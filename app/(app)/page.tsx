// 검색만(최단 루트)

"use client";

import CharacterSearchForm from "@/components/character/CharacterSearchForm";

import { useCharacterSearchStore } from "@/stores/characterSearch.store";
import { useSiblings } from "@/lib/lostark/queries";

export default function HomePage() {
  const submittedName = useCharacterSearchStore((s) => s.submittedName);

  const { data, isLoading, isError, error } = useSiblings(submittedName);

  return (
    <main className="min-h-dvh bg-(--color-bg) text-(--color-text-primary)">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-semibold text-(--color-text-primary)">
            로스트아크 캐릭터 검색
          </h1>
        </div>
        <p className="mt-2 text-sm text-(--color-text-secondary)">
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
