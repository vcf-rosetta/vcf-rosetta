// Popup: 读取/保存配置(启用开关 + 主机白名单),并通知当前标签页应用。
const enabledEl = document.getElementById('enabled');
const hostsEl = document.getElementById('hosts');
const statusEl = document.getElementById('status');
const collectEl = document.getElementById('collect');
const langEl = document.getElementById('lang');

// 从 langs.json 动态填充语言下拉(标注是否已本地缓存),再载入已存配置
async function populateLanguages(selected) {
  let langs = { 'zh-CN': { name: '简体中文' }, 'de': { name: 'Deutsch' } };
  try {
    const j = await (await fetch(chrome.runtime.getURL('langs.json'))).json();
    if (j && j.languages) langs = j.languages;
  } catch (e) { /* 用兜底 */ }
  const cached = await chrome.storage.local.get(null);
  langEl.innerHTML = '';
  for (const [code, meta] of Object.entries(langs)) {
    const opt = document.createElement('option');
    const isCached = !!cached['dict:' + code];
    opt.value = code;
    opt.textContent = `${meta.name}${meta.english ? '(' + meta.english + ')' : ''}${isCached ? ' ✓已下载' : ' ⬇可下载'}`;
    langEl.appendChild(opt);
  }
  langEl.value = selected || 'zh-CN';
}

chrome.storage.sync.get({ enabled: true, hosts: [], collect: false, lang: 'zh-CN' }, cfg => {
  enabledEl.checked = !!cfg.enabled;
  hostsEl.value = (cfg.hosts || []).join('\n');
  collectEl.checked = !!cfg.collect;
  populateLanguages(cfg.lang || 'zh-CN');
});

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

// 切换语言:保存并刷新当前页生效
langEl.addEventListener('change', async () => {
  await chrome.storage.sync.set({ lang: langEl.value });
  const tab = await activeTab();
  if (tab && tab.id != null) chrome.tabs.reload(tab.id);
  statusEl.textContent = '已切换语言,正在刷新页面…';
});

// 采集开关:即时生效
collectEl.addEventListener('change', async () => {
  await chrome.storage.sync.set({ collect: collectEl.checked });
  const tab = await activeTab();
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: 'VC_COLLECT', on: collectEl.checked }, () => void chrome.runtime.lastError);
  }
  statusEl.textContent = collectEl.checked ? '已开始收集,浏览缺词页面后点导出。' : '已停止收集。';
});

// 导出未翻译词条
document.getElementById('dump').addEventListener('click', async () => {
  const tab = await activeTab();
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: 'VC_DUMP' }, resp => {
      if (chrome.runtime.lastError) { statusEl.textContent = '请先刷新 vCenter 页面再导出。'; return; }
      statusEl.textContent = '已导出 ' + (resp && resp.count || 0) + ' 条(下载 JSON)。';
    });
  }
});

// 词条回流:两条通道(GitHub Issue / 邮件),共用采集结果
const REPO = 'vcf-rosetta/vcf-rosetta';
const DEV_EMAIL = 'zhouwei008@gmail.com'; // 词条贡献接收邮箱
const URL_BUDGET = 7000; // GitHub/mailto URL 实测安全上限,超出则截断并提示附本地文件

// 取当前页采集到的未翻译词条,回调 (list, lang, region)
function withMissing(cb) {
  activeTab().then(tab => {
    if (!tab || tab.id == null) { statusEl.textContent = '请先打开 vCenter 页面。'; return; }
    chrome.tabs.sendMessage(tab.id, { type: 'VC_GET_MISSING' }, resp => {
      if (chrome.runtime.lastError || !resp) { statusEl.textContent = '请先刷新 vCenter 页面,并开启“收集未翻译词条”。'; return; }
      const list = resp.list || [];
      if (!list.length) { statusEl.textContent = '当前没有采集到未翻译词条(先开启收集并浏览缺词页面)。'; return; }
      cb(list, resp.lang || langEl.value || 'zh-CN', (document.getElementById('region').value || '').trim());
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

document.getElementById('contribute').addEventListener('click', () => withMissing((list, lang, region) => {
  const title = `[i18n] ${lang} 缺词 ${list.length} 条${region ? ' · ' + region : ''}`;
  const render = a => `> 由 VCF 9 UI Translator 扩展自动采集的未翻译界面词条,目标语言:**${lang}**${region ? ',来源:' + region : ''}。\n` +
    `> 维护者:合并到 \`plugin/i18n/domains/\` 后重建词典。\n\n\`\`\`json\n${JSON.stringify(a)}\n\`\`\`\n`;
  const { arr, truncated } = fitWithin(list, render);
  let body = render(arr);
  if (truncated) body += `\n_注:词条过多,本 Issue 仅含前 ${arr.length}/${list.length} 条;完整清单请用“导出 JSON(本地)”后拖入评论。_\n`;
  chrome.tabs.create({ url: `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent('i18n,translation-contribution')}` +
    `&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}` });
  statusEl.textContent = truncated ? `已打开 GitHub(前 ${arr.length}/${list.length} 条);量大请另附本地导出。` : `已打开 GitHub(${list.length} 条),点 Submit 即可。`;
}));

document.getElementById('mail').addEventListener('click', () => withMissing((list, lang, region) => {
  const subject = `[vcf-rosetta i18n] ${lang} 缺词 ${list.length} 条${region ? ' · ' + region : ''}`;
  const render = a => `目标语言: ${lang}\n来源: ${region || '(未填)'}\n词条数: ${a.length}\n\n` +
    `${JSON.stringify(a, null, 2)}\n`;
  const { arr, truncated } = fitWithin(list, render);
  let body = render(arr);
  if (truncated) body += `\n注:词条较多,本邮件正文仅含前 ${arr.length}/${list.length} 条;请把“导出 JSON(本地)”得到的完整文件作为附件一并发送。\n`;
  chrome.tabs.create({ url: `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` });
  statusEl.textContent = truncated ? `已打开邮件(前 ${arr.length}/${list.length} 条);请把本地导出的 JSON 作为附件。` : `已打开邮件(${list.length} 条),发送即可。`;
}));

document.getElementById('clear').addEventListener('click', async () => {
  const tab = await activeTab();
  if (!tab || tab.id == null) { statusEl.textContent = '请先打开 vCenter 页面。'; return; }
  chrome.tabs.sendMessage(tab.id, { type: 'VC_CLEAR_MISSING' }, () => {
    void chrome.runtime.lastError;
    statusEl.textContent = '已清空本地采集的未翻译词条。';
  });
});

document.getElementById('save').addEventListener('click', async () => {
  const enabled = enabledEl.checked;
  const hosts = hostsEl.value
    .split('\n')
    .map(s => s.trim())
    .filter(Boolean);

  await chrome.storage.sync.set({ enabled, hosts });
  statusEl.textContent = '已保存。';

  // 通知当前标签页立即生效
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  if (tab && tab.id != null) {
    chrome.tabs.sendMessage(tab.id, { type: enabled ? 'VC_ENABLE' : 'VC_DISABLE' }, () => void chrome.runtime.lastError);
  }
});
