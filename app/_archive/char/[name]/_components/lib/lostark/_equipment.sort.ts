// 장비 데이터 가공/정렬
import type { EquipmentUI } from "@/types/Equipment.type";

// 슬롯 순서
const LEFT_ORDER = ["투구", "상의", "하의", "장갑", "어깨", "무기"];

const RIGHT_ORDER = ["목걸이", "귀걸이", "반지", "팔찌", "어빌리티 스톤"];

// 분류 기준(여기서 추가 가능: '어빌리티 스톤', '부적' 등)
function getGroup(type: string): "left" | "right" | "other" {
  if (LEFT_ORDER.includes(type)) return "left";
  if (RIGHT_ORDER.includes(type)) return "right";
  return "other";
}

function orderIndex(type: string, group: "left" | "right" | "other") {
  if (group === "left") return LEFT_ORDER.indexOf(type);
  if (group === "right") return RIGHT_ORDER.indexOf(type);
  return 999;
}

export function splitAndSortEquipment(uiItems: EquipmentUI[]) {
  const left: EquipmentUI[] = [];
  const right: EquipmentUI[] = [];
  const other: EquipmentUI[] = [];

  for (const it of uiItems) {
    const group = getGroup(it.type);
    if (group === "left") left.push(it);
    else if (group === "right") right.push(it);
    else other.push(it);
  }

  // 같은 Type끼리 여러 개 있을 수 있어서 2차 정렬(이름)도 추가
  const sortFn = (a: EquipmentUI, b: EquipmentUI) => {
    const ga = getGroup(a.type);
    const gb = getGroup(b.type);

    const oa = orderIndex(a.type, ga);
    const ob = orderIndex(b.type, gb);
    if (oa !== ob) return oa - ob;

    // 같은 슬롯이면 품질 높은 순 → 이름 순(취향)
    const qa = a.quality ?? -1;
    const qb = b.quality ?? -1;
    if (qa !== qb) return qb - qa;

    return a.name.localeCompare(b.name);
  };

  left.sort(sortFn);
  right.sort(sortFn);
  other.sort((a, b) => a.type.localeCompare(b.type));

  return { left, right, other };
}

// 코드 개선
/* 
const getQuality = (it: EquipmentUI) => {
  if (it.kind === "gear") return it.quality ?? -1;
  return it.quality ?? -1;
};


이렇게 가능
const getQuality = (it: EquipmentUI) => it.quality ?? -1;
*/
