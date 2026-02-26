// // 매핑 규칙(색상/배경) + UI 모델 변환
// import { extractEquipmentDetail } from "./tooltip";
// import type {
//   EquipmentItem,
//   EquipmentUI,
//   GearUI,
//   AccessoryUI,
// } from "@/types/Equipment.type";

// type EquipKind = "gear" | "accessory";

// export function toEquipmentUI(item: EquipmentItem): EquipmentUI {
//   const kind = getEquipKind(item.Type);

//   const detail = extractEquipmentDetail(item);

//   const itemLevelText = detail?.itemLevelText ?? "";
//   const category = detail?.category ?? "";

//   // 공통 베이스
//   const base = {
//     raw: item,
//     type: item.Type,
//     name: item.Name,
//     icon: item.Icon,
//     grade: item.Grade,
//     category,
//     itemLevelText,
//     gradeClass: gradeToClass(item.Grade, category),
//   };

//   if (kind === "gear") {
//     const quality = normalizeQuality(detail?.quality ?? null);

//     const ui: GearUI = {
//       kind: "gear",
//       ...base,
//       // raw: item,

//       // type: item.Type,
//       // name: item.Name,
//       // icon: item.Icon,
//       // grade: item.Grade,

//       // itemLevelText,

//       // category,

//       // gradeClass: gradeToClass(item.Grade, category),
//       quality,
//       qualityClass: qualityToClass(quality),
//     };

//     return ui;
//   }

//   const accQuality = normalizeQuality(detail?.quality ?? null);

//   const ui: AccessoryUI = {
//     kind: "accessory",
//     raw: item,

//     type: item.Type,
//     name: item.Name,
//     icon: item.Icon,
//     grade: item.Grade,

//     category,

//     itemLevelText,

//     gradeClass: gradeToClass(item.Grade, category),
//   };

//   if (accQuality != null) {
//     ui.quality = accQuality;
//     ui.qualityClass = qualityToClass(accQuality);
//   }

//   return ui;

//   // ✅ 어빌리티 스톤 각인(tooltip.ts에서 추출된 값)을 UI에 싣고 싶다면
//   // AccessoryUI 타입에 abilityStoneEngravings?: AbilityStoneEngraving[] 를 추가해두고 아래 주석 해제
//   if (detail?.abilityStoneEngravings?.length) {
//     (ui as any).abilityStoneEngravings = detail.abilityStoneEngravings;
//   }

//   return ui;
// }

// /* 무기/방어구 vs 장신구 분기 */
// function getEquipKind(type: string): EquipKind {
//   const t = type.trim();

//   // 무기/방어구
//   const gearTypes = ["무기", "투구", "상의", "하의", "장갑", "어깨"];
//   if (gearTypes.includes(t)) return "gear";

//   // 장신구 (프로젝트에서 나오는 Type 값에 맞춰 추가/수정)
//   const accessoryTypes = ["목걸이", "귀걸이", "반지", "팔찌", "어빌리티 스톤"];
//   if (accessoryTypes.includes(t)) return "accessory";

//   // 애매하면 일단 accessory로 (원하면 other를 추가해도 됨)
//   return "accessory";
// }

// function gradeToClass(grade: string, category?: string) {
//   const c = (category ?? "").trim();

//   if (c.includes("에스더")) {
//     return "border-cyan-300/40 bg-[linear-gradient(135deg,#0c2e2c,#2faba8)]";
//   }

//   switch (grade) {
//     case "고대":
//       return "border-[#dcc999]/40 bg-[linear-gradient(135deg,#3d3325,#dcc999)]";

//     case "유물":
//       return "border-[#a24006]/40 bg-[linear-gradient(135deg,#341a09,#a24006)]";

//     case "전설":
//       return "border-[#9e5f04]/40 bg-[linear-gradient(135deg,#362003,#9e5f04)]";

//     case "영웅":
//       return "border-[#480d5d]/40 bg-[linear-gradient(135deg,#261331,#480d5d)]";

//     case "희귀":
//       return "border-[#113d5d]/40 bg-[linear-gradient(135deg,#111f2c,#113d5d)]";

//     case "고급":
//       return "border-[#304911]/40 bg-[linear-gradient(135deg,#18220b,#304911)]";

//     case "일반":
//       return "border-zinc-200/40 bg-[linear-gradient(135deg,#f5f5f5,#ffffff)] text-zinc-900";

//     default:
//       return "border-white/10 bg-black/10";
//   }
// }

// function qualityToClass(q: number | null) {
//   if (q == null) return "text-zinc-400";
//   if (q < 30) return "text-red-400";
//   if (q < 50) return "text-yellow-400";
//   if (q < 70) return "text-lime-400";
//   if (q < 90) return "text-sky-400";
//   return "text-[rgb(255,94,0)]";
// }

// function normalizeQuality(q: number | null) {
//   if (q === -1) return null;
//   return q;
// }

// // 어빌리티스톤
// export type AbilityStoneEngraving = {
//   name: string;
//   level: number;
//   isNegative: boolean;
//   raw: string; // 디버깅용 (원문)
// };

// function stripHtml(input: string) {
//   return input
//     .replace(/<br\s*\/?>/gi, "\n")
//     .replace(/<[^>]*>/g, "")
//     .replace(/&nbsp;/g, " ")
//     .trim();
// }

// /**
//  * Element_007(IndentStringGroup) 안에서 각인 라인들을 뽑는다.
//  * 예) "[아드레날린] ... Lv.4"
//  */
// function extractAbilityStoneEngravings(
//   tooltipObj: any,
// ): AbilityStoneEngraving[] {
//   const group = tooltipObj?.Element_007;
//   if (!group || group.type !== "IndentStringGroup") return [];

//   const block = group?.value?.Element_000;
//   const contentStr = block?.contentStr;
//   if (!contentStr || typeof contentStr !== "object") return [];

//   const list: AbilityStoneEngraving[] = [];

//   for (const key of Object.keys(contentStr)) {
//     const raw = contentStr[key]?.contentStr;
//     if (typeof raw !== "string") continue;

//     // HTML 제거 후 텍스트화
//     const text = stripHtml(raw); // 예: "[아드레날린] Lv.4"
//     // 각인 라인만 매칭 (레벨 보너스 같은 줄은 제외됨)
//     const m = text.match(/^\s*\[(.+?)\]\s*Lv\.?\s*(\d+)\s*$/i);
//     if (!m) continue;

//     const name = m[1].trim();
//     const level = Number(m[2]);

//     // 빨간색(부정 각인) 여부: 원문에 FE2E2E 같은 색이 들어오므로 그걸로 판별
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

import { extractEquipmentDetail, EquipmentDetail } from "./_tooltip";
import type {
  EquipmentItem,
  EquipmentUI,
  GearUI,
  AccessoryUI,
} from "@/types/Equipment.type";

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
  // const detail = extractEquipmentDetail(item);
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

// abilityStoneEngravings: detail.abilityStoneEngravings ?? [],
/* 추가 이유 */
/* 
detail.abilityStoneEngravings는 AbilityStoneEngraving[] | undefined 타입임
AccessoryUI에서 abilityStoneEngravings?: AbilityStoneEngraving[]로 선언되어 있어서 undefined여도 타입 에러는 안 나지만, AbilityStoneEngravingsSection에서 engravings.length === 0 체크를 하기 때문에 undefined가 들어오면 런타임 에러가 나기 때문에 ?? []를 붙이면 파싱 실패로 undefined가 나와도 빈 배열로 대체되어 안전하게 처리 가능
*/
