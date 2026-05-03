# 연마 효과 & 아크 패시브 포인트 표시 구현

## Context

목걸이/귀걸이/반지의 툴팁 데이터에는 **연마 효과**(색상 코드별 옵션 값)와 **아크 패시브 포인트 효과**가 있지만, 현재 `EquipmentRow`에 표시되지 않는다. 이는 `AccessoryUI` 타입에 해당 필드가 없고, `toEquipmentUI` 매퍼에서도 저장하지 않기 때문이다.

사용자가 원하는 표시 내용:

- 품질 (이미 표시됨)
- **연마 효과**: `적에게 주는 피해 +1.20%`, `전투 중 생명력 회복량 +10`, `추가 피해 +2.60%` 등 — 색상 코드별로 구분
- **아크 패시브 포인트 효과**: `깨달음 +13` 등

---

## 샘플 데이터 구조 (목걸이/귀걸이/반지 공통)

세 아이템 모두 동일한 ItemPartBox 섹션 순서:

- `Element_004`: `기본 효과` — 힘/민/지/체력
- `Element_005`: null
- `Element_006`: `연마 효과` — 색상 코드 포함 HTML
- `Element_007`: `아크 패시브 포인트 효과` — 텍스트

연마 효과 HTML 패턴:

```html
<img src='emoticon_sign_greenDot'...></img>적에게 주는 피해 <FONT color='CE43FC'>+1.20%</FONT><br>
<img src='emoticon_sign_greenDot'...></img>전투 중 생명력 회복량 <FONT COLOR='00B5FF'>+10</FONT><br>
<img src='emoticon_sign_greenDot'...></img>추가 피해 <FONT COLOR='FE9600'>+2.60%</FONT>
```

색상 코드 → Tailwind 클래스 매핑:

| 색상코드 | 의미             | Tailwind          |
| -------- | ---------------- | ----------------- |
| `CE43FC` | 주요 옵션 (보라) | `text-purple-400` |
| `00B5FF` | 수치 옵션 (파랑) | `text-sky-400`    |
| `FE9600` | 특수 효과 (주황) | `text-orange-400` |
| 기타     | 기본             | `text-zinc-300`   |

---

## 구현 계획

### 1. `app/lib/lostark/tooltip.ts`

**`PolishingOption` 타입 추가 (export)**:

```ts
export type PolishingOption = {
  name: string;
  value: string;
  colorClass: string; // tailwind 텍스트 색상 클래스
};
```

**`extractPolishingOptions(html: string): PolishingOption[]` 함수 추가**:

- `<br>` 기준으로 줄 분리
- 각 줄에서 `<FONT color='COLOR'>+value</FONT>` 패턴으로 값과 색상 추출
- `<img ...>` 태그와 기타 HTML 제거해 name 추출
- 색상코드 → colorClass 매핑

**`EquipmentDetail` 타입에 필드 추가**:

```ts
polishingOptions: PolishingOption[];  // 연마 효과 파싱 결과
```

**`extractEquipmentDetail`에 추출 로직 추가**:

- ItemPartBox 순회 중 헤더가 `연마 효과`인 element를 만나면, `Element_001` raw HTML을 `extractPolishingOptions`로 파싱
- `detail.polishingOptions`에 저장

---

### 2. `app/types/Equipment.type.ts`

**`PolishingOption` import 추가**:

```ts
import type {
  AbilityStoneEngraving,
  PolishingOption,
} from "@/lib/lostark/tooltip";
```

**`AccessoryUI`에 필드 추가**:

```ts
export type AccessoryUI = EquipmentBaseUI & {
  kind: "accessory";
  quality: number | null;
  qualityClass?: string;
  abilityStoneEngravings: AbilityStoneEngraving[];
  polishingOptions: PolishingOption[]; // 연마 효과
  arkPassiveText: string; // 아크 패시브 포인트 효과
};
```

---

### 3. `app/lib/lostark/equipment.mapper.ts`

AccessoryUI 생성 시 새 필드 추가:

```ts
const ui: AccessoryUI = {
  kind: "accessory",
  ...base,
  quality: accQuality,
  abilityStoneEngravings: detail.abilityStoneEngravings ?? [],
  polishingOptions: detail.polishingOptions ?? [],
  arkPassiveText: detail.arkPassiveText ?? "",
};
```

---

### 4. `app/components/equipment/EquipmentRow.tsx`

목걸이/귀걸이/반지(`item.type === "목걸이" | "귀걸이" | "반지"`) 조건으로 표시.
어빌리티 스톤은 기존대로 `AbilityStoneEngravingsSection` 유지.

표시 레이아웃 (아이템명 아래):

```tsx
{
  item.kind === "accessory" &&
    ["목걸이", "귀걸이", "반지"].includes(item.type) && (
      <div className="mt-1 space-y-0.5">
        {/* 연마 효과 */}
        {item.polishingOptions.map((opt, i) => (
          <div key={i} className="flex items-center gap-1 text-[11px]">
            <span className="text-zinc-400 truncate">{opt.name}</span>
            <span className={opt.colorClass}>{opt.value}</span>
          </div>
        ))}
        {/* 아크 패시브 포인트 */}
        {item.arkPassiveText && (
          <div className="text-[11px] text-zinc-500">{item.arkPassiveText}</div>
        )}
      </div>
    );
}
```

---

## 수정 파일 목록

| 파일                                        | 변경 내용                                                                                                                                                    |
| ------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `app/lib/lostark/tooltip.ts`                | `PolishingOption` 타입 export, `extractPolishingOptions` 추가, `EquipmentDetail`에 `polishingOptions` 필드 추가, `extractEquipmentDetail`에서 연마 효과 파싱 |
| `app/types/Equipment.type.ts`               | `PolishingOption` import, `AccessoryUI`에 `polishingOptions`, `arkPassiveText` 필드 추가                                                                     |
| `app/lib/lostark/equipment.mapper.ts`       | AccessoryUI 생성 시 `polishingOptions`, `arkPassiveText` 채우기                                                                                              |
| `app/components/equipment/EquipmentRow.tsx` | 목걸이/귀걸이/반지에 연마 효과 + 아크 패시브 표시 추가                                                                                                       |

---

## 검증 방법

1. `npm run typecheck` — 타입 에러 없음
2. `npm run lint` — lint 에러 없음
3. 목걸이/귀걸이/반지 → EquipmentRow에 연마 효과 옵션 3줄 + 아크 패시브 표시 확인
4. 색상 구분 확인 (보라/파랑/주황)
5. 어빌리티 스톤 → 기존 각인 표시 영향 없음 확인
6. 팔찌/방어구/무기 → 연마 효과 표시 없음 확인
