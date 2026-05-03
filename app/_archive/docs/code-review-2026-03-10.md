# 코드 리뷰 및 개선 플랜 (2026-03-10)

## Context

전체 코드베이스를 시니어 프론트엔드 관점에서 리뷰한 결과, 다음 카테고리의 이슈가 발견됨:

- 프로덕션 배포 시 문제가 되는 console.log 잔존
- 타입 안전성 미흡 (타입 단언, optional 남용, 매직 스트링)
- 동일 상수가 2개 파일에 중복 정의됨 (장비 타입 배열)
- 컴포넌트 함수명 버그 (OverviewSection이 CharacterDetailsClient로 export됨)
- 성능 최적화 누락 (EquipmentPanel의 데이터 변환, onClick 핸들러)
- tooltip.ts 중복 헬퍼 로직 잔존

---

## P0: console.log 제거

### `app/components/equipment/EquipmentDetailDialog.tsx`

라인 39-41의 console.log 3개 제거:

```ts
// 제거
console.log("[WEAPON]", item?.Type, item?.Name);
console.log(item?.Tooltip?.slice(0, 500));
console.log("detail.durabilityText =", ...);
```

### `app/api/armories/characters/[characterName]/equipment/route.ts`

주석 처리된 이전 코드 + console.log 제거 → 단순화:

```ts
// Before:
// return NextResponse.json(await res.json());
const data = await res.json();
console.log("✅ Equipment API response:", data);
return NextResponse.json(data);

// After:
return NextResponse.json(await res.json());
```

---

## P1: 타입 안전성 개선

### `app/types/Equipment.type.ts`

**EquipmentItemType, EquipmentGrade 리터럴 타입 추가** — API 응답의 Type/Grade 값을 string 대신 유니온 타입으로 좁힘:

```ts
export type EquipmentItemType =
  | "무기"
  | "투구"
  | "상의"
  | "하의"
  | "장갑"
  | "어깨"
  | "목걸이"
  | "귀걸이"
  | "반지"
  | "팔찌"
  | "어빌리티 스톤";

export type EquipmentGrade =
  | "일반"
  | "고급"
  | "희귀"
  | "영웅"
  | "전설"
  | "유물"
  | "고대";
```

**optional 남용 정리** — 항상 값이 있는 필드를 필수로 변경:

| 필드                                 | 변경 전                                            | 변경 후                                           |
| ------------------------------------ | -------------------------------------------------- | ------------------------------------------------- |
| `EquipmentBaseUI.category`           | `category?: string`                                | `category: string`                                |
| `GearUI.durabilityText`              | `durabilityText?: string`                          | `durabilityText: string`                          |
| `AccessoryUI.abilityStoneEngravings` | `abilityStoneEngravings?: AbilityStoneEngraving[]` | `abilityStoneEngravings: AbilityStoneEngraving[]` |
| `AccessoryUI.quality`                | `quality?: number \| null`                         | `quality: number \| null`                         |

### `app/lib/utils.ts`

유틸 2개 추가:

```ts
export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export function parseItemLevel(v: unknown): number {
  if (typeof v !== "string") return Number.NEGATIVE_INFINITY;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}
```

### `app/(app)/char/[name]/_components/ProfilePanel.tsx` & `EquipmentPanel.tsx`

`(error as Error).message` → `getErrorMessage(error)` 로 교체

---

## P2: 컴포넌트명 버그 수정

### `app/(app)/char/[name]/_components/OverviewSection.tsx`

```ts
// Before:
export default function CharacterDetailsClient({ name }: Props) {

// After:
export default function OverviewSection({ name }: Props) {
```

**이유**: `CharacterDetailsClient.tsx`와 동일한 이름으로 export되어 IDE 탐색/디버깅 시 혼선 유발.

---

## P3: 중복 코드 및 상수 추출

### `app/lib/lostark/equipment.sort.ts`

`LEFT_ORDER`, `RIGHT_ORDER` 를 `export`로 변경:

```ts
export const LEFT_ORDER = ["투구", "상의", "하의", "장갑", "어깨", "무기"];
export const RIGHT_ORDER = [
  "목걸이",
  "귀걸이",
  "반지",
  "팔찌",
  "어빌리티 스톤",
];
```

### `app/lib/lostark/equipment.mapper.ts`

`gearTypes`, `accessoryTypes` 인라인 배열 → `LEFT_ORDER`, `RIGHT_ORDER` import로 교체:

```ts
import { LEFT_ORDER, RIGHT_ORDER } from "./equipment.sort";

function getEquipKind(type: string): EquipKind {
  if (LEFT_ORDER.includes(type.trim())) return "gear";
  if (RIGHT_ORDER.includes(type.trim())) return "accessory";
  return "accessory";
}
```

### `app/components/character/SiblingsList.tsx`

컴포넌트 내부의 `toNum` 함수 제거 → `parseItemLevel` import로 교체:

```ts
import { parseItemLevel } from "@/lib/utils";

const sortedData = [...data].sort(
  (a, b) => parseItemLevel(b.ItemAvgLevel) - parseItemLevel(a.ItemAvgLevel),
);
```

### `app/lib/lostark/itemLabel.ts`

보스 이름-키워드 매핑을 상수 객체로 추출:

```ts
type BossName = "세르카" | "에기르" | "케누아트" | "일리아칸" | "발비쿠";

const BOSS_KEYWORDS: Record<BossName, string> = {
  세르카: "전율",
  에기르: "업화",
  케누아트: "결단",
  일리아칸: "속삭임",
  발비쿠: "송곳니",
};

export function bossFromItemName(name: string): Boss {
  const n = name.trim();
  for (const [boss, keyword] of Object.entries(BOSS_KEYWORDS) as [
    BossName,
    string,
  ][]) {
    if (n.includes(keyword)) return boss;
  }
  return null;
}
```

기존코드는 데이터(키워드)와 로직(if문)이 섞여 있어서 보스가 추가될 때마다 if문을 계속 추가해야 했는데, 리팩토링 후에는 `BOSS_KEYWORDS`에 한 줄만 추가하면

이런 패턴을 **룩업 테이블**이라고 한다.

### `app/lib/lostark/tooltip.ts`

`extractDurabilityTextHybrid` 내 Element_014/013 처리 중복 로직을 내부 헬퍼로 추출:

```ts
function tryExtractDurability(value: unknown): string {
  if (typeof value !== "string" || !value.includes("내구도")) return "";
  const text = cleanText(stripHtml(value)).replace(/\|+$/g, "").trim();
  const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
  return m ? `내구도 ${m[1]} / ${m[2]}` : text;
}
```

---

## P4: 성능 최적화

### `app/(app)/char/[name]/_components/EquipmentPanel.tsx`

**데이터 변환 useMemo** — data 변경 시에만 정렬/변환/분류 실행:

```ts
const { left, right, other } = useMemo(() => {
  if (!data || data.length === 0) return { left: [], right: [], other: [] };
  const items = [...data].sort((a, b) => a.Type.localeCompare(b.Type));
  return splitAndSortEquipment(items.map(toEquipmentUI));
}, [data]);
```

**onClick 핸들러 useCallback으로 통합** — 3곳에 인라인 함수가 반복됨 → 단일 핸들러:

```ts
const handleSelectItem = useCallback((item: EquipmentItem) => {
  setSelected(item);
  setOpen(true);
}, []);
```

---

## P5: 매직 넘버/스트링 상수화

### `app/lib/lostark/equipment.mapper.ts`

**qualityToClass 임계값 상수화**:

```ts
const QUALITY_THRESHOLDS = { BAD: 30, OK: 70, GOOD: 90, PERFECT: 100 } as const;
```

**GRADE_STYLES Record로 추출** — switch 문 → Record 룩업:

```ts
const GRADE_STYLES: Record<string, string> = {
  고대: "border-[#dcc999]/40 bg-[linear-gradient(135deg,#3d3325,#dcc999)]",
  // ...
};

function gradeToClass(grade: string, category?: string) {
  if ((category ?? "").includes("에스더")) return ESTHER_CLASS;
  return GRADE_STYLES[grade] ?? "border-white/10 bg-black/10";
}
```

---

## 수정 파일 목록

| 파일                                                             | 변경 내용                                          |
| ---------------------------------------------------------------- | -------------------------------------------------- |
| `app/components/equipment/EquipmentDetailDialog.tsx`             | console.log 3개 제거 (임시 유지)                   |
| `app/api/armories/characters/[characterName]/equipment/route.ts` | console.log + 주석 제거 (임시 유지)                |
| `app/types/Equipment.type.ts`                                    | 리터럴 타입 추가, optional 정리                    |
| `app/lib/utils.ts`                                               | getErrorMessage, parseItemLevel 추가               |
| `app/(app)/char/[name]/_components/ProfilePanel.tsx`             | error 타입 단언 제거                               |
| `app/(app)/char/[name]/_components/EquipmentPanel.tsx`           | error 타입 단언 제거, useMemo, useCallback         |
| `app/(app)/char/[name]/_components/OverviewSection.tsx`          | 컴포넌트명 버그 수정                               |
| `app/lib/lostark/equipment.sort.ts`                              | LEFT_ORDER, RIGHT_ORDER export                     |
| `app/lib/lostark/equipment.mapper.ts`                            | import 공유 상수, GRADE_STYLES, QUALITY_THRESHOLDS |
| `app/components/character/SiblingsList.tsx`                      | toNum → parseItemLevel                             |
| `app/lib/lostark/itemLabel.ts`                                   | BOSS_KEYWORDS 상수화                               |
| `app/lib/lostark/tooltip.ts`                                     | tryExtractDurability 헬퍼 추출                     |
| `tsconfig.json`                                                  | app/\_archive 타입체크 제외                        |

---

## 검증

```bash
npm run typecheck  # 타입 에러 없어야 함 ✅
npm run lint       # ESLint 통과 (warning만 존재, 기존 코드) ✅
npm run build      # 빌드 성공 확인
```

런타임: 장비 상세 다이얼로그 열기 → console.log 미출력 확인, 원정대 목록 정렬 정상 확인

## equipment.mapper.ts

### 변경 전

```tsx
// 매핑 규칙(색상/배경) + UI 모델 변환

import { extractEquipmentDetail } from "./tooltip";
import type {
  EquipmentItem,
  EquipmentUI,
  GearUI,
  AccessoryUI,
} from "@/types/Equipment.type";
import type { EquipmentDetail } from "./tooltip";

const EMPTY_DETAIL: EquipmentDetail = {
  quality: null,
  category: "",
  itemLevelText: "",
  basicText: "",
  extraText: "",
  arkPassiveText: "",
  durabilityText: "",
  abilityStoneEngravings: [],
};

type EquipKind = "gear" | "accessory";

export function toEquipmentUI(item: EquipmentItem): EquipmentUI {
  const kind = getEquipKind(item.Type);
  const detail = extractEquipmentDetail(item) ?? EMPTY_DETAIL;

  const itemLevelText = detail.itemLevelText ?? "";
  const category = detail.category ?? "";

  const base = {
    raw: item,
    type: item.Type,
    name: item.Name,
    icon: item.Icon,
    grade: item.Grade,
    category,
    itemLevelText,
    gradeClass: gradeToClass(item.Grade, category),
  };

  if (kind === "gear") {
    const quality = normalizeQuality(detail.quality ?? null);

    const ui: GearUI = {
      kind: "gear",
      ...base,
      quality,
      qualityClass: qualityToClass(quality),
      durabilityText: detail.durabilityText ?? "",
    };

    return ui;
  }

  const accQuality = normalizeQuality(detail.quality ?? null);

  const ui: AccessoryUI = {
    kind: "accessory",
    ...base,

    // AccessoryUI 타입에 아래 필드를 추가해두면 깔끔(없으면 타입 에러)
    abilityStoneEngravings: detail.abilityStoneEngravings ?? [],
  };

  if (accQuality != null) {
    ui.quality = accQuality;
    ui.qualityClass = qualityToClass(accQuality);
  }

  return ui;
}

/* 무기/방어구 vs 장신구 분기 */
function getEquipKind(type: string): EquipKind {
  const t = type.trim();
  const gearTypes = ["무기", "투구", "상의", "하의", "장갑", "어깨"];
  if (gearTypes.includes(t)) return "gear";

  const accessoryTypes = ["목걸이", "귀걸이", "반지", "팔찌", "어빌리티 스톤"];
  if (accessoryTypes.includes(t)) return "accessory";

  return "accessory";
}

function gradeToClass(grade: string, category?: string) {
  const c = (category ?? "").trim();

  if (c.includes("에스더")) {
    return "border-cyan-300/40 bg-[linear-gradient(135deg,#0c2e2c,#2faba8)]";
  }

  switch (grade) {
    case "고대":
      return "border-[#dcc999]/40 bg-[linear-gradient(135deg,#3d3325,#dcc999)]";
    case "유물":
      return "border-[#a24006]/40 bg-[linear-gradient(135deg,#341a09,#a24006)]";
    case "전설":
      return "border-[#9e5f04]/40 bg-[linear-gradient(135deg,#362003,#9e5f04)]";
    case "영웅":
      return "border-[#480d5d]/40 bg-[linear-gradient(135deg,#261331,#480d5d)]";
    case "희귀":
      return "border-[#113d5d]/40 bg-[linear-gradient(135deg,#111f2c,#113d5d)]";
    case "고급":
      return "border-[#304911]/40 bg-[linear-gradient(135deg,#18220b,#304911)]";
    case "일반":
      return "border-zinc-200/40 bg-[linear-gradient(135deg,#f5f5f5,#ffffff)] text-zinc-900";
    default:
      return "border-white/10 bg-black/10";
  }
}

function qualityToClass(q: number | null) {
  if (q == null || q == 0) return "text-zinc-500";
  if (q <= 30) return "text-red-500";
  if (q < 70) return "text-lime-500";
  if (q < 90) return "text-blue-500";
  if (q < 100) return "text-purple-500";
  return "text-[rgb(255,94,0)]";
}

function normalizeQuality(q: number | null) {
  if (q === -1) return null;
  return q;
}
```

### 변경 후

```tsx
// 매핑 규칙(색상/배경) + UI 모델 변환

import { extractEquipmentDetail } from "./tooltip";
import { LEFT_ORDER, RIGHT_ORDER } from "./equipment.sort";
import type {
  EquipmentItem,
  EquipmentUI,
  GearUI,
  AccessoryUI,
} from "@/types/Equipment.type";
import type { EquipmentDetail } from "./tooltip";

const EMPTY_DETAIL: EquipmentDetail = {
  quality: null,
  category: "",
  itemLevelText: "",
  basicText: "",
  extraText: "",
  arkPassiveText: "",
  durabilityText: "",
  abilityStoneEngravings: [],
};

type EquipKind = "gear" | "accessory";

const QUALITY_THRESHOLDS = { BAD: 30, OK: 70, GOOD: 90, PERFECT: 100 } as const;

const ESTHER_CLASS =
  "border-cyan-300/40 bg-[linear-gradient(135deg,#0c2e2c,#2faba8)]";

const GRADE_STYLES: Record<string, string> = {
  고대: "border-[#dcc999]/40 bg-[linear-gradient(135deg,#3d3325,#dcc999)]",
  유물: "border-[#a24006]/40 bg-[linear-gradient(135deg,#341a09,#a24006)]",
  전설: "border-[#9e5f04]/40 bg-[linear-gradient(135deg,#362003,#9e5f04)]",
  영웅: "border-[#480d5d]/40 bg-[linear-gradient(135deg,#261331,#480d5d)]",
  희귀: "border-[#113d5d]/40 bg-[linear-gradient(135deg,#111f2c,#113d5d)]",
  고급: "border-[#304911]/40 bg-[linear-gradient(135deg,#18220b,#304911)]",
  일반: "border-zinc-200/40 bg-[linear-gradient(135deg,#f5f5f5,#ffffff)] text-zinc-900",
};

export function toEquipmentUI(item: EquipmentItem): EquipmentUI {
  const kind = getEquipKind(item.Type);
  const detail = extractEquipmentDetail(item) ?? EMPTY_DETAIL;

  const itemLevelText = detail.itemLevelText ?? "";
  const category = detail.category ?? "";

  const base = {
    raw: item,
    type: item.Type,
    name: item.Name,
    icon: item.Icon,
    grade: item.Grade,
    category,
    itemLevelText,
    gradeClass: gradeToClass(item.Grade, category),
  };

  if (kind === "gear") {
    const quality = normalizeQuality(detail.quality ?? null);

    const ui: GearUI = {
      kind: "gear",
      ...base,
      quality,
      qualityClass: qualityToClass(quality),
      durabilityText: detail.durabilityText ?? "",
    };

    return ui;
  }

  const accQuality = normalizeQuality(detail.quality ?? null);

  const ui: AccessoryUI = {
    kind: "accessory",
    ...base,
    quality: accQuality,
    abilityStoneEngravings: detail.abilityStoneEngravings ?? [],
  };

  if (accQuality != null) {
    ui.qualityClass = qualityToClass(accQuality);
  }

  return ui;
}

/* 무기/방어구 vs 장신구 분기 */
function getEquipKind(type: string): EquipKind {
  const t = type.trim();
  if (LEFT_ORDER.includes(t)) return "gear";
  if (RIGHT_ORDER.includes(t)) return "accessory";
  return "accessory";
}

function gradeToClass(grade: string, category?: string) {
  const c = (category ?? "").trim();

  if (c.includes("에스더")) return ESTHER_CLASS;

  return GRADE_STYLES[grade] ?? "border-white/10 bg-black/10";
}

function qualityToClass(q: number | null) {
  if (q == null || q == 0) return "text-zinc-500";
  if (q <= QUALITY_THRESHOLDS.BAD) return "text-red-500";
  if (q < QUALITY_THRESHOLDS.OK) return "text-lime-500";
  if (q < QUALITY_THRESHOLDS.GOOD) return "text-blue-500";
  if (q < QUALITY_THRESHOLDS.PERFECT) return "text-purple-500";
  return "text-[rgb(255,94,0)]";
}

function normalizeQuality(q: number | null) {
  if (q === -1) return null;
  return q;
}
```

- switch문이였던 것을 룩업 테이블로 변경해서 등급이 추가될 때마다 `GRADE_STYLES`에 추가하는 방식으로 확장성을 늘림

- 인라인 문자열 → 상수로 분리함

```ts
if (c.includes("에스더")) {
  return "border-cyan-300/40 bg-[linear-gradient(...)]"; // 함수 안에 박혀있음
}

const ESTHER_CLASS = "border-cyan-300/40 bg-[linear-gradient(...)]"; // 상수로 분리

if (c.includes("에스더")) return ESTHER_CLASS;
```
