# Setup

## 스택
- React + TypeScript + Tailwind (Make 기본). shadcn 등 UI 라이브러리 컴포넌트는 쓰지 않는다 (기본 라운드, 테두리, 카드가 규칙과 충돌). 아래 컴포넌트 규칙대로 직접 만든다.
- `@supabase/supabase-js` v2. 차트는 라이브러리 없이 SVG로 그린다.

## 파일 구조
```
src/
  product.ts        // PRODUCT 슬롯 + DEVICE_ID + SENSOR_MIN/MAX
  lib/supabase.ts   // createClient
  lib/device.ts     // connectSensor, disconnectSensor, setLedPower, loadPower
  components/       // ProductHeader, ConnectionControl, PowerToggle, SensorMoon, SensorChart
  App.tsx           // AppShell + state
styles/globals.css  // styles.md 내용
```

## product.ts
```ts
export const PRODUCT = { name: '', concept: '', description: '' };
export const DEVICE_ID = 'lamp-01';
export const SENSOR_MIN = 0;
export const SENSOR_MAX = 4095; // ESP32 ADC 12bit
export const MAX_POINTS = 60;
```

## Supabase
URL과 anon 키는 `lib/supabase.ts` 상단 상수로 둔다 (수업용). 학생이 자기 프로젝트 값으로 교체.

```ts
import { createClient } from '@supabase/supabase-js';
export const SUPABASE_URL = 'https://<project>.supabase.co';
export const SUPABASE_ANON_KEY = '<anon key>';
export const db = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
```

### 테이블 (변경 금지 — ESP32 코드와 공유)
```sql
create table sensor_readings (
  id bigint generated always as identity primary key,
  device_id text not null,
  value int not null,
  created_at timestamptz not null default now()
);
create table device_state (
  device_id text primary key,
  led_on boolean not null default false,
  updated_at timestamptz not null default now()
);
alter publication supabase_realtime add table sensor_readings;
```

### lib/device.ts — 이 시그니처를 유지
```ts
type Reading = { value: number; created_at: string };
type Status = 'disconnected' | 'connecting' | 'connected' | 'error';

// 최근 MAX_POINTS개 select(오래된 순으로 정렬해 반환) → onInit
// 그 뒤 sensor_readings INSERT (filter: device_id=eq.DEVICE_ID) 구독 → onReading
// 구독 상태 SUBSCRIBED → 'connected', CHANNEL_ERROR/TIMED_OUT → 'error'
connectSensor(opts: {
  onInit: (rows: Reading[]) => void;
  onReading: (row: Reading) => void;
  onStatus: (s: Status) => void;
}): Promise<void>;

disconnectSensor(): Promise<void>;          // db.removeChannel
setLedPower(on: boolean): Promise<boolean>; // device_state.led_on update, 성공 여부 반환
loadPower(): Promise<boolean>;              // 앱 시작 시 device_state.led_on 읽기
```

### Supabase를 아직 연결하지 않았을 때
URL이 `<project>`를 포함하면 **데모 모드**: 0.5초마다 가상 센서값(사인파)을 만들어 같은 콜백으로 흘려보낸다. 제품 설명 아래에 `t-caption` `--ink-muted`로 "데모 데이터로 표시 중" 한 줄 표시.
