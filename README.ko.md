# VCF 9 UI Translator

[English](README.md) · [简体中文](README.zh-CN.md) · [繁體中文](README.zh-TW.md) · [Deutsch](README.de.md) · [Italiano](README.it.md) · **한국어**

[![Chrome Web Store](https://img.shields.io/badge/Chrome%20웹%20스토어-설치-4285F4?logo=googlechrome&logoColor=white)](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)
[![최신 릴리스](https://img.shields.io/github/v/release/vcf-rosetta/vcf-rosetta?label=오프라인%20패키지)](https://github.com/vcf-rosetta/vcf-rosetta/releases/latest)
[![License: Apache-2.0](https://img.shields.io/badge/License-Apache--2.0-blue.svg)](LICENSE)

**VMware vCenter / VCF 9.x / Aria Operations(VCF Operations)** 웹 콘솔을 **브라우저에서 실시간 번역**합니다.
VCF 9은 English / 日本語 / Español / Français만 제공합니다 — 이 무료 오픈소스 Chrome/Edge 확장 프로그램이 플랫폼에서
제외된 5개 언어를 되돌려 놓습니다: **简体中文 · 繁體中文 · Deutsch · Italiano · 한국어**.

> GitHub 프로젝트 코드명은 **vcf-rosetta** — 다국어 대조의 고전적 상징인 로제타석에서 따왔습니다.

## 주요 특징

- **탐색하는 대로 번역** — 클라이언트 측 DOM 텍스트 실시간 치환; 서버 변경 없음, vCenter에 아무것도 설치하지 않음.
- **프라이버시 우선** — 페이지 내용은 절대 브라우저 밖으로 나가지 않음; 사전은 순수 데이터 JSON.
- **언어당 5만+ 검수 용어**, VMware 공식 현지화 팩 + 현장 수집 용어로 구축.
  중국어 간체는 일상 화면의 약 90%를 커버; 한국어/독일어/이탈리아어는 사용 가능하며 계속 개선 중 — 피드백을 환영합니다!
- **폐쇄망 사용 가능** — 오프라인 패키지에 모든 사전 내장; 설치 후 네트워크 불필요.
- **사전 자동 업데이트**(스토어 버전) — 새 용어가 CDN을 통해 설치된 사용자에게 자동 전달.

## 설치

📘 **그림 설치/사용 가이드(6개 언어):** <https://vcf-rosetta.github.io/vcf-rosetta/>

### 방법 1 — Chrome 웹 스토어(온라인, 권장)

**[VCF 9 UI Translator](https://chromewebstore.google.com/detail/vcf-9-ui-translator/fcpofclniofejlnhfckblonhecghkbmp)** 를 설치하세요(Chrome과 Edge 모두 지원).
vCenter / VCF / Aria Ops 콘솔 열기 → 확장 아이콘 클릭 → 언어 선택 → 완료.

### 방법 2 — 오프라인 패키지(폐쇄망 / 고객 사이트)

1. 오프라인 패키지 다운로드(사전 내장, ~6 MB, **설치 후 네트워크 불필요**):
   👉 <https://github.com/vcf-rosetta/vcf-rosetta/releases/latest/download/vcf-rosetta-offline.zip>
2. 삭제되지 않을 고정 폴더에 압축 해제(`manifest.json`이 보입니다).
3. `chrome://extensions` 열기(Edge: `edge://extensions`) → **개발자 모드** 켜기.
4. **압축해제된 확장 프로그램을 로드합니다** 클릭 → 압축 해제한 폴더 선택(zip 아님).
5. 콘솔을 열고 아이콘 클릭, 언어 선택.

> GitHub 릴리스는 **오프라인 패키지만** 제공합니다 — 여기서 받는 파일에는 항상 사전이 포함되어 있습니다.

## 번역되지 않은 텍스트를 발견했다면?

팝업에서 **"Collect untranslated terms"** 를 켜고 해당 화면을 탐색한 뒤 **Export JSON** 또는
**Contribute**(미리 채워진 GitHub Issue 열기)를 누르세요. 영어 UI 문자열만 전송되며 업무 데이터는 절대 포함되지 않습니다.
이슈 / 새 언어 요청: <https://github.com/vcf-rosetta/vcf-rosetta/issues>

## 저장소 구조

| 경로 | 내용 |
|------|------|
| [`browser-extension/`](browser-extension/) | **확장 프로그램 본체**(Chrome/Edge MV3); 패키징·스토어 자료는 `scripts/`, `store/` |
| [`plugin/i18n/`](plugin/i18n/) | 용어 데이터베이스(EN → 5개 언어), 사전의 소스 |
| [`contrib/`](contrib/) | 커뮤니티 용어 회수 도구(수집 → Issue → 병합) |
| [`docs/`](docs/) | 설치 가이드(GitHub Pages), 아키텍처, 로드맵 |
| [`plugin/`](plugin/) | (보류) vSphere Client remote plug-in PoC — 코드 보존, 배포 안 함 |

## 라이선스 및 팀

[Apache-2.0](LICENSE). 커뮤니티 현지화 도구 — **Broadcom / VMware와 무관**하며 VMware 소프트웨어를 배포하지
않습니다. "VMware", "vCenter", "vSphere", "VCF"는 각 소유자의 상표입니다.

개발팀: Tony Yuan <mycloud2015@126.com> · Jingsong Yang <yjs@tanzu.eu.org> · Wei Zhou <zhouwei008@gmail.com> —
버그 신고, 번역 수정, 새 언어 요청 모두 환영합니다.
