// 스켈레톤 적용 전 코드

// "use client";

// import ProfilePanel from "./ProfilePanel";
// import EquipmentPanel from "./EquipmentPanel";

// type Props = {
//   name: string;
// };

// export default function CharacterDetailsClient({ name }: Props) {
//   return (
//     <section className="grid gap-4">
//       {/* 기본 프로필 */}
//       <ProfilePanel name={name} />
//       <EquipmentPanel name={name} />

//       {/* 이후 확장 예정 */}
//       {/*
//         <StatsCard name={name} />
//         <EngravingsCard name={name} />
//         <SkillsCard name={name} />
//         */}
//     </section>
//   );
// }

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
