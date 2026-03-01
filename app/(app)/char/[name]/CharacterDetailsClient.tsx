"use client";

import { useState } from "react";
import OverviewSection from "./_components/OverviewSection";
import SiblingsTab from "@/components/character/SiblingsTab";

import type { CharacterName } from "@/types/character.type";

type Tab = "overview" | "siblings";

type Props = {
  name: CharacterName;
};

export default function CharacterDetailsClient({ name }: Props) {
  const [tab, setTab] = useState<Tab>("overview");

  return (
    <main className="min-h-dvh bg-[#212225] text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">캐릭터 : {name}</h1>

        <div className="inline-flex rounded-xl bg-gray-600 p-1">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`
      px-4 py-2 rounded-lg text-sm transition-all duration-200 ease-out

      ${
        tab === "overview"
          ? "bg-background text-foreground font-medium shadow-sm"
          : "text-foreground/60 hover:text-foreground"
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
          ? "bg-background text-foreground font-medium shadow-sm"
          : "text-foreground/60 hover:text-foreground"
      }
    `}
          >
            원정대
          </button>
        </div>

        <div className="mt-6">
          {tab === "overview" && <OverviewSection name={name} />}
          {tab === "siblings" && <SiblingsTab name={name} />}
        </div>
      </div>
    </main>
  );
}
