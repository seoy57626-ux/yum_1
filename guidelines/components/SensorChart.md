# SensorChart

Supabase 센서값 실시간 선 그래프. 라이브러리 없이 SVG. 2열 레이아웃에서 전체 폭.

- 소제목 없이 차트만. 박스 없이 바탕 위에 바로. `<section aria-label="실시간 센서값">`
- 데이터: `readings` 배열 (최대 MAX_POINTS, 넘치면 앞에서 제거). 새 점은 오른쪽 끝
- SVG 폭은 컨테이너 실제 폭으로 그린다 (ResizeObserver). 높이 200. 그래야 스마트폰에서도 축 글자가 12px로 유지된다
  - 여백 왼 40 / 오 8 / 위 8 / 아래 20
  - y축 0~SENSOR_MAX, 그리드 3줄(0, 중간, 최대) `--line` 1px, 눈금 숫자 `--ink-muted` 12px 오른쪽 정렬
  - x축 라벨: 왼쪽 "−60s", 오른쪽 "지금"
  - 선: polyline `--brand` 2px, round join/cap, 채우기 없음
- 데이터 없음: "센서를 연결하면 값이 여기에 그려집니다." `t-body` `--ink-muted` 가운데, 위아래 space-8
- `role="img"`, `aria-label="센서값 추이, 현재 N"`
- 응용: 임계값 가로선, 센서 여러 개면 선별 색 + 글자 범례
