export default function ProfilePanelSkeleton() {
  return (
    <section className="animate-pulse rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex gap-4">
        <div className="h-64 w-64 shrink-0 rounded-xl bg-zinc-700/50" />
        <div className="flex flex-col gap-1 pt-1">
          <div className="h-6 w-36 rounded bg-zinc-700/50" />

          <div className="h-4 w-28 rounded bg-zinc-700/40" />
          <div className="h-4 w-32 rounded bg-zinc-700/40" />
          <div className="h-4 w-20 rounded bg-zinc-700/40" />
          <div className="h-4 w-28 rounded bg-zinc-700/40" />
        </div>
      </div>
    </section>
  );
}
