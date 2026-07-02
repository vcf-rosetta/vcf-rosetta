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
  let dict = Object.create(null);
  let loadedLang = null;
  let loadedFrom = null;   // 'bundled' | 'cache' | 'cdn' —— 词典来源,供弹窗显示
  let loadedVer = null;    // 已加载词典对应的版本号
  let loadFailed = false;  // 所有来源(内置/缓存/全部 CDN)都取不到词典 —— 供弹窗明确告知用户
  let LANGS = {};
  // 语言目录:先读内置(必定可用),再用 CDN 上的最新目录覆盖(带超时,失败无害)。
  // 走缓存/CDN 取词典前必须 await 它 —— 修复竞态:LANGS 未就绪时 ver 取到 '0',缓存版本
  // 永远不匹配 → 每次页面加载都重下数 MB 词典,还把缓存写成 version:'0' 造成永久抖动。
  const LANGS_READY = (async () => {
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

  // 载入前校验:词典必须是 {英文串: 译文串} 的扁平映射,丢弃一切非字符串值(_note 等元数据、
  // 结构异常的远程内容),并落到无原型对象上 —— 页面上出现 "constructor"/"toString" 这类文本时
  // 不会命中 Object.prototype 的继承属性而被换成函数源码。
  function sanitizeDict(j) {
    if (!j || typeof j !== 'object' || Array.isArray(j)) return null;
    const out = Object.create(null);
    let n = 0;
    for (const k in j) {
      if (typeof j[k] === 'string') { out[k] = j[k]; n++; }
    }
    return n > 0 ? out : null;
  }

  // ── 归一化二级索引 ─────────────────────────────────────────
  // 词典键与页面文本常只差大小写 / 尾部 ":"、"…"、"..."(不同版本控制台的措辞漂移,
  // 如 9.0.x 与 9.1 同一标签一个带冒号一个不带)。精确匹配 miss 后按归一化形式再查一次,
  // 命中后把页面端的尾部标点原样带回译文。
  const TAIL_RE = /\s*(\.{3}|…|:|:)$/;
  function normTerm(s) {
    return s.toLowerCase().replace(TAIL_RE, '').replace(/[\s ]+/g, ' ').trim();
  }
  let dictAux = Object.create(null);   // normTerm(词典键) -> 词典键
  function buildAux(d) {
    const aux = Object.create(null);
    for (const k in d) {
      const n = normTerm(k);
      if (!n) continue;
      // 同归一形冲突时取更短的键(裸形优先于带冒号/省略号的变体)
      if (aux[n] === undefined || k.length < aux[n].length) aux[n] = k;
    }
    return aux;
  }
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

    await LANGS_READY;                       // ②③ 依赖目录里的版本号,等它就绪(含超时)
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
  // 启动时载入(兼容旧版:纯字符串数组 / 新版:{text:meta} 对象)
  try {
    chrome.storage.local.get(MISSING_KEY, got => {
      const v = got && got[MISSING_KEY];
      if (Array.isArray(v)) v.forEach(s => { if (typeof s === 'string' && !missing.has(s)) missing.set(s, { n: 1, tool: '?', title: '', flags: classifyFlags(s) }); });
      else if (v && typeof v === 'object') for (const k in v) if (!missing.has(k)) missing.set(k, v[k]);
    });
  } catch (e) { /* ignore */ }
  let saveTimer = null;
  const MISSING_MAX = 5000;   // 采集上限:整表持久化,不设限会无限膨胀(存储 + 每次写盘的序列化成本)
  let missingOverflowWarned = false;
  function writeMissingNow() {
    try { chrome.storage.local.set({ [MISSING_KEY]: Object.fromEntries(missing) }); } catch (e) { /* ignore */ }
  }
  function persistMissing() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => { saveTimer = null; writeMissingNow(); }, 5000); // 防抖:每次都是整表序列化写盘,拉长合并窗口
  }
  // 页面卸载前把防抖窗口内未落盘的采集结果冲掉,不丢最后几秒的词条
  window.addEventListener('pagehide', () => {
    if (saveTimer) { clearTimeout(saveTimer); saveTimer = null; writeMissingNow(); }
  });
  function pruneMissing() {       // 字典加载后剔除已翻译条目(补词后自动收缩)
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
  // 异常标记:帮助维护者快速判断该条该怎么处理
  function classifyFlags(s) {
    const f = [];
    if (/\d/.test(s)) f.push('含数字·疑动态');       // 可能该进 PHRASES 模式而非词典
    if (s.length > 60) f.push('长句');
    if (/^[a-z]/.test(s)) f.push('疑片段');           // 小写开头,可能是被拆开的句子片段
    if (/^[A-Z0-9 ()/_-]+$/.test(s) && s.length <= 28) f.push('全大写');
    if (/[{}]|\$\{|%[sd@]|\bundefined\b|\[object/.test(s)) f.push('疑占位/异常');
    if (/[A-Za-z][\w.]*(\.[A-Za-z][\w]*){2,}/.test(s)) f.push('疑标识符');  // 点分 key
    return f;
  }
  // 动态数据:随时间/实例变化,混进词库只会污染对齐,采集阶段就剔除。
  // (日期 05/03/2026 / 时钟 11:42:09 PM / MAC 00:50:56:.. / 纯数值±单位 "0 MB"、"0 free")
  const DYNAMIC_RE = [
    /\b\d{1,2}\/\d{1,2}\/\d{2,4}\b/,                                                            // 日期
    /\b\d{1,2}:\d{2}(:\d{2})?\b/,                                                               // 时钟(也覆盖 MAC 冒号段)
    /\b([0-9a-f]{2}:){2,}[0-9a-f]{2}\b/i,                                                       // MAC 地址
    /^[\s\d.,:%()|/_-]*\d[\s\d.,:%()|/_-]*(MB|GB|KB|TB|PB|MHz|GHz|kHz|Hz|ms|bps|free|used)?\s*$/i, // 纯数值±单位
  ];
  // 机器标识/代码/无障碍文本:不是给人读的 UI 串,采集阶段直接剔除(高精度,实测零误杀)。
  // 命中的典型噪声:API 路径、URN、点分标识符、主机名、snake/驼峰类名、快捷键、图表无障碍、动态数值。
  const NOISE_RE = [
    /^[a-z][\w.]*(\/[\w.{}-]+)+$/i,                  // 斜杠路径(REST API):token/token,无空格
    /^urn:|:\/\//,                                   // urn:... 或含 ://(URL)
    /^[a-z][\w-]*(\.[a-z][\w-]*){2,}$/i,             // 点分标识符 com.vmware.cns(无空格)
    /^[\w-]+(\.[\w-]+)+(:\d+)?$/,                    // 主机名/FQDN(可带 :端口),无空格
    /^[a-z0-9]+(_[a-z0-9]+)+$/i,                     // snake_case 单 token
    /^[A-Za-z][a-z0-9]+([A-Z][a-z0-9]+){2,}$/,       // 驼峰类名 CisTaskProgress(≥3 段,无空格)
    /\b(ctrl|alt|shift|cmd)\b\s*\+/i,               // 键盘快捷键
    /\b(pie|bar|line|donut)?\s*chart\b.*\b(slices?|data series|axis|graphic)\b/i, // 图表无障碍
    /\baxis displaying\b|\bdata series\b|created with (highcharts|highstock)/i,   // 图表无障碍
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-/i,         // GUID(任意位置)
    /\b\d[\d.,]*\s*(KBps|Bps|Mbps|Bytes?|vCPUs?|CPU\(s\)|MHz|GHz)/i, // 动态:速率/字节/vCPU
    /^\d[\d.,]*\s*(GB|MB|KB|TB|PB|B)\b/i,            // 数字开头的容量行 "12 GB, 0 GB..."
    /^[\w-]+\.\.\.$/,                                // 单 token 省略截断 "lic..."(无空格)
    /^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\s+\d{1,2}$/,  // 月 日 "Jun 20"
    /^(?=.*\d)[a-z][\w]*([-_][\w]+){2,}$/i,          // 实例/对象名:≥2 分隔符且含数字,无空格(如 knight-md-cl01)
  ];
  // 判断一段文本是否"值得翻译的英文"(过滤数字/GUID/纯符号/已含中文/动态值/机器标识)
  function looksTranslatable(s) {
    // 不设长度上限:H5 客户端的段落级长描述(vSAN/创建虚拟机/升级说明)动辄 200–400 字甚至更长,
    // 旧的 120 上限会把它们整段丢弃 -> 这类长描述「永远采集不到、永远翻不了」。动态/噪声仍由下方正则拦。
    if (s.length < 2) return false;
    if (/[一-鿿]/.test(s)) return false;          // 已含中文
    if (!/[A-Za-z]/.test(s)) return false;                // 无字母
    if (/^[0-9.\-:/\s%]+$/.test(s)) return false;         // 纯数字/时间/百分比
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) return false; // GUID
    if ((s.match(/[A-Za-z]/g) || []).length < 2) return false;
    if (DYNAMIC_RE.some(re => re.test(s))) return false;  // 日期/时间/MAC/数值-单位:动态值,跳过
    if (NOISE_RE.some(re => re.test(s))) return false;    // 机器标识/代码/无障碍:非 UI 文本,跳过
    return true;
  }
  function recordMissing(s) {
    if (!collect || !looksTranslatable(s)) return;
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
    ];
    return (
      /^\/ui(\/|$)/.test(location.pathname) ||
      TITLE_MARKERS.some(re => re.test(t)) ||
      // Clarity 框架特征(绝大多数 VCF 工具页都用 Clarity / Angular;SPA 标题为空时靠它兜底)
      !!document.querySelector('clr-header, .clr-app-container, vsphere-client, clr-main-container')
    );
  }

  // ── 受控模式替换 ──────────────────────────────────────────
  // 用于"数字动态、后缀固定"的场景(如 "267.45 GHz free")。仅匹配高度具体的
  // 安全模式,避免误翻别处的同名词。精确匹配未命中时才尝试。
  // 译文按 locale 分表:{ 'zh-CN','zh-TW','de','it','ko' }。某语言缺该条目 -> 退英文原串
  // (返回 s),绝不把一种语言的译文漏到另一种页面。zh-TW 由 zh-CN 经 OpenCC s2twp 转换并
  // 人工修正(量词「台」不转臺、Datastore=資料存放區、Instance=執行個體、Task=工作);de/it 取
  // glossary 权威词;ko 仅填语序安全项(量词 개/대),长尾整句缺译则退英文。
  const PHRASES = [
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+free$/i, { 'zh-CN': '$1 空闲', 'zh-TW': '$1 可用', de: '$1 frei', it: '$1 liberi', ko: '$1 사용 가능' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+used$/i, { 'zh-CN': '$1 已用', 'zh-TW': '$1 已使用', de: '$1 belegt', it: '$1 utilizzati', ko: '$1 사용됨' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+capacity$/i, { 'zh-CN': '$1 容量', 'zh-TW': '$1 容量', de: '$1 Kapazität', it: '$1 capacità', ko: '$1 용량' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+available$/i, { 'zh-CN': '$1 可用', 'zh-TW': '$1 可用', de: '$1 verfügbar', it: '$1 disponibili', ko: '$1 사용 가능' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+allocated$/i, { 'zh-CN': '$1 已分配', 'zh-TW': '$1 已分配', de: '$1 zugewiesen', it: '$1 allocati', ko: '$1 할당됨' }],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+total$/i, { 'zh-CN': '$1 总计', 'zh-TW': '$1 總計', de: '$1 gesamt', it: '$1 totali', ko: '$1 합계' }],
    [/^(.+?)\s+used\s*\|\s*(.+?)\s+total$/i, { 'zh-CN': '$1 已用 | $2 总计', 'zh-TW': '$1 已使用 | $2 總計', de: '$1 belegt | $2 gesamt', it: '$1 utilizzati | $2 totali', ko: '$1 사용됨 | $2 합계' }],
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+items?$/i, { 'zh-CN': '第 $1 - $2 项,共 $3 项', 'zh-TW': '第 $1 - $2 項,共 $3 項', de: '$1–$2 von $3 Elementen', it: '$1-$2 di $3 elementi', ko: '$3개 중 $1-$2개 항목' }],
    [/^(\d+)\s+of\s+(\d+)\s+items?$/i, { 'zh-CN': '共 $2 项中的 $1 项', 'zh-TW': '共 $2 項中的 $1 項', de: '$1 von $2 Elementen', it: '$1 di $2 elementi', ko: '$2개 중 $1개 항목' }],
    [/^(\d+)\s+items?$/i, { 'zh-CN': '$1 项', 'zh-TW': '$1 項', de: '$1 Elemente', it: '$1 elementi', ko: '$1개 항목' }],
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+users?$/i, { 'zh-CN': '第 $1 - $2 个,共 $3 个用户', 'zh-TW': '第 $1 - $2 個,共 $3 個使用者', de: '$1–$2 von $3 Benutzern', it: '$1-$2 di $3 utenti', ko: '$3명 중 $1-$2명 사용자' }],
    [/^(\d+)\s+of\s+(\d+)\s+users?$/i, { 'zh-CN': '共 $2 个用户中的 $1 个', 'zh-TW': '共 $2 個使用者中的 $1 個', de: '$1 von $2 Benutzern', it: '$1 di $2 utenti', ko: '$2명 중 $1명 사용자' }],
    [/^(\d+)\s+Datastore\(s\)$/i, { 'zh-CN': '$1 个数据存储', 'zh-TW': '$1 個資料存放區', de: '$1 Datenspeicher', it: '$1 datastore', ko: '$1개 데이터스토어' }],
    [/^(\d+)\s+Network\(s\)$/i, { 'zh-CN': '$1 个网络', 'zh-TW': '$1 個網路', de: '$1 Netzwerke', it: '$1 reti', ko: '$1개 네트워크' }],
    [/^(\d+)\s+tasks?$/i, { 'zh-CN': '$1 个任务', 'zh-TW': '$1 個工作', de: '$1 Aufgaben', it: '$1 attività', ko: '$1개 작업' }],
    [/^(\d+)\s+CPU\(s\)\s+x\s+(.+)$/i, { 'zh-CN': '$1 个 CPU x $2', 'zh-TW': '$1 個 CPU x $2', de: '$1 CPUs x $2', it: '$1 CPU x $2', ko: 'CPU $1개 x $2' }],
    [/^The license expires in\s+(\d+)\s+days?\.$/i, { 'zh-CN': '许可证将在 $1 天后过期。', 'zh-TW': '授權將在 $1 天後到期。', de: 'Die Lizenz läuft in $1 Tagen ab.', it: 'La licenza scade tra $1 giorni.', ko: '라이센스가 $1일 후에 만료됩니다.' }],
    [/^(.+?)\s+task running on target\s+(.+?)\s+finished with status SUCCESS$/i,
      { 'zh-CN': '在目标 $2 上运行的“$1”任务已完成,状态为 SUCCESS', 'zh-TW': '在目標 $2 上執行的「$1」工作已完成,狀態為 SUCCESS', de: 'Aufgabe „$1“ auf Ziel $2 mit Status SUCCESS abgeschlossen', it: 'Attività "$1" sulla destinazione $2 completata con stato SUCCESS' }],
    [/^Total capacity (.+?)\. Usage breakdown: Used capacity (.+?) \(([\d.]+%)\), Free (.+?) \(([\d.]+%)\)$/i,
      { 'zh-CN': '总容量 $1。用量明细: 已用容量 $2 ($3)，可用 $4 ($5)', 'zh-TW': '總容量 $1。使用明細: 已使用容量 $2 ($3)，可用 $4 ($5)', de: 'Gesamtkapazität $1. Nutzung: belegt $2 ($3), frei $4 ($5)', it: 'Capacità totale $1. Utilizzo: usato $2 ($3), libero $4 ($5)' }],
    [/^Total capacity (.+?)\. Usage breakdown: Free (.+?) \((100%)\)$/i,
      { 'zh-CN': '总容量 $1。用量明细: 可用 $2 ($3)', 'zh-TW': '總容量 $1。使用明細: 可用 $2 ($3)', de: 'Gesamtkapazität $1. Nutzung: frei $2 ($3)', it: 'Capacità totale $1. Utilizzo: libero $2 ($3)' }],
    [/^Active sessions:\s*(\d+)$/i, { 'zh-CN': '活动会话: $1', 'zh-TW': '使用中工作階段: $1', de: 'Aktive Sitzungen: $1', it: 'Sessioni attive: $1', ko: '활성 세션: $1' }],
    [/^Idle sessions:\s*(\d+)$/i, { 'zh-CN': '空闲会话: $1', 'zh-TW': '閒置工作階段: $1', de: 'Inaktive Sitzungen: $1', it: 'Sessioni inattive: $1', ko: '유휴 세션: $1' }],
    [/^Standalone Hosts \((\d+)\)$/i, { 'zh-CN': '独立主机 ($1)', 'zh-TW': '獨立主機 ($1)', de: 'Eigenständige Hosts ($1)', it: 'Host autonomi ($1)', ko: '독립 실행형 호스트 ($1)' }],
    [/^Idle for (\d+) day\(s\) (\d+) hour\(s\) (\d+) minute\(s\)$/i, { 'zh-CN': '已空闲 $1 天 $2 小时 $3 分钟', 'zh-TW': '已閒置 $1 天 $2 小時 $3 分鐘', de: '$1 Tage $2 Stunden $3 Minuten inaktiv', it: 'Inattivo da $1 giorni $2 ore $3 minuti', ko: '$1일 $2시간 $3분 동안 유휴' }],
    [/^Idle for (\d+) hour\(s\) (\d+) minute\(s\)$/i, { 'zh-CN': '已空闲 $1 小时 $2 分钟', 'zh-TW': '已閒置 $1 小時 $2 分鐘', de: '$1 Stunden $2 Minuten inaktiv', it: 'Inattivo da $1 ore $2 minuti', ko: '$1시간 $2분 동안 유휴' }],
    [/^Idle for (\d+) minute\(s\)$/i, { 'zh-CN': '已空闲 $1 分钟', 'zh-TW': '已閒置 $1 分鐘', de: '$1 Minuten inaktiv', it: 'Inattivo da $1 minuti', ko: '$1분 동안 유휴' }],
    [/^(\d+)\s+events?$/i, { 'zh-CN': '$1 个事件', 'zh-TW': '$1 個事件', de: '$1 Ereignisse', it: '$1 eventi', ko: '$1개 이벤트' }],
    [/^(\d+)\s+[Hh]osts?$/i, { 'zh-CN': '$1 台主机', 'zh-TW': '$1 台主機', de: '$1 Hosts', it: '$1 host', ko: '호스트 $1대' }],
    [/^(\d+)\s+VMs?$/i, { 'zh-CN': '$1 个虚拟机', 'zh-TW': '$1 個虛擬機器', de: '$1 VMs', it: '$1 VM', ko: 'VM $1개' }],
    [/^(\d+)\s+Instances?$/i, { 'zh-CN': '$1 个实例', 'zh-TW': '$1 個執行個體', de: '$1 Instanzen', it: '$1 istanze', ko: '$1개 인스턴스' }],
    [/^(\d+)\s+Clusters?$/i, { 'zh-CN': '$1 个集群', 'zh-TW': '$1 個叢集', de: '$1 Cluster', it: '$1 cluster', ko: '$1개 클러스터' }],
    [/^All (\d+) disks on version ([\d.]+)\. Some services may not provide the complete feature set\.$/i,
      { 'zh-CN': '所有 $1 个磁盘均为 $2 版本。某些服务可能无法提供完整的功能集。', 'zh-TW': '所有 $1 個磁碟均為 $2 版本。某些服務可能無法提供完整的功能集。', de: 'Alle $1 Datenträger auf Version $2. Einige Dienste bieten möglicherweise nicht den vollständigen Funktionsumfang.', it: 'Tutti i $1 dischi sulla versione $2. Alcuni servizi potrebbero non fornire il set completo di funzionalità.' }],
    [/^Ready to upgrade - pre-check completed successfully on (.+)\.$/i,
      { 'zh-CN': '准备升级 - 预检查已于 $1 成功完成。', 'zh-TW': '準備升級 - 預先檢查已於 $1 成功完成。', de: 'Bereit zum Upgrade – Vorprüfung auf $1 erfolgreich abgeschlossen.', it: "Pronto per l'aggiornamento - controllo preliminare completato su $1." }],
    [/^Last updated at\b/i, { 'zh-CN': '最后更新于', 'zh-TW': '最後更新於', de: 'Zuletzt aktualisiert um', it: 'Ultimo aggiornamento alle', ko: '마지막 업데이트:' }],
    [/^Updated\b/i, { 'zh-CN': '已更新', 'zh-TW': '已更新', de: 'Aktualisiert', it: 'Aggiornato', ko: '업데이트됨' }],
    [/^(\d+)\s+days?$/i, { 'zh-CN': '$1 天', 'zh-TW': '$1 天', de: '$1 Tage', it: '$1 giorni', ko: '$1일' }],
    [/^(\d+)\s+hours?$/i, { 'zh-CN': '$1 小时', 'zh-TW': '$1 小時', de: '$1 Stunden', it: '$1 ore', ko: '$1시간' }],
    [/^(\d+)\s+minutes?$/i, { 'zh-CN': '$1 分钟', 'zh-TW': '$1 分鐘', de: '$1 Minuten', it: '$1 minuti', ko: '$1분' }],
    [/^(\d+)\s+seconds?$/i, { 'zh-CN': '$1 秒', 'zh-TW': '$1 秒', de: '$1 Sekunden', it: '$1 secondi', ko: '$1초' }],
    [/^(\d+)\s+days?\s+ago$/i, { 'zh-CN': '$1 天前', 'zh-TW': '$1 天前', de: 'vor $1 Tagen', it: '$1 giorni fa', ko: '$1일 전' }],
    [/^(\d+)\s+hours?\s+ago$/i, { 'zh-CN': '$1 小时前', 'zh-TW': '$1 小時前', de: 'vor $1 Stunden', it: '$1 ore fa', ko: '$1시간 전' }],
    [/^(\d+)\s+minutes?\s+ago$/i, { 'zh-CN': '$1 分钟前', 'zh-TW': '$1 分鐘前', de: 'vor $1 Minuten', it: '$1 minuti fa', ko: '$1분 전' }],
    [/^a few seconds ago$/i, { 'zh-CN': '几秒前', 'zh-TW': '幾秒前', de: 'vor wenigen Sekunden', it: 'pochi secondi fa', ko: '몇 초 전' }],
    // VM 摘要页常见动态串(数字/版本/状态混排,精确查典命不中)
    [/^Last updated:/i, { 'zh-CN': '上次更新:', 'zh-TW': '上次更新:', de: 'Zuletzt aktualisiert:', it: 'Ultimo aggiornamento:', ko: '마지막 업데이트:' }],
    [/^(\d+)\s+CPU\(s\),\s*(.+?)\s+used$/i, { 'zh-CN': '$1 个 CPU,$2 已使用', 'zh-TW': '$1 個 CPU,$2 已使用', de: '$1 CPUs, $2 belegt', it: '$1 CPU, $2 utilizzati', ko: 'CPU $1개, $2 사용됨' }],
    [/^(.+?),\s*(.+?)\s+memory active$/i, { 'zh-CN': '$1,$2 活动内存', 'zh-TW': '$1，$2 作用中記憶體', de: '$1, $2 aktiver Speicher', it: '$1, $2 memoria attiva' }],
    [/^Not running, version:(\S+)\s*\(Guest Managed\)$/i, { 'zh-CN': '未运行,版本:$1 (客户机托管)', 'zh-TW': '不在執行中,版本:$1 (受管理的客體)', de: 'Wird nicht ausgeführt, Version:$1 (gastverwaltet)', it: 'Non in esecuzione, versione:$1 (gestito dal guest)' }],
    [/^Running, version:(\S+)\s*\(Guest Managed\)$/i, { 'zh-CN': '运行中,版本:$1 (客户机托管)', 'zh-TW': '執行中,版本:$1 (受管理的客體)', de: 'Wird ausgeführt, Version:$1 (gastverwaltet)', it: 'In esecuzione, versione:$1 (gestito dal guest)' }],
    [/^\(disconnected\)$/i, { 'zh-CN': '(已断开连接)', 'zh-TW': '(已中斷連線)', de: '(getrennt)', it: '(disconnesso)', ko: '(연결 끊김)' }],
    [/^\(connected\)$/i, { 'zh-CN': '(已连接)', 'zh-TW': '(已連線)', de: '(verbunden)', it: '(connesso)', ko: '(연결됨)' }],
    [/^used$/i, { 'zh-CN': '已使用', 'zh-TW': '已使用', de: 'belegt', it: 'utilizzati', ko: '사용됨' }],
    [/^active$/i, { 'zh-CN': '活动', 'zh-TW': '作用中', de: 'aktiv', it: 'attivo', ko: '활성' }],
  ];
  // 受控模式替换:精确查典未命中时才尝试。译文按 loadedLang 取;缺该语言条目则退英文,
  // 永不跨语言污染(历史 bug:写死简体的 PHRASES 漏进德文页)。
  function applyPhrases(s) {
    const lang = loadedLang;
    if (!lang || lang === 'en') return s;
    // 廉价预筛:绝大多数模式要求串内含数字;其余仅少数固定前缀。先挡掉,免去逐条 ~40 次正则。
    if (!/\d/.test(s) && !/^(Updated|Last updated|Active sessions|Idle sessions|Ready to upgrade|a few seconds|used$|active$|\(disconnected\)|\(connected\)|Not running|Running)/i.test(s)) return s;
    for (var i = 0; i < PHRASES.length; i++) {
      if (PHRASES[i][0].test(s)) {
        const rep = PHRASES[i][1][lang];
        return rep === undefined ? s : s.replace(PHRASES[i][0], rep);
      }
    }
    return s;
  }

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
    const ph = applyPhrases(trimmed);
    if (ph !== trimmed) {
      node.nodeValue = node.__vcOut = raw.replace(trimmed, () => ph);
    } else {
      recordMissing(trimmed);
    }
  }

  // ── 元素属性翻译 ──────────────────────────────────────────
  const TRANSLATE_ATTRS = ['placeholder', 'title', 'aria-label', 'aria-placeholder'];

  function translateAttrs(el) {
    TRANSLATE_ATTRS.forEach(attr => {
      const val = el.getAttribute(attr);
      if (!val) return;
      const trimmed = val.trim();
      const zh = dict[trimmed];
      if (zh && zh !== trimmed) { el.setAttribute(attr, zh); return; }
      if (zh) return;
      // 与文本节点同款的归一化二级查找(tooltip/placeholder 同样存在版本间标点漂移)
      const nk = dictAux[normTerm(trimmed)];
      if (nk !== undefined) {
        const base = dict[nk];
        if (base && base !== nk) {
          const tail = (trimmed.match(TAIL_RE) || [''])[0];
          el.setAttribute(attr, base.replace(TAIL_RE, '') + tail);
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
    pruneMissing();                            // 剔除现已翻译的旧采集条目
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
    else if (msg.type === 'VC_COLLECT') { collect = !!msg.on; if (collect && Object.keys(dict).length) walkAndTranslate(document.body); }
    else if (msg.type === 'VC_DUMP') { sendResponse({ count: window.__vcDumpMissing() }); }
    else if (msg.type === 'VC_GET_MISSING') {
      const entries = missingEntries();
      sendResponse({ entries: entries, list: entries.map(e => e.text), lang: loadedLang || 'en' });
    }
    else if (msg.type === 'VC_CLEAR_MISSING') {
      missing.clear();
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
