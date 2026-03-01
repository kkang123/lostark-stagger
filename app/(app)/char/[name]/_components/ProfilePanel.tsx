// 클라이언트 컴포넌트 + 내부 API 호출
// 서버 컴포넌트로 만들었는데 클라이언트 컴포넌트로 승격되어 env가 적용이 안됐음

"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

type CharacterProfile = {
  CharacterName: string;
  CharacterLevel: number;
  CharacterClassName: string;
  ItemAvgLevel: string;
  ServerName: string;
  CharacterImage: string | null;
};

async function fetchCharacterProfile(
  name: CharacterName,
): Promise<CharacterProfile> {
  // ✅ 외부 API 직접 호출 금지 → 내부 route.ts로 호출
  const res = await fetch(
    `/api/armories/characters/${encodeURIComponent(name)}/profile`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const status = body?.status ?? res.status;
    throw new Error(`캐릭터 정보를 불러오지 못했습니다. (status: ${status})`);
  }

  return res.json();
}

export default function ProfilePanel({ name }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["profile", name],
    queryFn: () => fetchCharacterProfile(name),
    enabled: Boolean(name),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
        프로필 불러오는 중...
      </section>
    );
  }

  if (isError) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-zinc-200">
        {(error as Error).message}
      </section>
    );
  }

  if (!data) return null;

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <div className="flex gap-4">
        {data.CharacterImage && (
          <Image
            src={data.CharacterImage}
            alt={data.CharacterName}
            width={256}
            height={256}
            className="rounded-xl object-cover"
          />
        )}
        <div className="flex flex-col gap-1">
          <h2 className="text-lg font-semibold">{data.CharacterName}</h2>
          <p className="text-sm text-zinc-300">서버: {data.ServerName}</p>
          <p className="text-sm text-zinc-300">
            클래스 : {data.CharacterClassName}
          </p>
          <div className="text-sm text-zinc-300">
            <span>전투 레벨</span> <span>{data.CharacterLevel}</span>
          </div>
          <p className="text-sm text-zinc-300">
            아이템 레벨 : {data.ItemAvgLevel}
          </p>
        </div>
      </div>
    </section>
  );
}
