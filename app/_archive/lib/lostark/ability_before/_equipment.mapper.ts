// 매핑 규칙(색상/배경) + UI 모델 변환
import { extractEquipmentDetail } from "./_tooltip";
import type {
  EquipmentItem,
  EquipmentUI,
  GearUI,
  AccessoryUI,
} from "@/types/Equipment.type";

type EquipKind = "gear" | "accessory";

export function toEquipmentUI(item: EquipmentItem): EquipmentUI {
  const kind = getEquipKind(item.Type);

  const detail = extractEquipmentDetail(item);

  const itemLevelText = detail?.itemLevelText ?? "";
  const category = detail?.category ?? "";

  // 공통 베이스
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
    const quality = normalizeQuality(detail?.quality ?? null);

    const ui: GearUI = {
      kind: "gear",
      ...base,
      // raw: item,

      // type: item.Type,
      // name: item.Name,
      // icon: item.Icon,
      // grade: item.Grade,

      // itemLevelText,

      // category,

      // gradeClass: gradeToClass(item.Grade, category),
      quality,
      qualityClass: qualityToClass(quality),
    };

    return ui;
  }

  const accQuality = normalizeQuality(detail?.quality ?? null);

  const ui: AccessoryUI = {
    kind: "accessory",
    raw: item,

    type: item.Type,
    name: item.Name,
    icon: item.Icon,
    grade: item.Grade,

    category,

    itemLevelText,

    gradeClass: gradeToClass(item.Grade, category),
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

  // 무기/방어구
  const gearTypes = ["무기", "투구", "상의", "하의", "장갑", "어깨"];
  if (gearTypes.includes(t)) return "gear";

  // 장신구 (프로젝트에서 나오는 Type 값에 맞춰 추가/수정)
  const accessoryTypes = ["목걸이", "귀걸이", "반지", "팔찌", "어빌리티 스톤"];
  if (accessoryTypes.includes(t)) return "accessory";

  // 애매하면 일단 accessory로 (원하면 other를 추가해도 됨)
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
  if (q == null) return "text-zinc-400";
  if (q < 30) return "text-red-400";
  if (q < 50) return "text-yellow-400";
  if (q < 70) return "text-lime-400";
  if (q < 90) return "text-sky-400";
  return "text-[rgb(255,94,0)]";
}

function normalizeQuality(q: number | null) {
  if (q === -1) return null;
  return q;
}
