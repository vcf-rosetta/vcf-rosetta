// 扩展详细配置页(options):展示同团队的 VMware skill 家族 —— 简介、各 skill 的 GitHub、安装命令。
// 界面语言与 popup 共用同一持久化键(uiLang),两处切换保持一致。文案见 ../popup/i18n.js。
const { t, resolve, detect } = window.ROSETTA_I18N;
const uiLangEl = document.getElementById('uilang');
const rowsEl = document.getElementById('skillRows');

let ui = 'en';

// skill 家族(vmware-aiops 为推荐入口)。名称、GitHub、安装命令为技术内容,统一英文;
// scope 简述随各 skill 固定。数据源:VMware skill 家族各仓库 README 的家族总表。
const SKILLS = [
  { name: 'vmware-aiops', repo: 'https://github.com/zw008/VMware-AIops', install: 'uv tool install vmware-aiops', scope: 'VM lifecycle, deployment, guest ops, clusters', entry: true },
  { name: 'vmware-monitor', repo: 'https://github.com/zw008/VMware-Monitor', install: 'uv tool install vmware-monitor', scope: 'Read-only: inventory, health, alarms, events, metrics' },
  { name: 'vmware-storage', repo: 'https://github.com/zw008/VMware-Storage', install: 'uv tool install vmware-storage', scope: 'Datastores, iSCSI, vSAN' },
  { name: 'vmware-vks', repo: 'https://github.com/zw008/VMware-VKS', install: 'uv tool install vmware-vks', scope: 'Tanzu Namespaces, TKC cluster lifecycle' },
  { name: 'vmware-nsx', repo: 'https://github.com/zw008/VMware-NSX', install: 'uv tool install vmware-nsx-mgmt', scope: 'NSX networking: segments, gateways, NAT, IPAM' },
  { name: 'vmware-nsx-security', repo: 'https://github.com/zw008/VMware-NSX-Security', install: 'uv tool install vmware-nsx-security', scope: 'DFW microsegmentation, security groups, Traceflow' },
  { name: 'vmware-aria', repo: 'https://github.com/zw008/VMware-Aria', install: 'uv tool install vmware-aria', scope: 'Aria Ops metrics, alerts, capacity planning' },
];

// 渲染一行 skill(不可变:每次从数据构造新节点,不改动既有 DOM 数据)
function renderRow(s) {
  const tr = document.createElement('tr');

  const tdName = document.createElement('td');
  const a = document.createElement('a');
  a.href = s.repo;
  a.target = '_blank';
  a.rel = 'noopener';
  a.textContent = s.name;
  tdName.appendChild(a);
  if (s.entry) {
    const badge = document.createElement('span');
    badge.className = 'entry';
    badge.textContent = '⭐ ' + t(ui, 'optEntry');
    tdName.append(' ', badge);
  }
  tr.appendChild(tdName);

  const tdScope = document.createElement('td');
  tdScope.textContent = s.scope;
  tr.appendChild(tdScope);

  const tdInstall = document.createElement('td');
  const code = document.createElement('code');
  code.textContent = s.install;
  tdInstall.appendChild(code);
  tr.appendChild(tdInstall);

  return tr;
}

function renderSkills() {
  rowsEl.textContent = '';
  SKILLS.forEach(s => rowsEl.appendChild(renderRow(s)));
}

// 按当前界面语言渲染所有 [data-i18n] 文案,并重绘表格(入口徽章随语言变化)
function applyUi() {
  document.querySelectorAll('[data-i18n]').forEach(el => {
    el.textContent = t(ui, el.getAttribute('data-i18n'));
  });
  document.documentElement.lang = ui;
  if (uiLangEl) { uiLangEl.value = ui; uiLangEl.title = t(ui, 'uiTip'); }
  renderSkills();
}

// 界面语言选择器:切换并持久化(与 popup 共用 uiLang 键)
uiLangEl.addEventListener('change', async () => {
  ui = resolve(uiLangEl.value);
  try { await chrome.storage.sync.set({ uiLang: ui }); } catch (e) { /* ignore */ }
  applyUi();
});

// 初始:沿用已保存的界面语言,否则跟随浏览器
chrome.storage.sync.get({ uiLang: '' }, cfg => {
  ui = cfg.uiLang ? resolve(cfg.uiLang) : detect();
  applyUi();
});
