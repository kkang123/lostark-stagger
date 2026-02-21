// import { cleanText, stripHtml } from "./utils"; // 유틸 함수 경로에 맞게 조정

type TooltipElement = { type?: string; value?: unknown };
type TooltipRoot = Record<string, TooltipElement>;

function stripHtml(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/?[^>]+>/g, "")
    .replace(/&nbsp;/g, " ")
    .trim();
}

// 문자열 후처리
function cleanText(s: string | null | undefined) {
  if (!s) return "";
  return s.replace(/\|/g, "").trim();
}

export function extractDurabilityTextFast(t: TooltipRoot): string {
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

// 기존 코드
// 라이트하우스에서 개선점 발견 못해서 최적화 불필요 판단.
function extractDurabilityTextFast0(t: TooltipRoot): string {
  for (const k of Object.keys(t)) {
    const el = t[k];
    // const value = el?.value;
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

// // value가 string인 케이스 (ShowMeTheMoney 등)
// if (typeof value === "string" && value.includes("내구도")) {
//   const text = cleanText(stripHtml(value)).replace(/\|+$/g, "").trim();

//   // "내구도 175 / 175" 형태를 최대한 표준화
//   const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
//   if (m) return `내구도 ${m[1]} / ${m[2]}`;

//   return text;
// }

// value가 object인 케이스: 내부에 string이 숨어 있을 수 있음
//   if (isRecord(value)) {
//     // object 전체를 문자열로 보고 탐색 (가장 견고)
//     const asString = JSON.stringify(value);
//     if (!asString.includes("내구도")) continue;

//     const text = cleanText(stripHtml(asString)).replace(/\|+$/g, "").trim();
//     const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
//     if (m) return `내구도 ${m[1]} / ${m[2]}`;

//     return text;
//   }
// }

//   return "";
// }

// Hybrid(제일 빠르고 + 안전)
function extractDurabilityTextHybrid(t: TooltipRoot): string {
  // 1) 빠른 경로(O(1)) - 흔한 위치 먼저
  const v014 = t["Element_014"]?.value;
  if (typeof v014 === "string" && v014.includes("내구도")) {
    const text = cleanText(stripHtml(v014)).replace(/\|+$/g, "").trim();
    const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
    return m ? `내구도 ${m[1]} / ${m[2]}` : text;
  }

  const v013 = t["Element_013"]?.value;
  if (typeof v013 === "string" && v013.includes("내구도")) {
    const text = cleanText(stripHtml(v013)).replace(/\|+$/g, "").trim();
    const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
    return m ? `내구도 ${m[1]} / ${m[2]}` : text;
  }

  // 2) fallback - 구조가 바뀌었을 때만 순회
  for (const k in t) {
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
