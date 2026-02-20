// 매핑 규칙(색상/배경) + UI 모델 변환
// 기존 타입 변경 이전의 매핑 코드
import { extractEquipmentDetail } from "./tooltip";
import type { EquipmentItem, EquipmentUI } from "@/types/Equipment.type";

export function toEquipmentUI(item: EquipmentItem): EquipmentUI {
  const detail = extractEquipmentDetail(item);

  const quality = normalizeQuality(detail?.quality ?? null);
  const itemLevelText = detail?.itemLevelText ?? "";

  return {
    raw: item,

    type: item.Type,
    name: item.Name,
    icon: item.Icon,
    grade: item.Grade,
    quality,
    itemLevelText,
    gradeClass: gradeToClass(item.Grade),
    qualityClass: qualityToClass(quality),
  };
}

function gradeToClass(grade: string) {
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
