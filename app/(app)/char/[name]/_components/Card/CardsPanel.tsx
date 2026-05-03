import { getCharacterCardsServer } from "@/lib/lostark/api/server";
import { getErrorMessage } from "@/lib/utils";
import CardSlotClient from "./CardSlotClient";
import CardSetTooltipClient from "./CardSetTooltipClient";

import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

// 전설 영웅 희귀 고급 일반
const CARD_GRADE_STYLES: Record<
  string,
  { border: string; bg: string; text: string; glow: string }
> = {
  전설: {
    border: "border-[#f5a623]/70",
    bg: "bg-[linear-gradient(160deg,#2a1a00_0%,#3d2600_50%,#1a1000_100%)]",
    text: "text-[#f5a623]",
    glow: "shadow-[0_0_12px_rgba(245,166,35,0.3)]",
  },
  영웅: {
    border: "border-[#9b59b6]/70",
    bg: "bg-[linear-gradient(160deg,#1e0a2e_0%,#2d1040_50%,#0f0518_100%)]",
    text: "text-[#c47aff]",
    glow: "shadow-[0_0_12px_rgba(155,89,182,0.3)]",
  },
  희귀: {
    border: "border-[#3498db]/70",
    bg: "bg-[linear-gradient(160deg,#0a1e2e_0%,#102a40_50%,#051018_100%)]",
    text: "text-[#5ab8ff]",
    glow: "shadow-[0_0_12px_rgba(52,152,219,0.3)]",
  },
  고급: {
    border: "border-[#2ecc71]/70",
    bg: "bg-[linear-gradient(160deg,#0a2e1a_0%,#103d22_50%,#051a0e_100%)]",
    text: "text-[#4dff9a]",
    glow: "shadow-[0_0_12px_rgba(46,204,113,0.3)]",
  },
  일반: {
    border: "border-white/20",
    bg: "bg-[linear-gradient(160deg,#1a1a1a_0%,#222222_50%,#111111_100%)]",
    text: "text-zinc-400",
    glow: "",
  },
};

const EMPTY_SLOT_STYLE = "border-white/5 bg-white/[0.03]";

function EmptySlot() {
  return (
    <div
      className={`flex h-full min-h-35 items-center justify-center rounded-xl border ${EMPTY_SLOT_STYLE} bg-(--color-surface)`}
    >
      <span className="text-xs text-(--color-text-tertiary)">빈 슬롯</span>
    </div>
  );
}

export default async function CardsPanel({ name }: Props) {
  let data;
  try {
    data = await getCharacterCardsServer(name);
  } catch (err) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-(--color-text-primary)">
        {getErrorMessage(err)}
      </section>
    );
  }

  console.log("✅ CardsPanel data:", JSON.stringify(data, null, 2));

  if (!data || !data.Cards || data.Cards.length === 0) {
    return (
      <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5 text-sm text-(--color-text-secondary)">
        카드 정보가 없습니다.
      </section>
    );
  }

  const cardsBySlot = new Map(data.Cards.map((c) => [c.Slot, c]));
  const slots = Array.from({ length: 6 }, (_, i) => cardsBySlot.get(i) ?? null);

  const setNames = data.Effects.map((e) => e.Items.at(-1)?.Name)
    .filter((n): n is string => !!n)
    .filter((n, i, arr) => arr.indexOf(n) === i);

  const slotToEffect = new Map<number, (typeof data.Effects)[0]>();
  data.Effects.forEach((effect) => {
    effect.CardSlots.forEach((slot) => slotToEffect.set(slot, effect));
  });

  return (
    <section className="rounded-2xl border border-(--color-border) bg-(--color-surface) p-5">
      <div className="mb-4 flex items-center justify-between min-w-0">
        <h3 className="text-sm font-semibold text-(--color-text-primary)">카드</h3>
        <CardSetTooltipClient setNames={setNames} effects={data.Effects} />
      </div>
      <div className="flex gap-2 justify-between">
        {slots.map((card, i) =>
          card ? (
            <CardSlotClient
              key={i}
              card={card}
              style={CARD_GRADE_STYLES[card.Grade] ?? CARD_GRADE_STYLES["일반"]}
            />
          ) : (
            <EmptySlot key={i} />
          ),
        )}
      </div>
    </section>
  );
}
