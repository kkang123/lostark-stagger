// 무기·방어구: 배지 + 아이템 레벨 + 이름 (3줄)
function GearRowSkeleton() {
  return (
    <li className="rounded-xl border border-white/10 bg-black/10 p-3">
      <div className="rounded-xl border border-white/10 p-3">
        <div className="flex w-full items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-md bg-zinc-700/50" />
          <div className="h-3 w-16 shrink-0 rounded bg-zinc-700/40" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-12 rounded bg-zinc-700/30" />
            <div className="h-3 w-20 rounded bg-zinc-700/40" />
            <div className="h-4 w-36 rounded bg-zinc-700/50" />
          </div>
        </div>
      </div>
    </li>
  );
}

// 장신구: 배지 없음, 연마 옵션 2줄 (text-[11px] 2개)
function AccessoryRowSkeleton() {
  return (
    <li className="rounded-xl border border-white/10 bg-black/10 p-3">
      <div className="rounded-xl border border-white/10 p-3">
        <div className="flex w-full items-center gap-3">
          <div className="h-10 w-10 shrink-0 rounded-md bg-zinc-700/50" />
          <div className="h-3 w-16 shrink-0 rounded bg-zinc-700/40" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-28 rounded bg-zinc-700/40" />
            <div className="h-3 w-28 rounded bg-zinc-700/40" />
            <div className="h-3 w-28 rounded bg-zinc-700/40" />
          </div>
        </div>
      </div>
    </li>
  );
}

export default function EquipmentPanelSkeleton() {
  return (
    <div className="animate-pulse">
      <div className="grid gap-3 md:grid-cols-2">
        {/* 무기·방어구 6행 */}
        <div>
          <div className="mb-2 h-3 w-20 rounded bg-zinc-700/40" />
          <ul className="grid gap-2">
            {Array.from({ length: 6 }).map((_, i) => (
              <GearRowSkeleton key={i} />
            ))}
          </ul>
        </div>

        {/* 장신구 5행 */}
        <div>
          <div className="mb-2 h-3 w-12 rounded bg-zinc-700/40" />
          <ul className="grid gap-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <AccessoryRowSkeleton key={i} />
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
