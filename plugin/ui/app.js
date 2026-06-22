// VCF Rosetta 运维助手 — 双语(zh-CN / de)。
// 按语言 fetch 对应数据(glossary.<lang>.json + alarm-explanations.<lang>.json),
// UI 文字本地化,顶部可切换语言。静态数据离线可用;资产/任务为实时 best-effort。
(function () {
  'use strict';

  // ── UI 文案(每种语言一套)──────────────────────────────────
  var UI = {
    'zh-CN': {
      title: 'VCF Rosetta · 中文运维助手',
      sub: '资产 / 告警 / 任务中文化 · 告警解释 · 术语查询',
      langLabel: '语言',
      tabs: { overview: '资产总览', tasks: '最近任务', alarms: '告警解释', glossary: '术语查询' },
      searchAlarm: '搜索告警(中文名 / 英文名 / 症状)…',
      searchGlossary: '输入英文或中文查术语…',
      symptom: '症状', causes: '可能原因', actions: '建议处置',
      sev: { critical: '严重', warning: '警告', info: '提示' },
      noAlarm: '无匹配告警。',
      gHint: function (n) { return '共 ' + n + ' 条术语,输入关键词查询。'; },
      gMore: function (n) { return '匹配较多,仅显示前 ' + n + ' 条,请细化关键词。'; },
      gHits: function (n) { return '匹配 ' + n + ' 条。'; },
      noGlossary: '无匹配术语。',
      ovLoading: '正在获取 vCenter 资产…',
      ov: { cluster: '集群', host: '主机', vm: '虚拟机', ds: '数据存储' },
      ovOk: '数据来自当前 vCenter(实时)。',
      ovFail: '未能获取实时数据 —— 可能需要在 vCenter 内登录会话/SDK 接入。其余页面可正常使用。',
      tLoading: '正在获取最近任务…', tNone: '暂无最近任务。',
      tOk: '任务名/状态已按术语词表中文化。',
      tFail: '未能获取实时任务 —— 该 vCenter 版本 REST 任务接口可能不可用。',
      colTask: '任务', colStatus: '状态'
    },
    'de': {
      title: 'VCF Rosetta · Betriebsassistent',
      sub: 'Bestand / Alarme / Aufgaben · Alarmerklärung · Begriffssuche',
      langLabel: 'Sprache',
      tabs: { overview: 'Bestandsübersicht', tasks: 'Letzte Aufgaben', alarms: 'Alarmerklärung', glossary: 'Begriffssuche' },
      searchAlarm: 'Alarm suchen (Name / Symptom)…',
      searchGlossary: 'Englisch oder Deutsch suchen…',
      symptom: 'Symptom', causes: 'Mögliche Ursachen', actions: 'Empfohlene Maßnahmen',
      sev: { critical: 'Kritisch', warning: 'Warnung', info: 'Info' },
      noAlarm: 'Keine passenden Alarme.',
      gHint: function (n) { return n + ' Begriffe. Stichwort eingeben.'; },
      gMore: function (n) { return 'Viele Treffer, nur die ersten ' + n + ' werden angezeigt.'; },
      gHits: function (n) { return n + ' Treffer.'; },
      noGlossary: 'Keine passenden Begriffe.',
      ovLoading: 'vCenter-Bestand wird geladen…',
      ov: { cluster: 'Cluster', host: 'Hosts', vm: 'VMs', ds: 'Datenspeicher' },
      ovOk: 'Daten aus dem aktuellen vCenter (live).',
      ovFail: 'Live-Daten nicht verfügbar — ggf. ist eine SDK-Sitzung erforderlich. Andere Seiten funktionieren.',
      tLoading: 'Letzte Aufgaben werden geladen…', tNone: 'Keine letzten Aufgaben.',
      tOk: 'Aufgaben/Status lokalisiert.',
      tFail: 'Live-Aufgaben nicht verfügbar — REST evtl. nicht unterstützt.',
      colTask: 'Aufgabe', colStatus: 'Status'
    }
  };

  function pickLang() {
    try { var s = localStorage.getItem('vcfr-lang'); if (s && UI[s]) return s; } catch (e) {}
    var n = (navigator.language || '').toLowerCase();
    if (n.indexOf('de') === 0) return 'de';
    return 'zh-CN';
  }

  var lang = pickLang();
  var t = UI[lang];
  var glossary = {}, glossaryKeys = [], glossaryIndex = [], alarms = {}, alarmEntries = [];
  var MAX = 200;

  function esc(s) { return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
  function tr(s) { return glossary[s] || s; }
  function debounce(fn, ms) { var x; return function () { var a = arguments, c = this; clearTimeout(x); x = setTimeout(function () { fn.apply(c, a); }, ms); }; }

  // ── 加载语言数据 ────────────────────────────────────────────
  async function loadData() {
    try {
      var g = await fetch('glossary.' + lang + '.json').then(r => r.json());
      glossary = g; glossaryKeys = Object.keys(g);
      glossaryIndex = glossaryKeys.map(function (en) { return { en: en, zh: g[en], hay: (en + '' + g[en]).toLowerCase() }; });
    } catch (e) { glossary = {}; glossaryKeys = []; glossaryIndex = []; }
    try {
      var a = await fetch('alarm-explanations.' + lang + '.json').then(r => r.json());
      alarms = a; alarmEntries = Object.keys(a).filter(function (k) { return k !== '_meta'; }).map(function (k) { return { en: k, d: a[k] }; });
    } catch (e) { alarms = {}; alarmEntries = []; }
  }

  // ── 应用 UI 文案 ────────────────────────────────────────────
  function applyText() {
    document.documentElement.lang = lang;
    document.getElementById('title').textContent = t.title;
    document.getElementById('subtitle').textContent = t.sub;
    document.getElementById('lang-label').textContent = t.langLabel;
    document.getElementById('lang').value = lang;
    document.querySelectorAll('.tab').forEach(function (b) { b.textContent = t.tabs[b.dataset.tab]; });
    document.getElementById('alarm-search').placeholder = t.searchAlarm;
    document.getElementById('glossary-search').placeholder = t.searchGlossary;
  }

  // ── 标签切换 ────────────────────────────────────────────────
  var loaded = {};
  function showTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) { b.classList.toggle('active', b.dataset.tab === name); });
    ['overview', 'tasks', 'alarms', 'glossary'].forEach(function (x) { document.getElementById('tab-' + x).classList.toggle('hidden', x !== name); });
    if (name === 'overview' && !loaded.overview) { loaded.overview = true; loadOverview(); }
    if (name === 'tasks' && !loaded.tasks) { loaded.tasks = true; loadTasks(); }
  }

  // ── 资产总览(实时)────────────────────────────────────────
  async function loadOverview() {
    var box = document.getElementById('overview-cards'), note = document.getElementById('overview-note');
    box.innerHTML = '<p class="loading">' + t.ovLoading + '</p>';
    var defs = [
      { label: t.ov.cluster, fn: VcApi.clusters }, { label: t.ov.host, fn: VcApi.hosts },
      { label: t.ov.vm, fn: VcApi.vms }, { label: t.ov.ds, fn: VcApi.datastores }
    ];
    try {
      var res = await Promise.all(defs.map(function (d) {
        return d.fn().then(function (arr) { return { label: d.label, n: Array.isArray(arr) ? arr.length : (arr.value ? arr.value.length : '?') }; })
          .catch(function () { return { label: d.label, n: '—' }; });
      }));
      box.innerHTML = res.map(function (r) { return '<div class="metric"><div class="num">' + r.n + '</div><div class="lbl">' + esc(r.label) + '</div></div>'; }).join('');
      note.textContent = res.some(function (r) { return r.n !== '—'; }) ? t.ovOk : t.ovFail;
    } catch (e) { box.innerHTML = ''; note.textContent = t.ovFail; }
  }

  // ── 最近任务(实时)────────────────────────────────────────
  async function loadTasks() {
    var box = document.getElementById('tasks-box'), note = document.getElementById('tasks-note');
    box.innerHTML = '<p class="loading">' + t.tLoading + '</p>';
    try {
      var data = await VcApi.tasks(); var list = Array.isArray(data) ? data : (data.value || []);
      if (!list.length) { box.innerHTML = '<p class="empty">' + t.tNone + '</p>'; note.textContent = ''; return; }
      var rows = list.slice(0, 50).map(function (x) {
        var op = x.operation || x.description || (x.task && x.task.description) || '';
        var st = x.status || (x.task && x.task.status) || '';
        return '<tr><td>' + esc(tr(op)) + '</td><td>' + esc(tr(st)) + '</td></tr>';
      }).join('');
      box.innerHTML = '<table class="grid"><thead><tr><th>' + t.colTask + '</th><th>' + t.colStatus + '</th></tr></thead><tbody>' + rows + '</tbody></table>';
      note.textContent = t.tOk;
    } catch (e) { box.innerHTML = ''; note.textContent = t.tFail; }
  }

  // ── 告警解释(静态)────────────────────────────────────────
  function renderAlarms(q) {
    q = (q || '').trim().toLowerCase();
    var list = document.getElementById('alarm-list'); list.innerHTML = ''; var shown = 0;
    alarmEntries.forEach(function (e) {
      var d = e.d;
      if (q && (e.en + ' ' + d.name + ' ' + (d.symptom || '')).toLowerCase().indexOf(q) === -1) return;
      shown++;
      var card = document.createElement('div'); card.className = 'card sev-' + (d.severity || 'info');
      var causes = (d.causes || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
      var actions = (d.actions || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('');
      card.innerHTML =
        '<div class="card-head"><span class="badge">' + (t.sev[d.severity] || t.sev.info) + '</span>' +
        '<span class="card-title">' + esc(d.name) + '</span><span class="card-en">' + esc(e.en) + '</span></div>' +
        '<div class="card-body"><p class="symptom"><b>' + t.symptom + ':</b>' + esc(d.symptom || '') + '</p>' +
        (causes ? '<div class="block"><b>' + t.causes + '</b><ul>' + causes + '</ul></div>' : '') +
        (actions ? '<div class="block"><b>' + t.actions + '</b><ol>' + actions + '</ol></div>' : '') + '</div>';
      card.querySelector('.card-head').addEventListener('click', function () { card.classList.toggle('open'); });
      list.appendChild(card);
    });
    if (!shown) list.innerHTML = '<p class="empty">' + t.noAlarm + '</p>';
  }

  // ── 术语查询(静态)────────────────────────────────────────
  function renderGlossary(q) {
    q = (q || '').trim().toLowerCase();
    var rows = document.getElementById('glossary-rows'), meta = document.getElementById('glossary-meta'); rows.innerHTML = '';
    if (!q) { meta.textContent = t.gHint(glossaryKeys.length); return; }
    var hits = 0, html = '';
    for (var i = 0; i < glossaryIndex.length && hits < MAX; i++) {
      if (glossaryIndex[i].hay.indexOf(q) === -1) continue;
      html += '<tr><td class="en">' + esc(glossaryIndex[i].en) + '</td><td class="zh">' + esc(glossaryIndex[i].zh) + '</td></tr>'; hits++;
    }
    rows.innerHTML = html || '<tr><td colspan="2" class="empty">' + t.noGlossary + '</td></tr>';
    meta.textContent = hits >= MAX ? t.gMore(MAX) : t.gHits(hits);
  }

  // ── 初始化 / 语言切换 ───────────────────────────────────────
  async function render() {
    t = UI[lang]; loaded = {};
    applyText();
    await loadData();
    renderAlarms(''); renderGlossary('');
    loaded.overview = true; loadOverview();
  }

  document.querySelectorAll('.tab').forEach(function (b) { b.addEventListener('click', function () { showTab(b.dataset.tab); }); });
  document.getElementById('alarm-search').addEventListener('input', function (e) { renderAlarms(e.target.value); });
  document.getElementById('glossary-search').addEventListener('input', debounce(function (e) { renderGlossary(e.target.value); }, 120));
  document.getElementById('lang').addEventListener('change', function (e) {
    lang = e.target.value; try { localStorage.setItem('vcfr-lang', lang); } catch (x) {}
    render();
  });

  render();
})();
