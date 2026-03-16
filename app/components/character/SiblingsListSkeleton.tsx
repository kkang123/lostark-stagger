// 실제 SiblingsList 구조: div.overflow-hidden > [헤더 px-5 py-4] + [ul.divide-y > li.px-5.py-4]
function SiblingRowSkeleton() {
  return (
    <li className="px-5 py-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div className="space-y-1">
          {/* text-sm font-medium — 캐릭터명 */}
          <div className="h-4 w-28 rounded bg-zinc-700/50" />
          {/* mt-1 text-xs — 서버·클래스·레벨 */}
          <div className="mt-1 h-3 w-44 rounded bg-zinc-700/40" />
        </div>
        <div className="space-y-1 text-right">
          {/* text-xs — "아이템 레벨" 라벨 */}
          <div className="h-3 w-16 rounded bg-zinc-700/40" />
          {/* text-sm font-semibold — 수치 */}
          <div className="h-4 w-20 rounded bg-zinc-700/50" />
        </div>
      </div>
    </li>
  );
}

export default function SiblingsListSkeleton() {
  return (
    <div className="animate-pulse overflow-hidden rounded-2xl border border-white/10 bg-black/15">
      <div className="border-b border-white/10 px-5 py-4">
        {/* text-sm font-semibold — 헤더 */}
        <div className="h-4 w-48 rounded bg-zinc-700/50" />
      </div>
      <ul className="divide-y divide-white/5">
        {Array.from({ length: 5 }).map((_, i) => (
          <SiblingRowSkeleton key={i} />
        ))}
      </ul>
    </div>
  );
}
