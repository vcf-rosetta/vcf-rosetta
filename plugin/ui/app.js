// VCF Rosetta 中文运维助手 — 4 个页面。
// 静态:告警解释、术语查询(数据打包,离线可用)。
// 实时:资产总览、最近任务(best-effort 调 vCenter REST,失败优雅降级)。
(function () {
  'use strict';

  var alarms = window.__alarms || {};
  var glossary = window.__glossary || {};
  var SEV = { critical: '严重', warning: '警告', info: '提示' };

  // ── 标签切换(实时页首次进入才拉数据)──────────────────
  var loaded = {};
  function showTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    ['overview', 'tasks', 'alarms', 'glossary'].forEach(function (t) {
      document.getElementById('tab-' + t).classList.toggle('hidden', t !== name);
    });
    if (name === 'overview' && !loaded.overview) { loaded.overview = true; loadOverview(); }
    if (name === 'tasks' && !loaded.tasks) { loaded.tasks = true; loadTasks(); }
  }
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.dataset.tab); });
  });

  function esc(s) {
    return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
  function tr(s) { return glossary[s] || s; }   // 用术语词表翻译一个英文串

  // ── 资产总览(实时)──────────────────────────────────────
  async function loadOverview() {
    var box = document.getElementById('overview-cards');
    var note = document.getElementById('overview-note');
    box.innerHTML = '<p class="loading">正在获取 vCenter 资产…</p>';
    var defs = [
      { label: '集群', fn: VcApi.clusters },
      { label: '主机', fn: VcApi.hosts },
      { label: '虚拟机', fn: VcApi.vms },
      { label: '数据存储', fn: VcApi.datastores },
    ];
    try {
      var results = await Promise.all(defs.map(function (d) {
        return d.fn().then(function (arr) { return { label: d.label, n: Array.isArray(arr) ? arr.length : (arr.value ? arr.value.length : '?') }; })
                     .catch(function () { return { label: d.label, n: '—' }; });
      }));
      box.innerHTML = results.map(function (r) {
        return '<div class="metric"><div class="num">' + r.n + '</div><div class="lbl">' + r.label + '</div></div>';
      }).join('');
      var ok = results.some(function (r) { return r.n !== '—'; });
      note.textContent = ok ? '数据来自当前 vCenter(实时)。' :
        '未能获取实时数据 —— 可能需要在 vCenter 内登录会话/SDK 接入。其余页面(告警解释、术语查询)可正常使用。';
    } catch (e) {
      box.innerHTML = '';
      note.textContent = '未能获取实时数据(' + esc(e.message) + ')。其余页面可正常使用。';
    }
  }

  // ── 最近任务(实时,任务名中文化)──────────────────────
  async function loadTasks() {
    var boxEl = document.getElementById('tasks-box');
    var note = document.getElementById('tasks-note');
    boxEl.innerHTML = '<p class="loading">正在获取最近任务…</p>';
    try {
      var data = await VcApi.tasks();
      var list = Array.isArray(data) ? data : (data.value || []);
      if (!list.length) { boxEl.innerHTML = '<p class="empty">暂无最近任务。</p>'; note.textContent = ''; return; }
      var rows = list.slice(0, 50).map(function (t) {
        var op = t.operation || t.description || (t.task && t.task.description) || '';
        var st = t.status || (t.task && t.task.status) || '';
        return '<tr><td>' + esc(tr(op)) + '</td><td>' + esc(tr(st)) + '</td></tr>';
      }).join('');
      boxEl.innerHTML = '<table class="grid"><thead><tr><th>任务</th><th>状态</th></tr></thead><tbody>' + rows + '</tbody></table>';
      note.textContent = '任务名/状态已按术语词表中文化。';
    } catch (e) {
      boxEl.innerHTML = '';
      note.textContent = '未能获取实时任务(' + esc(e.message) + ')—— 该 vCenter 版本 REST 任务接口可能不可用,后续可经后端补齐。';
    }
  }

  // ── 告警解释(静态)──────────────────────────────────────
  var alarmEntries = Object.keys(alarms).filter(function (k) { return k !== '_meta'; })
    .map(function (k) { return { en: k, d: alarms[k] }; });
  function renderAlarms(q) {
    q = (q || '').trim().toLowerCase();
    var list = document.getElementById('alarm-list');
    list.innerHTML = ''; var shown = 0;
    alarmEntries.forEach(function (e) {
      var d = e.d;
      if (q && (e.en + ' ' + d.name + ' ' + (d.symptom || '')).toLowerCase().indexOf(q) === -1) return;
      shown++;
      var card = document.createElement('div');
      card.className = 'card sev-' + (d.severity || 'info');
      var causes = (d.causes || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
      var actions = (d.actions || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('');
      card.innerHTML =
        '<div class="card-head"><span class="badge">' + (SEV[d.severity] || '提示') + '</span>' +
        '<span class="card-title">' + esc(d.name) + '</span><span class="card-en">' + esc(e.en) + '</span></div>' +
        '<div class="card-body"><p class="symptom"><b>症状:</b>' + esc(d.symptom || '') + '</p>' +
        (causes ? '<div class="block"><b>可能原因</b><ul>' + causes + '</ul></div>' : '') +
        (actions ? '<div class="block"><b>建议处置</b><ol>' + actions + '</ol></div>' : '') + '</div>';
      card.querySelector('.card-head').addEventListener('click', function () { card.classList.toggle('open'); });
      list.appendChild(card);
    });
    if (!shown) list.innerHTML = '<p class="empty">无匹配告警。</p>';
  }
  document.getElementById('alarm-search').addEventListener('input', function (e) { renderAlarms(e.target.value); });

  // ── 术语查询(静态)──────────────────────────────────────
  // 预计算小写检索索引一次,避免每次按键对 1.2 万条重复 toLowerCase。
  var glossaryKeys = Object.keys(glossary), MAX = 200;
  var glossaryIndex = glossaryKeys.map(function (en) {
    var zh = glossary[en];
    return { en: en, zh: zh, hay: (en + '' + zh).toLowerCase() };
  });
  function renderGlossary(q) {
    q = (q || '').trim().toLowerCase();
    var rows = document.getElementById('glossary-rows'), meta = document.getElementById('glossary-meta');
    rows.innerHTML = '';
    if (!q) { meta.textContent = '共 ' + glossaryKeys.length + ' 条术语,输入关键词查询。'; return; }
    var hits = 0, html = '';
    for (var i = 0; i < glossaryIndex.length && hits < MAX; i++) {
      if (glossaryIndex[i].hay.indexOf(q) === -1) continue;
      html += '<tr><td class="en">' + esc(glossaryIndex[i].en) + '</td><td class="zh">' + esc(glossaryIndex[i].zh) + '</td></tr>'; hits++;
    }
    rows.innerHTML = html || '<tr><td colspan="2" class="empty">无匹配术语。</td></tr>';
    meta.textContent = hits >= MAX ? ('匹配较多,仅显示前 ' + MAX + ' 条,请细化关键词。') : ('匹配 ' + hits + ' 条。');
  }
  function debounce(fn, ms) {
    var t; return function () { var a = arguments, c = this; clearTimeout(t); t = setTimeout(function () { fn.apply(c, a); }, ms); };
  }
  document.getElementById('glossary-search').addEventListener('input', debounce(function (e) { renderGlossary(e.target.value); }, 120));

  // 初始:默认页 + 静态页预渲染
  renderAlarms(''); renderGlossary('');
  loaded.overview = true; loadOverview();   // 默认页直接加载
})();
