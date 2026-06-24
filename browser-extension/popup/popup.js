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

// 显示当前站点
const curHostEl = document.getElementById('curHost');
async function currentHostname() {
  const tab = await activeTab();
  try { return tab && tab.url ? new URL(tab.url).hostname : ''; } catch (e) { return ''; }
}
currentHostname().then(h => { if (curHostEl) curHostEl.textContent = '当前站点:' + (h || '—'); });

// ➕ 添加当前站点并启用:把当前页 IP/域名加入强制启用列表
document.getElementById('addCurrent').addEventListener('click', async () => {
  const host = await currentHostname();
  if (!host || /^(chrome|edge|about)/.test(host)) { statusEl.textContent = '当前页不是可翻译的网站。'; return; }
  const list = hostsEl.value.split('\n').map(s => s.trim()).filter(Boolean);
  if (list.includes(host)) { statusEl.textContent = host + ' 已在列表中。'; return; }
  list.push(host);
  hostsEl.value = list.join('\n');
  await chrome.storage.sync.set({ enabled: true, hosts: list });
  enabledEl.checked = true;
  const tab = await activeTab();
  if (tab && tab.id != null) chrome.tabs.reload(tab.id);   // 重载让内容脚本在此站点激活
  statusEl.textContent = '已添加并启用 ' + host + ',正在刷新…';
});

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

// 取当前页采集到的未翻译词条(带标记),回调 (entries, lang, region)
function withMissing(cb) {
  activeTab().then(tab => {
    if (!tab || tab.id == null) { statusEl.textContent = '请先打开 vCenter 页面。'; return; }
    chrome.tabs.sendMessage(tab.id, { type: 'VC_GET_MISSING' }, resp => {
      if (chrome.runtime.lastError || !resp) { statusEl.textContent = '请先刷新 vCenter 页面,并开启“收集未翻译词条”。'; return; }
      const entries = resp.entries || (resp.list || []).map(t => ({ text: t, tool: '?', count: 1, flags: [] }));
      if (!entries.length) { statusEl.textContent = '当前没有采集到未翻译词条(先开启收集并浏览缺词页面)。'; return; }
      cb(entries, resp.lang || langEl.value || 'zh-CN', (document.getElementById('region').value || '').trim());
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
  const title = `[i18n] ${lang} 缺词 ${entries.length} 条${region ? ' · ' + region : ''}`;
  const render = a => `> 由 VCF 9 UI Translator 扩展自动采集的未翻译界面词条,目标语言:**${lang}**${region ? ',来源:' + region : ''}。\n` +
    `> 每条带 \`tool\`(来源工具页)与 \`flags\`(异常标记,如 含数字·疑动态 / 疑标识符),便于维护者判断。\n` +
    `> 维护者:\`node contrib/merge-incoming.mjs <file> ${lang}\` 去重后合并到 \`plugin/i18n/domains/\`。\n\n\`\`\`json\n${JSON.stringify(compact(a))}\n\`\`\`\n`;
  const { arr, truncated } = fitWithin(entries, render);
  let body = render(arr);
  if (truncated) body += `\n_注:词条过多,本 Issue 仅含前 ${arr.length}/${entries.length} 条;完整清单请用“导出 JSON(本地)”后拖入评论。_\n`;
  chrome.tabs.create({ url: `https://github.com/${REPO}/issues/new?labels=${encodeURIComponent('i18n,translation-contribution')}` +
    `&title=${encodeURIComponent(title)}&body=${encodeURIComponent(body)}` });
  statusEl.textContent = truncated ? `已打开 GitHub(前 ${arr.length}/${entries.length} 条);量大请另附本地导出。` : `已打开 GitHub(${entries.length} 条),点 Submit 即可。`;
}));

document.getElementById('mail').addEventListener('click', () => withMissing((entries, lang, region) => {
  const subject = `[vcf-rosetta i18n] ${lang} 缺词 ${entries.length} 条${region ? ' · ' + region : ''}`;
  const render = a => `目标语言: ${lang}\n来源: ${region || '(未填)'}\n词条数: ${a.length}\n(每条带 tool=来源工具页, flags=异常标记)\n\n` +
    `${JSON.stringify(compact(a), null, 2)}\n`;
  const { arr, truncated } = fitWithin(entries, render);
  let body = render(arr);
  if (truncated) body += `\n注:词条较多,本邮件正文仅含前 ${arr.length}/${entries.length} 条;请把“导出 JSON(本地)”得到的完整文件作为附件一并发送。\n`;
  chrome.tabs.create({ url: `mailto:${DEV_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}` });
  statusEl.textContent = truncated ? `已打开邮件(前 ${arr.length}/${entries.length} 条);请把本地导出的 JSON 作为附件。` : `已打开邮件(${entries.length} 条),发送即可。`;
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
