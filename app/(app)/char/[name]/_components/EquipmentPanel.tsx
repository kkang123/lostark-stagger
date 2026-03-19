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
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-zinc-200">
        {getErrorMessage(err)}
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

  const sorted = splitAndSortEquipment(
    [...data].sort((a, b) => a.Type.localeCompare(b.Type)).map(toEquipmentUI),
  );

  return <EquipmentPanelClient sorted={sorted} />;
}
