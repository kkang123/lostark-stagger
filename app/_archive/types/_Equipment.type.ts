export type EquipmentItem = {
  Type: string;
  Name: string;
  Icon: string;
  Grade: string;
  Tooltip: string;
};

// 공통 UI
export type EquipmentUI = {
  raw: EquipmentItem;

  type: string;
  name: string;
  icon: string;
  grade: string;

  category?: string;

  itemLevelText: string;
  quality: number | null; // 품질
  qualityClass: string; // 품질 색

  gradeClass: string; // 배경/테두리/글자색
  durabilityText?: string; // 내구성
};
