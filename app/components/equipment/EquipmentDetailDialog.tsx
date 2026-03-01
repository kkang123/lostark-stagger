"use client";

import Image from "next/image";
import { useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import AbilityStoneEngravingsSection from "./AbilityStoneEngravingsSection";
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

                {/* 어빌리티 스톤 각인 */}
                <AbilityStoneEngravingsSection
                  engravings={detail.abilityStoneEngravings ?? []}
                  variant="detail"
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
