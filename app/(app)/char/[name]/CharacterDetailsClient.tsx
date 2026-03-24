"use client";

import { useState } from "react";
import Link from "next/link";

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
    <main className="min-h-dvh bg-[#0B0D14] text-[#E8EBF5]">
      {/* max-w-3xl px-4 좌우 여백 제공  */}
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        {/* 뒤로가기 임시 생성 */}
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[#636B82] hover:text-[#8B92A9] transition-colors mb-4"
        >
          ← 검색으로 돌아가기
        </Link>

        <h1 className="text-2xl font-semibold mb-4 text-[#E8EBF5]">{name}</h1>

        <div className="inline-flex rounded-xl bg-[#12151E] p-1">
          <button
            type="button"
            onClick={() => setTab("overview")}
            className={`
              px-4 py-2 rounded-lg text-sm transition-all duration-200 ease-out
              ${
                tab === "overview"
                  ? "bg-[#1C2236] text-[#5B9AF8] font-medium shadow-sm"
                  : "text-[#636B82] hover:text-[#8B92A9]"
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
                  ? "bg-[#1C2236] text-[#5B9AF8] font-medium shadow-sm"
                  : "text-[#636B82] hover:text-[#8B92A9]"
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
