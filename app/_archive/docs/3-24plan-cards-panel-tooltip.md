````md
# 프롬프트

CardsPanel 컴포넌트를 아래 두 가지 기능으로 수정해줘.

---

## 1. 세트 이름 표시 로직 수정

현재 `setNames`는 모든 세트 이펙트 이름을 다 나열하는데,
실제로 **적용된 최고 단계만** 표시하도록 변경해야 해.

### API 데이터 구조

```ts
Effects: [
  {
    Index: 0,
    CardSlots: [...],
    Items: [
      { Name: "세상을 구하는 빛 2세트", Description: "..." },
      { Name: "세상을 구하는 빛 4세트", Description: "..." },
      { Name: "세상을 구하는 빛 6세트", Description: "..." },
      { Name: "세상을 구하는 빛 6세트 (12각성합계)", Description: "..." },
      { Name: "세상을 구하는 빛 6세트 (18각성합계)", Description: "..." },
      { Name: "세상을 구하는 빛 6세트 (24각성합계)", Description: "..." },
      { Name: "세상을 구하는 빛 6세트 (30각성합계)", Description: "..." },
    ]
  }
]
```
````

### 구현 방법

- `Effects` 배열을 순회하면서, 각 `Effect`의 `Items` 배열에서 **마지막 요소(`Items.at(-1)`)의 Name**만 추출
- 이미 적용된 이펙트들은 순서대로 배열에 있으므로 마지막이 곧 최고 적용 단계
- 중복 제거는 유지

```ts
// 변경 전
const setNames = data.Effects.flatMap((e) =>
  e.Items.map((item) => item.Name),
).filter((n, i, arr) => arr.indexOf(n) === i);

// 변경 후
const setNames = data.Effects.map((e) => e.Items.at(-1)?.Name)
  .filter((n): n is string => !!n)
  .filter((n, i, arr) => arr.indexOf(n) === i);
```

---

## 2. 카드 호버 툴팁 구현

`CardSlot` 컴포넌트에 마우스 hover 시 상세 정보 툴팁을 표시해야 해.

### 표시할 내용

해당 카드가 속한 `Effect`의 모든 `Items`를 툴팁에 표시.

- `Item.Name` (세트 단계명)
- `Item.Description` (효과 설명)
- 현재 적용된 마지막 단계는 강조 표시 (예: 텍스트 색상 amber)

### 데이터 연결 방법

`CardsPanel`에서 각 카드 슬롯이 어느 `Effect`에 속하는지 `Effect.CardSlots`로 확인 가능.
`CardSlot`에 해당 카드의 `effectItems` prop을 내려줘:

```ts
// CardsPanel에서
const slotToEffect = new Map<number, typeof data.Effects[0]>();
data.Effects.forEach((effect) => {
  effect.CardSlots.forEach((slot) => slotToEffect.set(slot, effect));
});

// CardSlot에 prop 추가
<CardSlot key={i} card={card} effect={slotToEffect.get(i)} />
```

### 툴팁 UI 조건

- `useState`로 hover 상태 관리 (`isHovered`)
- `onMouseEnter` / `onMouseLeave`로 토글
- 툴팁 위치: 카드 위쪽 (`bottom-full mb-2`) 또는 공간 부족 시 아래쪽
- `absolute` + `z-50`으로 다른 요소 위에 표시
- 툴팁 컨테이너는 `min-w-[200px]` 정도의 고정 너비
- 배경: `bg-[#1a1b1e]`, 테두리: `border border-white/20`, 둥근 모서리: `rounded-xl`, 패딩: `p-3`
- 각 Item을 리스트로 표시, 마지막 Item은 `text-amber-400`으로 강조
- `CardSlot`의 외부 wrapper에 `relative` 추가 필요

### 주의사항

- `"use client"` 지시어가 필요하면 별도 Client 컴포넌트(`CardSlotClient`)로 분리하고,
  `CardsPanel`은 Server Component로 유지
- 툴팁이 그리드 밖으로 잘릴 수 있으니 `overflow-visible`을 그리드에 적용

````

# CardsPanel 기능 수정 — 세트명 로직 + 호버 툴팁

## Context

기존 `CardsPanel.tsx`에 두 가지 기능을 추가/수정한다.

1. **세트명 표시 로직**: 현재 모든 단계의 이름을 나열하는데, 각 Effect의 최고 적용 단계(`Items.at(-1)`)만 표시하도록 변경.
2. **카드 호버 툴팁**: 각 카드에 마우스 올리면 해당 카드가 속한 Effect의 전체 Items(단계별 세트 효과)를 툴팁으로 표시. 인터랙션이 필요하므로 `CardSlotClient` Client Component를 분리하고 `CardsPanel`은 RSC로 유지.

---

## 수정 대상 파일

| 파일 | 수정 내용 |
|------|----------|
| `app/(app)/char/[name]/_components/CardsPanel.tsx` | setNames 로직 수정 + CardSlotClient 임포트 + slotToEffect Map 생성 후 prop 전달 |
| `app/(app)/char/[name]/_components/CardSlotClient.tsx` | 신규 생성 — `"use client"`, hover 상태 + 툴팁 UI |

---

## 구현 세부 내용

### 1. setNames 로직 수정 (`CardsPanel.tsx`)

```ts
// 변경 전 — 모든 단계의 이름을 나열
const setNames = data.Effects.flatMap((e) =>
  e.Items.map((item) => item.Name),
).filter((n, i, arr) => arr.indexOf(n) === i);

// 변경 후 — 각 Effect에서 마지막 Item(최고 적용 단계)만 추출
const setNames = data.Effects
  .map((e) => e.Items.at(-1)?.Name)
  .filter((n): n is string => !!n)
  .filter((n, i, arr) => arr.indexOf(n) === i);
````

### 2. slotToEffect Map 생성 (`CardsPanel.tsx`)

슬롯 번호로 해당 Effect를 빠르게 조회하기 위해 Map을 미리 생성한 뒤 `CardSlotClient`에 prop으로 전달한다.

```ts
const slotToEffect = new Map<number, (typeof data.Effects)[0]>();
data.Effects.forEach((effect) => {
  effect.CardSlots.forEach((slot) => slotToEffect.set(slot, effect));
});
```

그리드 내 카드 렌더링 시 `CardSlot` → `CardSlotClient`로 교체:

```tsx
<div className="grid grid-cols-3 gap-3 overflow-visible">
  {slots.map((card, i) =>
    card ? (
      <CardSlotClient
        key={i}
        card={card}
        effect={slotToEffect.get(i)}
        style={CARD_GRADE_STYLES[card.Grade] ?? CARD_GRADE_STYLES["일반"]}
      />
    ) : (
      <EmptySlot key={i} />
    ),
  )}
</div>
```

> `CARD_GRADE_STYLES`는 `CardsPanel`(RSC)에 그대로 유지하고, 계산된 style 객체만 prop으로 전달해 클라이언트에서 상수 중복 정의를 피한다.

### 3. `CardSlotClient.tsx` 신규 생성

**Props**

```ts
type Props = {
  card: CardItem;
  effect?: CardEffect; // 없으면 툴팁 미표시
  style: { border: string; bg: string; text: string; glow: string };
};
```

**상태**

- `isHovered: boolean` — `useState`로 관리
- `showBelow: boolean` — 툴팁 표시 방향 (위/아래)

**툴팁 방향 결정**

`useEffect` + `getBoundingClientRect()`로 wrapper의 `top` 값을 측정해 기준값(200px) 미만이면 아래 표시, 이상이면 위 표시:

```ts
useEffect(() => {
  if (isHovered && wrapperRef.current) {
    const rect = wrapperRef.current.getBoundingClientRect();
    setShowBelow(rect.top < 200);
  }
}, [isHovered]);
```

**툴팁 UI 구조**

```
wrapper (relative)
  └─ absolute 툴팁 (left-1/2 -translate-x-1/2 z-50)
      ├─ showBelow: top-full mt-2
      ├─ !showBelow: bottom-full mb-2
      ├─ min-w-[220px] bg-[#1a1b1e] border border-white/20 rounded-xl p-3
      └─ Items 순회
          ├─ Name: text-xs font-semibold text-zinc-200
          │        마지막 항목: text-amber-400 (최고 적용 단계 강조)
          └─ Description: text-xs text-zinc-400 mt-0.5
```

**그리드 overflow 처리**

툴팁이 그리드 경계 밖으로 넘칠 수 있으므로 `overflow-visible`을 그리드에 추가.

---

## 정리된 파일 구조

```
app/(app)/char/[name]/_components/
  CardsPanel.tsx        # RSC — 서버 fetch + slotToEffect 계산 + 렌더링
  CardSlotClient.tsx    # Client Component — hover 상태 + 툴팁 UI
```

---

## 검증

1. `npm run typecheck` — 타입 오류 없음
2. `npm run build` — 빌드 성공
3. 브라우저에서 카드 장착 캐릭터 → 세트명이 최고 단계만 표시되는지 확인
4. 카드에 마우스 hover → 툴팁에 단계별 세트 효과 목록 표시, 마지막 줄 amber 강조 확인
