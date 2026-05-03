"use client";

import { useState, useRef, useEffect } from "react";
import type { CardEffect } from "@/types/Card.type";

type Props = {
  setNames: string[];
  effects: CardEffect[];
};

export default function CardSetTooltipClient({ setNames, effects }: Props) {
  const [isHovered, setIsHovered] = useState(false);
  const [showBelow, setShowBelow] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isHovered && wrapperRef.current) {
      const rect = wrapperRef.current.getBoundingClientRect();
      setShowBelow(rect.top < 200);
    }
  }, [isHovered]);

  if (setNames.length === 0) return null;

  return (
    <div
      ref={wrapperRef}
      className="relative flex items-center gap-1 cursor-default group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* 세트명 텍스트 */}
      <p className="text-xs text-amber-400 truncate max-w-48">
        {setNames.join(" / ").replace("성합계", "")}
      </p>

      {/* ? 뱃지 */}
      <span className="flex h-4 w-4 items-center justify-center rounded-full border border-(--color-border) text-[10px] text-(--color-text-tertiary) group-hover:border-amber-400 group-hover:text-amber-400 transition-colors">
        ?
      </span>

      {/* 툴팁 */}
      {isHovered && effects.length > 0 && (
        <div
          className={[
            "absolute right-0 z-50 w-72",
            "bg-(--color-surface) border border-(--color-border) rounded-xl p-3 shadow-[0_8px_32px_rgba(0,0,0,0.6)]",
            showBelow ? "top-full mt-2" : "bottom-full mb-2",
          ].join(" ")}
        >
          {effects.map((effect, ei) => {
            // 세트명 추출 (첫 번째 Item에서 "N세트" 앞부분)
            const setTitle =
              effect.Items[0]?.Name.replace(/\s*\d+세트.*/, "") ?? "";

            return (
              <div
                key={ei}
                className={
                  ei > 0 ? "mt-4 pt-4 border-t border-(--color-border)" : ""
                }
              >
                {/* 세트 제목 */}
                {setTitle && (
                  <p className="text-xs font-bold text-(--color-text-primary) mb-2 pb-2 border-b border-(--color-border)">
                    {setTitle}
                  </p>
                )}

                {/* 효과 목록 */}
                <div className="space-y-2">
                  {effect.Items.map((item, idx) => {
                    const isActive = idx === effect.Items.length - 1;
                    return (
                      <div
                        key={idx}
                        className={[
                          "flex flex-col rounded-lg px-2 py-1.5",
                          isActive
                            ? "bg-amber-400/10 border border-amber-400/20"
                            : "",
                        ].join(" ")}
                      >
                        <span
                          className={[
                            "text-xs font-semibold",
                            isActive ? "text-amber-400" : "text-(--color-text-tertiary)",
                          ].join(" ")}
                        >
                          {isActive && "✦ "}
                          {item.Name.replace("성합계", "")}
                        </span>
                        <span
                          className={[
                            "text-xs mt-0.5 leading-relaxed",
                            isActive ? "text-amber-300/80" : "text-zinc-700",
                          ].join(" ")}
                        >
                          {item.Description}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
