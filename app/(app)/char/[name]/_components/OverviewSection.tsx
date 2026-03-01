"use client";

import ProfilePanel from "./ProfilePanel";
import EquipmentPanel from "./EquipmentPanel";

import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

export default function CharacterDetailsClient({ name }: Props) {
  return (
    <section className="grid gap-4">
      {/* 기본 프로필 */}
      <ProfilePanel name={name} />
      <EquipmentPanel name={name} />

      {/* 이후 확장 예정 */}
      {/*
      <StatsCard name={name} />
      <EngravingsCard name={name} />
      <SkillsCard name={name} />
      */}
    </section>
  );
}
