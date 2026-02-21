export type Boss =
  | "세르카"
  | "에기르"
  | "케누아트"
  | "일리아칸"
  | "발비쿠"
  | null;

export function bossFromItemName(name: string): Boss {
  const n = name.trim();

  if (n.includes("전율")) return "세르카";
  if (n.includes("업화")) return "에기르";
  if (n.includes("결단")) return "케누아트";
  if (n.includes("속삭임")) return "일리아칸";
  if (n.includes("송곳니")) return "발비쿠";

  return null;
}

// export const bossBadgeClass: Record<Exclude<Boss, null>, string> = {
//   세르카: "bg-purple-500/20 text-purple-300",
//   에기르: "bg-red-500/20 text-red-300",
//   케누아트: "bg-yellow-500/20 text-yellow-300",
//   일리아칸: "bg-emerald-500/20 text-emerald-300",
//   발비: "bg-sky-500/20 text-sky-300",
// };

export const bossBadgeClass: Record<Exclude<Boss, null>, string> = {
  세르카: "bg-purple-500/15 text-purple-300 border border-purple-400/30",
  에기르: "bg-red-500/15 text-red-300 border border-red-400/30",
  케누아트: "bg-yellow-500/15 text-yellow-300 border border-yellow-400/30",
  일리아칸: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/30",
  발비쿠: "bg-sky-500/15 text-sky-300 border border-sky-400/30",
};
