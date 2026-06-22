// Popup: 读取/保存配置(启用开关 + 主机白名单),并通知当前标签页应用。
const enabledEl = document.getElementById('enabled');
const hostsEl = document.getElementById('hosts');
const statusEl = document.getElementById('status');
const collectEl = document.getElementById('collect');

// 载入已存配置
chrome.storage.sync.get({ enabled: true, hosts: [], collect: false }, cfg => {
  enabledEl.checked = !!cfg.enabled;
  hostsEl.value = (cfg.hosts || []).join('\n');
  collectEl.checked = !!cfg.collect;
});

async function activeTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

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
