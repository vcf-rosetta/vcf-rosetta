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

  // Verdict: did ANY host-provided signal carry zh?
  const hostSignals = rows
    .filter((r) => /url\.|sdk\./.test(r.key))
    .map((r) => r.value.toLowerCase());
  const hostHasZh = hostSignals.some((v) => v.includes("zh"));
  const verdict = document.getElementById("verdict");
  if (hostHasZh) {
    verdict.className = "ok";
    verdict.textContent =
      "✅ 宿主向插件传递了 zh locale — 可直接按宿主 locale 自动切中文(R1 通过)。";
  } else {
    verdict.className = "warn";
    verdict.textContent =
      "⚠️ 宿主未传递 zh locale(预期,因为 9.0 已移除 zh-CN)。" +
      "→ 插件须按 HLD §6.3 自行判定语言(读 navigator.language / 用户偏好),不能依赖宿主。";
  }

  function safeProbe(label, fn) {
    try {
      add(label, fn());
    } catch (e) {
      add(label, "ERROR: " + e.message);
    }
  }
})();
