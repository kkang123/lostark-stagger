import "server-only";

import type { CharacterName } from "@/types/character.type";
import type { EquipmentItem } from "@/types/Equipment.type";
import type { CharacterProfile } from "./armories";

async function lostarkFetch<T>(path: string): Promise<T> {
  const baseUrl = process.env.LOSTARK_BASE_URL;
  const jwt = process.env.LOSTARK_JWT?.trim();

  if (!baseUrl || !jwt) {
    throw new Error("Server env is missing (LOSTARK_BASE_URL or LOSTARK_JWT)");
  }

  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      accept: "application/json",
      authorization: `bearer ${jwt}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    throw new Error(`Lostark API error (status: ${res.status})`);
  }

  return res.json() as Promise<T>;
}

export function getCharacterProfileServer(name: CharacterName) {
  const encodedName = encodeURIComponent(name.trim());
  return lostarkFetch<CharacterProfile>(
    `/armories/characters/${encodedName}/profiles`,
  );
}

export function getCharacterEquipmentServer(name: CharacterName) {
  const encodedName = encodeURIComponent(name.trim());
  return lostarkFetch<EquipmentItem[]>(
    `/armories/characters/${encodedName}/equipment`,
  );
}
