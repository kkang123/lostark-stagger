// Tooltip 파싱(품질, 아이템 레벨 추출)
// 하드 코딩 해결 후
import type { EquipmentItem } from "@/types/Equipment.type";

type TooltipElement = { type?: string; value?: unknown };
type TooltipRoot = Record<string, TooltipElement>;

/** 어빌리티 스톤 각인 한 줄 */
export type AbilityStoneEngraving = {
  name: string;
  level: number;
  isNegative: boolean;
  raw: string; // 디버깅용 원문(HTML 포함)
};

/** extractEquipmentDetail이 반환하는 구조(= detail) */
export type EquipmentDetail = {
  quality: number | null;
  category: string;
  itemLevelText: string;

  basicText: string;
  extraText: string;
  arkPassiveText: string;
  durabilityText: string;

  abilityStoneEngravings: AbilityStoneEngraving[];
};

function safeParseJson(raw: string): TooltipRoot | null {
  if (!raw) return null;
  try {
    return JSON.parse(raw) as TooltipRoot;
  } catch {
    return null;
  }
}

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

function isRecord(v: unknown): v is Record<string, unknown> {
  return typeof v === "object" && v !== null;
}

function getStr(v: unknown, key: string): string {
  if (!isRecord(v)) return "";
  const out = v[key];
  return typeof out === "string" ? out : "";
}

function getNumOrNull(v: unknown, key: string): number | null {
  if (!isRecord(v)) return null;
  const out = v[key];
  return typeof out === "number" ? out : null;
}

/** object[key] 안전 접근 (unknown → unknown) */
function getObj(v: unknown, key: string): unknown {
  if (!isRecord(v)) return null;
  return v[key] ?? null;
}

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

/** 능력석 각인 추출 */
function extractAbilityStoneEngravings(
  t: TooltipRoot,
): AbilityStoneEngraving[] {
  const el = t["Element_007"];
  if (!el) return [];
  if (el.type !== "IndentStringGroup") return [];

  const value = el.value;
  if (!isRecord(value)) return [];

  const block0 = getObj(value, "Element_000");
  if (!isRecord(block0)) return [];

  const contentStr = getObj(block0, "contentStr");
  if (!isRecord(contentStr)) return [];

  const list: AbilityStoneEngraving[] = [];

  for (const k of Object.keys(contentStr)) {
    const lineObj = contentStr[k];
    if (!isRecord(lineObj)) continue;

    const raw = lineObj["contentStr"];
    if (typeof raw !== "string") continue;

    const text = stripHtml(raw);
    const m = text.match(/^\s*\[(.+?)\]\s*Lv\.?\s*(\d+)\s*$/i);
    if (!m) continue;

    const name = m[1].trim();
    const level = Number(m[2]);
    const isNegative = /#FE2E2E/i.test(raw);

    list.push({
      name,
      level: Number.isFinite(level) ? level : 0,
      isNegative,
      raw,
    });
  }

  return list;
}
/** -----------------------------
 * 능력석 각인 추출 (any 없이)
 * - t["Element_007"] 자체(IndentStringGroup)를 받아서 파싱
 * ----------------------------- */
// function extractAbilityStoneEngravings(
//   t: TooltipRoot,
// ): AbilityStoneEngraving[] {
//   const el = t["Element_007"];
//   if (!el) return [];
//   if (el.type !== "IndentStringGroup") return [];

//   const value = el.value;
//   if (!isRecord(value)) return [];

//   const block0 = getObj(value, "Element_000");
//   if (!isRecord(block0)) return [];

//   const contentStr = getObj(block0, "contentStr");
//   if (!isRecord(contentStr)) return [];

//   const list: AbilityStoneEngraving[] = [];

//   for (const k of Object.keys(contentStr)) {
//     const lineObj = contentStr[k];
//     if (!isRecord(lineObj)) continue;

//     const raw = lineObj["contentStr"];
//     if (typeof raw !== "string") continue;

//     const text = stripHtml(raw); // 예: "[아드레날린] Lv.4"
//     const m = text.match(/^\s*\[(.+?)\]\s*Lv\.?\s*(\d+)\s*$/i);
//     if (!m) continue;

//     const name = m[1].trim();
//     const level = Number(m[2]);
//     const isNegative = /#FE2E2E/i.test(raw);

//     list.push({
//       name,
//       level: Number.isFinite(level) ? level : 0,
//       isNegative,
//       raw,
//     });
//   }

//   return list;
// }

/** -----------------------------------
 * Tooltip 전체에서 텍스트 블록 후보들을 수집
 * - 주로 ItemPartBox / string value에서 사람이 읽는 문장이 들어옴
 * - 비싼 JSON.stringify는 최소화: ItemPartBox는 value가 object이므로
 *   그 안의 Element_001 같은 흔한 키를 우선 시도하고, 실패하면 fallback으로 stringify
 * ----------------------------------- */
function collectTextBlocks(t: TooltipRoot): string[] {
  const blocks: string[] = [];

  for (const k of Object.keys(t)) {
    const el = t[k];
    const value = el?.value;

    // 1) value가 string인 경우 (일부 섹션/라인)
    if (typeof value === "string") {
      const s = cleanText(stripHtml(value));
      if (s) blocks.push(s);
      continue;
    }

    // 2) ItemPartBox는 보통 사람이 읽는 본문이 들어 있음
    if (el?.type === "ItemPartBox" && isRecord(value)) {
      // 흔한 패턴: value.Element_001
      const maybe = getStr(value, "Element_001");
      if (maybe) {
        const s = cleanText(stripHtml(maybe));
        if (s) blocks.push(s);
        continue;
      }

      // 혹시 다른 키에 들어있을 수도 있어 fallback (빈번히 쓰지 않게 조건부)
      const asString = JSON.stringify(value);
      const s = cleanText(stripHtml(asString));
      if (s) blocks.push(s);
    }
  }

  return blocks;
}

/** -----------------------------------
 * 수집한 텍스트 블록에서 basic/extra/ark를 분류
 * - “완벽한 규칙”이 아니라 실용적인 휴리스틱
 * - 너 프로젝트에서 안 보이던 텍스트를 최대한 살려서 보여주는 목적
 * ----------------------------------- */
function splitSectionsFromBlocks(blocks: string[]): {
  basicText: string;
  extraText: string;
  arkPassiveText: string;
} {
  const basic: string[] = [];
  const extra: string[] = [];
  const ark: string[] = [];

  for (const b of blocks) {
    const s = b.replace(/\s+\n/g, "\n").trim();
    if (!s) continue;

    // 아크 패시브는 키워드가 비교적 명확한 편
    if (/(아크\s*패시브|Ark\s*Passive)/i.test(s)) {
      ark.push(s);
      continue;
    }

    // 추가/특수 효과 관련 키워드 (프로젝트에서 필요시 확장)
    if (
      /(추가\s*효과|추가\s*옵션|특수\s*효과|각인\s*효과|세트\s*효과)/i.test(s)
    ) {
      extra.push(s);
      continue;
    }

    // 기본 효과는 보통 스탯/공격력/방어력 등 숫자 나열이 많음(휴리스틱)
    // 너무 공격적으로 분류하면 잡음이 늘어날 수 있어 "숫자 + 스탯 키워드" 위주로
    if (
      /(공격력|무기\s*공격력|힘|민첩|지능|체력|방어력|치명|특화|신속|제압|인내|숙련)/.test(
        s,
      )
    ) {
      basic.push(s);
      continue;
    }
  }

  // 여러 블록이 잡히면 보기 좋게 합치기
  const join = (arr: string[]) => arr.join("\n\n").trim();

  return {
    basicText: join(basic),
    extraText: join(extra),
    arkPassiveText: join(ark),
  };
}

// export function extractEquipmentDetail(
//   item: EquipmentItem,
// ): EquipmentDetail | null {
//   const t = safeParseJson(item.Tooltip);
//   if (!t) return null;

//   const v001 = t["Element_001"]?.value;
//   const v005 = t["Element_005"]?.value;
//   const v007 = t["Element_007"]?.value;
//   const v009 = t["Element_009"]?.value;

//   const quality = getNumOrNull(v001, "qualityValue");
//   const category = stripHtml(getStr(v001, "leftStr0"));
//   const itemLevelText = stripHtml(getStr(v001, "leftStr2"));

//   const basicText = stripHtml(getStr(v005, "Element_001"));
//   const extraText = stripHtml(getStr(v007, "Element_001"));
//   const arkPassiveText = stripHtml(getStr(v009, "Element_001"));

//   // ✅ 무기/방어구 등 Element 번호가 달라도 내구도를 찾아냄
//   const durabilityText = extractDurabilityText(t);

//   // ✅ 어빌리티 스톤 각인 (Tooltip 전체 Root로부터)
//   const abilityStoneEngravings = extractAbilityStoneEngravings(t);

//   // --- (선택) 디버깅: 내구도 들어있는 Element 확인 ---
//   // if (process.env.NODE_ENV === "development") {
//   //   for (const k of Object.keys(t)) {
//   //     const raw = JSON.stringify(t[k]);
//   //     if (raw.includes("내구도")) console.log("[FOUND]", k, t[k]);
//   //   }
//   // }

//   return {
//     quality,
//     category,
//     itemLevelText,
//     basicText,
//     extraText,
//     arkPassiveText,
//     durabilityText,
//     abilityStoneEngravings,
//   };
// }

export function extractEquipmentDetail(
  item: EquipmentItem,
): EquipmentDetail | null {
  const t = safeParseJson(item.Tooltip);
  if (!t) return null;

  const v001 = t["Element_001"]?.value;
  const v005 = t["Element_005"]?.value;
  const v007 = t["Element_007"]?.value;
  const v009 = t["Element_009"]?.value;

  const quality = getNumOrNull(v001, "qualityValue");
  const category = stripHtml(getStr(v001, "leftStr0"));
  const itemLevelText = stripHtml(getStr(v001, "leftStr2"));

  // 1) 기존 방식(빠름) 먼저 시도
  let basicText = stripHtml(getStr(v005, "Element_001"));
  let extraText = stripHtml(getStr(v007, "Element_001"));
  let arkPassiveText = stripHtml(getStr(v009, "Element_001"));

  // 2) 안 보이는 장비 대응: 비어 있으면 순회 fallback으로 채우기
  if (!basicText || !extraText || !arkPassiveText) {
    const blocks = collectTextBlocks(t);
    const fallback = splitSectionsFromBlocks(blocks);

    if (!basicText) basicText = fallback.basicText;
    if (!extraText) extraText = fallback.extraText;
    if (!arkPassiveText) arkPassiveText = fallback.arkPassiveText;
  }

  const durabilityText = extractDurabilityTextHybrid(t);
  const abilityStoneEngravings = extractAbilityStoneEngravings(t);

  return {
    quality,
    category,
    itemLevelText,
    basicText,
    extraText,
    arkPassiveText,
    durabilityText,
    abilityStoneEngravings,
  };
}
