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
