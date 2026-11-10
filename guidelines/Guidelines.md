# IoT 조명 웹앱 기본 프레임

센서값에 반응하는 조명 제품의 웹, 스마트폰 화면이다. 검은 바탕 정가운데에 센서값과 연동된 달이 떠 있다. 데이터 흐름: 센서 → ESP32 → Supabase → 이 웹앱.
이 문서 하나에 모든 규칙이 있다. 아래 Setup, Tokens, styles, 컴포넌트 섹션을 모두 따른다.

## 반드시 지킬 시각 규칙

1. **텍스트는 페이지 바탕(`--surface`) 위에 바로 놓는다.** 배경색 있는 사각 박스 위에 글자를 올리는 건 버튼만 허용. 카드 UI를 만들지 않는다.
2. **사각 프레임에 테두리 금지.** border, outline 장식, ring 클래스 모두. (키보드 포커스 링만 예외)
3. **사각 프레임에 라운드 금지.** 버튼, 토글, 입력창 포함 모든 사각 요소 `border-radius: 0` (rounded-* 클래스 금지). 원형 요소(LED 원, 상태 점)만 원.
4. **무의미한 소제목 금지.** 내용이 이미 말하는 것을 반복하는 섹션 제목("조명 상태", "컨트롤", "실시간 센서값", "제품 소개" 같은), 제목 위 작은 장식 라벨을 달지 않는다. 무엇을 조작하는지 알려주는 컨트롤 이름("센서", "LED 전원")만 쓴다. 섹션 이름은 `aria-label`로.
5. **중점(·) 금지.** 나열은 쉼표나 줄바꿈으로.
6. **자간, 행간은 폰트 기본값.** `letter-spacing`, `line-height`를 지정하지 않는다 (tracking-*, leading-* 클래스 금지). 대문자 라벨(uppercase) 금지.
7. 색, 크기, 간격은 Tokens의 CSS 변수만. Tailwind 기본 팔레트나 임의 hex 금지.
8. 구분은 여백으로. 구분선, 그림자, 그라데이션, 이모지 금지. `--line`은 차트 그리드에만.

## 반드시 지킬 동작 규칙

1. 상태(연결됨, 오류, 켜짐, 꺼짐)는 항상 **글자로** 표시한다. 색만으로 구분 금지.
2. 버튼, 토글 터치 영역 최소 44px. 스마트폰(375px)에서 가로 스크롤 금지.
3. 화면은 상태 3개(`status`, `power`, `readings`)에서만 그린다.
4. Supabase 키는 anon(publishable) 키만. service_role 키는 코드에 넣지 않는다.
5. 바탕은 검은색 한 테마. 텍스트 대비 4.5:1 이상.

## 제품 슬롯 (학생이 채우는 칸)

제품 이름, 컨셉, 설명은 `src/product.ts`의 `PRODUCT` 객체 한 곳에서만 정의하고 화면은 거기서 읽는다. 비어 있으면 `[제품 이름]` 같은 자리표시를 `--ink-muted`로 보여준다.

| 슬롯 | 위치 |
| --- | --- |
| 제품 이름 | `PRODUCT.name` |
| 제품 컨셉 (한 줄) | `PRODUCT.concept` |
| 제품 설명 (2~3문장) | `PRODUCT.description` |
| 메인 컬러 | globals.css의 `--brand`, `--on-brand`. 기본값 블루 |
| 폰트 | globals.css의 `--font-sans`(메인, 기본값 Pretendard), `--font-display`(서브, 기본값 Rising CHAI). 서브는 제품 이름과 센서값 숫자에만 |

## 기능

| 기능 | 컴포넌트 | 데이터 |
| --- | --- | --- |
| 센서값에 따라 밝아지는 달 (검은 바탕 정가운데) | SensorMoon | 최신 `sensor_readings.value` |
| 센서값 플롯 | SensorChart | 최근 60개 + realtime INSERT |
| LED 전원 on/off | PowerToggle | `device_state.led_on` 업데이트 |
| 센서 연결, 끊기 | ConnectionControl | realtime 채널 구독, 해제 |
| 반응형 | AppShell | 768px 기준. 웹은 달 아래 컨트롤과 차트 2열 |
| 제품 정보 | ProductHeader | `PRODUCT` |

"센서 연결"은 Supabase realtime 채널을 구독하는 동작이다. 블루투스나 시리얼은 쓰지 않으므로 iOS 포함 모든 스마트폰에서 동작한다.

## 응용 범위

- 바꿔도 됨: 제품 슬롯, 달 이미지(정사각, 투명 배경), 센서 범위와 단위, 차트 포인트 수, 섹션 추가.
- 바꾸면 안 됨: 위 시각 규칙과 동작 규칙, 상태 구조, Supabase 테이블 이름과 컬럼.
