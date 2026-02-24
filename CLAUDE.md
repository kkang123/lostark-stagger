# CLAUDE.md

## 프로젝트 개요

로스트아크 오픈 API를 사용해 캐릭터 장비·프로필 정보를 조회하는 Next.js 웹 앱.

---

## 기술 스택

| 항목 | 버전/라이브러리 |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript 5 |
| UI | React 19, Tailwind CSS 4, shadcn/ui |
| Server State | TanStack React Query 5 |
| Client State | Zustand 5 |
| Test | Vitest 4, Testing Library |

---

## 개발 명령어

```bash
npm run dev        # 개발 서버
npm run build      # 프로덕션 빌드
npm run typecheck  # 타입 체크 (tsc --noEmit)
npm run lint       # ESLint
npm run test       # Vitest (passWithNoTests)
```

---

## 경로 alias

```
@/* → ./app/*
```

예: `@/components/ui/button` → `app/components/ui/button.tsx`

shadcn/ui 컴포넌트도 `app/components/ui/`에 위치한다 (`components.json` 참고).

---

## 폴더 구조

```
app/
  (app)/                          # Next.js 라우트 그룹 (URL에 영향 없음)
    char/[name]/
      page.tsx                    # 캐릭터 상세 페이지 (RSC)
      CharacterDetailsClient.tsx  # 탭(능력치/원정대) 관리 Client Component
      _components/                # 이 라우트 전용 컴포넌트
        OverviewSection.tsx
        EquipmentPanel.tsx
        ProfilePanel.tsx
    page.tsx                      # 메인(검색) 페이지

  api/                            # Next.js Route Handlers (프록시 역할)
    armories/characters/[characterName]/
      equipment/route.ts          # GET /api/armories/characters/:name/equipment
      profile/route.ts            # GET /api/armories/characters/:name/profile
    characters/[characterName]/
      siblings/route.ts           # GET /api/characters/:name/siblings

  components/                     # 공용 컴포넌트
    character/                    # 캐릭터 관련 공용 컴포넌트
    equipment/                    # 장비 관련 공용 컴포넌트
    ui/                           # shadcn/ui 컴포넌트

  dev/                            # 개발 전용 컴포넌트 (배포 전 삭제)
    AgentationClient.tsx

  hooks/                          # React Query 훅
    useCharacterEquipmentQuery.ts

  lib/
    lostark/
      api/
        http.ts                   # fetchJson 유틸 (공통 fetch 래퍼)
        armories.ts               # API 호출 함수 (getCharacterEquipment 등)
      tooltip.ts                  # 로스트아크 툴팁 JSON 파싱 (extractEquipmentDetail)
      equipment.mapper.ts         # EquipmentItem → EquipmentUI 변환 (toEquipmentUI)
      equipment.sort.ts           # 장비 슬롯 정렬/분류 (splitAndSortEquipment)
      itemLabel.ts                # 장비 표시 라벨 관련
      queries.ts                  # useSiblings React Query 훅
      client.ts                   # fetchSiblings 등 클라이언트 fetch 함수
    utils.ts                      # shadcn/ui cn() 유틸

  stores/
    characterSearch.store.ts      # Zustand: 캐릭터 검색어 상태

  types/
    Equipment.type.ts             # EquipmentItem, EquipmentUI, GearUI, AccessoryUI
    character.type.ts             # CharacterName

  _archive/                       # 과거 구현 백업 (라우팅에서 제외됨, 참고용)

  providers.tsx                   # React Query Provider 등
  layout.tsx                      # 루트 레이아웃
  globals.css
```

---

## 주요 타입

### `EquipmentItem` (API 원본)
로스트아크 API에서 받은 원본 장비 데이터. `Tooltip` 필드가 JSON 문자열.

### `EquipmentUI` = `GearUI | AccessoryUI`
- `GearUI`: 무기/방어구 (무기, 투구, 상의, 하의, 장갑, 어깨)
- `AccessoryUI`: 장신구 (목걸이, 귀걸이, 반지, 팔찌, 어빌리티 스톤)

### `EquipmentDetail` (`tooltip.ts`)
`extractEquipmentDetail()`이 툴팁 파싱 후 반환하는 구조체.

---

## 데이터 흐름

```
로스트아크 API
  └─ app/api/.../route.ts (프록시, JWT 숨김)
       └─ app/lib/lostark/api/armories.ts (fetchJson 호출)
            └─ app/hooks/useCharacterEquipmentQuery.ts (React Query)
                 └─ EquipmentPanel.tsx (UI 렌더링)
                      ├─ toEquipmentUI() (equipment.mapper.ts)
                      └─ splitAndSortEquipment() (equipment.sort.ts)
```

---

## 환경 변수

`.env.local` 필요:

```
LOSTARK_BASE_URL=https://developer-lostark.game.onstove.com
LOSTARK_JWT=<발급받은 API 키>
```

---

## 컨벤션

- **라우트 전용 컴포넌트**: 해당 라우트 폴더 내 `_components/`에 배치
- **공용 컴포넌트**: `app/components/` 하위 도메인 폴더로 분류
- **개발 전용 컴포넌트**: `app/dev/`에 배치 (배포 전 폴더 단위 삭제)
- **React Query 훅**: `app/hooks/` 또는 `app/lib/lostark/queries.ts`
- **타입**: 도메인 타입은 `app/types/`, API 응답 구조는 해당 `lib/` 파일에 함께 정의
- **아카이브**: 이전 구현은 `app/_archive/`에 보존 (라우팅 제외)