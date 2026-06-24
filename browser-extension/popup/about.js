// 关于页语言选择:默认英文,仅当所选语言为中文(zh-CN / zh-TW)时显示中文。
// 来源优先级:URL ?ui=zh|en(由弹窗传入)→ 否则读 storage.sync.lang。
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
    chrome.storage.sync.get({ lang: 'en' }, cfg => {
      show((cfg.lang === 'zh-CN' || cfg.lang === 'zh-TW') ? 'zh' : 'en');
    });
  } catch (e) { show('en'); }
})();
