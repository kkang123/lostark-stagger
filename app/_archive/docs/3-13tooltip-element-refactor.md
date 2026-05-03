# Tooltip Element 위치 하드코딩 제거 리팩터링

## Context

로스트아크 API 툴팁 JSON의 Element 위치가 아이템 종류/티어마다 다름에도, `tooltip.ts`의 `extractEquipmentDetail`이 `Element_005`, `Element_007`, `Element_009` 위치를 하드코딩해 basicText/extraText/arkPassiveText를 추출함. 장신구(11개 element), 방어구(15개), 무기(14개), 어빌리티 스톤(12개)이 전부 구조가 다르며, 낮은 티어 아이템도 element 수가 다를 수 있음. 또한 `EquipmentDetailDialog`에 `console.log`와 `<pre>` 태그가 남아 있어 CLAUDE.md 규칙 위반.

---

## 확인된 문제점

### 샘플 데이터 Element 구조 분석 결과

| 아이템 종류 | element 수 | basicText 위치 | extraText 위치 | arkPassive 위치 |
|---|---|---|---|---|
| 무기 | 14 | Element_005 | Element_007 | Element_009 |
| 방어구 (투구~어깨) | 15 | Element_005 | Element_007 | Element_009 |
| 장신구 (목걸이~팔찌) | 11 | Element_004 | (없음) | (없음) |
| 어빌리티 스톤 | 12 | Element_004 | (없음) | (없음) |
| 보주/나침반/부적 | 11 | Element_004 | 모름 | (없음) |

→ 장신구는 `v005`가 null이라 basicText가 빈 문자열, fallback 키워드 매칭으로 구제되지만 불안정함.

---

### 문제 1 — tooltip.ts: 하드코딩 Element 위치 (핵심)

```ts
// extractEquipmentDetail (line 237-239) — 위치 기반 하드코딩
let basicText = stripHtml(getStr(v005, "Element_001"));    // 장신구는 v005 = null!
let extraText = stripHtml(getStr(v007, "Element_001"));    // 장신구는 없음
let arkPassiveText = stripHtml(getStr(v009, "Element_001")); // 장신구는 없음
```

`Element_005`, `007`, `009`를 고정 사용하면 장신구·낮은 티어 아이템에서 모두 빈 문자열 → fallback이 보완하지만 불안정.

### 문제 2 — tooltip.ts: extractAbilityStoneEngravings 하드코딩

```ts
const el = t["Element_007"];  // 어빌리티 스톤에서만 맞지만 위치 고정
```

`IndentStringGroup` 타입을 스캔해서 찾는 방식이 더 안전.

### 문제 3 — EquipmentDetailDialog.tsx: console.log (CLAUDE.md 위반)

```ts
console.log("[WEAPON]", item?.Type, item?.Name);
console.log(item?.Tooltip?.slice(0, 500));
console.log("detail.durabilityText =", detail?.durabilityText);
```

### 문제 4 — EquipmentDetailDialog.tsx: `<pre>` 태그 (CLAUDE.md 위반)

```ts
<pre className="mt-2 whitespace-pre-wrap text-sm">{body}</pre>
```

CLAUDE.md: "`<pre>` 태그로 raw 텍스트 표시 금지 — 항상 스타일링된 컴포넌트로 렌더링"

---

## 수정 계획

### 1. `app/lib/lostark/tooltip.ts`

#### 1a. `extractAbilityStoneEngravings` 개선
- 기존: `Element_007` 하드코딩
- 변경: `IndentStringGroup` 타입을 가진 element를 순회해서 찾음

```ts
function extractAbilityStoneEngravings(t: TooltipRoot): AbilityStoneEngraving[] {
  let el: TooltipElement | undefined;
  for (const k in t) {
    if (t[k]?.type === "IndentStringGroup") {
      el = t[k];
      break;
    }
  }
  if (!el) return [];
  // ... 기존 추출 로직
}
```

#### 1b. `extractEquipmentDetail` 개선 — ItemPartBox 타입 스캔으로 교체
- 기존: v005, v007, v009 하드코딩 + 빈 경우 fallback
- 변경: `ItemPartBox` 타입 element를 전체 스캔 → header(Element_000)로 분류

```ts
function extractItemPartBoxSections(t: TooltipRoot): {
  basicText: string; extraText: string; arkPassiveText: string
} {
  const basic: string[] = [];
  const extra: string[] = [];
  const ark: string[] = [];

  for (const k in t) {
    const el = t[k];
    if (el?.type !== "ItemPartBox") continue;
    const value = el.value;
    if (!isRecord(value)) continue;

    const header = stripHtml(getStr(value, "Element_000"));
    const body = cleanText(stripHtml(getStr(value, "Element_001")));
    if (!body) continue;

    if (/(아크\s*패시브|Ark\s*Passive)/i.test(header)) {
      ark.push(body);
    } else if (/(추가\s*효과|추가\s*옵션|특수\s*효과|각인\s*효과|세트\s*효과)/i.test(header)) {
      extra.push(body);
    } else if (/(기본\s*효과)/i.test(header) || /(공격력|방어력|치명|특화|신속|제압|인내|숙련)/.test(body)) {
      basic.push(body);
    }
  }

  return {
    basicText: basic.join("\n\n").trim(),
    extraText: extra.join("\n\n").trim(),
    arkPassiveText: ark.join("\n\n").trim(),
  };
}
```

`extractEquipmentDetail` 내에서 v005/v007/v009 하드코딩 제거, `extractItemPartBoxSections` 호출로 교체.
quality/category/itemLevel 파싱(`Element_001`의 `qualityValue`, `leftStr0`, `leftStr2`)은 유지 — 샘플 기준 전 아이템 공통.

`collectTextBlocks` + `splitSectionsFromBlocks` 기반 fallback은 유지하되, `extractItemPartBoxSections`가 빈 경우에만 사용.

### 2. `app/components/equipment/EquipmentDetailDialog.tsx`

- `console.log` 3줄 삭제
- `<pre>` → `<div className="mt-2 whitespace-pre-wrap text-sm text-zinc-100">`

---

## 수정 파일 목록

| 파일 | 변경 내용 |
|---|---|
| `app/lib/lostark/tooltip.ts` | extractAbilityStoneEngravings IndentStringGroup 스캔, extractEquipmentDetail ItemPartBox 타입 스캔 방식으로 교체 |
| `app/components/equipment/EquipmentDetailDialog.tsx` | console.log 3줄 제거, pre 태그 → div |

---

## 검증 방법

1. `npm run typecheck` — 타입 에러 없음 확인
2. `npm run lint` — lint 에러 없음 확인
3. 티어 4 고대 장비 캐릭터 → 장비 탭 → 각 아이템 클릭 → 아이템 레벨/분류/기본 효과/추가 효과 표시 확인
4. 장신구(목걸이, 귀걸이, 반지, 팔찌) → 품질 표시 + 기본 효과 표시 확인
5. 어빌리티 스톤 → 각인 효과 3개 표시 확인
6. 낮은 레벨(티어 1/2/3) 캐릭터 → 동일하게 장비 정보 표시 확인
