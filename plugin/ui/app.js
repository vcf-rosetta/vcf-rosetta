// VCF Rosetta 中文运维助手 — 标签页应用(纯前端,数据打包在插件内,离线可用)
(function () {
  'use strict';

  var alarms = window.__alarms || {};          // 告警解释库
  var glossary = window.__glossary || {};       // 术语词表 EN->ZH
  var SEV = { critical: '严重', warning: '警告', info: '提示' };

  // ── 标签切换 ──────────────────────────────────────────────
  function showTab(name) {
    document.querySelectorAll('.tab').forEach(function (b) {
      b.classList.toggle('active', b.dataset.tab === name);
    });
    document.getElementById('tab-alarms').classList.toggle('hidden', name !== 'alarms');
    document.getElementById('tab-glossary').classList.toggle('hidden', name !== 'glossary');
  }
  document.querySelectorAll('.tab').forEach(function (b) {
    b.addEventListener('click', function () { showTab(b.dataset.tab); });
  });

  // ── 告警解释 ──────────────────────────────────────────────
  var alarmEntries = Object.keys(alarms)
    .filter(function (k) { return k !== '_meta'; })
    .map(function (k) { return { en: k, d: alarms[k] }; });

  function renderAlarms(q) {
    q = (q || '').trim().toLowerCase();
    var list = document.getElementById('alarm-list');
    list.innerHTML = '';
    var shown = 0;
    alarmEntries.forEach(function (e) {
      var d = e.d;
      var hay = (e.en + ' ' + d.name + ' ' + (d.symptom || '')).toLowerCase();
      if (q && hay.indexOf(q) === -1) return;
      shown++;
      var card = document.createElement('div');
      card.className = 'card sev-' + (d.severity || 'info');
      var causes = (d.causes || []).map(function (c) { return '<li>' + esc(c) + '</li>'; }).join('');
      var actions = (d.actions || []).map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('');
      card.innerHTML =
        '<div class="card-head">' +
          '<span class="badge">' + (SEV[d.severity] || '提示') + '</span>' +
          '<span class="card-title">' + esc(d.name) + '</span>' +
          '<span class="card-en">' + esc(e.en) + '</span>' +
        '</div>' +
        '<div class="card-body">' +
          '<p class="symptom"><b>症状:</b>' + esc(d.symptom || '') + '</p>' +
          (causes ? '<div class="block"><b>可能原因</b><ul>' + causes + '</ul></div>' : '') +
          (actions ? '<div class="block"><b>建议处置</b><ol>' + actions + '</ol></div>' : '') +
        '</div>';
      card.querySelector('.card-head').addEventListener('click', function () {
        card.classList.toggle('open');
      });
      list.appendChild(card);
    });
    if (shown === 0) list.innerHTML = '<p class="empty">无匹配告警。</p>';
  }
  document.getElementById('alarm-search').addEventListener('input', function (e) {
    renderAlarms(e.target.value);
  });

  // ── 术语查询 ──────────────────────────────────────────────
  var glossaryKeys = Object.keys(glossary);
  var MAX = 200;
  function renderGlossary(q) {
    q = (q || '').trim().toLowerCase();
    var rows = document.getElementById('glossary-rows');
    var meta = document.getElementById('glossary-meta');
    rows.innerHTML = '';
    if (!q) {
      meta.textContent = '共 ' + glossaryKeys.length + ' 条术语,输入关键词查询。';
      return;
    }
    var hits = 0, html = '';
    for (var i = 0; i < glossaryKeys.length && hits < MAX; i++) {
      var en = glossaryKeys[i], zh = glossary[en];
      if (en.toLowerCase().indexOf(q) === -1 && String(zh).toLowerCase().indexOf(q) === -1) continue;
      html += '<tr><td class="en">' + esc(en) + '</td><td class="zh">' + esc(zh) + '</td></tr>';
      hits++;
    }
    rows.innerHTML = html || '<tr><td colspan="2" class="empty">无匹配术语。</td></tr>';
    meta.textContent = hits >= MAX ? ('匹配较多,仅显示前 ' + MAX + ' 条,请细化关键词。') : ('匹配 ' + hits + ' 条。');
  }
  document.getElementById('glossary-search').addEventListener('input', function (e) {
    renderGlossary(e.target.value);
  });

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 初始渲染
  renderAlarms('');
  renderGlossary('');
})();
