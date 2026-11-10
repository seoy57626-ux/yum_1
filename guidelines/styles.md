# styles/globals.css 에 넣을 내용

아래 블록을 globals.css 맨 위에 그대로 넣는다. 메인 컬러, 폰트 슬롯은 여기서만 바꾼다.

파일 위치:
- 폰트 `public/fonts/`: Pretendard-Regular, Medium, SemiBold, RisingCHAI-ExtraBold, RisingCHAI-Light (.woff2)
- 달 이미지 `public/images/moon.webp` (800×800, 투명 배경)

```css
/* 메인 폰트 Pretendard */
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-Regular.woff2") format("woff2"); font-weight: 400; font-display: swap; }
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-Medium.woff2") format("woff2"); font-weight: 500; font-display: swap; }
@font-face { font-family: "Pretendard"; src: url("/fonts/Pretendard-SemiBold.woff2") format("woff2"); font-weight: 600; font-display: swap; }
/* 서브 폰트 Rising CHAI */
@font-face { font-family: "Rising CHAI"; src: url("/fonts/RisingCHAI-Light.woff2") format("woff2"); font-weight: 300; font-display: swap; }
@font-face { font-family: "Rising CHAI"; src: url("/fonts/RisingCHAI-ExtraBold.woff2") format("woff2"); font-weight: 800; font-display: swap; }

:root {
  /* 학생 슬롯: 메인 컬러 (기본값 블루) */
  --brand: #2f5bff;
  --on-brand: #ffffff;
  /* 학생 슬롯: 폰트 (메인, 서브) */
  --font-sans: Pretendard, -apple-system, "Apple SD Gothic Neo", "Noto Sans KR", sans-serif;
  --font-display: "Rising CHAI", Pretendard, -apple-system, sans-serif;

  --surface: #000000;
  --ink: #eef0f3;
  --ink-muted: #9a9ea7;
  --line: #2a2d33;
  --off: #5d6169;
  --moon-glow: #9db8ff;
  --status-on: #4cc38a;
  --danger: #f97066;

  --space-1: 4px; --space-2: 8px; --space-3: 12px; --space-4: 16px;
  --space-6: 24px; --space-8: 32px; --space-12: 48px;
  color-scheme: dark;
}

body { margin: 0; background: var(--surface); color: var(--ink); font-family: var(--font-sans); }
:focus-visible { outline: 2px solid var(--brand); outline-offset: 2px; }
button { border: 0; border-radius: 0; }

/* 타입: 자간, 행간 지정 없음 */
.t-display { font-family: var(--font-display); font-size: 40px; font-weight: 800; }
.t-value   { font-family: var(--font-display); font-size: 48px; font-weight: 800; font-variant-numeric: tabular-nums; }
.t-body    { font-size: 16px; font-weight: 400; }
.t-label   { font-size: 14px; font-weight: 500; }
.t-caption { font-size: 12px; font-weight: 400; }
@media (max-width: 767px) { .t-display { font-size: 24px; } }

/* 센서 달 */
.moon { --level: 0; width: min(72vw, 360px); aspect-ratio: 1; margin: 0 auto; animation: moon-float 6s ease-in-out infinite alternate; }
.moon img { display: block; width: 100%; height: 100%; object-fit: contain;
  filter: brightness(calc(0.25 + 0.75 * var(--level))) drop-shadow(0 0 calc(var(--level) * 48px) var(--moon-glow));
  transition: filter .4s; }
.moon[data-power="off"] img { filter: brightness(0.12) grayscale(1); }
@keyframes moon-float { from { transform: translateY(0); } to { transform: translateY(-10px); } }
@media (prefers-reduced-motion: reduce) { .moon { animation: none; } }
```
