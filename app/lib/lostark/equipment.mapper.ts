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
