# PowerToggle

LED 전원 스위치. 컨트롤 영역의 둘째 행 (첫 행과 space-6 간격, 구분선 없음).

- 한 행: 왼쪽 [컨트롤 이름 "LED 전원" `t-label` + 그 아래 "켜짐" 또는 "꺼짐" `t-caption` `--ink-muted`], 오른쪽 스위치
- 스위치: `<button role="switch" aria-checked aria-label="LED 전원">`
  - 사각 트랙 52×32, radius 0. OFF `--off` / ON `--brand`
  - 사각 손잡이 24×24, radius 0, 4px 안쪽. OFF `--surface` / ON `--on-brand`. ON이면 오른쪽으로 20px, 150ms
  - 터치 영역 최소 44px
- 누르면 즉시 UI 반영 → `setLedPower(on)` → 실패하면 이전 상태로 되돌리고 행 아래에 "전원 변경 실패, 다시 시도" `t-caption` `--danger`
- 앱 시작 시 `loadPower()`로 초기값
- 센서 연결 여부와 무관하게 동작
