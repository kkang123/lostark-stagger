type BossName = "세르카" | "에기르" | "케누아트" | "일리아칸" | "발비쿠";

export type Boss = BossName | null;

export type SpecialLabel = "에스더" | null;

const BOSS_KEYWORDS: Record<BossName, string> = {
  세르카: "전율",
  에기르: "업화",
  케누아트: "결단",
  일리아칸: "속삭임",
  발비쿠: "송곳니",
};

export function bossFromItemName(name: string): Boss {
  const n = name.trim();
  for (const [boss, keyword] of Object.entries(BOSS_KEYWORDS) as [BossName, string][]) {
    if (n.includes(keyword)) return boss;
  }
  return null;
}

export function specialFromCategory(category: string): SpecialLabel {
  const c = category.trim();

  if (c.includes("에스더")) return "에스더";

  return null;
}

export const bossBadgeClass: Record<BossName, string> = {
  세르카: "bg-purple-500/15 text-purple-300 border border-purple-400/30",
  에기르: "bg-red-500/15 text-red-300 border border-red-400/30",
  케누아트: "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
  일리아칸: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
  발비쿠: "bg-sky-500/15 text-sky-300 border border-sky-400/30",
};

export const specialBadgeClass: Record<Exclude<SpecialLabel, null>, string> = {
  에스더:
    "bg-[linear-gradient(135deg,#0c2e2c,#2faba8)] text-cyan-100 border border-cyan-300/40 font-semibold",
};
