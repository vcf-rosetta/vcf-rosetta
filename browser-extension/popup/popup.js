// Popup: 读取/保存配置(启用开关 + 主机白名单),并通知当前标签页应用。
const enabledEl = document.getElementById('enabled');
const hostsEl = document.getElementById('hosts');
const statusEl = document.getElementById('status');

// 载入已存配置
chrome.storage.sync.get({ enabled: true, hosts: [] }, cfg => {
  enabledEl.checked = !!cfg.enabled;
  hostsEl.value = (cfg.hosts || []).join('\n');
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
