// 关于页界面语言:默认英文,跟随独立的界面语言设置(uiLang),与翻译语言包无关。
// 来源优先级:URL ?ui=zh|en(由弹窗传入)→ 否则读 storage.sync.uiLang。
(function () {
  'use strict';
  function show(ui) {
    const zh = ui === 'zh';
    document.getElementById('about-zh').hidden = !zh;
    document.getElementById('about-en').hidden = zh;
    document.documentElement.lang = zh ? 'zh-CN' : 'en';
  }
  const q = new URLSearchParams(location.search).get('ui');
  if (q === 'zh' || q === 'en') { show(q); return; }
  try {
    chrome.storage.sync.get({ uiLang: 'en' }, cfg => show(cfg.uiLang === 'zh' ? 'zh' : 'en'));
  } catch (e) { show('en'); }
})();
