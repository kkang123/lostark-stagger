import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return "알 수 없는 오류가 발생했습니다.";
}

export function parseItemLevel(v: unknown): number {
  if (typeof v !== "string") return Number.NEGATIVE_INFINITY;
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
}
