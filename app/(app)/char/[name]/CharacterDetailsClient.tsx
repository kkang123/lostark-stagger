"use client";

import { useState } from "react";

import SiblingsTab from "@/components/character/SiblingsTab";

import type { ReactNode } from "react";
import type { CharacterName } from "@/types/character.type";

type Tab = "overview" | "siblings";

type Props = {
  name: CharacterName;
  overviewContent: ReactNode;
};

export default function CharacterDetailsClient({
  name,
  overviewContent,
}: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main className="min-h-dvh bg-(--color-bg) text-(--color-text-primary)">
      {/* max-w-3xl px-4 좌우 여백 제공  */}
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold mb-4 text-(--color-text-primary)">
          {name}
        </h1>

        <div className="inline-flex rounded-xl bg-(--color-surface) p-1">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`
              px-4 py-2 rounded-lg text-sm transition-all duration-200 ease-out
              ${
                tab === "overview"
                  ? "bg-(--color-surface-elevated) text-[#5B9AF8] font-medium shadow-sm"
                  : "text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
              }
            `}
          >
            능력치
          </button>

          <button
            type="button"
            onClick={() => setTab("siblings")}
            className={`
              px-4 py-2 rounded-lg text-sm transition-all duration-200 ease-out
              ${
                tab === "siblings"
                  ? "bg-(--color-surface-elevated) text-[#5B9AF8] font-medium shadow-sm"
                  : "text-(--color-text-tertiary) hover:text-(--color-text-secondary)"
              }
            `}
          >
            원정대
          </button>
        </div>

        <div className="mt-6">
          {tab === "overview" && overviewContent}
          {tab === "siblings" && <SiblingsTab name={name} />}
        </div>
      </div>
    </main>
  );
}
