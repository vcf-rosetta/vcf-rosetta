// 翻译引擎:MutationObserver + TreeWalker,将 vCenter UI 英文文本实时替换为中文。
// 词典由 dict.js 注入到 window.__vcDict(英文 UI 串 -> 简体中文)。
(function () {
  'use strict';

  // 字典按需加载:扩展包本身不内置数 MB 词典(保持轻量),仅在确认是 vCenter/Aria 页面时,
  // 按选定语言获取 dict.<lang>.json。三级来源:① 扩展内置(开发/离线时存在才用);
  // ② 本地缓存(chrome.storage.local,按版本);③ 远程语言包(jsDelivr)→ 下载后缓存。
  const LANGPACK_BASE = 'https://cdn.jsdelivr.net/gh/vcf-rosetta/langpacks@main';
  let dict = {};
  let loadedLang = null;
  let LANGS = {};
  fetch(chrome.runtime.getURL('langs.json')).then(r => r.json())
    .then(j => { LANGS = (j && j.languages) || {}; }).catch(() => {});

  async function loadDict(lang) {
    lang = lang || 'en';
    if (lang === 'en') { dict = {}; loadedLang = 'en'; return false; } // 英文原文:无词典,不翻译、不联网
    if (loadedLang === lang && Object.keys(dict).length) return true;
    const ver = (LANGS[lang] && LANGS[lang].version) || '0';
    const cacheKey = 'dict:' + lang;

    // ① 扩展内置(若打包时附带了 dict.<lang>.json)
    try {
      const res = await fetch(chrome.runtime.getURL('dict.' + lang + '.json'));
      if (res.ok) { dict = await res.json(); loadedLang = lang;
        console.info('[vcf-rosetta] 内置字典:' + lang + ',' + Object.keys(dict).length + ' 条'); return Object.keys(dict).length > 0; }
    } catch (e) { /* 未内置,继续 */ }

    // ② 本地缓存(版本一致才用)
    try {
      const got = await chrome.storage.local.get(cacheKey);
      const c = got[cacheKey];
      if (c && c.version === ver && c.data) { dict = c.data; loadedLang = lang;
        console.info('[vcf-rosetta] 缓存字典:' + lang + ',' + Object.keys(dict).length + ' 条'); return true; }
    } catch (e) { /* ignore */ }

    // ③ 远程下载 → 写缓存
    const url = LANGPACK_BASE + '/dict.' + lang + '.json';
    try {
      const res = await fetch(url);
      if (!res.ok) { console.warn('[vcf-rosetta] 语言包下载失败 HTTP ' + res.status + ' @ ' + url); return false; }
      dict = await res.json();
      loadedLang = lang;
      try { await chrome.storage.local.set({ [cacheKey]: { version: ver, data: dict } }); } catch (e) { /* 配额? */ }
      console.info('[vcf-rosetta] 已下载并缓存语言包:' + lang + ',' + Object.keys(dict).length + ' 条');
      return Object.keys(dict).length > 0;
    } catch (e) {
      console.warn('[vcf-rosetta] 语言包下载异常 @ ' + url + ' : ' + e.message);
      return false;
    }
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
  function persistMissing() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try { chrome.storage.local.set({ [MISSING_KEY]: Object.fromEntries(missing) }); } catch (e) { /* ignore */ }
    }, 1500); // 防抖,避免频繁写盘
  }
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
  // 判断一段文本是否"值得翻译的英文"(过滤数字/GUID/纯符号/已含中文/动态值)
  function looksTranslatable(s) {
    if (s.length < 2 || s.length > 120) return false;
    if (/[一-鿿]/.test(s)) return false;          // 已含中文
    if (!/[A-Za-z]/.test(s)) return false;                // 无字母
    if (/^[0-9.\-:/\s%]+$/.test(s)) return false;         // 纯数字/时间/百分比
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) return false; // GUID
    if ((s.match(/[A-Za-z]/g) || []).length < 2) return false;
    if (DYNAMIC_RE.some(re => re.test(s))) return false;  // 日期/时间/MAC/数值-单位:动态值,跳过
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
    const TITLE_MARKERS = [
      'vSphere', 'vCenter', 'SDDC Manager', 'Cloud Foundation',
      'Aria Operations', 'VCF Operations', 'vRealize Operations',
      'Operations for Logs', 'Log Insight', 'vRealize Log',          // 日志工具
      'Aria Automation', 'vRealize Automation', 'NSX',               // 其它 VCF 工具
    ];
    return (
      location.pathname.startsWith('/ui') ||
      TITLE_MARKERS.some(m => t.includes(m)) ||
      // Clarity 框架特征(绝大多数 VCF 工具页都用 Clarity / Angular)
      !!document.querySelector('clr-header, .clr-app-container, vsphere-client, clr-main-container')
    );
  }

  // ── 受控模式替换 ──────────────────────────────────────────
  // 用于"数字动态、后缀固定"的场景(如 "267.45 GHz free")。仅匹配高度具体的
  // 安全模式,避免误翻别处的同名词。精确匹配未命中时才尝试。
  const PHRASES = [
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+free$/i, '$1 空闲'],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+used$/i, '$1 已用'],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+capacity$/i, '$1 容量'],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+available$/i, '$1 可用'],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+allocated$/i, '$1 已分配'],
    [/^([\d.,]+\s*[A-Za-z%/]+)\s+total$/i, '$1 总计'],
    [/^(.+?)\s+used\s*\|\s*(.+?)\s+total$/i, '$1 已用 | $2 总计'],
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+items?$/i, '第 $1 - $2 项,共 $3 项'],
    [/^(\d+)\s+of\s+(\d+)\s+items?$/i, '共 $2 项中的 $1 项'],
    [/^(\d+)\s+items?$/i, '$1 项'],
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+users?$/i, '第 $1 - $2 个,共 $3 个用户'],
    [/^(\d+)\s+of\s+(\d+)\s+users?$/i, '共 $2 个用户中的 $1 个'],
    [/^(\d+)\s+Datastore\(s\)$/i, '$1 个数据存储'],
    [/^(\d+)\s+Network\(s\)$/i, '$1 个网络'],
    [/^(\d+)\s+tasks?$/i, '$1 个任务'],
    [/^(\d+)\s+CPU\(s\)\s+x\s+(.+)$/i, '$1 个 CPU x $2'],
    [/^The license expires in\s+(\d+)\s+days?\.$/i, '许可证将在 $1 天后过期。'],
    [/^(.+?)\s+task running on target\s+(.+?)\s+finished with status SUCCESS$/i,
      '在目标 $2 上运行的“$1”任务已完成,状态为 SUCCESS'],
    [/^Last updated at\b/i, '最后更新于'],
    [/^Updated\b/i, '已更新'],
    [/^(\d+)\s+days?$/i, '$1 天'],
    [/^(\d+)\s+hours?$/i, '$1 小时'],
    [/^(\d+)\s+minutes?$/i, '$1 分钟'],
    [/^(\d+)\s+seconds?$/i, '$1 秒'],
    [/^(\d+)\s+days?\s+ago$/i, '$1 天前'],
    [/^(\d+)\s+hours?\s+ago$/i, '$1 小时前'],
    [/^(\d+)\s+minutes?\s+ago$/i, '$1 分钟前'],
    [/^a few seconds ago$/i, '几秒前'],
  ];
  function applyPhrases(s) {
    for (var i = 0; i < PHRASES.length; i++) {
      if (PHRASES[i][0].test(s)) return s.replace(PHRASES[i][0], PHRASES[i][1]);
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
    if (zh && zh !== trimmed) {
      node.nodeValue = node.__vcOut = raw.replace(trimmed, zh); // 保留首尾空白
      return;
    }
    if (zh) return; // 命中但译文==原文(专有名词),不动
    // 精确未命中:试受控模式替换
    const ph = applyPhrases(trimmed);
    if (ph !== trimmed) {
      node.nodeValue = node.__vcOut = raw.replace(trimmed, ph);
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
      if (zh && zh !== trimmed) el.setAttribute(attr, zh);
    });
  }

  // ── 遍历节点树 ────────────────────────────────────────────
  function walkAndTranslate(root) {
    if (!root) return;
    if (root.nodeType === Node.TEXT_NODE) { translateText(root); return; }
    if (root.nodeType !== Node.ELEMENT_NODE) return;

    const tag = root.tagName ? root.tagName.toLowerCase() : '';
    if (['script', 'style', 'noscript', 'code', 'pre', 'textarea'].includes(tag)) return;

    translateAttrs(root);
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, null);
    let node;
    while ((node = walker.nextNode())) translateText(node);
  }

  // ── MutationObserver(Angular SPA 路由切换 / 数据加载) ──────
  // 用 rAF 批处理:把待处理节点入队、合并到一帧统一翻译。绝不丢 mutation
  // (旧版 busy 标志会丢弃繁忙期的变更 -> 漏翻)。
  let pending = new Set();
  let scheduled = false;
  function flush() {
    scheduled = false;
    const roots = pending; pending = new Set();
    roots.forEach(walkAndTranslate);
  }
  function schedule(node) {
    pending.add(node);
    if (!scheduled) {
      scheduled = true;
      (window.requestAnimationFrame || window.setTimeout)(flush, 0);
    }
  }
  const observer = new MutationObserver(mutations => {
    for (const m of mutations) {
      if (m.type === 'childList') m.addedNodes.forEach(schedule);
      // 跳过我们自己写回的文本节点(避免在指标实时刷新的页面上空转处理一遍又早退)
      else if (m.type === 'characterData') { if (m.target.__vcOut !== m.target.nodeValue) schedule(m.target); }
      else if (m.type === 'attributes' && m.target.nodeType === Node.ELEMENT_NODE) translateAttrs(m.target);
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
  });
})();
