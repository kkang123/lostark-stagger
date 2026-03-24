"use client";

import Image from "next/image";

import {
  bossFromItemName,
  bossBadgeClass,
  specialFromCategory,
  specialBadgeClass,
} from "@/lib/lostark/itemLabel";
import AbilityStoneEngravingsSection from "./AbilityStoneEngravingsSection";

import type { EquipmentUI } from "@/types/Equipment.type";

type Props = {
  item: EquipmentUI;
  onClick: () => void;
};

export default function EquipmentRow({ item, onClick }: Props) {
  const special = specialFromCategory(item.category ?? "");
  const boss = special ? null : bossFromItemName(item.name);

  return (
    <li className="rounded-xl border border-(--color-border) bg-(--color-surface) transition-colors hover:bg-(--color-surface-elevated)">
      <button
        type="button"
        onClick={onClick}
        className="relative flex w-full items-center p-3 text-left cursor-pointer"
      >
        <div className="relative z-10 flex w-full items-center gap-3">
          <div className="relative h-10 w-10 shrink-0">
            {/* 아이템 이미지 */}
            {item.icon && (
              <Image
                src={item.icon}
                alt={item.name}
                width={40}
                height={40}
                className={`h-10 w-10 rounded-md ${item.gradeClass}`}
              />
            )}

            {/* 타입 텍스트 (이미지 위) */}
            <span className="absolute bottom-[0.2px] right-[0.2px] z-20 rounded bg-black/40 px-1 text-[8px] text-white">
              {item.type === "어빌리티 스톤" ? "스톤" : item.type}
            </span>
          </div>

          {/* 품질 */}
          <span
            className={`w-16 shrink-0 text-xs font-medium ${item.qualityClass}`}
          >
            {item.quality != null ? (
              `품질 ${item.quality}`
            ) : (
              <span className="invisible">품질 00</span>
            )}
          </span>

          {/* 텍스트 */}
          <div className="min-w-0 flex-1">
            <div className="flex gap-1">
              {special && (
                <span
                  className={`inline-flex items-center rounded px-1 py-0.5 text-[8px] font-semibold ${
                    specialBadgeClass[special]
                  }`}
                >
                  {special}
                </span>
              )}

              {boss && (
                <span
                  className={`inline-flex items-center rounded px-1 py-0.5 text-[8px] font-semibold ${
                    bossBadgeClass[boss]
                  }`}
                >
                  {boss}
                </span>
              )}
            </div>

            {item.kind === "gear" && (
              <div className="flex flex-col gap-0.5 mt-1">
                <span className="text-xs leading-tight text-(--color-text-tertiary)">
                  {item.itemLevelText}
                </span>

                <span className="truncate text-sm text-(--color-text-primary)">
                  {item.name}
                </span>
              </div>
            )}

            {item.kind === "accessory" &&
              ["목걸이", "귀걸이", "반지"].includes(item.type) && (
                <div className="mt-1 space-y-0.5">
                  {item.polishingOptions.map((opt, i) => (
                    <div
                      key={i}
                      className="flex items-center gap-1 text-[11px]"
                    >
                      <span className="text-(--color-text-tertiary) truncate">{opt.name}</span>
                      <span className={opt.colorClass}>{opt.value}</span>
                    </div>
                  ))}
                </div>
              )}

            {item.kind === "accessory" && item.type === "어빌리티 스톤" && (
              <AbilityStoneEngravingsSection
                engravings={item.abilityStoneEngravings ?? []}
                variant="row"
              />
            )}
          </div>
        </div>
      </button>
    </li>
  );
}
