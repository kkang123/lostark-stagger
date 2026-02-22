"use client";

import { useQuery } from "@tanstack/react-query";

import { getCharacterEquipment } from "@/lib/lostark/api/armories";

import type { CharacterName } from "@/types/character.type";

export function useCharacterEquipmentQuery(name: CharacterName) {
  const n = name.trim();

  return useQuery({
    queryKey: ["armories", "equipment", n],
    queryFn: () => getCharacterEquipment(n),
    enabled: n.length > 0,
    staleTime: 30_000,
  });
}
