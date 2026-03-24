import EquipmentPanelClient from "./EquipmentPanelClient";

import { getCharacterEquipmentServer } from "@/lib/lostark/api/server";
import { toEquipmentUI } from "@/lib/lostark/equipment.mapper";
import { splitAndSortEquipment } from "@/lib/lostark/equipment.sort";
import { getErrorMessage } from "@/lib/utils";

import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

export default async function EquipmentPanel({ name }: Props) {
  let data;
  try {
    data = await getCharacterEquipmentServer(name);
  } catch (err) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-[#E8EBF5]">
        {getErrorMessage(err)}
      </section>
    );
  }

  if (!data || data.length === 0) {
    return (
      <section className="rounded-2xl border border-white/[0.07] bg-[#12151E] p-5 text-sm text-[#8B92A9]">
        장비 정보가 없습니다.
      </section>
    );
  }

  const sorted = splitAndSortEquipment(
    [...data].sort((a, b) => a.Type.localeCompare(b.Type)).map(toEquipmentUI),
  );

  return (
    <section className="rounded-2xl border border-white/[0.07] bg-[#12151E] p-5">
      <EquipmentPanelClient sorted={sorted} />
    </section>
  );
}
