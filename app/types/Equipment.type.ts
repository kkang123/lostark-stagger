import type { AbilityStoneEngraving } from "@/lib/lostark/tooltip";

export type EquipmentItemType =
  | "무기"
  | "투구"
  | "상의"
  | "하의"
  | "장갑"
  | "어깨"
  | "목걸이"
  | "귀걸이"
  | "반지"
  | "팔찌"
  | "어빌리티 스톤";

export type EquipmentGrade =
  | "일반"
  | "고급"
  | "희귀"
  | "영웅"
  | "전설"
  | "유물"
  | "고대";

export type EquipmentItem = {
  Type: EquipmentItemType;
  Name: string;
  Icon: string;
  Grade: EquipmentGrade;
  Tooltip: string;
};

// 공통 UI
export type EquipmentBaseUI = {
  raw: EquipmentItem;

  type: string;
  name: string;
  icon: string;
  grade: string;

  category: string;

  itemLevelText: string;

  gradeClass: string; // 배경/테두리/글자색
};

// 무기/방어구 UI
export type GearUI = EquipmentBaseUI & {
  kind: "gear";
  quality: number | null; // 품질
  qualityClass: string; // 품질 색
  durabilityText: string; // 내구성
};

// 장신구
export type AccessoryUI = EquipmentBaseUI & {
  kind: "accessory";
  quality: number | null; // 장신구는 품질이 있을 수도/없을 수도 (null = 없음)
  qualityClass?: string;

  abilityStoneEngravings: AbilityStoneEngraving[];
};

export type EquipmentUI = GearUI | AccessoryUI;
