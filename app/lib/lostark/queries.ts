import { useQuery } from "@tanstack/react-query";

import { fetchSiblings } from "./client";

export const lostarkKeys = {
  siblings: (characterName: string) =>
    ["lostark", "siblings", characterName] as const,
};

export function useSiblings(characterName: string, enabled: boolean) {
  return useQuery({
    queryKey: lostarkKeys.siblings(characterName),
    queryFn: () => fetchSiblings(characterName),
    enabled,
    staleTime: 1000 * 30, // 30s
  });
}
