// Popup: 读取/保存配置(启用开关 + 主机白名单 + 语言),并通知当前标签页应用。
// 界面文案默认英文,仅当所选语言为中文(zh-CN / zh-TW)时切换为中文(见 i18n.js)。
const enabledEl = document.getElementById('enabled');
const hostsEl = document.getElementById('hosts');
const statusEl = document.getElementById('status');
const collectEl = document.getElementById('collect');
const langEl = document.getElementById('lang');
const curHostEl = document.getElementById('curHost');
const { uiLang, t } = window.ROSETTA_I18N;

let ui = 'en';   // 当前界面语言:'en' | 'zh'

// 把 [data-i18n] 元素按当前界面语言渲染(默认英文)
function applyUi() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(ui, el.getAttribute('data-i18n'));
  });
  const orig = langEl.querySelector('option[value="en"]');
  if (orig) orig.textContent = t(ui, 'langOriginal');   // 「英文原文」选项随界面语言刷新
  currentHostname().then(h => { curHostEl.textContent = t(ui, 'curHost', h); });
}

// 从 langs.json 动态填充语言下拉:首项为「英文原文(不翻译)」,其后为可下载语言(标注是否已缓存)
async function populateLanguages(selected) {
  let langs = {};
  try {
    const j = await (await fetch(chrome.runtime.getURL('langs.json'))).json();
    if (j && j.languages) langs = j.languages;
  } catch (e) { /* 用兜底 */ }
  const cached = await chrome.storage.local.get(null);
  langEl.innerHTML = '';

  const orig = document.createElement('option');
  orig.value = 'en';
  orig.textContent = t(ui, 'langOriginal');
  langEl.appendChild(orig);

  for (const [code, meta] of Object.entries(langs)) {
    const opt = document.createElement('option');
    const isCached = !!cached['dict:' + code];
    opt.value = code;
    opt.textContent = `${meta.name}${meta.english ? '(' + meta.english + ')' : ''}${isCached ? ' ✓' : ' ⬇'}`;
    langEl.appendChild(opt);
  }
  langEl.value = selected || 'en';
}

chrome.storage.sync.get({ enabled: true, hosts: [], collect: false, lang: 'en' }, async cfg => {
  ui = uiLang(cfg.lang || 'en');
  enabledEl.checked = !!cfg.enabled;
  hostsEl.value = (cfg.hosts || []).join('\n');
  collectEl.checked = !!cfg.collect;
  await populateLanguages(cfg.lang || 'en');
  applyUi();
});

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function currentHostname() {
  const tab = await activeTab();
  try { return tab && tab.url ? new URL(tab.url).hostname : ''; } catch (e) { return ''; }
}

// ➕ 添加当前站点并启用:把当前页 IP/域名加入强制启用列表(不可变:新数组)
document.getElementById('addCurrent').addEventListener('click', async () => {
  const host = await currentHostname();
  if (!host || /^(chrome|edge|about)/.test(host)) { statusEl.textContent = t(ui, 'notTranslatable'); return; }
  const list = hostsEl.value.split('\n').map(s => s.trim()).filter(Boolean);
  if (list.includes(host)) { statusEl.textContent = t(ui, 'already', host); return; }
  const next = [...list, host];
  hostsEl.value = next.join('\n');
  await chrome.storage.sync.set({ enabled: true, hosts: next });
  enabledEl.checked = true;
  const tab = await activeTab();
  if (tab && tab.id != null) chrome.tabs.reload(tab.id);   // 重载让内容脚本在此站点激活
  statusEl.textContent = t(ui, 'addedEnabled', host);
});

// ➖ 移除当前站点:从强制启用列表删除当前页地址(不可变:filter 出新数组)
document.getElementById('removeCurrent').addEventListener('click', async () => {
  const host = await currentHostname();
  if (!host) { statusEl.textContent = t(ui, 'cantIdentify'); return; }
  const list = hostsEl.value.split('\n').map(s => s.trim()).filter(Boolean);
  if (!list.includes(host)) { statusEl.textContent = t(ui, 'notInList', host); return; }
  const next = list.filter(h => h !== host);
  hostsEl.value = next.join('\n');
  await chrome.storage.sync.set({ hosts: next });
  const tab = await activeTab();
  if (tab && tab.id != null) chrome.tabs.reload(tab.id);   // 重载让此站点停止翻译
  statusEl.textContent = t(ui, 'removed', host);
});

// ℹ️ 关于页:在新标签打开开发者与许可证信息(随当前语言显示)
document.getElementById('about').addEventListener('click', () => {
  chrome.tabs.create({ url: chrome.runtime.getURL('popup/about.html') + '?ui=' + ui });
});

// 切换语言:保存、即时切换界面文案、并刷新当前页生效
langEl.addEventListener('change', async () => {
  await chrome.storage.sync.set({ lang: langEl.value });
  ui = uiLang(langEl.value);
  applyUi();
  const tab = await activeTab();
  if (tab && tab.id != null) chrome.tabs.reload(tab.id);
  statusEl.textContent = t(ui, 'switched');
});

// 采集开关:即时生效
collectEl.addEventListener('change', async () => {
  await chrome.storage.sync.set({ collect: collectEl.checked });
  const tab = await activeTab();
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: 'VC_COLLECT', on: collectEl.checked }, () => void chrome.runtime.lastError);
  }
  statusEl.textContent = collectEl.checked ? t(ui, 'collectOn') : t(ui, 'collectOff');
});

// 导出未翻译词条
document.getElementById('dump').addEventListener('click', async () => {
  const tab = await activeTab();
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: 'VC_DUMP' }, resp => {
      if (chrome.runtime.lastError) { statusEl.textContent = t(ui, 'refreshFirst'); return; }
      statusEl.textContent = t(ui, 'exported', (resp && resp.count) || 0);
    });
  }
});

// 词条回流:两条通道(GitHub Issue / 邮件),共用采集结果
const REPO = 'vcf-rosetta/vcf-rosetta';
const DEV_EMAIL = 'zhouwei008@gmail.com'; // 词条贡献接收邮箱
const URL_BUDGET = 7000; // GitHub/mailto URL 实测安全上限,超出则截断并提示附本地文件

// 取当前页采集到的未翻译词条(带标记),回调 (entries, lang, region)
function withMissing(cb) {
  activeTab().then(tab => {
    if (!tab || tab.id == null) { statusEl.textContent = t(ui, 'openVcFirst'); return; }
    chrome.tabs.sendMessage(tab.id, { type: 'VC_GET_MISSING' }, resp => {
      if (chrome.runtime.lastError || !resp) { statusEl.textContent = t(ui, 'refreshAndCollect'); return; }
      const entries = resp.entries || (resp.list || []).map(t2 => ({ text: t2, tool: '?', count: 1, flags: [] }));
      if (!entries.length) { statusEl.textContent = t(ui, 'noneCollected'); return; }
      cb(entries, resp.lang || langEl.value || 'en', (document.getElementById('region').value || '').trim());
    });
  });
}
// 在预算内尽量多地塞词条,返回 { arr, truncated }
function fitWithin(list, render) {
  let arr = list, truncated = false;
  while (arr.length > 1 && encodeURIComponent(render(arr)).length > URL_BUDGET) {
    arr = arr.slice(0, Math.floor(arr.length * 0.8)); truncated = true;
  }
  return { arr, truncated };
}
// 紧凑序列化(带标记):{text, tool, flags},省去 title/count 控制体积
const compact = a => a.map(e => e.flags && e.flags.length ? { text: e.text, tool: e.tool, flags: e.flags } : { text: e.text, tool: e.tool });

document.getElementById('contribute').addEventListener('click', () => withMissing((entries, lang, region) => {
  const title = `[i18n] ${lang} missing ${entries.length}${region ? ' · ' + region : ''}`;
  const render = a => `> Untranslated UI terms auto-collected by the VCF UI Translator extension. Target language: **${lang}**${region ? ', source: ' + region : ''}.\n` +
    `> Each entry carries \`tool\` (source tool page) and \`flags\` (anomaly hints) to help maintainers triage.\n` +
    `> Maintainer: \`node contrib/merge-incoming.mjs <file> ${lang}\` to dedupe & merge into \`plugin/i18n/domains/\`.\n\n\`\`\`json\n${JSON.stringify(compact(a))}\n\`\`\`\n`;
  const { arr, truncated } = fitWithin(entries, render);
  let body = render(arr);
  if (truncated) body += `\n_Note: too many terms; this Issue includes only the first ${arr.length}/${entries.length}. Attach the full list via “Export JSON (local)”._\n`;
  chrome.tabs.create({ url: `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent('i18n,translation-contribution')}` +
    `&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}` });
  statusEl.textContent = truncated ? `GitHub opened (first ${arr.length}/${entries.length}); attach the local export for the rest.` : `GitHub opened (${entries.length}); click Submit.`;
}));

document.getElementById('mail').addEventListener('click', () => withMissing((entries, lang, region) => {
  const subject = `[vcf-rosetta i18n] ${lang} missing ${entries.length}${region ? ' · ' + region : ''}`;
  const render = a => `Target language: ${lang}\nSource: ${region || '(none)'}\nTerms: ${a.length}\n(each entry: tool=source page, flags=anomaly hints)\n\n` +
    `${JSON.stringify(compact(a), null, 2)}\n`;
  const { arr, truncated } = fitWithin(entries, render);
  let body = render(arr);
  if (truncated) body += `\nNote: many terms; this email body includes only the first ${arr.length}/${entries.length}. Please attach the full JSON from “Export JSON (local)”.\n`;
  chrome.tabs.create({ url: `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` });
  statusEl.textContent = truncated ? `Email opened (first ${arr.length}/${entries.length}); attach the local JSON.` : `Email opened (${entries.length}); send it.`;
}));

document.getElementById('clear').addEventListener('click', async () => {
  const tab = await activeTab();
  if (!tab || tab.id == null) { statusEl.textContent = t(ui, 'openVcFirst'); return; }
  chrome.tabs.sendMessage(tab.id, { type: 'VC_CLEAR_MISSING' }, () => {
    void chrome.runtime.lastError;
    statusEl.textContent = t(ui, 'cleared');
  });
});

document.getElementById('save').addEventListener('click', async () => {
  const enabled = enabledEl.checked;
  const hosts = hostsEl.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  await chrome.storage.sync.set({ enabled, hosts });
  statusEl.textContent = t(ui, 'saved');

  // 通知当前标签页立即生效
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: enabled ? 'VC_ENABLE' : 'VC_DISABLE' }, () => void chrome.runtime.lastError);
  }
});
