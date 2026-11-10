# AppShell

전체 화면 레이아웃과 상태 관리 (`App.tsx`).

## 레이아웃
- 바탕 `--surface` 검은색. 섹션은 박스 없이 바탕 위에 바로. 섹션 소제목 없음. 구분은 여백으로만
- `<main>` 최대 폭 1120px 가운데. 여백 모바일 위아래 space-8, 좌우 space-4 / 웹(768px 이상) 위아래 space-12, 좌우 space-8
- 배치 순서:
  1. ProductHeader: 맨 위, 왼쪽 정렬, 전체 폭
  2. SensorMoon: 전체 폭, 화면 정가운데 (min-height 70vh)
  3. 컨트롤(ConnectionControl, PowerToggle 두 행, 행 사이 space-6)
  4. SensorChart
- 모바일: 1열, 섹션 사이 space-8
- 웹: 3과 4를 나란히 (grid 1fr 2fr), 섹션 사이 space-12
- viewport meta: `width=device-width, initial-scale=1`

## 상태
```ts
const [status, setStatus] = useState<Status>('disconnected');
const [power, setPower] = useState(false);
const [readings, setReadings] = useState<Reading[]>([]);
```
- connected 여부는 `status === 'connected'`
- 최신값 = `readings.at(-1)?.value`
- `onReading`: 배열 끝에 추가, MAX_POINTS 초과 시 앞에서 제거
- 언마운트 시 `disconnectSensor()`

## 응용
- 섹션 추가: grid 안에 `<section aria-label="…">` 추가. 전체 폭은 `col-span-full`
