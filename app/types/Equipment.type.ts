import type { AbilityStoneEngraving } from "@/lib/lostark/tooltip";

export type EquipmentItem = {
  Type: string;
  Name: string;
  Icon: string;
  Grade: string;
  Tooltip: string;
};

// 공통 UI
export type EquipmentBaseUI = {
  raw: EquipmentItem;

  type: string;
  name: string;
  icon: string;
  grade: string;

  category?: string;

  itemLevelText: string;

  gradeClass: string; // 배경/테두리/글자색
};

// 무기/방어구 UI
export type GearUI = EquipmentBaseUI & {
  kind: "gear";
  quality: number | null; // 품질
  qualityClass: string; // 품질 색
  durabilityText?: string; // 내구성
};

// 장신구
export type AccessoryUI = EquipmentBaseUI & {
  kind: "accessory";
  quality?: number | null; // 장신구는 품질이 있을 수도/없을 수도
  qualityClass?: string;
  // 팔찌/목걸이/반지 등 장신구 전용 필드 확장 가능
  // statsText?: string;
  // engravingText?: string;

  abilityStoneEngravings?: AbilityStoneEngraving[];
};

export type EquipmentUI = GearUI | AccessoryUI;
