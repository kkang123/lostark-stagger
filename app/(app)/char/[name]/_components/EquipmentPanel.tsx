// 장비
"use client";

import { useState, useMemo, useCallback } from "react";

import EquipmentDetailDialog from "@/components/equipment/EquipmentDetailDialog";
import EquipmentPanelSkeleton from "./EquipmentPanelSkeleton";
import EquipmentRow from "@/components/equipment/EquipmentRow";

import { toEquipmentUI } from "@/lib/lostark/equipment.mapper";
import { splitAndSortEquipment } from "@/lib/lostark/equipment.sort";
import { useCharacterEquipmentQuery } from "@/hooks/useCharacterEquipmentQuery";
import { getErrorMessage } from "@/lib/utils";

import type { EquipmentItem } from "@/types/Equipment.type";
import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

export default function EquipmentPanel({ name }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EquipmentItem | null>(null);

  const { data, isLoading, isError, error } = useCharacterEquipmentQuery(name);

  const { left, right, other } = useMemo(() => {
    if (!data || data.length === 0) return { left: [], right: [], other: [] };
    const items = [...data].sort((a, b) => a.Type.localeCompare(b.Type));
    return splitAndSortEquipment(items.map(toEquipmentUI));
  }, [data]);

  const handleSelectItem = useCallback((item: EquipmentItem) => {
    setSelected(item);
    setOpen(true);
  }, []);

  if (isLoading) {
    return <EquipmentPanelSkeleton />;
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-zinc-200">
        {getErrorMessage(error)}
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

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        {/* 왼쪽 */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-400">
            무기 · 방어구
          </h4>
          <ul className="grid gap-2">
            {left.map((it, idx) => (
              <EquipmentRow
                key={`${it.type}-${it.name}-${idx}`}
                item={it}
                onClick={() => handleSelectItem(it.raw)}
              />
            ))}
          </ul>
        </div>

        {/* 오른쪽 */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-zinc-400">장신구</h4>
          <ul className="grid gap-2">
            {right.map((it, idx) => (
              <EquipmentRow
                key={`${it.type}-${it.name}-${idx}`}
                item={it}
                onClick={() => handleSelectItem(it.raw)}
              />
            ))}
          </ul>
        </div>
      </div>

      {other.length > 0 && (
        <div className="mt-4">
          <h4 className="mb-2 text-xs font-semibold text-zinc-400">기타</h4>
          <ul className="grid gap-2">
            {other.map((it, idx) => (
              <EquipmentRow
                key={`${it.type}-${it.name}-${idx}`}
                item={it}
                onClick={() => handleSelectItem(it.raw)}
              />
            ))}
          </ul>
        </div>
      )}

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
