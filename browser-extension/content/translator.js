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
    lang = lang || 'zh-CN';
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
  const missing = window.__vcMissing || (window.__vcMissing = new Set());
  // 启动时载入已持久化的采集结果
  try {
    chrome.storage.local.get(MISSING_KEY, got => {
      const arr = got && got[MISSING_KEY];
      if (Array.isArray(arr)) arr.forEach(s => missing.add(s));
    });
  } catch (e) { /* ignore */ }
  let saveTimer = null;
  function persistMissing() {
    if (saveTimer) return;
    saveTimer = setTimeout(() => {
      saveTimer = null;
      try { chrome.storage.local.set({ [MISSING_KEY]: Array.from(missing) }); } catch (e) { /* ignore */ }
    }, 1500); // 防抖,避免频繁写盘
  }
  // 字典加载后:剔除已翻译条目(升级/补词后自动收缩待采集集)
  function pruneMissing() {
    let changed = false;
    missing.forEach(s => { if (dict[s] !== undefined) { missing.delete(s); changed = true; } });
    if (changed) persistMissing();
  }
  // 判断一段文本是否"值得翻译的英文"(过滤数字/GUID/纯符号/已含中文)
  function looksTranslatable(s) {
    if (s.length < 2 || s.length > 120) return false;
    if (/[一-鿿]/.test(s)) return false;          // 已含中文
    if (!/[A-Za-z]/.test(s)) return false;                // 无字母
    if (/^[0-9.\-:/\s%]+$/.test(s)) return false;         // 纯数字/时间/百分比
    if (/^[0-9a-f]{8}-[0-9a-f]{4}-/i.test(s)) return false; // GUID
    if ((s.match(/[A-Za-z]/g) || []).length < 2) return false;
    return true;
  }
  function recordMissing(s) {
    if (collect && looksTranslatable(s) && !missing.has(s)) { missing.add(s); persistMissing(); }
  }
  // 导出:下载 JSON + 打印到控制台
  window.__vcDumpMissing = function () {
    const list = Array.from(missing).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
    console.log('[vcf-rosetta] 未翻译词条 ' + list.length + ' 条:', list);
    try {
      const blob = new Blob([JSON.stringify(list, null, 2)], { type: 'application/json' });
      const a = document.createElement('a');
      a.href = URL.createObjectURL(blob);
      a.download = 'vc-missing-' + list.length + '.json';
      document.body.appendChild(a); a.click(); a.remove();
    } catch (e) { /* 下载失败也已打印到控制台 */ }
    return list.length;
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
      else if (m.type === 'characterData') schedule(m.target);
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

  chrome.storage.sync.get({ hosts: [], enabled: true, collect: false, lang: 'zh-CN' }, cfg => {
    collect = !!cfg.collect;
    activateIfNeeded(cfg);
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'VC_ENABLE') {
      chrome.storage.sync.get({ lang: 'zh-CN' }, c => loadDict(c.lang).then(ok => { if (ok) init(); }));
    } else if (msg.type === 'VC_DISABLE') { observer.disconnect(); location.reload(); }
    else if (msg.type === 'VC_COLLECT') { collect = !!msg.on; if (collect && Object.keys(dict).length) walkAndTranslate(document.body); }
    else if (msg.type === 'VC_DUMP') { sendResponse({ count: window.__vcDumpMissing() }); }
    else if (msg.type === 'VC_GET_MISSING') {
      const list = Array.from(missing).sort((a, b) => a.toLowerCase() < b.toLowerCase() ? -1 : 1);
      sendResponse({ list: list, lang: loadedLang || 'zh-CN' });
    }
    else if (msg.type === 'VC_CLEAR_MISSING') {
      missing.clear();
      try { chrome.storage.local.remove(MISSING_KEY); } catch (e) { /* ignore */ }
      sendResponse({ ok: true });
    }
  });
})();
