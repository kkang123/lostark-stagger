"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import { toEquipmentUI } from "@/lib/lostark/equipment.mapper";

import type { EquipmentItem } from "@/types/Equipment.type";
import { extractEquipmentDetail } from "@/lib/lostark/tooltip";

type Props = {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  item: EquipmentItem | null;
};

export default function EquipmentDetailDialog({
  open,
  onOpenChange,
  item,
}: Props) {
  const detail = useMemo(() => {
    if (!item) return null;
    return extractEquipmentDetail(item);
  }, [item]);

  const ui = useMemo(() => {
    if (!item) return null;
    return toEquipmentUI(item);
  }, [item]);

  console.log("[WEAPON]", item?.Type, item?.Name);
  console.log(item?.Tooltip?.slice(0, 500));
  console.log("detail.durabilityText =", detail?.durabilityText);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-180 rounded-2xl border border-white/10 bg-zinc-950 text-zinc-100">
        {!item ? null : (
          <>
            <DialogHeader>
              <DialogTitle className="flex items-center gap-3">
                <div
                  className={`relative h-12 w-12 overflow-hidden rounded-lg border ${ui?.gradeClass ?? "border-white/10 bg-black/10"}`}
                >
                  <Image
                    src={item.Icon}
                    alt={item.Name}
                    fill
                    className="object-cover"
                  />
                </div>

                <div className="min-w-0">
                  <div className="truncate text-base font-semibold">
                    {item.Name}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {item.Grade} · {item.Type}
                  </div>
                </div>
              </DialogTitle>
            </DialogHeader>

            {!detail ? (
              <div className="text-sm text-zinc-400">Tooltip 파싱 실패</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3 rounded-xl border border-white/10 bg-white/5 p-4">
                  <Info
                    label="아이템 레벨"
                    value={detail.itemLevelText || "-"}
                  />
                  <div className="col-span-2">
                    <Info label="분류" value={detail.category || "-"} />
                  </div>

                  <Info
                    label={ui?.quality != null ? "품질" : ""}
                    value={
                      ui?.quality != null ? (
                        `품질 ${ui.quality}`
                      ) : (
                        <span className="invisible">품질 00</span>
                      )
                    }
                  />
                </div>

                {/* ✅ 여기 추가: 어빌리티 스톤 각인 */}
                <AbilityStoneEngravingsSection
                  engravings={detail.abilityStoneEngravings ?? []}
                />

                <Section title="기본 효과" body={detail.basicText} />
                <Section title="추가 효과" body={detail.extraText} />
                <Section title="아크 패시브" body={detail.arkPassiveText} />
                <Section title="내구도" body={detail.durabilityText} />
              </div>
            )}
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}

function Info({ label, value }: { label: string; value: React.ReactNode }) {
  if (!label) return null; // label이 빈 문자열이면 아예 숨김
  return (
    <div>
      <div className="text-xs text-zinc-400">{label}</div>
      <div className="text-sm font-medium">{value}</div>
    </div>
  );
}

function Section({ title, body }: { title: string; body: string }) {
  if (!body) return null;
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4">
      <div className="text-xs text-zinc-400">{title}</div>
      <pre className="mt-2 whitespace-pre-wrap text-sm">{body}</pre>
    </div>
  );
}

/** ✅ 능력석 각인 표시 섹션 */
function AbilityStoneEngravingsSection({
  engravings,
}: {
  engravings: { name: string; level: number; isNegative: boolean }[];
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

// 어빌리티 스톤 추가 후
