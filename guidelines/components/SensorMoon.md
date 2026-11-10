# SensorMoon

검은 바탕 정가운데에 떠 있는 달. 센서값에 따라 밝기와 주변 빛이 바뀐다. 실제 조명의 디지털 쌍둥이.

- 이미지 `public/images/moon.webp` (투명 배경). `<div class="moon"><img src="/images/moon.webp" alt=""></div>`
- 위치: 화면 정가운데. 감싸는 `<section aria-label="달 상태">`는 min-height 70vh, flex 세로 정렬로 가로 세로 가운데. 소제목 없음
- level = clamp((value − SENSOR_MIN) / (SENSOR_MAX − SENSOR_MIN), 0, 1) → `.moon`의 `--level` 스타일 변수
- 밝기 0.25 + 0.75 × level, 빛 drop-shadow level × 48px `--moon-glow` (styles.md의 `.moon` 그대로)
- 전원 OFF: `data-power="off"` → 밝기 0.12, 흑백, 빛 없음
- 위아래 10px, 6초 주기로 천천히 떠 있음. reduced-motion이면 멈춤
- 달 아래 space-6 간격으로 현재값 `t-value` (천 단위 콤마, 값 없으면 "—")
- `role="img"`, `aria-label="달 밝기 NN%"`, 꺼지면 "달 꺼짐"
- 응용: 같은 규격(정사각, 투명 배경) 이미지로 바꾸면 자기 제품 오브제로 쓸 수 있다
