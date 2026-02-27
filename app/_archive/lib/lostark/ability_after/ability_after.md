# 어빌리티 수치 적용 후

1. 내구도가 표시가 안되는 오류가 발생
2. 알고보니 하드코딩 되어서 `Element_014`에서 주는 내구도만 캐치함
3. 추가적으로 내구도뿐만 아닌 아이템의 종류에 따라서 보이는 데이터가 있고 없는 데이터가 발생
4. 하드 코딩된 부분을 `tooltip.ts`에서 수정해야함

## 문제 해결 + API 분석 능력 향상에 도움됨

### 🛠 Tooltip 파싱 오류 해결 — 무기 내구도 미표시 문제

#### 📌 배경

로스트아크 Open API의 장비 정보는 개별 필드로 제공되지 않고, Tooltip(JSON + HTML 문자열) 내부에 대부분의 상세 정보가 포함되어 있다.

따라서 장비의 품질, 아이템 레벨, 효과, 내구도 등은 Tooltip을 파싱하여 추출해야 한다.

#### ❗ 문제

장비 상세 모달에서:

- ✅ 방어구 → 내구도 정상 표시
- ❌ 무기 → 내구도 표시되지 않음

초기에는 UI 문제나 데이터 전달 문제로 보였으나, Tooltip 원문에는 내구도 정보가 존재함을 확인하였다.

#### 🔍 원인 분석

기존 구현은 특정 Element 번호에서만 내구도를 추출하도록 되어 있었다.

```ts
const v014 = t["Element_014"]?.value;
const durabilityRaw = typeof v014 === "string" ? v014 : "";
```

tooltip 구조를 보면
| 장비 종류 | 내구도 위치 |
| ----- | ------------- |
| 방어구 | `Element_014` |
| 무기 | `Element_013` |

장비 종류에 따라 Element 번호가 다르기 때문에 고정된 번호로 접근하면 일부 정보가 누락이 된다.

> 또한 방어구 014라고 모든 방어구가 출력되는 것이 아니라 상위 등급 아이템은 다른 넘버값을 가지고 있는거 같다.  
> (ex. 25강 방어구에서도 내구도 표시가 안됨, 부캐 무기에서는 내구도 표시가 되었지만 본캐라인쪽 상위 등급 무기에서는 표시 안됨)

#### 🧠 해결 방법

Element 번호를 하드코딩하지 않고,
Tooltip 전체를 순회하면서 "내구도" 문자열을 포함한 항목을 찾아 파싱하도록 변경하였다.

- 변경 전 (취약한 방식)

```ts
const durabilityRaw = typeof v014 === "string" ? v014 : "";
const durabilityText = cleanText(stripHtml(durabilityRaw));
```

- 변경 후 (안정적인 방식)

```ts
function extractDurabilityText(t: TooltipRoot): string {
  for (const k of Object.keys(t)) {
    const value = t[k]?.value;

    if (typeof value === "string" && value.includes("내구도")) {
      const text = cleanText(stripHtml(value));
      const m = text.match(/내구도\s*(\d+)\s*\/\s*(\d+)/);

      if (m) return `내구도 ${m[1]} / ${m[2]}`;
      return text;
    }
  }
  return "";
}
```

#### ✅ 결과

- 모든 장비(무기 / 방어구 등)에서 내구도 정상 표시
- Tooltip 구조 변경에도 비교적 안정적으로 동작
- 특정 Element 번호에 의존하지 않음

#### 💡 교훈 (Lessons Learned)

1. API의 “표시용 문자열” 데이터는 구조가 고정되어 있지 않을 수 있다
   특히 게임 API의 Tooltip 데이터는 UI 구성에 따라 변할 가능성이 높다.
2. 위치 기반 접근보다 의미 기반 접근이 더 안전하다

- ❌ Element 번호 기반 파싱
- ✅ 키워드 / 타입 / 구조 기반 파싱

3. 디버깅 시 원문 데이터 확인이 가장 중요하다

> Tooltip 전체를 출력하여 실제 구조를 분석한 것이 문제 해결의 핵심이었다.

#### 🚀 개선 가능성

향후 기본 효과 / 추가 효과 / 아크 패시브 등도 Element 번호에 의존하지 않는 방식으로 리팩터링할 수 있다.

## 추가적으로 순회를 하면 비용값이 많아지지 않을까? 고민을 시작

그랬을 때 비용 절감 즉 최적화 방법을 고민

1. JSON+HTML를 보니 `내구도` 로그에서는

type: "ShowMeTheMoney"
value: "<FONT ...>내구도 ...</FONT>|" (string)

내구도는 string value인 ShowMeTheMoney에서만 찾으면 충분할거 같다고 판단

> 순회는 하되, `el.type === "ShowMeTheMoney"` AND `typeof value === "string"`인 것만 검사 `stringify`는 아예 안 함

```ts
function extractDurabilityTextFast(t: TooltipRoot): string {
  for (const k of Object.keys(t)) {
    const el = t[k];
    if (el?.type !== "ShowMeTheMoney") continue;

    const value = el.value;
    if (typeof value !== "string") continue;
    if (!value.includes("내구도")) continue;

    const text = cleanText(stripHtml(value)).replace(/\|+$/g, "").trim();
    const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
    return m ? `내구도 ${m[1]} / ${m[2]}` : text;
  }
  return "";
}
```

> 실제로 라이트하우스로 개선된 점 발견하지 못해서 일단 보류
> JSON.stringify(value) 같은 “최악의 느린 경로”를 제거해서 파싱 비용 상한(최악 케이스)을 낮추는 것이 목적. 대신 안전성은 ↓
> Hybrid(제일 빠르고 + 안전) : 가장 흔한 키(013/014) 먼저 O(1)로 확인 -> 없으면 그때만 Fast 순회

2. 중복 파싱 제거

3. `필요할 때만` 파싱하기 (lazy parsing), 간단 캐싱(Map/LRU)

<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->
<!--  -->

# 포트폴리오 방식

> ⭐ 문제 해결 능력 + API 이해도 + 안정적인 설계 + 확장성

## 🛠 Robust Tooltip Parsing — Weapon Durability Rendering Fix

### 📌 Overview

로스트아크 Open API는 장비 상세 정보를 구조화된 필드로 제공하지 않고, 대부분의 데이터를 Tooltip(JSON + HTML 문자열) 내부에 포함한다.

본 프로젝트에서는 장비 상세 모달을 구현하기 위해 Tooltip을 파싱하여:

품질, 아이템 레벨, 기본/추가 효과, 아크 패시브, 내구도 등의 정보를 추출하고 UI에 표시한다.

### ❗ Problem

특정 장비에서 내구도가 표시되지 않는 문제가 발생했다.

장비 종류 내구도 표시
방어구 ✅ 정상
무기 ❌ 표시되지 않음

UI 문제나 데이터 전달 오류로 보였으나, Tooltip 원문에는 내구도 정보가 존재함을 확인하였다.

### 🔍 Root Cause Analysis

기존 구현은 특정 Element 번호에서만 내구도를 추출하도록 되어 있었다.

```ts
const v014 = t["Element_014"]?.value;

Tooltip 구조 분석 결과, 장비 종류에 따라 내구도 위치가 달랐다.
```

장비 종류 Tooltip 위치
방어구 Element_014
무기 Element_013

즉, Tooltip 내부 구조는 고정되어 있지 않으며 Element 번호 기반 접근은 신뢰할 수 없는 방식이었다.

실제 디버깅 로그:

```bash
[FOUND] Element_013 ... "내구도 175 / 175"
[FOUND] Element_014 ... "내구도 59 / 59"
```

### 🧠 Solution

Element 위치에 의존하지 않고,
Tooltip 전체를 순회하여 의미 기반으로 데이터 추출하도록 파서를 재설계하였다.

#### ✔ 기존 방식 (Brittle)

- 특정 Element 번호 하드코딩
- 구조 변경 시 즉시 깨짐
- 장비 종류별 예외 발생

#### ✔ 개선 방식 (Robust)

- TooltipRoot 전체 순회
- "내구도" 키워드를 포함한 항목 탐색
- HTML 제거 후 정규식으로 값 추출
- 다양한 포맷 대응

```ts
function extractDurabilityText(t: TooltipRoot): string {
  for (const k of Object.keys(t)) {
    const value = t[k]?.value;

    if (typeof value === "string" && value.includes("내구도")) {
      const text = cleanText(stripHtml(value));
      const m = text.match(/내구도\s*(\d+)\s*\/\s*(\d+)/);

      if (m) return `내구도 ${m[1]} / ${m[2]}`;
      return text;
    }
  }
  return "";
}
```

### ✅ Result

모든 장비(무기 / 방어구 / 기타)에서 내구도 정상 표시

Tooltip 구조 변화에 대한 내성 확보

유지보수 비용 감소

동일한 접근 방식을 다른 Tooltip 요소에도 확장 가능

🏗 Engineering Insight
1️⃣ UI용 문자열 데이터는 구조가 불안정할 수 있다

게임 API와 같이 UI 렌더링 기반 데이터는
표현 방식이 변경될 가능성이 높다.

2️⃣ 위치 기반 접근보다 의미 기반 접근이 더 견고하다
접근 방식 안정성
Element 번호 기반 ❌ 낮음
키워드 / 타입 기반 ✅ 높음
3️⃣ 실제 데이터 분석이 문제 해결의 핵심이었다

Tooltip 원문을 직접 분석하지 않았다면
문제의 근본 원인을 발견하기 어려웠다.

4️⃣ 범용 파서 설계로 확장 가능

동일한 전략을 사용하면:

기본 효과

추가 효과

아크 패시브

특수 옵션

등 다른 Tooltip 요소에도 적용할 수 있다.

🚀 Impact

사용자 경험 개선 (정보 누락 방지)

코드 안정성 향상

향후 API 변경에 대한 대응력 확보

실제 서비스 환경에서 발생 가능한 데이터 불일치 문제 해결 경험 축적

🧩 Key Takeaway

When parsing loosely structured API data,
semantic extraction is more reliable than positional extraction.

💡 Why This Matters

이 문제 해결 과정은 단순한 UI 버그 수정이 아니라:

✔ 불완전한 외부 API 대응 능력
✔ 데이터 구조 분석 능력
✔ 견고한 파서 설계 경험
✔ 유지보수를 고려한 리팩터링 능력

을 보여준다.

### ⭐ 포트폴리오 관점에서 매우 강력한 이유

👉 “실제 서비스에서 반드시 마주치는 문제를 해결한 경험”
👉 “외부 API를 그대로 믿지 않고 분석할 줄 아는 개발자”
👉 “방어적 프로그래밍 가능”
