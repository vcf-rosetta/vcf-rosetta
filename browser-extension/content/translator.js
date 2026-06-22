// 翻译引擎:MutationObserver + TreeWalker,将 vCenter UI 英文文本实时替换为中文。
// 词典由 dict.js 注入到 window.__vcDict(英文 UI 串 -> 简体中文)。
(function () {
  'use strict';

  const dict = window.__vcDict || {};
  if (Object.keys(dict).length === 0) return;

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

  // ── 文本节点翻译 ──────────────────────────────────────────
  function translateText(node) {
    if (node.__vcZh) return;
    const raw = node.nodeValue;
    if (!raw || !raw.trim()) return;
    const trimmed = raw.trim();
    const zh = dict[trimmed];
    if (zh && zh !== trimmed) {
      node.nodeValue = raw.replace(trimmed, zh); // 保留首尾空白
      node.__vcZh = true;
    } else if (!zh) {
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
  let busy = false;
  const observer = new MutationObserver(mutations => {
    if (busy) return;
    busy = true;
    for (const m of mutations) {
      if (m.type === 'childList') m.addedNodes.forEach(n => walkAndTranslate(n));
      else if (m.type === 'characterData') translateText(m.target);
      else if (m.type === 'attributes' && m.target.nodeType === Node.ELEMENT_NODE) translateAttrs(m.target);
    }
    busy = false;
  });

  function init() {
    walkAndTranslate(document.body);
    observer.observe(document.body, {
      childList: true, subtree: true, characterData: true,
      attributes: true, attributeFilter: TRANSLATE_ATTRS,
    });
    const titleEl = document.querySelector('title');
    if (titleEl) walkAndTranslate(titleEl);
  }

  chrome.storage.sync.get({ hosts: [], enabled: true, collect: false }, cfg => {
    collect = !!cfg.collect;
    if (shouldActivate(cfg)) {
      if (document.body) init();
      else document.addEventListener('DOMContentLoaded', init, { once: true });
    }
  });

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === 'VC_ENABLE') init();
    else if (msg.type === 'VC_DISABLE') { observer.disconnect(); location.reload(); }
    else if (msg.type === 'VC_COLLECT') { collect = !!msg.on; if (collect) walkAndTranslate(document.body); }
    else if (msg.type === 'VC_DUMP') { sendResponse({ count: window.__vcDumpMissing() }); }
  });
})();
