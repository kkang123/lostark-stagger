# SSR 적용 — ProfilePanel & EquipmentPanel

## 배경

`char/[name]` 페이지는 URL에 캐릭터명이 이미 있으므로 서버에서 데이터를 미리 가져올 수 있다.
기존에는 `ProfilePanel`·`EquipmentPanel` 모두 `useQuery`로 클라이언트에서 API를 호출했다.

---

## 기존 컴포넌트 트리

```
page.tsx (RSC)
└─ CharacterDetailsClient (use client) ← 탭 useState
    ├─ OverviewSection (use client) ← 실제로 클라이언트 코드 없음
    │   ├─ ProfilePanel (use client) ← useQuery → /api/.../profile
    │   └─ EquipmentPanel (use client) ← useQuery → /api/.../equipment + useState(dialog)
    └─ SiblingsTab (use client)
```

---

## 변경 후 렌더링 흐름

```
page.tsx (RSC)
├─ <OverviewSection /> 렌더링 → overviewContent prop으로 전달
└─ CharacterDetailsClient (use client) ← 탭 useState
    ├─ overviewContent (RSC, prop으로 수신)
    │   ├─ <Suspense fallback={<ProfilePanelSkeleton />}>
    │   │   └─ ProfilePanel (RSC, async) ← 서버에서 profile 직접 fetch
    │   └─ <Suspense fallback={<EquipmentPanelSkeleton />}>
    │       └─ EquipmentPanel (RSC, async) ← 서버에서 equipment 직접 fetch
    │           └─ EquipmentPanelClient (use client) ← sorted props + dialog 상태
    └─ SiblingsTab (use client) ← 탭 클릭 시 client fetch (유지)
```

---

## 핵심 패턴: RSC를 use client에 넘기는 방법

`CharacterDetailsClient`(use client)가 `OverviewSection`을 **직접 import** 하면
그 하위 트리 전체가 클라이언트 번들로 오염된다.

**해결책**: `page.tsx`(RSC)에서 렌더링 후 `ReactNode` prop으로 전달.

```tsx
// page.tsx (RSC)
export default async function CharacterDetailsPage({ params }) {
  const decodedName = decodeURIComponent((await params).name);
  return (
    <CharacterDetailsClient
      name={decodedName}
      overviewContent={<OverviewSection name={decodedName} />} // RSC 유지
    />
  );
}

// CharacterDetailsClient.tsx (use client)
type Props = { name: CharacterName; overviewContent: ReactNode };
// OverviewSection import 없음 — prop으로만 수신
```

---

## 신규 모듈: `app/lib/lostark/api/server.ts`

서버 전용 모듈. `import "server-only"`로 클라이언트 번들 포함을 방지한다.

```ts
import "server-only";

// LOSTARK_JWT로 외부 API 직접 호출 (Route Handler 우회)
export function getCharacterProfileServer(
  name: CharacterName,
): Promise<CharacterProfile>;
export function getCharacterEquipmentServer(
  name: CharacterName,
): Promise<EquipmentItem[]>;
```

---

## EquipmentPanel 분리 구조

데이터 페칭과 다이얼로그 인터랙션을 두 레이어로 분리.

| 파일                       | 역할                                                                                              |
| -------------------------- | ------------------------------------------------------------------------------------------------- |
| `EquipmentPanel.tsx`       | RSC, async. 서버에서 fetch → 변환(`toEquipmentUI`, `splitAndSortEquipment`) → Client에 props 전달 |
| `EquipmentPanelClient.tsx` | use client. `sorted` props 받아 렌더링. `useState`(open/selected) + 다이얼로그 관리               |

---

## SiblingsTab — SSR 미적용 (의도적)

원정대 목록은 탭을 열 때 처음 요청되는 구조.
"클릭 전까지 fetch 안 함"이 설계 의도이므로 현행 client fetch 유지.

---

## 적용 결과

- 초기 페이지 로드 시 프로필·장비 데이터가 HTML에 포함되어 내려옴
- JS 비활성화 상태에서도 프로필·장비 렌더링 가능 (순수 SSR)
- `/api/armories/...` 클라이언트 요청 제거 (Network 탭에서 확인)
- `<Suspense>` fallback으로 스트리밍 환경에서도 스켈레톤 자연스럽게 동작

### SSR이 왜 미적용인지?

SiblingsTab SSR 미적용 이유

````md
핵심은 "언제 데이터가 필요한가" 예요.
ProfilePanel → 페이지 열자마자 바로 보임 → SSR 적합
EquipmentPanel → 페이지 열자마자 바로 보임 → SSR 적합
SiblingsTab → 탭을 클릭해야 처음 보임 → SSR 불필요
SSR은 페이지 요청 시점에 서버가 모든 데이터를 fetch해서 HTML에 담아 보내요. 그런데 SiblingsTab은 사용자가 탭을 클릭하기 전까지 화면에 안 보이잖아요.
만약 SSR로 처리하면:
사용자가 페이지 열기
↓
서버가 profile fetch + equipment fetch + siblings fetch (안 볼 수도 있는데 강제로)
↓
HTML 완성
↓
사용자에게 전송
불필요한 API 호출이 생기고, 서버 응답 시간도 늘어나요. 그래서 "클릭할 때 그때 가져오는 게 맞다" 는 설계 의도로 CSR 유지한 거예요.

기존 vs 변경 후 큰 차이
기존 구조의 문제

```md
page.tsx (RSC)
└─ CharacterDetailsClient (use client)
└─ ProfilePanel (use client) ← useQuery
└─ EquipmentPanel (use client) ← useQuery
```

사용자 입장에서 보면:

```md
브라우저: 빈 화면
↓
JS 번들 다운로드
↓
useQuery 실행 → API 호출
↓
로딩 스켈레톤 보임
↓
데이터 도착 → 화면 렌더링
```

변경 후 구조

```md
page.tsx (RSC)
├─ ProfilePanel (RSC, async) ← 서버에서 직접 fetch
└─ EquipmentPanel (RSC, async) ← 서버에서 직접 fetch
└─ EquipmentPanelClient (use client) ← 인터랙션만
```

사용자 입장:

```md
브라우저: 완성된 HTML 수신 (프로필·장비 데이터 포함)
↓
바로 화면 렌더링
↓
(백그라운드에서 JS hydration)
```

두 구조의 핵심 차이 3가지

1. API 호출 위치
   기존변경 후ProfilePanel브라우저 → /api/.../profile서버 → 로스트아크 API 직접EquipmentPanel브라우저 → /api/.../equipment서버 → 로스트아크 API 직접
   기존엔 브라우저 → Next.js Route Handler → 로스트아크 API 이렇게 한 단계 더 거쳤는데, 변경 후엔 서버에서 바로 호출해요.
2. JS 번들 크기
   기존엔 ProfilePanel, EquipmentPanel 코드가 전부 클라이언트 번들에 포함됐어요. 변경 후엔 RSC라서 서버에서만 실행되고 브라우저에 JS 코드 자체가 안 내려가요. EquipmentPanelClient처럼 진짜 인터랙션이 필요한 부분만 번들에 포함되고요.
3. RSC를 use client에 넘기는 패턴
   이게 이번 변경의 가장 중요한 기술적 포인트예요.

```tsx
// 잘못된 방법 - OverviewSection을 직접 import하면
// CharacterDetailsClient가 use client라서
// OverviewSection 하위 트리 전체가 클라이언트 번들로 오염됨
import OverviewSection from "./OverviewSection"; // ❌

// 올바른 방법 - page.tsx(RSC)에서 렌더링해서 prop으로 전달
<CharacterDetailsClient
  overviewContent={<OverviewSection name={decodedName} />} // ✅
/>;
```
````

use client 컴포넌트가 RSC를 직접 import하면 그 RSC도 클라이언트 번들에 포함돼버려요. 하지만 이미 렌더링된 결과물(ReactNode)을 prop으로 받으면 RSC 특성이 유지돼요. 이게 Next.js App Router에서 자주 쓰이는 패턴이에요.

```

```

```

```

## 결론

RSC는 SSR에 구현 방식 중 하나이며

이미 그렇게 구현했고, 현재 스켈레톤 ui가 보이는 이유는 내가 Suspense를 넣었기 때문에 그런 것이고, 새로 고침을 하면 완성된 HTML을 브라우저에 전송하여 화면 렌더링을 진행되게 함

### Suspense를 넣은 이유 (이전 대화 기록 기준)

ProfilePanel, EquipmentPanel을 async function으로 전환하면,  
 React는 해당 컴포넌트가 Promise를 resolve하는 동안 무엇을
보여줄지 알아야 한다. Suspense 경계가 없으면 페이지 전체가  
 데이터를 다 받을 때까지 블록된다.

2. 스트리밍 환경에서의 안전망

계획 문서에 이런 내용이 있었습니다:

SSR 전환 후 초기 로드에는 스켈레톤이 표시되지 않는다
(서버에서 이미 데이터 완성).
<Suspense> fallback으로 기존 스켈레톤 컴포넌트를
재사용하므로, 스트리밍 환경에서도 자연스럽게 동작.

즉, 일반적인 SSR에서는 서버가 데이터를 다 가져온 후 HTML을
내려보내므로 스켈레톤이 실제로 보이지 않는다. 하지만 React
스트리밍(renderToReadableStream) 환경에서는 Suspense 경계
단위로 청크를 순차 전송하기 때문에, 경계가 없으면 스트리밍
이점을 못 쓴다.

---

요약: async RSC가 Promise를 resolve하는 동안 fallback을
제공하기 위한 것이고, 기존 스켈레톤 컴포넌트가 이미 있어서
재사용했습니다. 지금 주석 처리하셨다면 스트리밍을 쓰지 않는
환경에서는 동작상 차이가 없습니다.

## RSC + Suspense 조합

좋은거다 api가 느릴 경우도 있기 때문에

하지만, 내 시점에서는

왜 빠를 때도 스켈레톤이 보이는게 불필요하다고 판단.

이러는 이유는 Next.js가 Suspense를 만나면 API 속도와 관계없이 무조건 스트리밍 모드로 전환하기 때문

```md
Suspense 있음
↓
API 빠르든 느리든 → 스켈레톤 먼저 전송 → 데이터로 교체
```

loading.tsx를 활용해서 파일자체가 일단 Suspense역할을 하는데 api가 느릴 때만 적용되도록함(페이지 단위로 처리하기 때문에 별 차이 없음)

제거하는 방향으로 고려

## Suspense의 역할

Next.js App Router에서 Suspense를 켜는 이유는 TTFB(Time to First Byte) 개선입니다.

- Suspense 없을 때
  - 브라우저 요청  
     → 서버: ProfilePanel API 대기 (예: 300ms)  
     → 서버: EquipmentPanel API 대기 (예: 400ms)  
     → 총 400ms 후 HTML 전송 시작  
    두 API가 끝날 때까지 브라우저는 빈 화면

  - Suspense 있을 때 (스트리밍)
    - 브라우저 요청
      → 즉시: HTML 껍데기 + 스켈레톤 전송 (사용자에게 즉시 보임)
      → 300ms 후: ProfilePanel 스트리밍으로 교체
      → 400ms 후: EquipmentPanel 스트리밍으로 교체

---

이 프로젝트에서 실질적 이점이 있는가?

로스트아크 API가 느릴 때 차이가 남. API 응답이 빠르면(<
100ms) 사용자가 체감하는 차이는 거의 없고

현재 Suspense를 주석 처리하신 게 맞는 판단일 수 있습니다 —
API가 느릴 때만 켜는 게 의미 있고, 지금은 코드를 단순하게
유지하는 게 낫다.

1.  100ms → Suspense 이점 없음, 현재 유지
2.  100~300ms → 체감 경계선, 취향 차이
3.  300ms → Suspense 켜면 사용자가 체감
