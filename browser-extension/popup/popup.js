// Popup: 读取/保存配置(启用开关 + 主机白名单 + 语言),并通知当前标签页应用。
// 界面文案默认英文,仅当所选语言为中文(zh-CN / zh-TW)时切换为中文(见 i18n.js)。
const hostsEl = document.getElementById('hosts');
const statusEl = document.getElementById('status');
const collectEl = document.getElementById('collect');
const langEl = document.getElementById('lang');
const curHostEl = document.getElementById('curHost');
const { t, resolve } = window.ROSETTA_I18N;
const uiLangEl = document.getElementById('uilang');

// 界面语言是独立设置,与「翻译语言包」解耦:用右上角选择器切换(en / zh-CN / zh-TW / de / it / ko)。
// 首次打开默认跟随浏览器语言,无匹配则英文。
let ui = 'en';

// 把 [data-i18n] 元素按当前界面语言渲染,并同步选择器与原文选项
function applyUi() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(ui, el.getAttribute('data-i18n'));
  });
  if (uiLangEl) { uiLangEl.value = ui; uiLangEl.title = t(ui, 'uiTip'); }
  const orig = langEl.querySelector('option[value="en"]');
  if (orig) orig.textContent = t(ui, 'langOriginal');   // 「英文原文」选项随界面语言刷新
  refreshOffHint();
  showDict(lastDictInfo);   // 语言切换时用最近一次信息重渲(来源词本地化)
  currentHostname().then(h => { curHostEl.textContent = t(ui, 'curHost', h); });
}

// 当前页词典信息(语言·版本·条数·来源),供测试机确认「在用哪版词典」
let lastDictInfo = null;
function srcLabel(from) {
  return from === 'bundled' ? t(ui, 'srcBundled') : from === 'cache' ? t(ui, 'srcCache') : from === 'cdn' ? t(ui, 'srcCdn') : '—';
}
const OFFLINE_PACK_URL = 'https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip';
function showDict(info) {
  lastDictInfo = info;
  const el = document.getElementById('dictInfo');
  if (!el) return;
  // 词典彻底取不到(所有 CDN 不可达且无缓存):明确告知 + 给出离线包出路,不再静默显示"—"
  if (info && info.failed && !info.count) {
    el.textContent = '';
    el.append(document.createTextNode(t(ui, 'dictFailed') + ' '));
    const a = document.createElement('a');
    a.href = OFFLINE_PACK_URL;
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = t(ui, 'dictFailedLink');
    el.append(a);
    return;
  }
  if (!info || !info.lang || info.lang === 'en' || !info.count) { el.textContent = t(ui, 'dictNone'); return; }
  el.textContent = `${info.lang} v${info.version || '?'} · ${info.count} ${t(ui, 'dictTerms')} · ${srcLabel(info.from)}`;
}
function queryDict() {
  activeTab().then(tab => {
    if (!tab || tab.id == null) { showDict(null); return; }
    chrome.tabs.sendMessage(tab.id, { type: 'VC_DICT_INFO' }, info => {
      if (chrome.runtime.lastError) { showDict(null); return; }   // 非 VCF 页 / 内容脚本未注入
      showDict(info);
    });
  });
}

// 翻译语言为 en(原文/不翻译)时,给出醒目提示,消除「记住了站点却没翻译」的困惑
function refreshOffHint() {
  const el = document.getElementById('offHint');
  if (!el) return;
  el.hidden = langEl.value !== 'en';
}

// 右上角界面语言选择器:切换 en / zh-CN / zh-TW / de / it / ko,独立持久化(uiLang),不动翻译语言包
uiLangEl.addEventListener('change', async () => {
  ui = resolve(uiLangEl.value);
  await chrome.storage.sync.set({ uiLang: ui });
  applyUi();
});

// 检测某语言词库是否扩展内置(离线包):本地资源 fetch 命中即“现成可用”,无需联网下载。
// 只读响应头、不消费 body(本地资源,几乎零开销)。
async function isBundled(code) {
  try {
    const r = await fetch(chrome.runtime.getURL('dict.' + code + '.json'));
    if (r.body && r.body.cancel) try { r.body.cancel(); } catch (e) { /* ignore */ }
    return r.ok;
  } catch (e) { return false; }
}

// 从 langs.json 填充语言下拉:首项为「英文原文(不翻译)」。已具备(内置/已缓存)的语言直接列出;
// 仅“联网包里尚未下载”的语言才标 ⬇。离线部署因词库已内置,全部干净无下载标记,界面更简洁。
async function populateLanguages(selected) {
  let langs = {};
  try {
    const j = await (await fetch(chrome.runtime.getURL('langs.json'))).json();
    if (j && j.languages) langs = j.languages;
  } catch (e) { /* 用兜底 */ }
  const cached = await chrome.storage.local.get(null);
  const codes = Object.keys(langs);
  const bundled = await Promise.all(codes.map(isBundled));   // 离线包:全部命中
  langEl.innerHTML = '';

  const orig = document.createElement('option');
  orig.value = 'en';
  orig.textContent = t(ui, 'langOriginal');
  langEl.appendChild(orig);

  codes.forEach((code, i) => {
    const meta = langs[code];
    const have = bundled[i] || !!cached['dict:' + code];     // 内置 或 已缓存 = 现成可用
    const opt = document.createElement('option');
    opt.value = code;
    opt.textContent = `${meta.name}${meta.english ? '(' + meta.english + ')' : ''}${have ? '' : ' ⬇'}`;
    langEl.appendChild(opt);
  });
  langEl.value = selected || 'en';
}

chrome.storage.sync.get({ enabled: true, hosts: [], collect: false, lang: 'en', uiLang: '' }, async cfg => {
  // 已保存则用保存值(归一化),否则首次跟随浏览器语言
  ui = cfg.uiLang ? resolve(cfg.uiLang) : window.ROSETTA_I18N.detect();
  hostsEl.value = (cfg.hosts || []).join('\n');
  collectEl.checked = !!cfg.collect;
  await populateLanguages(cfg.lang || 'en');
  applyUi();
  queryDict();   // 拉取当前页正在用的词典信息
});

// ↻ 刷新词典:让当前页内容脚本清缓存、强制重取最新词典并整页重翻
document.getElementById('refreshDict').addEventListener('click', async () => {
  const tab = await activeTab();
  if (!tab || tab.id == null) { statusEl.textContent = t(ui, 'openVcFirst'); return; }
  statusEl.textContent = t(ui, 'dictRefreshing');
  chrome.tabs.sendMessage(tab.id, { type: 'VC_REFRESH_DICT' }, info => {
    if (chrome.runtime.lastError) { statusEl.textContent = t(ui, 'refreshFirst'); return; }
    showDict(info);
    statusEl.textContent = t(ui, 'dictRefreshed');
  });
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
  const tab = await activeTab();
  if (tab && tab.id != null) chrome.tabs.reload(tab.id);   // 重载让内容脚本在此站点激活
  // 若翻译语言仍为「英文原文/不翻译」,加站点也不会翻 —— 明确引导用户先选语言
  statusEl.textContent = langEl.value === 'en' ? t(ui, 'addedOff', host) : t(ui, 'addedEnabled', host);
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

// ℹ️ 关于:就地展开/收起内联小窗口(开发者联系方式 + 许可证),不另开页面,更轻量友好
document.getElementById('about').addEventListener('click', () => {
  const panel = document.getElementById('aboutPanel');
  if (panel) panel.hidden = !panel.hidden;
});

// 切换「翻译语言包」:保存并刷新当前页生效。界面语言不受影响(由顶部开关单独控制)。
langEl.addEventListener('change', async () => {
  await chrome.storage.sync.set({ lang: langEl.value });
  refreshOffHint();
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
const REPO = 'vcf-rosetta/vcf-rosetta';   // 公开主仓库:外部用户可见可提 Issue
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
  // 翻译开关由「翻译语言」承担(选 English 原文 = 不翻译);保存只持久化手工编辑的站点列表并应用。
  const hosts = hostsEl.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  await chrome.storage.sync.set({ enabled: true, hosts });
  statusEl.textContent = t(ui, 'saved');

  // 通知当前标签页立即生效
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: 'VC_ENABLE' }, () => void chrome.runtime.lastError);
  }
});
