// 서버 컴포넌트
import CharacterDetailsClient from "@/(app)/char/[name]/CharacterDetailsClient";
import OverviewSection from "./_components/OverviewSection";

import type { CharacterName } from "@/types/character.type";

type Props = {
  params: Promise<{ name: CharacterName }>;
};

export default async function CharacterDetailsPage({ params }: Props) {
  // URL 인코딩된 한글/특수문자 디코딩 (서버에서 처리)
  const { name } = await params; // ✅ Promise 언랩
  const decodedName = decodeURIComponent(name);

  return (
    <CharacterDetailsClient
      name={decodedName}
      overviewContent={<OverviewSection name={decodedName} />}
    />
  );
}

// "use client";

// import React from "react";
// import { useMemo, useState } from "react";
// import { useParams } from "next/navigation";
// import ProfilePanel from "@/_components";
// import SiblingsList from "@/components/character/SiblingsList";

// type Tab = "overview" | "siblings";
// type Props = {
//   params: Promise<{ name: string }>;
// };

// export default function CharacterDetailsPage({ params }: Props) {
//   //   const params = useParams<{ name: string }>;
//   //   const name = useMemo(() => decodeURIComponent(params.name), [params.name]);
//   const { name } = React.use(params); // ✅ Promise 언랩
//   const decodedName = decodeURIComponent(name);

//   const [tab, setTab] = useState<Tab>("overview");

//   return;
//   <div className="mx-auto max-w-3xl p-6">
//     <h1 className="text-2xl font-semibold">{name}</h1>

//     <div className="mt-4 flex gap-2">
//       <button
//         onClick={() => setTab("overview")}
//         className={tab === "overview" ? "font-bold" : "opacity-60"}
//       >
//         개요
//       </button>
//       <button
//         onClick={() => setTab("siblings")}
//         className={tab === "siblings" ? "font-bold" : "opacity-60"}
//       >
//         원정대
//       </button>
//     </div>

//     <div className="mt-6">
//       {tab === "overview" && <ProfilePanel name={name} />}
//       {tab === "siblings" && <SiblingsTab name={name} />}
//     </div>
//   </div>;
// }

/*
params: Promise<{ name: string }> / React.use(params)

- Next에서 특정 상황(점진적/비동기 props 처리 관련)에서 Promise 형태로 받는 패턴이 예시로 등장하긴 하는데,
- 대부분의 “일반적인 동적 라우트 params”는 Promise가 아니고 그냥 객체로 오는 게 표준에 가까움.

- 게다가 React.use()는 실험적/새 패턴 쪽이라 팀/프로젝트에서 컨벤션이 없으면 오히려 가독성 떨어질 수 있어.




장점 (서버 컴포넌트 기준):

Page 자체가 서버 컴포넌트라면:
번들 가벼움
서버에서 데이터 페치/캐시 전략 적용이 쉬움
SEO/초기 렌더에 유리

단점:
너처럼 탭 상태가 필요하면 Page를 use client로 만들지 말고,
서버 Page에서 params만 처리하고
탭 UI는 별도 클라이언트 컴포넌트로 분리해야 함
*/

/* 
서버컴포넌트로 만들고

같은 폴더에서 client 구현해서 호출하기

브라우저로 JS 번들을 보내지 않는다
서버에서만 실행된다
DB 접근, 비밀 키 사용, 서버 전용 로직 가능
결과는 HTML + RSC payload(React tree 데이터) 로 내려감
*/
