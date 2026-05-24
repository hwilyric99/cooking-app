# 🍳 AI 쿠킹 클래스

음식 이름을 입력하면 AI가 재료와 단계별 레시피를 즉시 알려주는 단일 HTML 웹앱입니다.

## 주요 기능

- **레시피 검색** — 음식 이름 입력 시 재료 배지 + 단계별 조리법 렌더링
- **다중 메뉴** — 쉼표로 구분해 최대 5개 메뉴 동시 검색
- **PDF 분석** — 레시피 PDF 업로드 시 AI가 핵심 내용 요약
- **스트리밍 응답** — 실시간으로 타이핑되듯 응답 표시
- **폴백 지원** — OpenRouter(DeepSeek) 실패 시 OpenAI GPT-4o-mini 자동 전환

## 사용 방법

1. `index_cooking.html` 파일 내 `CONFIG` 객체에 API 키 입력

```javascript
var CONFIG = {
  OPENROUTER_API_KEY: 'your-openrouter-api-key',
  OPENAI_API_KEY: 'your-openai-api-key',
  ...
};
```

2. `index_cooking.html`을 브라우저에서 바로 열기 (서버 불필요)

## API 키 발급

- **OpenRouter** (무료 DeepSeek 모델): https://openrouter.ai
- **OpenAI** (폴백용): https://platform.openai.com

## 기술 스택

- 순수 HTML / CSS / JavaScript (프레임워크 없음)
- [PDF.js](https://mozilla.github.io/pdf.js/) CDN — PDF 텍스트 추출
- [Noto Sans KR](https://fonts.google.com/noto/specimen/Noto+Sans+KR) — 한국어 폰트
