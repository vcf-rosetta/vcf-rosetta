// R1 locale probe — collects every locale signal available to a remote plug-in
// iframe and reports them, so we can answer: does the vSphere Client ever hand a
// zh-CN locale to our plug-in? (HLD risk R1)
//
// It is intentionally defensive: the exact SDK locale API differs across
// versions, so we read ALL plausible sources rather than assume one.

(function () {
  "use strict";

  const rows = [];
  const add = (key, value) => rows.push({ key, value: value == null ? "(none)" : String(value) });

  // 1. URL params — vSphere Client commonly passes locale/context via query string
  const params = new URLSearchParams(window.location.search);
  add("url.locale", params.get("locale"));
  add("url.lang", params.get("lang"));
  add("url.search (raw)", window.location.search || "(empty)");

  // 2. The vSphere Client remote plug-in JS SDK, if injected into the iframe.
  //    Method names vary by version — probe each defensively inside try/catch.
  const sdk = window.htmlClientSdk || window.vSphereClientSdk || null;
  add("window.htmlClientSdk present", Boolean(window.htmlClientSdk));
  add("window.vSphereClientSdk present", Boolean(window.vSphereClientSdk));
  if (sdk) {
    safeProbe("sdk.app.getClientLocale()", () => sdk.app && sdk.app.getClientLocale && sdk.app.getClientLocale());
    safeProbe("sdk.getLocale()", () => sdk.getLocale && sdk.getLocale());
    safeProbe("sdk.app.getProperty('locale')", () => sdk.app && sdk.app.getProperty && sdk.app.getProperty("locale"));
  }

  // 3. Browser-level locale — our own fallback signal (HLD §6.3)
  add("navigator.language", navigator.language);
  add("navigator.languages", (navigator.languages || []).join(", "));
  add("document.documentElement.lang", document.documentElement.lang);

  // Render
  const tbody = document.querySelector("#probe tbody");
  rows.forEach((r) => {
    const tr = document.createElement("tr");
    const td1 = document.createElement("td");
    td1.className = "k";
    td1.textContent = r.key;
    const td2 = document.createElement("td");
    td2.className = "v";
    td2.textContent = r.value;
    tr.append(td1, td2);
    tbody.appendChild(tr);
  });

  // Verdict. Two channels matter:
  //  - explicit: locale passed via URL params or the vSphere Client SDK
  //  - implicit: the iframe's navigator.language (set by the host UI locale)
  // R1 real-machine result: explicit channel is absent, but navigator.language
  // is zh-CN — so the plugin CAN follow the host locale via navigator.
  const explicitZh = rows
    .filter((r) => /url\.|sdk\./.test(r.key))
    .some((r) => r.value.toLowerCase().includes("zh"));
  const navZh = /^zh/i.test(navigator.language || "");
  const verdict = document.getElementById("verdict");
  if (explicitZh) {
    verdict.className = "ok";
    verdict.textContent =
      "✅ 宿主通过 URL/SDK 显式传递了 zh locale — 可直接按宿主 locale 自动切中文。";
  } else if (navZh) {
    verdict.className = "ok";
    verdict.textContent =
      "✅ 宿主未用 URL/SDK 显式传 locale,但 navigator.language=" +
      navigator.language +
      " 为中文 — 插件可据此自动切中文(HLD §6.3)。R1 通过。";
  } else {
    verdict.className = "warn";
    verdict.textContent =
      "⚠️ 未检测到任何中文 locale 信号。插件应回退到用户偏好 / 默认语言(HLD §6.3)。";
  }

  function safeProbe(label, fn) {
    try {
      add(label, fn());
    } catch (e) {
      add(label, "ERROR: " + e.message);
    }
  }
})();
