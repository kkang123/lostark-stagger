import type { LostarkSibling } from "./types";

export async function fetchSiblings(
  characterName: string,
): Promise<LostarkSibling[]> {
  const name = characterName.trim();
  if (!name) return [];

  const res = await fetch(
    // 브라우저 → Next.js 서버(Route Handler) 로 가는 요청
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
