// Tooltip 파싱(품질, 아이템 레벨 추출)
import type { EquipmentItem } from "@/types/Equipment.type";

type TooltipElement = { value?: unknown };
type TooltipRoot = Record<string, TooltipElement>;

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

export function extractEquipmentDetail(item: EquipmentItem) {
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

  // 내구도 | 문자 제거 전
  // const durabilityText = cleanText(stripHtml(t?.Element_014?.value ?? ""));

  const durabilityRaw = typeof v014 === "string" ? v014 : "";
  const durabilityText = cleanText(stripHtml(durabilityRaw));

  return {
    quality,
    category,
    itemLevelText,
    basicText,
    extraText,
    arkPassiveText,
    durabilityText,
  };
}
