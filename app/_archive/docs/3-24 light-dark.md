## 라이트 / 다크 모드 토글

### 배경

기존 앱은 다크 테마 고정으로, 모든 색상이 Tailwind 임의값(`#0B0D14`, `#12151E` 등)으로 하드코딩되어 있었다.
라이트 모드를 추가하기 위해 CSS 변수 기반으로 색상 시스템 전환 후 토글 기능 구현.

### 접근 방식

#### 1단계: CSS 변수 정의 (`globals.css`)

`:root`(라이트)와 `.dark`(다크) 두 세트의 시맨틱 색상 변수 정의.

```css
:root {
  --color-bg: #f5f6fa;
  --color-surface: #ffffff;
  --color-surface-elevated: #f0f2f8;
  --color-border: rgba(0, 0, 0, 0.07);
  --color-text-primary: #191f28;
  --color-text-secondary: #4e5968;
  --color-text-tertiary: #8b95a1;
}

.dark {
  --color-bg: #0b0d14;
  --color-surface: #12151e;
  --color-surface-elevated: #1c2030;
  --color-border: rgba(255, 255, 255, 0.07);
  --color-text-primary: #e8ebf5;
  --color-text-secondary: #8b92a9;
  --color-text-tertiary: #636b82;
}
```

Tailwind v4 CSS 변수 참조 문법: `bg-[var(--color-surface)]` → `bg-(--color-surface)` 단축형 사용.

#### 2단계: 15개 컴포넌트 색상 교체

하드코딩된 hex를 CSS 변수로 교체.

| 파일                         | 변경 내용                       |
| ---------------------------- | ------------------------------- |
| `CharacterDetailsClient.tsx` | bg/text 교체 + 토글 버튼 배치   |
| `ProfilePanel.tsx`           | bg/border/text 교체             |
| `EquipmentDetailDialog.tsx`  | bg/border/text 교체             |
| `CharacterSearchForm.tsx`    | input/label/button 색상 교체    |
| `EquipmentPanel.tsx`         | bg/border/text 교체             |
| `EquipmentPanelClient.tsx`   | 헤더 텍스트 색상 교체           |
| `EquipmentRow.tsx`           | bg/border/text 교체             |
| `CardsPanel.tsx`             | bg/border/text + EmptySlot 교체 |
| `CardSetTooltipClient.tsx`   | 툴팁 bg/border/text 교체        |
| `CardSlotClient.tsx`         | 툴팁 bg/border/text 교체        |
| `page.tsx` (홈)              | bg/text 교체 + 토글 버튼 배치   |

#### 3단계: 테마 상태 관리

- `next-themes` 라이브러리 사용 (SSR 플리커 자동 방지)
- `providers.tsx`에 `ThemeProvider` 추가 (`attribute="class"`, `defaultTheme="dark"`)
- `layout.tsx` `<html>`에 `suppressHydrationWarning` 추가
- `ThemeToggleButton.tsx` 신규 생성 — 달/해 SVG 아이콘, `mounted` 상태로 hydration 불일치 방지
- 토글 버튼: 홈 페이지 + 캐릭터 상세 페이지 상단 우측 배치

### 동작

- 토글 버튼 클릭 → `<html>`에 `dark` 클래스 on/off
- 선택한 테마는 `localStorage`에 자동 저장 → 새로고침 후 유지
- SSR 플리커 없음 (next-themes가 스크립트 인젝션으로 처리)

> 다크모드에서 색상에 블루를 섞은 그레이, 블랙 느낌을 주는 방향으로 색감 지정
