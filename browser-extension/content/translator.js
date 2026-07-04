// 翻译引擎:MutationObserver + TreeWalker,将 vCenter UI 英文文本实时替换为中文。
// 词典由 dict.js 注入到 window.__vcDict(英文 UI 串 -> 简体中文)。
(function () {
  'use strict';

  // 字典按需加载:扩展包本身不内置数 MB 词典(保持轻量),仅在确认是 vCenter/Aria 页面时,
  // 按选定语言获取 dict.<lang>.json。三级来源:① 扩展内置(开发/离线时存在才用);
  // ② 本地缓存(chrome.storage.local,按版本);③ 远程语言包(jsDelivr)→ 下载后缓存。
  // 词典 URL 按 langs.json 里的版本号钉到发布 tag(@v<版本>,内容不可变,免 purge 免"版本
  // 与内容不一致");语言目录 langs.json 自身走 @main 浮动引用(小文件),让已装用户不升级
  // 扩展也能发现并拉到新版词典。
  // 多 CDN 回退:jsDelivr 主域在部分网络(中国大陆/严格企业代理)不可达,
  // fastly/gcore 镜像可达性好得多。所有远程请求按此顺序逐个尝试。
  const CDN_HOSTS = ['cdn.jsdelivr.net', 'fastly.jsdelivr.net', 'gcore.jsdelivr.net'];
  const ghUrl = (host, ref, file) => 'https://' + host + '/gh/vcf-rosetta/vcf-rosetta@' + ref + '/browser-extension/' + file;
  // 依次尝试各 CDN 主机,返回第一个 HTTP 200 的 Response;全部失败返回 null。
  // 每次尝试带超时(被墙的域名常是"挂住"而非快速失败,不设超时会拖死整条加载链)。
  async function fetchFirst(ref, file, init, timeoutMs) {
    for (const host of CDN_HOSTS) {
      const url = ghUrl(host, ref, file);
      try {
        const ctl = new AbortController();
        const timer = setTimeout(() => ctl.abort(), timeoutMs);
        const r = await fetch(url, Object.assign({ signal: ctl.signal }, init || {}));
        clearTimeout(timer);
        if (r.ok) return r;
        console.warn('[vcf-rosetta] HTTP ' + r.status + ' @ ' + url);
      } catch (e) {
        console.warn('[vcf-rosetta] 请求失败 @ ' + url + ' : ' + e.message);
      }
    }
    return null;
  }
  // 纯函数(词典清洗/归一化/采集过滤/受控模式 PHRASES)在 content/lib.js,
  // manifest 里先于本文件注入 —— 同一隔离世界,直接取全局命名空间。
  const { TAIL_RE, normTerm, sanitizeDict, buildAux, classifyFlags, looksTranslatable, applyPhrases } = globalThis.__vcLib;

  let dict = Object.create(null);
  let loadedLang = null;
  let loadedFrom = null;   // 'bundled' | 'cache' | 'cdn' —— 词典来源,供弹窗显示
  let loadedVer = null;    // 已加载词典对应的版本号
  let loadFailed = false;  // 所有来源(内置/缓存/全部 CDN)都取不到词典 —— 供弹窗明确告知用户
  let LANGS = {};
  // 语言目录:先读内置(必定可用),再用 CDN 上的最新目录覆盖(带超时,失败无害)。
  // 走缓存/CDN 取词典前必须 await 它 —— 修复竞态:LANGS 未就绪时 ver 取到 '0',缓存版本
  // 永远不匹配 → 每次页面加载都重下数 MB 词典,还把缓存写成 version:'0' 造成永久抖动。
  // 惰性 + memoize:内容脚本注入到所有 https 页面,若像旧版那样在顶层立即执行,等于用户
  // 每打开任意网页都向 jsDelivr 发一次请求(把浏览时机泄露给第三方 CDN + 纯浪费)。
  // 现在只有 loadDict 确认是 VCF 页面、真正走到「缓存/CDN」分支时才首次触发。
  let langsReadyP = null;
  function langsReady() {
    if (langsReadyP) return langsReadyP;
    langsReadyP = (async () => {
      try {
        const j = await (await fetch(chrome.runtime.getURL('langs.json'))).json();
        if (j && j.languages) LANGS = j.languages;
      } catch (e) { /* ignore */ }
      try {
        const r = await fetchFirst('main', 'langs.json', null, 4000);
        if (r) {
          const j = await r.json();
          if (j && j.languages && typeof j.languages === 'object') LANGS = j.languages;
        }
      } catch (e) { /* 离线/隔离网:用内置目录即可 */ }
    })();
    return langsReadyP;
  }

  let dictAux = Object.create(null);   // normTerm(词典键) -> 词典键(归一化二级索引)
  function setDict(d) {
    dict = d;
    dictAux = buildAux(d);
  }

  async function loadDict(lang, opts) {
    lang = lang || 'en';
    const force = opts && opts.force;   // 刷新词典:跳过「已加载」短路与本地缓存,强制取最新
    loadFailed = false;
    if (lang === 'en') { setDict(Object.create(null)); loadedLang = 'en'; loadedFrom = null; loadedVer = null; return false; } // 英文原文:无词典
    if (!force && loadedLang === lang && Object.keys(dict).length) return true;
    const cacheKey = 'dict:' + lang;

    // ① 扩展内置(若打包时附带了 dict.<lang>.json;离线包即走这条)—— 不依赖语言目录,零联网零等待
    try {
      const res = await fetch(chrome.runtime.getURL('dict.' + lang + '.json'));
      if (res.ok) {
        const d = sanitizeDict(await res.json());
        if (d) {
          setDict(d); loadedLang = lang; loadedFrom = 'bundled';
          loadedVer = (LANGS[lang] && LANGS[lang].version) || chrome.runtime.getManifest().version;
          console.info('[vcf-rosetta] 内置字典:' + lang + ',' + Object.keys(dict).length + ' 条');
          return true;
        }
      }
    } catch (e) { /* 未内置,继续 */ }

    await langsReady();                      // ②③ 依赖目录里的版本号,首次触发并等它就绪(含超时)
    if (force) {
      // 手动刷新:绕过 HTTP 缓存重取语言目录,立即发现刚发布的新词典版本
      try {
        const r = await fetchFirst('main', 'langs.json', { cache: 'reload' }, 4000);
        if (r) { const j = await r.json(); if (j && j.languages) LANGS = j.languages; }
      } catch (e) { /* ignore */ }
    }
    const ver = (LANGS[lang] && LANGS[lang].version) || '0';

    // ② 本地缓存(版本一致才用;force 刷新时跳过,以便重新下载)
    if (!force) try {
      const got = await chrome.storage.local.get(cacheKey);
      const c = got[cacheKey];
      if (c && c.version === ver && c.data) {
        const d = sanitizeDict(c.data);
        if (d) {
          setDict(d); loadedLang = lang; loadedFrom = 'cache'; loadedVer = c.version;
          console.info('[vcf-rosetta] 缓存字典:' + lang + ',' + Object.keys(dict).length + ' 条');
          return true;
        }
      }
    } catch (e) { /* ignore */ }

    // ③ 远程下载(逐 CDN 主机回退)→ 写缓存。优先钉到发布 tag(内容不可变,jsDelivr 长期
    //    缓存、免 purge);tag 尚未打出(目录先行发布)或不可达时,退回 @main 浮动引用。
    const refs = [];
    if (ver !== '0') refs.push('v' + ver);
    refs.push('main');
    for (const ref of refs) {
      const res = await fetchFirst(ref, 'dict.' + lang + '.json', force ? { cache: 'reload' } : null, 20000);
      if (!res) continue;
      try {
        const d = sanitizeDict(await res.json());
        if (!d) { console.warn('[vcf-rosetta] 语言包内容异常(非字符串映射)@' + ref); continue; }
        setDict(d); loadedLang = lang; loadedFrom = 'cdn'; loadedVer = ver;
        try { await chrome.storage.local.set({ [cacheKey]: { version: ver, data: dict } }); } catch (e) { /* 配额? */ }
        console.info('[vcf-rosetta] 已下载并缓存语言包:' + lang + ',' + Object.keys(dict).length + ' 条');
        return true;
      } catch (e) {
        console.warn('[vcf-rosetta] 语言包解析异常 @' + ref + ' : ' + e.message);
      }
    }
    // 所有来源尽数失败:标记给弹窗,并在控制台给出可执行的出路(离线包)
    loadFailed = true;
    console.warn('[vcf-rosetta] 词典加载失败:所有 CDN(' + CDN_HOSTS.join(' / ') + ')均不可达且无可用缓存。' +
      '隔离网/受限网络请改用离线包(词典内置):https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip');
    return false;
  }

  // ── 未翻译词条采集 ──────────────────────────────────────
  // 开启后,把「未命中字典的英文文本」收集起来供回流。
  // 持久化到 chrome.storage.local:跨页面/跨会话/跨扩展升级累积,不丢失、不重复采集;
  // 每次成功加载字典后,会自动剔除「现已翻译」的条目,所以词库覆盖越全、待采集越少。
  let collect = false;
  const MISSING_KEY = 'missingTerms';
  // text -> { n:出现次数, tool:来源工具页, title:样本页标题, flags:[异常标记] }
  const missing = window.__vcMissing || (window.__vcMissing = new Map());
  // 惰性载入(兼容旧版:纯字符串数组 / 新版:{text:meta} 对象)。
  // 不在脚本顶层无条件读取 —— 内容脚本注入到所有 https 页面的所有 frame,采集表最多
  // 5000 条(含元数据),旧版等于每开一个任意网页都反序列化一遍。现在只在真正需要时载入:
  // ① 采集开启且页面激活;② 弹窗请求导出/查看/清空。
  let missingLoaded = false;   // 已与 storage 合并完成 —— 之前绝不整表写盘(会覆盖丢失存量)
  let missingLoadP = null;
  function ensureMissingLoaded() {
    if (missingLoadP) return missingLoadP;
    missingLoadP = new Promise(resolve => {
      try {
        chrome.storage.local.get(MISSING_KEY, got => {
          const v = got && got[MISSING_KEY];
          if (Array.isArray(v)) v.forEach(s => { if (typeof s === 'string' && !missing.has(s)) missing.set(s, { n: 1, tool: '?', title: '', flags: classifyFlags(s) }); });
          else if (v && typeof v === 'object') for (const k in v) if (!missing.has(k)) missing.set(k, v[k]);
          missingLoaded = true;
          resolve();
        });
      } catch (e) { missingLoaded = true; resolve(); }
    });
    return missingLoadP;
  }
  let saveTimer = null;
  const MISSING_MAX = 5000;   // 采集上限:整表持久化,不设限会无限膨胀(存储 + 每次写盘的序列化成本)
  let missingOverflowWarned = false;
  function writeMissingNow() {
    if (!missingLoaded) return;   // 存量尚未合并进内存,整表写盘会把它清掉
    try { chrome.storage.local.set({ [MISSING_KEY]: Object.fromEntries(missing) }); } catch (e) { /* ignore */ }
  }
  function persistMissing() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; ensureMissingLoaded().then(writeMissingNow); }, 5000); // 防抖:每次都是整表序列化写盘,拉长合并窗口
  }
  // 页面卸载前把防抖窗口内未落盘的采集结果冲掉,不丢最后几秒的词条
  window.addEventListener('pagehide', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; writeMissingNow(); }
  });
  function pruneMissing() {       // 字典加载后剔除已翻译条目(补词后自动收缩)
    if (!missingLoaded) return;   // 采集未启用 -> 表未载入,无从剔除(下次采集/导出时自然会做)
    let changed = false;
    missing.forEach((_, k) => { if (dict[k] !== undefined) { missing.delete(k); changed = true; } });
    if (changed) persistMissing();
  }
  // 来源套件识别(给采集词条标来源,便于按套件补词)。
  // 关键:VCF 套件多为 SPA,document.title 常为空或加载晚 —— 只认 title 会全部退到
  // 裸 hostname(如 fleet-ops.knight.com),套件分不开。故合并 title + hostname + path 一起判。
  function detectTool() {
    const hay = ((document.title || '') + ' ' + (location.hostname || '') + ' ' + (location.pathname || '')).toLowerCase();
    if (/log\s*insight|operations for logs|vrealize log|loginsight/.test(hay)) return 'log';
    if (/aria.?operations|vcf.?operations|vrops|vrealize.?operations|fleet.?ops|\bops\b/.test(hay)) return 'aria-ops';
    if (/aria.?automation|vrealize.?automation|\bvra\b/.test(hay)) return 'aria-automation';
    if (/\bnsx\b/.test(hay)) return 'nsx';
    if (/sddc.?manager|\bsddc\b/.test(hay)) return 'sddc';
    if (/vsphere|vcenter|\bvcsa\b/.test(hay)) return 'vcenter';
    return location.hostname || 'other';
  }
  // 异常标记 classifyFlags / 动态·噪声过滤 looksTranslatable 在 lib.js
  function recordMissing(s) {
    if (!collect || !looksTranslatable(s)) return;
    if (!missingLoadP) ensureMissingLoaded();   // 首条采集触发存量合并(写盘由 persistMissing 等它完成)
    const m = missing.get(s);
    if (m) {
      m.n = (m.n || 1) + 1;
      if (!m.tool || m.tool === '?') {          // 回填旧版遗留/未知来源,让历史数据也能按套件归位
        m.tool = detectTool();
        m.title = (document.title || '').slice(0, 80);
      }
    } else {
      if (missing.size >= MISSING_MAX) {   // 满仓只更新已有条目,不再收新词;提醒一次导出+清空
        if (!missingOverflowWarned) {
          missingOverflowWarned = true;
          console.warn('[vcf-rosetta] 采集词条已达上限 ' + MISSING_MAX + ' 条,新词条不再记录;请在弹窗导出 JSON 后清空再继续采集');
        }
        return;
      }
      missing.set(s, { n: 1, tool: detectTool(), title: (document.title || '').slice(0, 80), flags: classifyFlags(s) });
    }
    persistMissing();
  }
  // 导出条目(带标记),按 工具→出现次数降序→字母 排序
  function missingEntries() {
    return Array.from(missing.entries())
      .map(([text, m]) => ({ text: text, count: m.n || 1, tool: m.tool || '?', flags: m.flags || [], title: m.title || '' }))
      .sort((a, b) => (a.tool < b.tool ? -1 : a.tool > b.tool ? 1 : b.count - a.count || (a.text.toLowerCase() < b.text.toLowerCase() ? -1 : 1)));
  }
  // 本地导出:下载带标记的 JSON + 打印摘要
  window.__vcDumpMissing = function () {
    const entries = missingEntries();
    const byTool = {}; entries.forEach(e => byTool[e.tool] = (byTool[e.tool] || 0) + 1);
    console.log('[vcf-rosetta] 未翻译词条 ' + entries.length + ' 条,按工具:', byTool);
    try {
      const payload = { generatedFrom: location.hostname, total: entries.length, byTool: byTool, entries: entries };
      const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vc-missing-' + entries.length + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { /* 下载失败也已打印到控制台 */ }
    return entries.length;
  };

  // 翻译 VCF 控制台页面。两条激活路径(加法,不互斥):
  //   ① 用户用「添加当前站点」显式强制启用的主机 —— 任何 VCF 工具页都能这样一键加白名单;
  //   ② 自动检测 Clarity / VCF 工具特征(vCenter / SDDC Manager / Aria Operations / Aria Operations
  //      for Logs(Log Insight)/ NSX 等)。
  function shouldActivate(cfg) {
    if (!cfg.enabled) return false;
    const hosts = cfg.hosts || [];
    if (hosts.some(h => h && location.hostname.includes(h))) return true;   // 显式启用站点(加法)
    const t = document.title || '';
    // 标题标记一律按词边界匹配 —— includes('NSX') 会把标题里仅仅提到 NSX 的新闻/文档页
    // 也当成控制台;startsWith('/ui') 会误中任何网站的 /ui-kit、/uiserver 等路径。
    // 单独的弱词 NSX 不再凭标题激活(NSX 控制台由下方 Clarity 特征覆盖)。
    const TITLE_MARKERS = [
      /\bvSphere\b/, /\bvCenter\b/, /\bSDDC Manager\b/, /\bCloud Foundation\b/,
      /\bAria Operations\b/, /\bVCF Operations\b/, /\bvRealize Operations\b/,
      /\bOperations for Logs\b/, /\bLog Insight\b/, /\bvRealize Log\b/,     // 日志工具
      /\bAria Automation\b/, /\bvRealize Automation\b/,                     // 其它 VCF 工具
      /\blifecycle-ui\b/i,                                                  // vCenter 安装/生命周期管理 UI
    ];
    return (
      /^\/ui(\/|$)/.test(location.pathname) ||
      TITLE_MARKERS.some(re => re.test(t)) ||
      // Clarity 框架特征(绝大多数 VCF 工具页都用 Clarity / Angular;SPA 标题为空时靠它兜底)
      !!document.querySelector('clr-header, .clr-app-container, vsphere-client, clr-main-container')
    );
  }

  // 受控模式替换 applyPhrases(s, lang) 在 lib.js:预筛按「模式是否要求数字」自动划分,
  // 不再手工维护前缀登记表(历史上漏登记导致整类无数字模式被预筛拦死、漏翻 1600+ 条)。

  // ── 文本节点翻译 ──────────────────────────────────────────
  const CJK = /[一-鿿]/;
  function translateText(node) {
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    // 关键:不要用"翻过就永久跳过"的布尔标志 —— Clarity 的 clr-datagrid 等虚拟列表会
    // 回收复用同一批文本节点、只改写其文本(characterData)。我们改记录"上次写入的结果":
    // 只要节点当前文本不等于我们上次的输出,就重新处理(覆盖新告警/新行/滚动复用)。
    if (node.__vcOut !== undefined && raw === node.__vcOut) return; // 正是我们的输出 -> 跳过,防回环
    const trimmed = raw.trim();
    if (CJK.test(trimmed)) return;            // 已是中文(原生或我们的输出),不动
    const zh = dict[trimmed];
    // 替换值一律用函数形式:译文若含 "$&"、"$`" 等 String.replace 特殊模式,
    // 字符串形式会把原文/前文拼进结果(5 万条社区词条迟早踩中),函数返回值则按字面使用。
    if (zh && zh !== trimmed) {
      node.nodeValue = node.__vcOut = raw.replace(trimmed, () => zh); // 保留首尾空白
      return;
    }
    if (zh) return; // 命中但译文==原文(专有名词),不动
    // 分级描述:形如 "(3) 描述文本" 的串(DRS 迁移阈值 / DPM 电源管理滑块,每档一段),
    // 剥离前导 "(N) " 再查词典命中后回填 —— 档位数字不影响匹配,且对所有分级描述通用。
    const nm = trimmed.match(/^(\(\d+\)\s*)([\s\S]+)$/);
    if (nm) {
      const body = dict[nm[2]];
      if (body && body !== nm[2]) { node.nodeValue = node.__vcOut = raw.replace(trimmed, () => nm[1] + body); return; }
    }
    // 归一化二级查找:同一标签在不同版本控制台常只差大小写或尾部 ":"/"…"
    // (如 9.0.x 带冒号、9.1 不带)。命中后把页面端的尾部标点原样带回。
    const nk = dictAux[normTerm(trimmed)];
    if (nk !== undefined) {
      const base = dict[nk];
      if (base && base !== nk) {
        const tail = (trimmed.match(TAIL_RE) || [''])[0];
        const out = base.replace(TAIL_RE, '') + tail;
        node.nodeValue = node.__vcOut = raw.replace(trimmed, () => out);
        return;
      }
    }
    // 精确未命中:试受控模式替换
    const ph = applyPhrases(trimmed, loadedLang);
    if (ph !== trimmed) {
      node.nodeValue = node.__vcOut = raw.replace(trimmed, () => ph);
    } else {
      recordMissing(trimmed);
    }
  }

  // ── 元素属性翻译 ──────────────────────────────────────────
  const TRANSLATE_ATTRS = ['placeholder', 'title', 'aria-label', 'aria-placeholder'];

  function translateAttrs(el) {
    // 与文本节点的 __vcOut 同款防回环:我们的 setAttribute 本身会再触发一次 attributes
    // mutation → 本函数被再次调用。记录「上次写入的译文」,值未被页面改动就直接跳过,
    // 免得在指标频繁刷新的页面上对同一批属性反复空查词典。
    const out = el.__vcAttrOut || (el.__vcAttrOut = Object.create(null));
    TRANSLATE_ATTRS.forEach(attr => {
      const val = el.getAttribute(attr);
      if (!val || val === out[attr]) return;
      const trimmed = val.trim();
      const zh = dict[trimmed];
      if (zh && zh !== trimmed) { out[attr] = zh; el.setAttribute(attr, zh); return; }
      if (zh) return;
      // 与文本节点同款的归一化二级查找(tooltip/placeholder 同样存在版本间标点漂移)
      const nk = dictAux[normTerm(trimmed)];
      if (nk !== undefined) {
        const base = dict[nk];
        if (base && base !== nk) {
          const tail = (trimmed.match(TAIL_RE) || [''])[0];
          const v = base.replace(TAIL_RE, '') + tail;
          out[attr] = v;
          el.setAttribute(attr, v);
        }
      }
    });
  }

  // ── 遍历节点树 ────────────────────────────────────────────
  // VCF Operations / Aria 等控制台大量用 Web Component(Clarity / 自研),正文(数据网格列头、
  // 仪表板小组件)渲染在 open shadow DOM 里;部分内嵌同源 iframe。普通 TreeWalker 不跨 shadow/
  // iframe 边界 —— 这正是「词库里有 Health/Memory 等词、界面却仍是英文」的根因。故改为递归下降,
  // 主动穿透 open shadow root 与同源 iframe(闭合 shadow / 跨源 iframe 无法访问,自动跳过)。
  const SKIP_TAGS = ['script', 'style', 'noscript', 'code', 'pre', 'textarea'];
  const observedRoots = new WeakSet();   // 已挂监听的 shadow root / iframe 文档,避免重复 observe
  function observeRoot(root) {
    if (!root || observedRoots.has(root)) return;
    observedRoots.add(root);
    try {
      observer.observe(root, {
        childList: true, subtree: true, characterData: true,
        attributes: true, attributeFilter: TRANSLATE_ATTRS,
      });
    } catch (e) { /* 个别 root 不可监听,忽略 */ }
  }
  function walkAndTranslate(root) {
    if (!root) return;
    const type = root.nodeType;
    if (type === Node.TEXT_NODE) { translateText(root); return; }
    if (type === Node.ELEMENT_NODE) {
      const tag = root.tagName ? root.tagName.toLowerCase() : '';
      if (SKIP_TAGS.includes(tag)) return;
      if (root.isContentEditable) return;   // 用户可编辑区:改写文本会破坏输入内容与光标位置
      translateAttrs(root);
      if (tag === 'iframe' || tag === 'frame') {        // 同源 iframe:进入其文档(跨源抛错 -> 跳过)
        let doc = null;
        try { doc = root.contentDocument; } catch (e) { doc = null; }
        if (doc && doc.body) { observeRoot(doc.body); walkAndTranslate(doc.body); }
        return;
      }
      if (root.shadowRoot) { observeRoot(root.shadowRoot); walkAndTranslate(root.shadowRoot); }  // open shadow DOM
    } else if (type !== Node.DOCUMENT_FRAGMENT_NODE && type !== Node.DOCUMENT_NODE) {
      return;
    }
    const kids = root.childNodes;                       // 元素 / shadowRoot / document 的子节点
    if (kids) for (let i = 0; i < kids.length; i++) walkAndTranslate(kids[i]);
  }

  // ── MutationObserver(Angular SPA 路由切换 / 数据加载) ──────
  // 用 rAF 批处理:把待处理节点入队、合并到一帧统一翻译。绝不丢 mutation
  // (旧版 busy 标志会丢弃繁忙期的变更 -> 漏翻)。
  let pending = new Set();
  let scheduled = false;
  // 关键:原生 requestAnimationFrame 必须以 window 为 this 调用。strict 模式下
  // `(window.requestAnimationFrame || window.setTimeout)(flush,0)` 会以 this=undefined
  // 调用 -> 抛 "Illegal invocation";而此前 scheduled 已置 true -> 之后永不再调度 ->
  // 首屏之后的动态内容(SPA 路由切换 / 懒加载组件)全部漏翻。故先 bind。
  const raf = window.requestAnimationFrame
    ? window.requestAnimationFrame.bind(window)
    : (cb) => window.setTimeout(cb, 0);
  function flush() {
    scheduled = false;
    const roots = pending; pending = new Set();
    const list = [];
    roots.forEach(n => { if (n && n.isConnected !== false) list.push(n); }); // 跳过已移除节点(Clarity 行回收)
    // 同批去重:若某节点的祖先也在本批,祖先遍历已覆盖它,跳过以免重复下降大子树。
    // 批量很大时(罕见)跳过 O(n²) 去重,直接全走,避免预筛本身成为瓶颈。
    const dedup = list.length <= 200;
    for (const n of list) {
      if (dedup && list.some(o => o !== n && o.contains && o.contains(n))) continue;
      try { walkAndTranslate(n); } catch (e) { /* 单节点失败不拖垮整批 */ }
    }
  }
  function schedule(node) {
    pending.add(node);
    if (!scheduled) {
      scheduled = true;
      raf(flush);
    }
  }
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      try {
        if (m.type === 'childList') m.addedNodes.forEach(schedule);
        // 跳过我们自己写回的文本节点(避免在指标实时刷新的页面上空转处理一遍又早退)
        else if (m.type === 'characterData') { if (m.target.__vcOut !== m.target.nodeValue) schedule(m.target); }
        else if (m.type === 'attributes' && m.target.nodeType === Node.ELEMENT_NODE) translateAttrs(m.target);
      } catch (e) { /* 单条 mutation 失败不影响同批其余 */ }
    }
  });

  let started = false;
  function init() {
    walkAndTranslate(document.body);
    const titleEl = document.querySelector('title');
    if (titleEl) walkAndTranslate(titleEl);
    if (started) return;                  // 已在监听 -> 仅重扫,避免重复 observer
    started = true;
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: TRANSLATE_ATTRS,
    });
  }

  async function activateIfNeeded(cfg) {
    if (!shouldActivate(cfg)) return;
    if (!(await loadDict(cfg.lang))) return;   // 仅 vCenter 页面才加载选定语言字典
    if (collect) { await ensureMissingLoaded(); pruneMissing(); }  // 剔除现已翻译的旧采集条目(采集开启时才载表)
    if (document.body) init();
    else document.addEventListener('DOMContentLoaded', init, { once: true });
  }

  chrome.storage.sync.get({ hosts: [], enabled: true, collect: false, lang: 'en' }, cfg => {
    collect = !!cfg.collect;
    activateIfNeeded(cfg);
  });

  // 设置变化时即时生效:对「尚未翻译、但现在应当翻译」的页面(如刚记住的站点、刚选好语言)
  // 立刻激活,无需手动点击或刷新。只做加法激活,不主动 reload —— 语言切换/停用的清屏由弹窗刷新负责,
  // 且非 vCenter 页面会被 shouldActivate 挡掉,这里对它们是无操作。
  chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'sync') return;
    if (changes.collect) collect = !!changes.collect.newValue;
    if (!started && (changes.enabled || changes.hosts || changes.lang)) {
      chrome.storage.sync.get({ hosts: [], enabled: true, collect: false, lang: 'en' }, activateIfNeeded);
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'VC_ENABLE') {
      chrome.storage.sync.get({ lang: 'en' }, c => loadDict(c.lang).then(ok => { if (ok) init(); }));
    } else if (msg.type === 'VC_DISABLE') { observer.disconnect(); location.reload(); }
    else if (msg.type === 'VC_COLLECT') {
      collect = !!msg.on;
      // 开启采集时先把存量表合并进内存(表是惰性载入的),再整页重扫
      if (collect) ensureMissingLoaded().then(() => { if (Object.keys(dict).length) walkAndTranslate(document.body); });
    }
    else if (msg.type === 'VC_DUMP') {
      ensureMissingLoaded().then(() => sendResponse({ count: window.__vcDumpMissing() }));
      return true;   // 异步 sendResponse
    }
    else if (msg.type === 'VC_GET_MISSING') {
      ensureMissingLoaded().then(() => {
        const entries = missingEntries();
        sendResponse({ entries: entries, list: entries.map(e => e.text), lang: loadedLang || 'en' });
      });
      return true;   // 异步 sendResponse
    }
    else if (msg.type === 'VC_CLEAR_MISSING') {
      // 内存 + 存储一并清;同时把「已载入」置真 —— 之后的惰性载入不得把旧存量复活
      missing.clear();
      missingLoaded = true;
      missingLoadP = Promise.resolve();
      try { chrome.storage.local.remove(MISSING_KEY); } catch (e) { /* ignore */ }
      sendResponse({ ok: true });
    }
    // 当前页加载的词典信息(语言/版本/条数/来源)—— 供弹窗显示「我在用哪版」
    else if (msg.type === 'VC_DICT_INFO') {
      sendResponse({ lang: loadedLang || 'en', version: loadedVer, count: Object.keys(dict).length, from: loadedFrom, failed: loadFailed });
    }
    // 刷新词典:清掉本地缓存,强制重取(内置→重读文件;联网→绕缓存重下),再整页重翻
    else if (msg.type === 'VC_REFRESH_DICT') {
      const lang = loadedLang && loadedLang !== 'en' ? loadedLang : (msg.lang || 'en');
      const done = info => sendResponse(info);
      if (lang === 'en') { done({ lang: 'en', version: null, count: 0, from: null }); return true; }
      chrome.storage.local.remove('dict:' + lang).catch(() => {}).then(() => loadDict(lang, { force: true })).then(ok => {
        if (ok) walkAndTranslate(document.body);
        done({ lang: loadedLang || 'en', version: loadedVer, count: Object.keys(dict).length, from: loadedFrom, ok: ok, failed: loadFailed });
      });
      return true;   // 异步 sendResponse
    }
  });
})();
