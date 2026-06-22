// 翻译引擎:MutationObserver + TreeWalker,将 vCenter UI 英文文本实时替换为中文。
// 词典由 dict.js 注入到 window.__vcDict(英文 UI 串 -> 简体中文)。
(function () {
  'use strict';

  // 字典按需加载:仅在确认是 vCenter 页面时 fetch 选定语言的 dict.<lang>.json,
  // 避免在每个网站注入数 MB。语言由用户在 popup 选择(默认 zh-CN)。
  let dict = {};
  let loadedLang = null;
  async function loadDict(lang) {
    lang = lang || 'zh-CN';
    if (loadedLang === lang && Object.keys(dict).length) return true;
    try {
      const res = await fetch(chrome.runtime.getURL('dict.' + lang + '.json'));
      dict = await res.json();
      loadedLang = lang;
      return Object.keys(dict).length > 0;
    } catch (e) { return false; }
  }

  // ── 未翻译词条采集(调试用)──────────────────────────────
  // 开启后,把所有「未命中字典的英文文本」收集起来,供导出补词。
  let collect = false;
  const missing = window.__vcMissing || (window.__vcMissing = new Set());
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
    if (collect && looksTranslatable(s)) missing.add(s);
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

  // 只翻译 vCenter/VCF 相关页面:① 用户配置的白名单;② 否则自动检测 Clarity UI 特征
  function shouldActivate(cfg) {
    if (!cfg.enabled) return false;
    const hosts = cfg.hosts || [];
    if (hosts.length > 0) {
      return hosts.some(h => h && location.hostname.includes(h));
    }
    return (
      location.pathname.startsWith('/ui') ||
      document.title.includes('vSphere') ||
      document.title.includes('vCenter') ||
      document.title.includes('SDDC Manager') ||
      !!document.querySelector('clr-header, .clr-app-container, vsphere-client')
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
    [/^(\d+)\s*-\s*(\d+)\s+of\s+(\d+)\s+items?$/i, '第 $1 - $2 项,共 $3 项'],
    [/^(\d+)\s+of\s+(\d+)\s+items?$/i, '共 $2 项中的 $1 项'],
    [/^(\d+)\s+items?$/i, '$1 项'],
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
    if (node.__vcZh) return;
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    const trimmed = raw.trim();
    if (CJK.test(trimmed)) { node.__vcZh = true; return; } // 已是中文,早退(省重扫开销)
    const zh = dict[trimmed];
    if (zh && zh !== trimmed) {
      node.nodeValue = raw.replace(trimmed, zh); // 保留首尾空白
      node.__vcZh = true;
      return;
    }
    if (zh) return; // 命中但译文==原文(专有名词),不动
    // 精确未命中:试受控模式替换
    const ph = applyPhrases(trimmed);
    if (ph !== trimmed) {
      node.nodeValue = raw.replace(trimmed, ph);
      node.__vcZh = true;
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
  });
})();
