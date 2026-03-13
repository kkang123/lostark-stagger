// Tooltip 파싱(품질, 아이템 레벨 추출)

import type { EquipmentItem } from "@/types/Equipment.type";

type TooltipElement = { type?: string; value?: unknown };
type TooltipRoot = Record<string, TooltipElement>;

/** 어빌리티 스톤 각인 한 줄 */
export type AbilityStoneEngraving = {
  name: string;
  level: number;
  isNegative: boolean;
  raw: string;
};

/** 연마 효과 한 줄 */
export type PolishingOption = {
  name: string;
  value: string;
  colorClass: string; // tailwind 텍스트 색상 클래스
};

export type EquipmentDetail = {
  quality: number | null;
  category: string;
  itemLevelText: string;

  basicText: string;
  extraText: string;
  arkPassiveText: string;
  durabilityText: string;

  abilityStoneEngravings: AbilityStoneEngraving[];
  polishingOptions: PolishingOption[];
};

const POLISHING_COLOR_MAP: Record<string, string> = {
  CE43FC: "text-purple-400",
  "00B5FF": "text-sky-400",
  FE9600: "text-orange-400",
};

function polishingColorToClass(hex: string): string {
  return POLISHING_COLOR_MAP[hex.toUpperCase()] ?? "text-zinc-300";
}

/** 연마 효과 HTML → PolishingOption[] 파싱 */
function extractPolishingOptions(html: string): PolishingOption[] {
  const lines = html.split(/<br\s*\/?>/gi).filter(Boolean);
  const result: PolishingOption[] = [];

  for (const line of lines) {
    const fontMatch = line.match(
      /<FONT\s+[Cc][Oo][Ll][Oo][Rr]='([^']+)'>([^<]+)<\/FONT>/i,
    );
    if (!fontMatch) continue;

    const colorHex = fontMatch[1].replace("#", "").toUpperCase();
    const value = fontMatch[2].trim();

    const name = line
      .replace(/<img[^>]*\/?>/gi, "")
      .replace(/<FONT[^>]*>[^<]*<\/FONT>/gi, "")
      .replace(/<\/?[^>]+>/g, "")
      .replace(/&nbsp;/g, " ")
      .trim();

    if (!name || !value) continue;

    result.push({ name, value, colorClass: polishingColorToClass(colorHex) });
  }

  return result;
}

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

function tryExtractDurability(value: unknown): string {
  if (typeof value !== "string" || !value.includes("내구도")) return "";
  const text = cleanText(stripHtml(value)).replace(/\|+$/g, "").trim();
  const m = text.match(/내구도\s*[:：]?\s*(\d+)\s*\/\s*(\d+)/);
  return m ? `내구도 ${m[1]} / ${m[2]}` : text;
}

function extractDurabilityTextHybrid(t: TooltipRoot): string {
  // 1) 빠른 경로(O(1)) - 흔한 위치 먼저
  const from014 = tryExtractDurability(t["Element_014"]?.value);
  if (from014) return from014;

  const from013 = tryExtractDurability(t["Element_013"]?.value);
  if (from013) return from013;

  // 2) fallback - 구조가 바뀌었을 때만 순회
  for (const k in t) {
    const el = t[k];
    if (el?.type !== "ShowMeTheMoney") continue;
    const result = tryExtractDurability(el.value);
    if (result) return result;
  }

  return "";
}

/** 능력석 각인 추출 */
function extractAbilityStoneEngravings(
  t: TooltipRoot,
): AbilityStoneEngraving[] {
  let el: TooltipElement | undefined;
  for (const k in t) {
    if (t[k]?.type === "IndentStringGroup") {
      el = t[k];
      break;
    }
  }
  if (!el) return [];

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

function extractItemPartBoxSections(t: TooltipRoot): {
  basicText: string;
  extraText: string;
  arkPassiveText: string;
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
    } else if (
      /(추가\s*효과|추가\s*옵션|특수\s*효과|각인\s*효과|세트\s*효과)/i.test(
        header,
      )
    ) {
      extra.push(body);
    } else if (
      /(기본\s*효과)/i.test(header) ||
      /(공격력|방어력|치명|특화|신속|제압|인내|숙련)/.test(body)
    ) {
      basic.push(body);
    }
  }

  const join = (arr: string[]) => arr.join("\n\n").trim();

  return {
    basicText: join(basic),
    extraText: join(extra),
    arkPassiveText: join(ark),
  };
}

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
      const maybe = getStr(value, "Element_001");
      if (maybe) {
        const s = cleanText(stripHtml(maybe));
        if (s) blocks.push(s);
        continue;
      }

      const asString = JSON.stringify(value);
      const s = cleanText(stripHtml(asString));
      if (s) blocks.push(s);
    }
  }

  return blocks;
}

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

    // 추가/특수 효과 관련 키워드
    if (
      /(추가\s*효과|추가\s*옵션|특수\s*효과|각인\s*효과|세트\s*효과)/i.test(s)
    ) {
      extra.push(s);
      continue;
    }

    if (
      /(공격력|무기\s*공격력|힘|민첩|지능|체력|방어력|치명|특화|신속|제압|인내|숙련)/.test(
        s,
      )
    ) {
      basic.push(s);
      continue;
    }
  }

  const join = (arr: string[]) => arr.join("\n\n").trim();

  return {
    basicText: join(basic),
    extraText: join(extra),
    arkPassiveText: join(ark),
  };
}

export function extractEquipmentDetail(
  item: EquipmentItem,
): EquipmentDetail | null {
  const t = safeParseJson(item.Tooltip);
  if (!t) return null;

  const v001 = t["Element_001"]?.value;

  const quality = getNumOrNull(v001, "qualityValue");
  const category = stripHtml(getStr(v001, "leftStr0"));
  const itemLevelText = stripHtml(getStr(v001, "leftStr2"));

  const sections = extractItemPartBoxSections(t);
  let { basicText, extraText, arkPassiveText } = sections;

  if (!basicText || !extraText || !arkPassiveText) {
    const blocks = collectTextBlocks(t);
    const fallback = splitSectionsFromBlocks(blocks);

    if (!basicText) basicText = fallback.basicText;
    if (!extraText) extraText = fallback.extraText;
    if (!arkPassiveText) arkPassiveText = fallback.arkPassiveText;
  }

  const durabilityText = extractDurabilityTextHybrid(t);
  const abilityStoneEngravings = extractAbilityStoneEngravings(t);

  // 연마 효과 추출 (목걸이/귀걸이/반지)
  let polishingOptions: PolishingOption[] = [];
  for (const k in t) {
    const el = t[k];
    if (el?.type !== "ItemPartBox") continue;
    const value = el.value;
    if (!isRecord(value)) continue;
    const header = stripHtml(getStr(value, "Element_000"));
    if (/연마\s*효과/i.test(header)) {
      polishingOptions = extractPolishingOptions(getStr(value, "Element_001"));
      break;
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
    polishingOptions,
  };
}
