// 어빌리티 스톤 각인 표시 섹션

import type { AbilityStoneEngraving } from "@/lib/lostark/tooltip";

export default function AbilityStoneEngravingsSection({
  engravings,
}: {
  engravings: AbilityStoneEngraving[];
}) {
  // 능력석이 아니거나, 파싱 실패로 비어있으면 숨김
  if (!engravings || engravings.length === 0) return null;

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

/* 
원하는 데이터만 필요하고 Ui는 차별점을 주고 싶을 떄
보통 이런 경우 variant props 패턴을 씁니다. 데이터 로직은 공유하되 UI만 다르게 렌더링하는 방식 사용


이 코드는 아직 적용 전
*/
