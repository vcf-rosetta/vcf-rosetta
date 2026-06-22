// 翻译引擎:MutationObserver + TreeWalker,将 vCenter UI 英文文本实时替换为中文。
// 词典由 dict.js 注入到 window.__vcDict(英文 UI 串 -> 简体中文)。
(function () {
  'use strict';

  const dict = window.__vcDict || {};
  if (Object.keys(dict).length === 0) return;

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

  chrome.storage.sync.get({ hosts: [], enabled: true }, cfg => {
    if (shouldActivate(cfg)) {
      if (document.body) init();
      else document.addEventListener('DOMContentLoaded', init, { once: true });
    }
  });

  chrome.runtime.onMessage.addListener(msg => {
    if (msg.type === 'VC_ENABLE') init();
    else if (msg.type === 'VC_DISABLE') { observer.disconnect(); location.reload(); }
  });
})();
