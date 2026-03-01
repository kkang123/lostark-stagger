# LoaKing - 로아왕 (LostArk)

## 건실한 청년들

로스트아크 무력 정리 사이트를 구현

### 목표

1. 이번 기회의 CI/CD 구현
   - CI = GitHub Actions
   - CD = Vercel(자동 배포) 또는 GitHub Actions로 배포

2. 늘 하던 next 사용
3. 스킬 코드 복붙하여 분당 무력화 계산
4. AI 기술 추가하여 생산성 높히기

### 기술스택

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

shadcn/ui

```bash
npx shadcn@latest init
npx shadcn@latest add dialog # dialog
```

### CI/CD

목표 : PR 올리면 자동으로 lint/typecheck/test/build 돌고, 통과해야 main에 머지 가능

1. CI 워크플로우 생성

   <details>
     <summary>CI 워크플로우 코드</summary>

   ```yml
   name: CI

   on:
   pull_request:
   push:
   branches: [main]

   jobs:
   ci:
   runs-on: ubuntu-latest
   timeout-minutes: 15

       steps:
         - name: Checkout
           uses: actions/checkout@v4

         - name: Setup Node
           uses: actions/setup-node@v4
           with:
             node-version: 20
             cache: "npm"

         - name: Install dependencies
           run: npm ci

         - name: Lint
           run: npm run lint

         - name: Typecheck
           run: npm run typecheck

         - name: Test
           run: npm run test

           <!-- 테스트 있을 때만 실행 -->
           run: npm run test --if-present

         - name: Build
           run: npm run build

   ```

   </details>

2. main 브랜치 깃허브에서 보호(CI를 강제하기)
3. test는 vistest로 처리
4. CD는 vercel으로 처리

5. CI용 스크립트

```json
// package.json
"typecheck": "tsc --noEmit" // TypeScript 타입 에러만 검사

// build에서도 타입 검사를 하지만 타입 체크 + 번들링 + 최적화 + 서버 코드 처리 다 하기 때문에 느림
// tsc --noEmit는 타입만 체크해서 아래와 같이 처리하여 효율적
// lint → typecheck → test → build

"lint": "next lint",
"test": "vitest run",
"test": "vitest run --passWithNoTests" // 테스트 있을 때만 실행
"build": "next build"
```

> GitHub Actions: GitHub 안에서 CI를 돌려주는 실행기(클라우드 러너). PR 생성/업데이트, main에 push 같은 이벤트를 트리거로 워크플로우를 실행함.  
> 확인 방법으로 깃허브 레포 action 탭에서 유무 확인 가능

6. PR 올릴 때 CI 통과해야 머지되게” 막는 설정(중요)

- ✅ Require a pull request before merging
- ✅ Require status checks to pass before merging
- ✅ (목록에서) CI 체크
- (선택) ✅ Require branches to be up to date before merging

7. 해당 플젝에서 토큰을 사용할 시 action에서 Secrets에 env 추가 할 것
   → jwt 토큰 같은 경우에는 현재 API를 호출할 때만 사용하기 때문에 호출 시에만 사용호도록 코드를 분리하면 좋을 것으로 생각

Secret 등록 : 리포지토리 → Settings → 왼쪽 메뉴 → Secrets and variables → Actions → New repository secret → Name: LOSTARK_JWT → Value: (지헌님 JWT 값) → 저장

```yml
# CI 워크플로우에 추가
env:
  LOSTARK_JWT: ${{ secrets.LOSTARK_JWT }}
```

#### jwt 보안 강화

- JWT는 “요청이 들어올 때만” 사용
- next build(CI 빌드) 때는 JWT가 없어도 실패하지 않게
- 클라이언트(브라우저)로 JWT가 절대 노출되지 않게

✅ 클라이언트 → 우리 Next 서버 API(/app/api/...) 호출 → Next 서버가 env(JWT)로 로스트아크 API 호출 → 결과만 클라이언트에 반환

##### 구조 1

`서버 라우트에서만` JWT 사용하고, 클라이언트는 `우리 API`만 호출하기, 서버 컴포넌트에서 `빌드 타임`에 로스트아크 API 직접 호출하지 않기

TanStack Query를 쓰기 때문에 검색 버튼/입력 시 API 호출하도록 구현

#### CI에서 JWT 관련 실패 안 나게 하려면

- JWT를 route.ts에서만 사용
- 클라이언트에서 Lostark API 직접 호출 제거(page.tsx)
- next build 중 외부 API 호출 없음(env 제거 후 npm run build)
- (선택) GitHub Secrets에 LOSTARK_JWT 등록

> CI가 깨지지 않게 하는 핵심은 Secrets가 아니라 빌드 타임에 호출하지 않는 구조다

### AI 라이브러리

1. Agentation

```bash
npm install agentation -D
```

### 초기 디렉토리

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

```csharp
src/
  app/
    layout.tsx
    globals.css

    (site)/
      page.tsx                 // 메인(검색 페이지)
      characters/
        page.tsx               // (선택) 캐릭터 검색 페이지 따로 분리 시

    api/
      lostark/
        characters/
          [characterName]/
            siblings/
              route.ts         // ✅ 외부 API 프록시 (JWT 사용)

  components/
    character/
      CharacterSearchForm.tsx
      SiblingsList.tsx

  lib/
    lostark/
      client.ts                // fetch 래퍼(프론트에서 우리 API 호출)
      types.ts                 // 응답 타입
      queries.ts               // TanStack Query 키/함수
      constants.ts             // base url 등 (선택)

  stores/
    characterSearch.store.ts   // Zustand: 입력값/최근검색 등

  styles/ (선택)
```

## 캐릭터 검색 기능 구현

### 1. 캐릭터 검색 api 연결 하는데 API ERROR 발생

코드상 문제는 없음 업스트림(로스트아크)에서 인증이 거절되어 401 발생 → 토근 재입력하니 해결

```tsx
try {
    const res = await fetch(url, {
      method: "GET",
      headers: {
        // Accept: "application/json",
        // Authorization: `Bearer ${jwt}`,

        accept: "application/json",
        authorization: `bearer ${jwt}`,
        // 공식 가이드 예시가 bearer(소문자)로 안내됨
        // Bearer(대문자)도 보통 동작하지만, 문서대로 가는 게 안전
      },
      // Next 서버에서 외부 API 호출은 캐시 끄는 게 개발 단계에 편함
      cache: "no-store",
    });
}
    // 여기도 굳이 대문자로 바꿀 필요없이 공식문서대로 진행하면 됩니다.
```

### 2. 아이템 레벨 정렬하기

```tsx
const sortedData = [...data].sort(
  (a, b) => parseFloat(b.ItemMaxLevel) - parseFloat(a.ItemMaxLevel),
);
```

- ItemAvgLevel 값이 숫자 문자열이 아니라 1,580.00 처럼 콤마가 포함돼서 parseFloat가 1만 읽어버리는 문제 발생
- 그래서 숫자를 안전 변환 함수를 하나 만들어서 그걸가지고 정렬 진행

```tsx
const toNum = (v: unknown) => {
  if (typeof v !== "string") return Number.NEGATIVE_INFINITY;
  // "1,580.00" 같은 콤마 제거 후 변환
  const n = Number(v.replace(/,/g, ""));
  return Number.isFinite(n) ? n : Number.NEGATIVE_INFINITY;
};

const sortedData = [...data].sort(
  (a, b) => toNum(b.ItemAvgLevel) - toNum(a.ItemAvgLevel),
);
```

- parseFloat("1,580.00") → 1 (콤마에서 끊김) ❌
- Number("1,580.00") → NaN ❌
- Number("1,580.00".replace(/,/g,"")) → 1580 ✅
- 결국 `,` 제거로 `1,580.16`을 `1580.16`으로 제대로 표현 해줌

### 3. 캐릭터 검색 시 닉네임을 url에 끝단에 추가

- 만약 그렇게 구현 시 url을 통해서 검색을 했을 때도 api 호출이 이루어지도록 구현해야하는지?

→ 클라이언트: /api/...만 호출 (fetchSiblings)
→ 서버 Route Handler: 외부 호출 + cache: "no-store" + dynamic="force-dynamic" (route.ts)

- URL이 /char/[name] 형태로 구현 완료 하지만 Next.js(App Router 최신 버전)에서는
  Client Component에서 params가 Promise로 전달될 수 있는데, 그걸 동기적으로 바로 접근했기 때문에 오류가 발생

즉, Client Component(`use client`)일 경우 params를 Promise 형태로 넘겨 줄 수 있는데

```ts
params.name; // ❌ 아직 Promise인데 바로 접근

const { name } = React.use(params); // React.use로 params Promise를 언랩하여 실제 값을 사용한다
```

### 4. Promise 추가 여부에 대하여

| 구분                | 언제 사용                     | 형태     |
| ------------------- | ----------------------------- | -------- |
| `{ params }`        | `page.tsx`, `layout.tsx`, RSC | ✅ 정석  |
| `ctx.params`        | `route.ts` (API)              | ✅ 정석  |
| `params: Promise<>` | 거의 없음                     | ❌ 안 씀 |
| Page에서 `ctx`      | 사용 안 함                    | ❌       |

정석 내용은 이렇다고 하지만`(next 15이후에는 틀린 기준)`

그렇다고 Promise<> ❌, await ❌를 제거하여 의미적으로 명확히하면 아래와 같은 에러가 발생한다.

```tsx
// 정상
export async function GET(
  _req: Request,
  ctx: { params: Promise<{ characterName: string }> }, // Promise로 받기
) {
  const { characterName } = await ctx.params; // await로 unwrap
}

// 에러발생
export async function GET(
  _req: Request,
  ctx: { params: { characterName: string } }, // Promise로 받기
) {
  const { characterName } = ctx.params;
} // await로 unwrap
```

```bash
# 에러
Error: Route "/api/armories/characters/[characterName]/profile" used `params.characterName`. `params` is a Promise and must be unwrapped with `await` or `React.use()` before accessing its properties. Learn more: https://nextjs.org/docs/messages/sync-dynamic-apis
    at GET (app/api/armories/characters/[characterName]/profile/route.ts:10:11)
   8 |   ctx: { params: { characterName: string } },
   9 | ) {
> 10 |   const { characterName } = ctx.params;
     |           ^
  11 |
  12 |   const baseUrl = process.env.LOSTARK_BASE_URL;
  13 |   const jwt = process.env.LOSTARK_JWT?.trim();
 GET /api/armories/characters/%EC%BD%94%EA%BC%AC%EB%A7%9D/profile 400 in 38ms
```

**Next.js 15**부터는 params, searchParams, cookies(), headers() 같은 것들을 **Dynamic APIs**로 분류하고, 비동기(Async)로 바꼈다.

#### 이유 1. 요청 시점에만 안전하게 접근하기 위해

`parmas`는 라우팅 결과라서 그 요청에 종속되는데 Next는 서버에서 프리렌더(빌드 시점)/캐시 / 스트리밍 / 병렬 렌더링을 하면서, 어떤 코드는 요청 스코프 밖에서 잘못 실행될 수 있음

그래서 Next가 아예 동적 API는 async로 강제해서 요청이 진짜 들어온 뒤에 올바른 request scope에 값을 꺼내게 만들어줍니다.

결론은 오류 내용을 보면 런타임에서 실제로 Promise가 넘어오니까 타입을 { params: { characterName: string } }로 두면 “동기 접근”이 되어 버리고 Next가 막아버리기 된다.

- ctx.params(혹은 { params })가 Promise일 수 있으니 await로 풀기

> Promise 일 수도 있으니는 가정하는 말투이지만 코드상에서 감싸는 이유는 실수 방지와 안정성을 위해 감싸주는 것이다.  
> (런타임 동작과 타입을 일치시키기 위해, 실수를 컴파일 단계에서 막기 위해)

| 구분                        | 언제 사용                                         | 형태                                                             |
| --------------------------- | ------------------------------------------------- | ---------------------------------------------------------------- |
| `{ params }`                | `page.tsx`, `layout.tsx`, metadata, route handler | **Next 15에선 `Promise`일 수 있음** ([nextjs.org][1])            |
| `ctx.params` / `{ params }` | `route.ts` (API)                                  | **Promise일 수 있으니 await 권장** ([nextjs.org][1])             |
| `params: Promise<>`         | Next 15의 Dynamic APIs                            | ✅ **이제는 “있을 수 있음(권장될 때도 있음)”** ([nextjs.org][1]) |

###### 정리

- route.ts에서 넘어오는 params는 런타임에서 Promise로 동작함, 그래서 동기 접근(params.characterName)은 에러 발생 반드시 await params로 풀어야 함

### 5. /equipment에서 품질 데이터를 보내주는지 확인 및 데이터 가공 후 그에 맞는 스타일 추가하기

1. fetch 함수에서 console.log 추가하기

```ts
async function fetchCharacterEquipment(name: string): Promise<EquipmentItem[]> {
  const res = await fetch(
    `/api/armories/characters/${encodeURIComponent(name)}/equipment`,
    { cache: "no-store" },
  );

  if (!res.ok) {
    const body = await res.json().catch(() => null);
    const status = body?.status ?? res.status;
    throw new Error(`장비 정보를 불러오지 못했습니다. (status: ${status})`);
  }

  const json = await res.json();

  console.log("equipment raw:", json); // ✅ 여기

  return json;
}
```

2. 데이터 요약은 기존 타입에서 EquipmentItem 그대로 사용하고 상세 정보는 모달로 열 때 tooltip 파싱하는 방식으로, 이때 모달은 shadcn/ui Dialog 사용해서 구현

- 파싱 : `Tooltip` JSON 문자열을 JSON.parse로 객체화
- 정규화/가공 : 여기저기 흩어진 값을 일괄된 값으로 재구성
- 매핑 : 값에 따라 색/등급/라벨 같은 UI 규칙 생성
- 뷰 모델 : 컴포넌트가 바로 렌더링할 수 있는 형태(색상, 텍스트, 숫자 포함)

3. 품질이 없는 아이템 매핑처리하기

API → extract → normalize → UI 정석 아키텍처

<!-- equipment.mapper.ts -->

```ts
function normalizeQuality(q: number | null) {
  if (q === -1) return null;
  return q;
}

// null 값은 존재하지만 안에 값이 의도적으로 없을 때 사용해야하기 때문에 undefined를 사용하면 안된다.
```

4. 장비 데이터 정렬 및 분할 방법은?

새로운 정렬 **규칙** `lib/lostark/equipment.sort.ts` 생성

5. 내구도 오류

분명 무기에서 내구도가 보였던거 같은데 이제는 안 보인다.

그렇게 착각한 이유는 다른 캐릭에서는 보였고 다른 캐릭에서는 안 보였기 때문이다.

원인 분석을 하던 과정 중에 알게 된게 api를 불러올 때 내구도 관련은 `Element_014`만 있는 줄 알아서 하드 코딩을 해놨지만 실제로는 아이템에 따라서 코드 네임이 여러가지가 존재하여서 낮은 장비에서는 보이던 정보가 높은 장비에서는 안 보일 수가 있기 때문이다. 이를 해결하기 위해서는 for문으로 순회하면서
include로 포함되어있는 데이터를 가져오도록 수정하였다.

> 추가적으로 include를 내구도에서는 명확하지만 추가적인 데이터에서는 한계적일 수 있어 TooltipRoot 전체 순회(타입/키워드 기반 추출) 로 전환

### api

✅ 캐릭터 원정대(siblings)

✅ 캐릭터 기본 프로필(armories/characters)

/armories/characters/{name}/equipment → 장비

/armories/characters/{name}/engraving → 각인

/armories/characters/{name}/combat-skills → 스킬

/armories/characters/{name}/cards → 카드

/armories/characters/{name}/gems → 보석
