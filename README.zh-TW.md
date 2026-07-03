# VCF 9 UI Translator

[English](README.md) · [简体中文](README.zh-CN.md) · **繁體中文** · [Deutsch](README.de.md) · [Italiano](README.it.md) · [한국어](README.ko.md)

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20線上應用程式商店-安裝-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)
[![最新版本](https://img.shields.io/github/v/release/vcf-rosetta/vcf-rosetta?label=離線包)](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

**VMware vCenter / VCF 9.x / Aria Operations(VCF Operations)** 主控台介面**即時翻譯**。
VCF 9 官方只提供 English / 日本語 / Español / Français —— 這個免費開源的 Chrome/Edge 擴充功能把平台放棄的
5 種語言裝回來:**简体中文 · 繁體中文 · Deutsch · Italiano · 한국어**。

> GitHub 專案代號 **vcf-rosetta** —— 取自羅塞塔石碑,多語言對照的經典符號。

## 亮點

- **瀏覽即翻譯** —— 純前端 DOM 即時替換;不修改 vCenter 伺服器,不在伺服器端安裝任何東西。
- **隱私優先** —— 頁面內容絕不外傳;字典是純資料 JSON。
- **每語言 5 萬+ 審校詞條**,基於 VMware 官方語言包 + 現場採集回流建置。
  簡體中文已涵蓋日常介面約 90%;繁體中文緊隨其後;德/義/韓可用且持續改進。
- **隔離網可用** —— 離線包內建全部字典,安裝後零連線。
- **字典自動更新**(商店版)—— 新詞條經 CDN 自動送達已安裝的使用者,無需等擴充功能改版。

## 安裝

📘 **圖文安裝/使用指南(6 語言)**:<https://vcf-rosetta.github.io/vcf-rosetta/>

### 方式一:Chrome 線上應用程式商店(連線,建議)

安裝 **[VCF 9 UI Translator](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)**(Chrome 與 Edge 皆可用)。
開啟 vCenter / VCF / Aria Ops 主控台 → 點擴充功能圖示 → 選語言 → 完成。
字典按需下載(jsDelivr + 鏡像回退),並自動保持最新。

### 方式二:離線包(隔離網 / 客戶現場)

1. 下載離線包(字典內建,~6 MB,**安裝後零連線**):
   👉 <https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip>
2. 解壓縮到一個固定、不會刪除的目錄(裡面有 `manifest.json`)。
3. 開啟 `chrome://extensions`(Edge:`edge://extensions`)→ 開 **開發人員模式**。
4. 點 **載入未封裝項目** → 選解壓縮出的資料夾(不是 zip 本身)。
5. 開啟主控台,點圖示,選語言。

> GitHub Release **只提供離線包** —— 從這裡下載的包一定帶字典,不會下錯。

## 發現沒翻譯的詞?

在彈出視窗開啟**「收集未翻譯詞條」**,瀏覽相關頁面後點**「匯出 JSON」**或**「貢獻」**(自動開啟預填好的
GitHub Issue)。只回傳英文介面詞條,絕不含業務資料。
Bug / 新語言需求:<https://github.com/vcf-rosetta/vcf-rosetta/issues>

## 字典怎麼來

```
瀏覽器擴充 ──①內建(離線包)──▶ 直接用
          ──②本機快取──────▶ chrome.storage(版本一致)
          ──③CDN 按需下載──▶ cdn.jsdelivr.net/gh/vcf-rosetta/vcf-rosetta@v<版本>/browser-extension/dict.<lang>.json
                             (版本號來自 @main 的 langs.json;tag 未就緒或主網域不可達時自動回退 @main / 鏡像網域)
```

## 儲存庫結構

| 目錄 | 內容 |
|------|------|
| [`browser-extension/`](browser-extension/) | **擴充功能本體**(Chrome/Edge MV3);打包與上架素材見 `scripts/` 與 `store/` |
| [`plugin/i18n/`](plugin/i18n/) | 術語詞庫(英 → 5 種語言),字典由此建置 |
| [`contrib/`](contrib/) | 社群詞條回流工具(採集 → Issue → 合併) |
| [`docs/`](docs/) | 安裝指南(GitHub Pages)、架構、路線圖 |
| [`plugin/`](plugin/) | (暫緩)vSphere Client remote plug-in PoC —— 程式碼保留,不部署 |

## 從原始碼建置(維護者)

```bash
git clone https://github.com/vcf-rosetta/vcf-rosetta.git
cd vcf-rosetta
node browser-extension/build-dict.mjs                       # 重建 dict.*.json
node browser-extension/scripts/pack-store.mjs --offline     # 離線包(~6 MB,字典內建)
node browser-extension/scripts/pack-store.mjs               # 輕量包(僅用於商店後台上傳)
```

## 授權與團隊

[Apache-2.0](LICENSE)。社群在地化工具 —— **與 Broadcom / VMware 無隸屬關係**,不散布任何 VMware 軟體;
"VMware"、"vCenter"、"vSphere"、"VCF" 等商標歸各自所有者。

開發團隊:Tony Yuan <mycloud2015@126.com> · Jingsong Yang <yjs@tanzu.eu.org> · Wei Zhou <zhouwei008@gmail.com> ——
Bug、翻譯糾錯、優化建議或新增語言需求歡迎聯繫。
