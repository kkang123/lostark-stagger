import type { LostarkSibling } from "./types";

export async function fetchSiblings(
  characterName: string,
): Promise<LostarkSibling[]> {
  const name = characterName.trim();
  if (!name) return [];

  const res = await fetch(
    `/api/characters/${encodeURIComponent(name)}/siblings`,
    {
      method: "GET",
    },
  );

  const data = await res.json();

  if (!res.ok) {
    const msg =
      typeof data?.message === "string" ? data.message : "Request failed";
    throw new Error(msg);
  }

  return data as LostarkSibling[];
}
