import Image from "next/image";

import { getCharacterProfileServer } from "@/lib/lostark/api/server";
import { getErrorMessage } from "@/lib/utils";

import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

export default async function ProfilePanel({ name }: Props) {
  let data;
  try {
    data = await getCharacterProfileServer(name);
  } catch (err) {
    return (
      <section className="rounded-2xl border border-red-500/20 bg-red-500/10 p-5 text-sm text-zinc-200">
        {getErrorMessage(err)}
      </section>
    );
  }

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
