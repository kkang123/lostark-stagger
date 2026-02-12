// 장비

"use client";

import Image from "next/image";
import { useQuery } from "@tanstack/react-query";

type Props = {
  name: string;
};

// ✅ 우선은 “응답 구조 파악”을 위해 최소 타입만
// (필드명은 로스트아크 장비 응답에서 흔히 나오는 것들)
type EquipmentItem = {
  Type: string; // 예: "무기", "투구" ...
  Name: string;
  Icon: string;
  Grade: string;
  Quality?: number;
  Tooltip: string; // JSON 문자열인 경우가 많음
};

async function fetchCharacterEquipment(name: string): Promise<EquipmentItem[]> {
  const res = await fetch(
    `/api/armories/characters/${encodeURIComponent(name)}/equipment`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const status = body?.status ?? res.status;
    throw new Error(`장비 정보를 불러오지 못했습니다. (status: ${status})`);
  }

  return res.json();
}

export default function EquipmentPanel({ name }: Props) {
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["equipment", name],
    queryFn: () => fetchCharacterEquipment(name),
    enabled: Boolean(name),
    staleTime: 30_000,
  });

  if (isLoading) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
        장비 불러오는 중...
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

  if (!data || data.length === 0) {
    return (
      <section className="rounded-2xl border border-white/10 bg-black/20 p-5 text-sm text-zinc-300">
        장비 정보가 없습니다.
      </section>
    );
  }

  // ✅ 보기 좋게 Type 기준으로 정렬(원하면 커스텀 순서로 바꿀 수 있음)
  const items = [...data].sort((a, b) =>
    (a.Type ?? "").localeCompare(b.Type ?? ""),
  );

  return (
    <section className="rounded-2xl border border-white/10 bg-black/20 p-5">
      <h3 className="mb-3 text-sm font-semibold text-zinc-200">장비</h3>

      <ul className="grid gap-2">
        {items.map((it, idx) => (
          <li
            key={`${it.Type}-${it.Name}-${idx}`}
            className="flex items-center gap-3 rounded-xl border border-white/10 bg-black/10 p-3"
          >
            {it.Icon && (
              <Image
                src={it.Icon}
                alt={it.Name}
                width={40}
                height={40}
                className="h-10 w-10 rounded-md"
              />
            )}

            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xs text-zinc-400">{it.Type}</span>
                {typeof it.Quality === "number" && (
                  <span className="text-xs text-zinc-400">
                    품질 {it.Quality}
                  </span>
                )}
              </div>
              <div className="truncate text-sm text-zinc-100">{it.Name}</div>
              {it.Grade && (
                <div className="text-xs text-zinc-400">{it.Grade}</div>
              )}
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
