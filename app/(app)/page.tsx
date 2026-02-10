// 검색만(최단 루트)

"use client";

import CharacterSearchForm from "@/components/character/CharacterSearchForm";

import { useCharacterSearchStore } from "@/stores/characterSearch.store";
import { useSiblings } from "@/lib/lostark/queries";

export default function HomePage() {
  const submittedName = useCharacterSearchStore((s) => s.submittedName);

  const { data, isLoading, isError, error } = useSiblings(submittedName);

  return (
    <main className="min-h-dvh bg-[#212225] text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">로스트아크 캐릭터 검색</h1>
        <p className="mt-2 text-sm text-zinc-300">
          캐릭터명을 입력하면 해당 계정의 캐릭터(서버/직업/레벨/아이템레벨)를
          조회합니다.
        </p>

        <div className="mt-6">
          <CharacterSearchForm />
        </div>
      </div>
    </main>
  );
}
