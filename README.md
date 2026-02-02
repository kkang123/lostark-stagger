# LostArk

## 건실한 청년들

로스트아크 무력 정리 사이트를 구현

### 목표

1. 이번 기회의 CI/CD 구현
   - CI = GitHub Actions
   - CD = Vercel(자동 배포) 또는 GitHub Actions로 배포

2. 늘 하던 next 사용
3. 스킬 코드 복붙하여 분당 무력화 계산

#### 기술스택

- Next.js (App Router)

```bash
npx create-next-app@latest lostark-stagger
```

1번 선택 시

- TypeScript ✅ (타입 안정성)
- ESLint ✅ (코드 스타일/에러 검사)
- Tailwind CSS ✅ (CSS 프레임워크)
- App Router ✅ (Next.js 최신 방식)

React

Tailwind CSS

Zustand: UI 상태(선택 캐릭터/필터/빌드/옵션)

TanStack Query: 서버 데이터 캐싱/리트라이/동기화

```bash
npm install zustand @tanstack/react-query
```

vitest : 테스팅(ci를 위한 용도)

```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```ts
// vitest.config.ts
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    environment: "jsdom",
    globals: true,
    setupFiles: "./vitest.setup.ts",
  },
});

// vitest.setup.ts
import "@testing-library/jest-dom";
```

```json
// package.json
{
  "scripts": {
    "test": "vitest run"
  }
}
```

> npm run test → vitest run

(선택) Zod: API 응답 런타임 검증

```bash
npm install zod
```

(선택) DB: SQLite/Prisma(간단), 또는 Supabase/Postgres(공유/관리 편함)

(선택) 아이콘/UI 보조 라이브러리

```bash
npm install lucide-react
```

(선택) className 유틸 (clsx + tailwind-merge)

```bash
npm install clsx tailwind-merge
```

> 선택은 적용시 선택 제거

#### CI/CD

목표 : PR 올리면 자동으로 lint/typecheck/test/build 돌고, 통과해야 main에 머지 가능

1. CI 워크플로우 생성
2. main 브랜치 깃허브에서 보호(CI를 강제하기)
3. CD는 vercel으로 처리

```json
"typecheck": "tsc --noEmit" // TypeScript 타입 에러만 검사

// build에서도 타입 검사를 하지만 타입 체크 + 번들링 + 최적화 + 서버 코드 처리 다 하기 때문에 느림
// tsc --noEmit는 타입만 체크해서 아래와 같이 처리하여 효율적
// lint → typecheck → test → build
```

#### 디렉토리

```less
src/
  app/
    page.tsx                      // 캐릭터 검색
    characters/[name]/page.tsx     // 형제 캐릭터 선택
    characters/[name]/stagger/page.tsx // 무력 계산기
    api/
      loa/[...path]/route.ts       // 로아 API 프록시
  shared/
    loa/
      client.ts                    // 서버 fetch 래퍼(레이트리밋/에러)
      endpoints.ts                 // 엔드포인트 빌더
      types.ts                     // 응답 타입(zod optional)
    stagger/
      dataset.ts                   // 무력 데이터셋(초기엔 JSON/TS)
      calc.ts                      // 무력/분 계산 로직(순수 함수)
  store/
    useStaggerStore.ts             // zustand
  components/
    CharacterSearch.tsx
    SiblingsList.tsx
    SkillTable.tsx
    RotationBuilder.tsx
    ResultPanel.tsx
```
