// 원정대캐릭 목록
"use client";

import Link from "next/link";

import SiblingsListSkeleton from "@/components/character/SiblingsListSkeleton";

import type { LostarkSibling } from "@/types/Sibling.types";
import { parseItemLevel } from "@/lib/utils";

type Props = {
  characterName: string;
  data: LostarkSibling[];
  loading: boolean;
  errorMsg: string | null;
};

export default function SiblingsList({
  characterName,
  data,
  loading,
  errorMsg,
}: Props) {
  if (!characterName) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-sm text-zinc-300">
        캐릭터명을 입력하고 검색하세요.
      </div>
    );
  }

  if (loading) {
    return <SiblingsListSkeleton />;
  }

  if (errorMsg) {
    return (
      <div className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-red-200">
        {errorMsg}
      </div>
    );
  }

  if (data.length === 0) {
    return (
      <div className="rounded-2xl border border-white/10 bg-black/15 p-5 text-sm text-zinc-300">
        검색 결과가 없어. (캐릭터명 오타/비공개/점검/레이트리밋 가능)
      </div>
    );
  }

  const sortedData = [...data].sort(
    (a, b) => parseItemLevel(b.ItemAvgLevel) - parseItemLevel(a.ItemAvgLevel),
  );

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-black/15">
      <div className="border-b border-white/10 px-5 py-4">
        <h2 className="text-sm font-semibold">
          “{characterName}” 계정 캐릭터 목록 ({data.length})
        </h2>
      </div>

      <ul className="divide-y divide-white/5">
        {sortedData.map((c) => (
          <li key={`${c.ServerName}:${c.CharacterName}`} className="px-5 py-4">
            <Link
              href={`/char/${encodeURIComponent(c.CharacterName)}`}
              className="block relative z-10"
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <p className="text-sm font-medium">{c.CharacterName}</p>
                  <p className="mt-1 text-xs text-zinc-300">
                    {c.ServerName} · {c.CharacterClassName} · Lv.
                    {c.CharacterLevel}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-xs text-zinc-400">아이템 레벨</p>
                  <p className="text-sm font-semibold tabular-nums">
                    {c.ItemAvgLevel}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
