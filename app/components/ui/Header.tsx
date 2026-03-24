"use client";

import Link from "next/link";

import ThemeToggleButton from "./ThemeToggleButton";

export default function Header() {
  return (
    <header className="flex items-center justify-between px-6 h-14 border-b border-(--color-border) bg-(--color-surface-elevated)">
      <Link href="/" className="font-semibold text-(--color-text-primary)">
        로아왕
      </Link>

      <div className="flex items-center gap-2">
        <ThemeToggleButton />
      </div>
    </header>
  );
}
