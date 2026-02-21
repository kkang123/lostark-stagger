// Tooltip 파싱(품질, 아이템 레벨 추출)
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

/** -----------------------------
 * 능력석 각인 추출 (any 없이)
 * - t["Element_007"] 자체(IndentStringGroup)를 받아서 파싱
 * ----------------------------- */
function extractAbilityStoneEngravings(
  t: TooltipRoot,
): AbilityStoneEngraving[] {
  const el = t["Element_007"];
  if (!el) return [];
  if (el.type !== "IndentStringGroup") return [];

  // el.value: unknown → { Element_000: { contentStr: { Element_000: { contentStr: string } ... } } }
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

    // HTML 제거 후 매칭용 텍스트
    const text = stripHtml(raw); // 예: "[아드레날린] Lv.4"
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

export function extractEquipmentDetail(
  item: EquipmentItem,
): EquipmentDetail | null {
  const t = safeParseJson(item.Tooltip);
  if (!t) return null;

  const v001 = t["Element_001"]?.value;
  const v005 = t["Element_005"]?.value;
  const v007 = t["Element_007"]?.value;
  const v009 = t["Element_009"]?.value;
  const v014 = t["Element_014"]?.value;

  const quality = getNumOrNull(v001, "qualityValue");
  const category = stripHtml(getStr(v001, "leftStr0"));
  const itemLevelText = stripHtml(getStr(v001, "leftStr2"));

  const basicText = stripHtml(getStr(v005, "Element_001"));
  const extraText = stripHtml(getStr(v007, "Element_001"));
  const arkPassiveText = stripHtml(getStr(v009, "Element_001"));

  const durabilityRaw = typeof v014 === "string" ? v014 : "";
  const durabilityText = cleanText(stripHtml(durabilityRaw));

  // ✅ 어빌리티 스톤 각인 (Tooltip 전체 Root로부터)
  const abilityStoneEngravings = extractAbilityStoneEngravings(t);

  // console.log("[weapon has 내구도?]", item.Tooltip.includes("내구도"));

  const obj = JSON.parse(item.Tooltip);
  const keys = Object.keys(obj);

  for (const k of keys) {
    const raw = JSON.stringify(obj[k]);
    if (raw.includes("내구도")) {
      console.log("[FOUND]", k, obj[k]);
    }
  }

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
