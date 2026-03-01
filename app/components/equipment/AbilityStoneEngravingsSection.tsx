// 어빌리티 스톤 각인 표시 섹션

import type { AbilityStoneEngraving } from "@/lib/lostark/tooltip";

type Props = {
  engravings: AbilityStoneEngraving[];
  variant?: "detail" | "row";
};

export default function AbilityStoneEngravingsSection({
  engravings,
  variant = "detail",
}: Props) {
  if (!engravings || engravings.length === 0) return null;

  // 리스트에서 보이는 컴팩트한 UI
  if (variant === "row") {
    return (
      <div className="mt-1 flex flex-col gap-1 w-fit">
        {engravings.map((e) => (
          <span
            key={`${e.name}-${e.level}-${e.isNegative ? "n" : "p"}`}
            className={[
              "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px]",
              e.isNegative
                ? "bg-red-500/20 text-red-300"
                : "bg-white/10 text-zinc-300",
            ].join(" ")}
          >
            {e.name}
            <span className="opacity-60">Lv.{e.level}</span>
          </span>
        ))}
      </div>
    );
  }

  // 상세 다이얼로그용 기존 UI
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-zinc-400">무작위 각인 효과</div>
      <div className="mt-3 flex flex-wrap gap-2">
        {engravings.map((e) => (
          <span
            key={`${e.name}-${e.level}-${e.isNegative ? "n" : "p"}`}
            className={[
              "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-sm",
              e.isNegative
                ? "border-red-500/25 bg-red-500/10 text-red-200"
                : "border-white/10 bg-black/20 text-zinc-100",
            ].join(" ")}
          >
            <span className="font-medium">{e.name}</span>
            <span className="text-xs opacity-80">Lv.{e.level}</span>
          </span>
        ))}
      </div>
    </div>
  );
}
