"use client";

import SiblingsList from "@/components/character/SiblingsList";
import { useSiblings } from "@/lib/lostark/queries";

type Props = { name: string };

export default function SiblingsTab({ name }: Props) {
  const { data, isLoading, isError, error } = useSiblings(name);

  return (
    <SiblingsList
      characterName={name}
      data={data ?? []}
      loading={isLoading}
      errorMsg={
        isError ? ((error as Error)?.message ?? "에러가 발생했어요") : null
      }
    />
  );
}
