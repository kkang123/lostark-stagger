// 장비

"use client";

import { useState } from "react";
import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import EquipmentDetailDialog from "@/components/equipment/EquipmentDetailDialog";
// import EquipmentRow from "@/components/equipment/EquipmentRow";
import { toEquipmentUI } from "@/lib/lostark/equipment.mapper";
import { splitAndSortEquipment } from "@/lib/lostark/equipment.sort";

import type { EquipmentItem } from "@/types/Equipment.type";
import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

async function fetchCharacterEquipment(
  name: CharacterName,
): Promise<EquipmentItem[]> {
  const res = await fetch(
    `/api/armories/characters/${encodeURIComponent(name)}/equipment`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const status = body?.status ?? res.status;
    throw new Error(`장비 정보를 불러오지 못했습니다. (status: ${status})`);
  }

  return res.json();
}

export default function EquipmentPanel({ name }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EquipmentItem | null>(null);

  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["equipment", name],
    queryFn: () => fetchCharacterEquipment(name),
    enabled: Boolean(name),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
        장비 불러오는 중...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-zinc-200">
        {(error as Error).message}
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
        장비 정보가 없습니다.
      </section>
    );
  }

  // ✅ 보기 좋게 Type 기준으로 정렬(원하면 커스텀 순서로 바꿀 수 있음)
  const items = [...data].sort((a, b) =>
    (a.Type ?? "").localeCompare(b.Type ?? ""),
  );

  const uiItems = items.map(toEquipmentUI);
  // const { left, right, other } = splitAndSortEquipment(uiItems);

  return (
    <>
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
        <h3 className="mb-3 text-sm font-semibold text-zinc-200">장비</h3>

        <ul className="grid gap-2">
          {uiItems.map((it, idx) => (
            <li
              key={`${it.type}-${it.name}-${idx}`}
              className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3"
            >
              <button
                type="button"
                onClick={() => {
                  setSelected(it.raw);
                  setOpen(true);
                }}
                className={`relative flex w-full items-center rounded-xl border p-3 text-left `}
              >
                <div className="relative z-10 flex w-full items-center gap-3">
                  {/* 아이템 이미지 */}
                  {it.icon && (
                    <Image
                      src={it.icon}
                      alt={it.name}
                      width={40}
                      height={40}
                      className={`relative shrink-0 z-10 h-10 w-10 rounded-md ${it.gradeClass}`}
                    />
                  )}

                  {/* ✅ 품질 표시 + 색상 적용 */}
                  <span
                    className={`w-16 shrink-0 text-xs font-medium ${it.qualityClass}`}
                  >
                    {it.quality != null ? (
                      `품질 ${it.quality}`
                    ) : (
                      <span className="invisible">품질 00</span>
                    )}
                  </span>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                      {/* 아이템 티어3,4 */}
                      <span className="text-xs text-zinc-400">
                        {it.itemLevelText}
                      </span>
                    </div>
                    <div className="truncate text-sm text-zinc-100">
                      {it.name}
                    </div>
                    {it.grade && (
                      <div className="text-xs text-zinc-400">{it.grade}</div>
                    )}
                  </div>
                </div>
              </button>
            </li>
          ))}
        </ul>
      </section>

      <EquipmentDetailDialog
        open={open}
        onOpenChange={(v) => {
          setOpen(v);
          if (!v) setSelected(null);
        }}
        item={selected}
      />
    </>
  );
}
