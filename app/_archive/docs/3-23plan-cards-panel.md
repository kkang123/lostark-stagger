# 카드 패널 추가 구현 계획

## Context

`/char/[name]` 페이지 하단에 캐릭터가 장착한 카드 6개와 카드 세트 이름을 표시하는 패널을 추가한다.
로스트아크 API의 `/armories/characters/{name}/cards` 엔드포인트를 사용하며,
기존 `ProfilePanel` · `EquipmentPanel`과 동일한 RSC 패턴으로 구현한다.

---

## Lostark Cards API 응답 구조

```json
{
  "Cards": [
    {
      "Slot": 0,
      "Name": "카드 이름",
      "Icon": "https://...",
      "AwakeCount": 3,
      "AwakeTotal": 5,
      "Grade": "전설",
      "Tooltip": "{...}"
    }
  ],
  "Effects": [
    {
      "Index": 0,
      "CardSlots": [0, 1, 2],
      "Items": [
        { "Name": "세트 이름", "Description": "효과 설명" }
      ]
    }
  ]
}
```

- `Cards`: 슬롯 0~5, 최대 6개 (빈 슬롯은 배열에서 생략될 수 있음)
- `Effects[].Items[].Name`: 카드 세트 이름 (예: "광기", "구원" 등)
- `AwakeCount / AwakeTotal`: 각성 진행도

---

## 구현 대상 파일

### 신규 생성 (3개)

| 파일 | 역할 |
|------|------|
| `app/api/armories/characters/[characterName]/cards/route.ts` | Route Handler — JWT 프록시 |
| `app/types/Card.type.ts` | `CardItem` (API 원본), `CardEffect`, `CharacterCards` 타입 |
| `app/(app)/char/[name]/_components/CardsPanel.tsx` | RSC — 서버 fetch + 렌더링 |

### 수정 (2개)

| 파일 | 수정 내용 |
|------|----------|
| `app/lib/lostark/api/server.ts` | `getCharacterCardsServer()` 함수 추가 |
| `app/(app)/char/[name]/_components/OverviewSection.tsx` | `<CardsPanel>` 추가 (EquipmentPanel 아래) |

---

## 구현 세부 내용

### 1. `app/types/Card.type.ts`

```ts
export type CardGrade = "일반" | "희귀" | "영웅" | "전설" | "에스더";

export type CardItem = {
  Slot: number;
  Name: string;
  Icon: string;
  AwakeCount: number;
  AwakeTotal: number;
  Grade: CardGrade;
  Tooltip: string;
};

export type CardEffect = {
  Index: number;
  CardSlots: number[];
  Items: { Name: string; Description: string }[];
};

export type CharacterCards = {
  Cards: CardItem[];
  Effects: CardEffect[];
};
```

### 2. `app/api/armories/characters/[characterName]/cards/route.ts`

기존 equipment route와 동일 패턴:
- `export const dynamic = "force-dynamic"`
- 환경변수 검증 → URL 인코딩 → fetch → 에러 처리 → `NextResponse.json(data)`
- 엔드포인트: `${baseUrl}/armories/characters/${encodedName}/cards`

### 3. `app/lib/lostark/api/server.ts`에 함수 추가

```ts
export function getCharacterCardsServer(name: CharacterName) {
  const encodedName = encodeURIComponent(name.trim());
  return lostarkFetch<CharacterCards>(`/armories/characters/${encodedName}/cards`);
}
```

### 4. `app/(app)/char/[name]/_components/CardsPanel.tsx`

순수 RSC (인터랙션 없음 → 클라이언트 컴포넌트 분리 불필요).

**레이아웃: 3열 × 2행 그리드**

```
section
  ├─ 상단: h3 "카드" (좌측) + 세트 이름 (우측)
  ├─ grid grid-cols-3 gap-3
  │   └─ 각 카드: 아이콘 + 이름 + 각성 진행도 (●●●○)
  └─ 빈 슬롯: "빈 슬롯" 텍스트 표시
```

**각성 진행도**: `AwakeCount / AwakeTotal` → 점(●○)으로 표현

**카드 세트 이름 추출**: `Effects` 배열에서 `Items[0].Name`들을 중복 제거 후 ` / `로 조합해 표시.

**빈 슬롯 처리**: `Slot` 번호 기준으로 0~5 배열을 채우고, 없는 슬롯은 빈 카드로 표시.

**에러/빈 상태**: `EquipmentPanel` 동일 패턴.

### 5. `OverviewSection.tsx` 수정

```tsx
<section className="grid gap-4">
  <ProfilePanel name={name} />
  <EquipmentPanel name={name} />
  <CardsPanel name={name} />   {/* 추가 */}
</section>
```

---

## 등급 색상

기존 `GRADE_STYLES` 패턴(`equipment.mapper.ts`) 참고해 카드 등급별 색상 상수를 `CardsPanel.tsx` 내부에 정의:

```ts
const CARD_GRADE_STYLES: Record<string, string> = {
  에스더: "border-[#00b4d8]/40 bg-[linear-gradient(135deg,#002d3d,#00b4d8)]",
  전설:  "border-[#f5a623]/40 bg-[linear-gradient(135deg,#3d2800,#f5a623)]",
  영웅:  "border-[#9b59b6]/40 bg-[linear-gradient(135deg,#1e0a2e,#9b59b6)]",
  희귀:  "border-[#3498db]/40 bg-[linear-gradient(135deg,#0a1e2e,#3498db)]",
  일반:  "border-white/10 bg-black/20",
};
```

---

## 검증

1. `npm run typecheck` — 타입 오류 없음
2. `npm run build` — 빌드 성공
3. 브라우저에서 캐릭터 검색 → 카드 패널 최하단 노출 확인
4. 카드 미장착 캐릭터 → "카드 정보가 없습니다." 빈 상태 확인
