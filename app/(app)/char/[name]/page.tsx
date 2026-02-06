"use client";

import React from "react";

import CharacterSearchForm from "@/components/character/CharacterSearchForm";
import SiblingsList from "@/components/character/SiblingsList";

import { useSiblings } from "@/lib/lostark/queries";

type Props = {
  params: Promise<{ name: string }>;
};

export default function CharacterPage({ params }: Props) {
  const { name } = React.use(params); // ✅ Promise 언랩
  const decodedName = decodeURIComponent(name);

  const { data, isLoading, isError, error } = useSiblings(decodedName);

  return (
    <main className="min-h-dvh bg-[#212225] text-zinc-100">
      <div className="mx-auto w-full max-w-3xl px-4 py-10">
        <h1 className="text-2xl font-semibold">캐릭터: {decodedName}</h1>

        <div className="mt-6">
          <CharacterSearchForm />
        </div>

        <div className="mt-8">
          <SiblingsList
            characterName={decodedName}
            data={data ?? []}
            loading={isLoading}
            errorMsg={
              isError
                ? ((error as Error)?.message ?? "에러가 발생했어요")
                : null
            }
          />
        </div>
      </div>
    </main>
  );
}
