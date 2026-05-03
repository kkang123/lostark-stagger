# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 프로젝트 개요 : 로아왕

로스트아크 오픈 API를 사용해 캐릭터 장비·프로필 정보를 조회하는 Next.js 웹 앱.

---

## 기술 스택

| 항목         | 버전/라이브러리                     |
| ------------ | ----------------------------------- |
| Framework    | Next.js 16 (App Router)             |
| Language     | TypeScript 5                        |
| UI           | React 19, Tailwind CSS 4, shadcn/ui |
| Server State | TanStack React Query 5              |
| Client State | Zustand 5                           |
| Test         | Vitest 4, Testing Library           |

---

## 코드 스타일

### TypeScript

- strict 모드 사용, `any` 타입 금지
- `interface` 사용 금지, `type`만 사용
- 리터럴 유니온으로 상태/분류 표현: `type Tab = "overview" | "siblings"`
- Props 타입은 컴포넌트 바로 위에 `type Props = {...}`로 정의

### 컴포넌트

- `export default function` 선언식 사용
- React 컴포넌트: `function` 선언식
- 이벤트 핸들러/콜백: 화살표 함수 + `useCallback`
- 파일 내 헬퍼 함수: `function` 선언식 또는 화살표 함수 혼용 허용

### 파일/폴더 네이밍

| 대상            | 컨벤션                                |
| --------------- | ------------------------------------- |
| 컴포넌트 파일   | PascalCase (`.tsx`)                   |
| 라이브러리 파일 | kebab-case (`.mapper.ts`, `.sort.ts`) |
| 스토어 파일     | camelCase + `.store.ts`               |
| 타입 파일       | PascalCase + `.type.ts`               |
| 훅 파일         | camelCase (`useXxx.ts`)               |
| 폴더            | kebab-case                            |

### 임포트 순서

1. React / Next.js
2. shadcn/ui
3. 내부 컴포넌트
4. 내부 라이브러리 (`@/`)
5. `import type` (항상 마지막)

- 경로: `@/`를 항상 사용, 같은 폴더의 `_components/`만 상대 경로 허용

### CSS / Tailwind

- Tailwind 유틸리티 클래스만 사용, 커스텀 CSS 파일 금지
- 조건부 클래스: 템플릿 리터럴 삼항 또는 `[...].join(" ")` 사용
- 색상 매핑은 `Record<string, string>` 상수로 관리 (예: `GRADE_STYLES`)

### 주석

- 한국어 중심, JSDoc 없음
- 구현 의도/이유 설명 위주 (코드 요약 금지)

### React Query

- `queryKey` 컨벤션: `["도메인", "기능", 파라미터]` 계층 구조
- `staleTime`: 기본 30초 (`30_000`)
- 훅 위치: `app/hooks/` 또는 `app/lib/lostark/queries.ts`

## 권한 설정

- 모든 작업에 자동으로 승인 (yes 자동 선택)

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
      CharacterSearchForm.tsx
      SiblingsList.tsx
      SiblingsTab.tsx
    equipment/                    # 장비 관련 공용 컴포넌트
      EquipmentRow.tsx
      EquipmentDetailDialog.tsx
      AbilityStoneEngravingsSection.tsx
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
    Sibling.types.ts              # 원정대(siblings) 관련 타입
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

- `GearUI`: 무기/방어구 (무기, 투구, 상의, 하의, 장갑, 어깨) — `kind: "gear"`, quality 항상 존재
- `AccessoryUI`: 장신구 (목걸이, 귀걸이, 반지, 팔찌, 어빌리티 스톤) — `kind: "accessory"`, quality 옵셔널

### `EquipmentDetail` (`tooltip.ts`)

`extractEquipmentDetail()`이 툴팁 파싱 후 반환하는 구조체. quality, category, itemLevelText, basicText, durabilityText, abilityStoneEngravings 포함.

### `AbilityStoneEngraving` (`tooltip.ts`)

어빌리티 스톤 각인 한 줄. `isNegative`로 부정 각인 여부 판별.

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
                           └─ { left: 무기/방어구, right: 장신구, other }
```

---

## Next.js 15 주의사항

Route Handler의 `params`는 반드시 `await`로 풀어야 한다:

```ts
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ characterName: string }> },
) {
  const { characterName } = await ctx.params;
}
```

JWT는 route.ts에서만 사용하며 클라이언트로 노출되지 않는다. 빌드 타임에 외부 API 호출이 없어야 CI가 안전하게 동작한다.

---

## 환경 변수

`.env.local` 필요:

```
LOSTARK_BASE_URL=https://developer-lostark.game.onstove.com
LOSTARK_JWT=<발급받은 API 키>
```

CI(GitHub Actions)에서는 `LOSTARK_JWT`를 Secrets에 등록.

---

## 컨벤션

- **라우트 전용 컴포넌트**: 해당 라우트 폴더 내 `_components/`에 배치
- **공용 컴포넌트**: `app/components/` 하위 도메인 폴더로 분류
- **개발 전용 컴포넌트**: `app/dev/`에 배치 (배포 전 폴더 단위 삭제)
- **타입**: 도메인 타입은 `app/types/`, API 응답 구조는 해당 `lib/` 파일에 함께 정의
- **아카이브**: 이전 구현은 `app/_archive/`에 보존 (라우팅 제외)
- **아이템 레벨 수치**: `ItemAvgLevel` 등 콤마 포함 문자열은 `.replace(/,/g, "")` 후 `Number()`로 변환

## Rules

<!-- context7 룰 -->

Always use context7 when I need code generation, setup or configuration steps, or library/API documentation.

<!-- frontend-design -->

UI 작업 시 아래 규칙을 따를 것.

**기술 스택**: React + Next.js + Tailwind CSS v4 + shadcn/ui

**현재 디자인 시스템**

- 다크 테마 고정: bg-[#212225], bg-zinc-950, text-zinc-100
- 등급별 그라데이션 색상 시스템 유지 (고대/유물/전설/영웅)
- 품질 수치 색상 구분 유지 (빨강/라임/파랑/보라/주황)

**디자인 규칙**

- generic 폰트 사용 금지 (Inter, Roboto, Arial, system-ui)
- AI 클리셰 금지 (보라색 그라디언트 + 흰 배경 등)
- 애니메이션은 페이지 로드 시 staggered reveal 위주, micro-interaction 남발 금지
- 배경은 단색보다 gradient mesh, noise texture, geometric pattern 권장

**코드 품질 규칙**

<!-- - console.log 절대 남기지 말 것 -->

- border 중복 사용 금지 (부모/자식 동시 border)
- `<pre>` 태그로 raw 텍스트 표시 금지 — 항상 스타일링된 컴포넌트로 렌더링
- 탭 버튼 배경은 다크 테마와 명확한 대비를 가진 색상 사용

<!-- claude 설정 -->

Always skip confirmation prompts. When asked yes/no, always proceed with yes and don't ask again.

## 작업 제한

### 수정 금지 폴더/파일

- `_archive/` 폴더 내에 있는 파일 및 폴더 수정 금지
