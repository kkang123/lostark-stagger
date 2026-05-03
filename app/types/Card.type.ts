export type CardGrade = "일반" | "희귀" | "영웅" | "전설" | "에스더";

export type CardItem = {
  Slot: number;
  Name: string;
  Icon: string;
  AwakeCount: number;
  AwakeTotal: number;
  Grade: CardGrade;
  Tooltip: string;
};

export type CardEffect = {
  Index: number;
  CardSlots: number[];
  Items: { Name: string; Description: string }[];
};

export type CharacterCards = {
  Cards: CardItem[];
  Effects: CardEffect[];
};
