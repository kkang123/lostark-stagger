import { Suspense } from "react";

import ProfilePanel from "./ProfilePanel";
import ProfilePanelSkeleton from "./ProfilePanelSkeleton";
import EquipmentPanel from "./EquipmentPanel";
import EquipmentPanelSkeleton from "./EquipmentPanelSkeleton";

import type { CharacterName } from "@/types/character.type";

type Props = {
  name: CharacterName;
};

export default function OverviewSection({ name }: Props) {
  return (
    <section className="grid gap-4">
      <Suspense fallback={<ProfilePanelSkeleton />}>
        <ProfilePanel name={name} />
      </Suspense>
      <Suspense fallback={<EquipmentPanelSkeleton />}>
        <EquipmentPanel name={name} />
      </Suspense>

      {/* 이후 확장 예정 */}
      {/*
      <StatsCard name={name} />
      <EngravingsCard name={name} />
      <SkillsCard name={name} />
      */}
    </section>
  );
}
