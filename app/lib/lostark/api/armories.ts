import { fetchJson } from "./http";

import type { CharacterName } from "@/types/character.type";
import type { EquipmentItem } from "@/types/Equipment.type";

export type CharacterProfile = {
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ServerName: string;
  CharacterImage: string | null;
};

export function getCharacterProfile(name: CharacterName) {
  const n = name.trim();
  return fetchJson<CharacterProfile>(
    `/api/armories/characters/${encodeURIComponent(n)}/profile`,
    { cache: "no-store" },
  );
}

export function getCharacterEquipment(name: CharacterName) {
  const n = name.trim();
  return fetchJson<EquipmentItem[]>(
    `/api/armories/characters/${encodeURIComponent(n)}/equipment`,
    { cache: "no-store" },
  );
}
