"use client";

import { useQuery } from "@tanstack/react-query";

import { fetchSiblings } from "./client";
import type { LostarkSibling } from "@/types/Sibling.types";

export const lostarkKeys = {
  siblings: (characterName: string) =>
    ["lostark", "siblings", characterName] as const,
};

export function useSiblings(characterName: string) {
  const name = characterName.trim();

  return useQuery<LostarkSibling[], Error>({
    queryKey: lostarkKeys.siblings(name),
    queryFn: () => fetchSiblings(name),
    enabled: name.length >= 2, // ✅ 2글자 이상일 때만 호출
    staleTime: 1000 * 30, // 30s
  });
}
