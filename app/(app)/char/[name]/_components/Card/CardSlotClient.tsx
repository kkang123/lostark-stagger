"use client";

import { useState, useRef, useEffect } from "react";
import Image from "next/image";

import type { CardItem, CardEffect } from "@/types/Card.type";

type Props = {
  card: CardItem;
  effect?: CardEffect;
  style: { border: string; bg: string; text: string; glow: string };
};

function AwakeDots({ count, total }: { count: number; total: number }) {
  return (
    <div className="flex gap-0.5">
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={[
            "h-1.5 w-1.5 rounded-full",
            i < count
              ? "bg-amber-400 shadow-[0_0_4px_rgba(245,166,35,0.8)]"
              : "bg-white/20",
          ].join(" ")}
        />
      ))}
    </div>
  );
}

export default function CardSlotClient({ card, effect, style }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const [showBelow, setShowBelow] = useState(false);

  useEffect(() => {
    if (isHovered && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setShowBelow(rect.top < 200);
    }
  }, [isHovered]);

  return (
    <div
      ref={wrapperRef}
      className="relative flex flex-col items-center gap-1 p-1"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 카드 이미지 */}
      <div
        className={[
          "relative h-24 w-18 overflow-hidden rounded-md shadow-md border-2",
          style.border,
          style.glow,
        ].join(" ")}
      >
        <Image
          src={card.Icon}
          alt={card.Name}
          fill
          sizes="72px"
          className="object-cover"
        />
      </div>

      {/* 카드 이름 */}
      <p
        className={`line-clamp-2 text-center text-xs font-medium leading-tight ${style.text}`}
      >
        {card.Name}
      </p>

      {/* 각성 도트 */}
      {card.AwakeTotal > 0 && (
        <AwakeDots count={card.AwakeCount} total={card.AwakeTotal} />
      )}

      {/* 호버 툴팁 */}
      {isHovered && effect && effect.Items.length > 0 && (
        <div
          className={[
            "absolute left-1/2 -translate-x-1/2 z-50",
            "min-w-55 bg-(--color-surface) border border-(--color-border) rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
            showBelow ? "top-full mt-2" : "bottom-full mb-2",
          ].join(" ")}
        >
          <p className="text-xs font-bold text-(--color-text-primary) mb-2 pb-2 border-b border-(--color-border)">
            카드 효과
          </p>

          {effect.Items.map((item, idx) => (
            <div key={idx} className={idx > 0 ? "mt-2" : ""}>
              <p
                className={[
                  "text-xs font-semibold",
                  idx === effect.Items.length - 1
                    ? "text-amber-400"
                    : "text-(--color-text-secondary)",
                ].join(" ")}
              >
                {item.Name}
              </p>
              <p className="text-xs text-(--color-text-tertiary) mt-0.5">{item.Description}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
