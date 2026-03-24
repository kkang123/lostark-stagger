"use client";

import { useState, useCallback } from "react";

import EquipmentDetailDialog from "@/components/equipment/EquipmentDetailDialog";
import EquipmentRow from "@/components/equipment/EquipmentRow";

import type { EquipmentItem, EquipmentUI } from "@/types/Equipment.type";

type SortedEquipment = {
  left: EquipmentUI[];
  right: EquipmentUI[];
  other: EquipmentUI[];
};

type Props = {
  sorted: SortedEquipment;
};

export default function EquipmentPanelClient({ sorted }: Props) {
  const [open, setOpen] = useState(false);
  const [selected, setSelected] = useState<EquipmentItem | null>(null);

  const { left, right, other } = sorted;

  const handleSelectItem = useCallback((item: EquipmentItem) => {
    setSelected(item);
    setOpen(true);
  }, []);

  return (
    <>
      <div className="grid gap-3 md:grid-cols-2">
        {/* 왼쪽 */}
        <div>
          <h4 className="mb-2 text-xs font-semibold text-[#636B82]">
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
          <h4 className="mb-2 text-xs font-semibold text-[#636B82]">장신구</h4>
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
          <h4 className="mb-2 text-xs font-semibold text-[#636B82]">기타</h4>
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
