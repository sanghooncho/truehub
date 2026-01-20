# Design Guide — TrueHub (Reward App Experience Platform)

> Version: MVP 1.0  
> Date: 2026-01-20  
> Target: Frontend Developer (Next.js + Tailwind CSS) & Designer  
> Tone: Clean, Professional, Trustworthy (Reference: Toss, Karrot)

---

## 1. Design Philosophy

### "Clean Utility (정돈된 도구)"

Users use this app to **earn rewards (money)**, so **trust and clear information delivery** are the top priorities. Focus on information hierarchy and number readability rather than flashy graphics.

| Principle | Description |
|-----------|-------------|
| **Trust (신뢰)** | Financial app-level organized UI (Deep Blue, White Space) |
| **Clarity (명확함)** | Emphasize reward amounts and missions most prominently |
| **Speed (속도)** | Minimize unnecessary clicks, provide instant feedback animations |

---

## 2. Color System

Based on Tailwind CSS Slate colors, with brand colors defined as CSS variables.

### 2.1 Brand Colors

| Role | Variable Name | Hex Code | Tailwind Class | Usage |
|------|---------------|----------|----------------|-------|
| Primary | `primary` | `#0052CC` | `bg-primary` | Main buttons, active states, brand logo |
| Secondary | `secondary` | `#00C7BE` | `bg-secondary` | Reward amounts, completion checks, positive states |
| Destructive | `destructive` | `#FF5A5F` | `bg-destructive` | Rejection, deletion, warnings, deadline alerts |
| Background | `background` | `#F8FAFC` | `bg-background` | App-wide background (Slate-50) |
| Surface | `card` | `#FFFFFF` | `bg-card` | Cards, modals, sheets background |

### 2.2 Text Colors

| Role | Hex Code | Tailwind Class | Usage |
|------|----------|----------------|-------|
| Main | `#0F172A` | `text-slate-900` | Titles, important body text |
| Body | `#334155` | `text-slate-700` | Regular body text, input text |
| Muted | `#64748B` | `text-slate-500` | Secondary descriptions, placeholders, disabled |
| Invert | `#FFFFFF` | `text-white` | Text on Primary buttons |

### 2.3 Semantic Colors

```css
/* Status Colors */
--color-success: #10B981;    /* Emerald-500 - Approved, Completed */
--color-warning: #F59E0B;    /* Amber-500 - Pending Review, Caution */
--color-error: #EF4444;      /* Red-500 - Rejected, Error */
--color-info: #3B82F6;       /* Blue-500 - Information */

/* Fraud Score Colors */
--fraud-safe: #10B981;       /* 0-39: Green */
--fraud-review: #F59E0B;     /* 40-69: Yellow */
--fraud-reject: #EF4444;     /* 70+: Red */
```

---

## 3. Typography

### 3.1 Font Family

```css
font-family: 'Pretendard', -apple-system, BlinkMacSystemFont, system-ui, sans-serif;
```

### 3.2 Number Typography

> **CRITICAL:** Always apply `tabular-nums` (monospace numbers) to numeric values (amounts, times) to prevent layout shifts when numbers change.

```css
.font-numeric {
  font-variant-numeric: tabular-nums;
  font-feature-settings: "tnum";
}
```

### 3.3 Type Scale

| Style | Size (Web/Mobile) | Weight | Line Height | Usage |
|-------|-------------------|--------|-------------|-------|
| Display | 24px / 28px | Bold (700) | 1.3 | Page main titles |
| Heading | 18px / 20px | SemiBold (600) | 1.4 | Card titles, section headers |
| Body Large | 16px | Medium (500) | 1.5 | Body text, input fields, button text |
| Body Small | 14px | Regular (400) | 1.5 | Secondary descriptions, list content |
| Caption | 12px | Medium (500) | 1.4 | Tags, timestamps, help text |
| Reward | 20px | Bold (700) | 1.0 | Reward amount emphasis (Secondary Color) |

### 3.4 Tailwind Classes

```html
<!-- Display -->
<h1 class="text-2xl font-bold leading-tight">Page Title</h1>

<!-- Heading -->
<h2 class="text-lg font-semibold">Card Title</h2>

<!-- Body Large -->
<p class="text-base font-medium">Body text</p>

<!-- Body Small -->
<p class="text-sm">Secondary text</p>

<!-- Caption -->
<span class="text-xs font-medium text-slate-500">Timestamp</span>

<!-- Reward Amount -->
<span class="text-xl font-bold text-secondary tabular-nums">5,000P</span>
```

---

## 4. UI Components & Spacing

### 4.1 Layout & Spacing

| Property | Value | Tailwind Class | Note |
|----------|-------|----------------|------|
| Mobile Container | max-w-md | `max-w-md mx-auto` | Mobile-first design |
| Container Padding | 20px | `px-5` | Left/right margins |
| Component Gap | 16px / 24px | `gap-4` / `gap-6` | Between components |
| Section Gap | 32px | `gap-8` | Between sections |
| Card Padding | 16px / 20px | `p-4` / `p-5` | Inside cards |

### 4.2 Cards (Toss Style)

```typescript
// Card Component Specs
const cardStyle = {
  borderRadius: 'rounded-2xl',     // 16px
  shadow: 'shadow-toss',            // Custom: 0 4px 20px -2px rgba(0, 0, 0, 0.08)
  border: 'border border-slate-100', // Very light border
  background: 'bg-white',
  padding: 'p-4 md:p-5',
};
```

```html
<!-- Standard Card -->
<div class="bg-white rounded-2xl shadow-toss border border-slate-100 p-4">
  <!-- Card content -->
</div>

<!-- Elevated Card (for important info) -->
<div class="bg-white rounded-2xl shadow-lg border border-slate-100 p-5">
  <!-- Card content -->
</div>
```

### 4.3 Buttons

#### Primary Button
```html
<button class="
  w-full h-[52px] 
  bg-primary text-white 
  font-semibold text-base
  rounded-xl
  transition-transform
  active:scale-95
  disabled:opacity-50 disabled:cursor-not-allowed
">
  Submit
</button>
```

#### Secondary Button
```html
<button class="
  w-full h-[52px]
  bg-slate-100 text-slate-900
  font-semibold text-base
  rounded-xl
  transition-transform
  active:scale-95
">
  Cancel
</button>
```

#### Ghost Button
```html
<button class="
  px-4 py-2
  text-primary font-medium
  hover:bg-slate-50
  rounded-lg
  transition-colors
">
  Text Action
</button>
```

#### Destructive Button
```html
<button class="
  w-full h-[52px]
  bg-destructive text-white
  font-semibold text-base
  rounded-xl
  transition-transform
  active:scale-95
">
  Reject
</button>
```

### 4.4 Inputs

```html
<!-- Standard Input -->
<input 
  type="text"
  class="
    w-full h-[48px]
    bg-slate-50 
    rounded-xl
    px-4
    text-base text-slate-900
    placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-primary/20
    transition-shadow
  "
  placeholder="Enter text..."
/>

<!-- Textarea -->
<textarea 
  class="
    w-full min-h-[120px]
    bg-slate-50
    rounded-xl
    p-4
    text-base text-slate-900
    placeholder:text-slate-400
    focus:outline-none focus:ring-2 focus:ring-primary/20
    resize-none
  "
  placeholder="Enter feedback..."
></textarea>
```

### 4.5 Badges & Tags

```html
<!-- Status Badge -->
<span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-700">
  Approved
</span>

<!-- Time Badge -->
<span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600">
  <span>⏱️</span> 1분 컷
</span>

<!-- Reward Badge -->
<span class="inline-flex items-center px-3 py-1.5 rounded-full text-sm font-bold bg-secondary/10 text-secondary">
  500P
</span>
```

---

## 5. Screen Wireframes & Specs

### 5.1 [Tester] Campaign List

**Route:** `/tester/campaigns`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ [Logo]                    [🔔] [≡]  │ ← Header (sticky, blur on scroll)
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [⏱️ 1분컷]                   │   │
│  │ 캠페인 타이틀 최대 2줄까지   │   │
│  │ 표시됩니다...                │   │
│  │                      500 P  │   │ ← Reward (right-aligned, mint)
│  │ D-7  ·  23명 남음           │   │
│  └─────────────────────────────┘   │
│                                     │
│  ┌─────────────────────────────┐   │
│  │ [다음 캠페인 카드...]        │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

#### Component Specs

**Header:**
- Logo on left, notification/menu icons on right
- On scroll: `backdrop-blur-lg bg-white/80`
- Height: `h-14`

**Campaign Card:**
```html
<div class="bg-white rounded-2xl shadow-toss border border-slate-100 p-4">
  <!-- Tag -->
  <span class="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium bg-slate-100 text-slate-600 mb-2">
    ⏱️ 1분 컷
  </span>
  
  <!-- Title -->
  <h3 class="text-base font-semibold text-slate-900 line-clamp-2 mb-3">
    캠페인 타이틀 최대 2줄까지 표시됩니다...
  </h3>
  
  <!-- Bottom Row -->
  <div class="flex items-end justify-between">
    <div class="text-sm text-slate-500">
      D-7 · 23명 남음
    </div>
    <span class="text-xl font-bold text-secondary tabular-nums">
      500P
    </span>
  </div>
</div>
```

**States:**
- Completed/Closed campaigns: `opacity-50` with "완료" badge overlay

---

### 5.2 [Tester] Campaign Detail & Submit

**Route:** `/tester/campaigns/[id]`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ [←]  캠페인 상세              [...]  │
├─────────────────────────────────────┤
│                                     │
│  캠페인 타이틀                      │
│                                     │
│  ┌─────────┐  ┌─────────┐          │
│  │  D-7    │  │ 23명    │          │
│  │  남음   │  │ 남음    │          │
│  └─────────┘  └─────────┘          │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  참여 방법                          │
│  ┌─────────────────────────────┐   │
│  │ 1️⃣  앱 설치하기              │   │
│  │ 2️⃣  미션 수행하기            │   │
│  │ 3️⃣  캡처 업로드하기          │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  스크린샷 업로드                    │
│  ┌───────────┐  ┌───────────┐      │
│  │  📷       │  │  📷       │      │
│  │  캡처 1   │  │  캡처 2   │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  질문 1                             │
│  ┌─────────────────────────────┐   │
│  │ 답변 입력...                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  질문 2                             │
│  ┌─────────────────────────────┐   │
│  │ 답변 입력...                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  자유 의견                          │
│  ┌─────────────────────────────┐   │
│  │                             │   │
│  │ 30자 이상 입력해주세요...    │   │
│  │                             │   │
│  └─────────────────────────────┘   │
│                                     │
├─────────────────────────────────────┤
│  ┌─────────────────────────────┐   │ ← Sticky Footer
│  │   제출하고 500P 받기         │   │
│  └─────────────────────────────┘   │
└─────────────────────────────────────┘
```

#### Image Upload Component

```html
<!-- Empty State -->
<div class="
  aspect-square
  bg-slate-50
  rounded-xl
  border-2 border-dashed border-slate-200
  flex flex-col items-center justify-center
  cursor-pointer
  hover:border-primary/50 hover:bg-slate-100
  transition-colors
">
  <span class="text-3xl mb-2">📷</span>
  <span class="text-sm text-slate-500">캡처를 올려주세요</span>
</div>

<!-- Uploaded State -->
<div class="relative aspect-square rounded-xl overflow-hidden">
  <img src="..." class="w-full h-full object-cover" />
  <!-- Success Badge -->
  <div class="absolute top-2 right-2 w-6 h-6 bg-emerald-500 rounded-full flex items-center justify-center">
    <span class="text-white text-xs">✓</span>
  </div>
  <!-- Remove Button -->
  <button class="absolute top-2 left-2 w-6 h-6 bg-black/50 rounded-full flex items-center justify-center">
    <span class="text-white text-xs">✕</span>
  </button>
</div>
```

#### Bottom CTA (Sticky Footer)

```html
<div class="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-100 p-4 pb-safe">
  <button class="
    w-full h-[52px]
    bg-primary text-white
    font-semibold text-base
    rounded-xl
    transition-transform
    active:scale-95
    disabled:opacity-50
  ">
    제출하고 500P 받기
  </button>
</div>
```

> **Note:** Button text should be action + reward oriented: "제출하기" ❌ → "제출하고 500P 받기" ✅

---

### 5.3 [Advertiser] Dashboard

**Route:** `/advertiser/dashboard`

#### Layout Structure
```
┌─────────────────────────────────────┐
│ [Logo]                    [Profile] │
├─────────────────────────────────────┤
│                                     │
│  ┌─────────────────────────────┐   │
│  │  💳 Credit Card Style       │   │ ← Credit Balance Card
│  │                             │   │
│  │           150,000 원        │   │ ← Large balance display
│  │                             │   │
│  │  [충전하기]                 │   │
│  └─────────────────────────────┘   │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  캠페인 현황                        │
│  ┌───────────┐  ┌───────────┐      │
│  │    3      │  │    2      │      │
│  │  진행 중  │  │  검토중   │      │
│  └───────────┘  └───────────┘      │
│  ┌───────────┐  ┌───────────┐      │
│  │   127     │  │    8      │      │
│  │   승인    │  │   반려    │      │
│  └───────────┘  └───────────┘      │
│                                     │
│  ─────────────────────────────────  │
│                                     │
│  최근 활동                          │
│  ┌─────────────────────────────┐   │
│  │ ● 캠페인 A 참여 승인됨      │   │
│  │   2분 전                    │   │
│  ├─────────────────────────────┤   │
│  │ ● 크레딧 50,000원 충전됨    │   │
│  │   1시간 전                  │   │
│  └─────────────────────────────┘   │
│                                     │
└─────────────────────────────────────┘
```

#### Credit Card Component

```html
<div class="
  relative overflow-hidden
  bg-gradient-to-br from-primary to-primary/80
  rounded-2xl
  p-5
  text-white
">
  <!-- Card Pattern (optional) -->
  <div class="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2"></div>
  
  <!-- Label -->
  <p class="text-sm text-white/80 mb-1">보유 크레딧</p>
  
  <!-- Balance -->
  <p class="text-3xl font-bold tabular-nums mb-4">
    150,000<span class="text-lg ml-1">원</span>
  </p>
  
  <!-- Action -->
  <button class="
    px-4 py-2
    bg-white/20 
    rounded-lg
    text-sm font-medium
    hover:bg-white/30
    transition-colors
  ">
    충전하기
  </button>
</div>
```

#### Stats Grid

```html
<div class="grid grid-cols-2 gap-3">
  <div class="bg-white rounded-xl p-4 border border-slate-100">
    <p class="text-2xl font-bold text-slate-900 tabular-nums">3</p>
    <p class="text-sm text-slate-500">진행 중</p>
  </div>
  <div class="bg-white rounded-xl p-4 border border-slate-100">
    <p class="text-2xl font-bold text-amber-500 tabular-nums">2</p>
    <p class="text-sm text-slate-500">검토중</p>
  </div>
  <div class="bg-white rounded-xl p-4 border border-slate-100">
    <p class="text-2xl font-bold text-emerald-500 tabular-nums">127</p>
    <p class="text-sm text-slate-500">승인</p>
  </div>
  <div class="bg-white rounded-xl p-4 border border-slate-100">
    <p class="text-2xl font-bold text-red-500 tabular-nums">8</p>
    <p class="text-sm text-slate-500">반려</p>
  </div>
</div>
```

---

### 5.4 [Admin] Participation Review (Split View)

**Route:** `/admin/participations/[id]`

#### Desktop Layout (Split View)
```
┌────────────────────────────────────────────────────────────────────┐
│ [←] 참여 심사 #P-1234                                      [Admin] │
├────────────────────────────┬───────────────────────────────────────┤
│                            │                                       │
│  Evidence (Scrollable)     │  Action Panel (Sticky)               │
│                            │                                       │
│  ┌──────────────────────┐  │  Fraud Score                         │
│  │                      │  │  ┌─────────────────────────────────┐ │
│  │   Screenshot 1       │  │  │  ████████░░░░░░░░░░  42점       │ │
│  │   (Click to zoom)    │  │  │  [REVIEW 필요]                  │ │
│  │                      │  │  └─────────────────────────────────┘ │
│  └──────────────────────┘  │                                       │
│                            │  Fraud Signals                        │
│  ┌──────────────────────┐  │  ┌─────────────────────────────────┐ │
│  │                      │  │  │ ⚠️ 유사 이미지 감지 (+15)        │ │
│  │   Screenshot 2       │  │  │ ⚠️ 동일 기기 반복 (+12)         │ │
│  │                      │  │  └─────────────────────────────────┘ │
│  └──────────────────────┘  │                                       │
│                            │  ─────────────────────────────────── │
│  질문 1                    │                                       │
│  사용자 답변 내용...       │  User Info                            │
│                            │  ┌─────────────────────────────────┐ │
│  질문 2                    │  │ ID: U-5678                      │ │
│  사용자 답변 내용...       │  │ Provider: Kakao                 │ │
│                            │  │ 이전 참여: 12건                 │ │
│  자유 의견                 │  └─────────────────────────────────┘ │
│  사용자가 작성한 피드백    │                                       │
│  내용이 여기 표시됩니다... │  ─────────────────────────────────── │
│                            │                                       │
│                            │  ┌─────────────────────────────────┐ │
│                            │  │      승인 (A)                   │ │ ← Blue
│                            │  └─────────────────────────────────┘ │
│                            │  ┌─────────────────────────────────┐ │
│                            │  │      반려 (R)                   │ │ ← Red
│                            │  └─────────────────────────────────┘ │
│                            │                                       │
└────────────────────────────┴───────────────────────────────────────┘
        50%                              50%
```

#### Fraud Score Display

```html
<!-- Score Bar -->
<div class="space-y-2">
  <div class="flex items-center justify-between">
    <span class="text-sm font-medium text-slate-700">Fraud Score</span>
    <span class="text-lg font-bold tabular-nums text-amber-500">42점</span>
  </div>
  
  <!-- Progress Bar -->
  <div class="h-2 bg-slate-100 rounded-full overflow-hidden">
    <div 
      class="h-full bg-amber-500 rounded-full transition-all"
      style="width: 42%"
    ></div>
  </div>
  
  <!-- Decision Badge -->
  <span class="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
    REVIEW 필요
  </span>
</div>
```

#### Score Color Logic

```typescript
function getFraudScoreColor(score: number) {
  if (score < 40) return {
    bar: 'bg-emerald-500',
    badge: 'bg-emerald-100 text-emerald-700',
    text: 'text-emerald-500',
    label: 'PASS'
  };
  if (score < 70) return {
    bar: 'bg-amber-500',
    badge: 'bg-amber-100 text-amber-700',
    text: 'text-amber-500',
    label: 'REVIEW'
  };
  return {
    bar: 'bg-red-500',
    badge: 'bg-red-100 text-red-700',
    text: 'text-red-500',
    label: 'REJECT'
  };
}
```

#### Action Buttons with Keyboard Hints

```html
<div class="space-y-3">
  <button class="
    w-full h-[48px]
    bg-primary text-white
    font-semibold
    rounded-xl
    flex items-center justify-center gap-2
    transition-transform active:scale-95
  ">
    <span>승인</span>
    <kbd class="px-1.5 py-0.5 bg-white/20 rounded text-xs">A</kbd>
  </button>
  
  <button class="
    w-full h-[48px]
    bg-destructive text-white
    font-semibold
    rounded-xl
    flex items-center justify-center gap-2
    transition-transform active:scale-95
  ">
    <span>반려</span>
    <kbd class="px-1.5 py-0.5 bg-white/20 rounded text-xs">R</kbd>
  </button>
</div>
```

---

## 6. Animation & Interaction

### 6.1 Micro-interactions

```css
/* Button Press */
.btn-press {
  transition: transform 0.1s ease;
}
.btn-press:active {
  transform: scale(0.95);
}

/* Fade In Up (for list items) */
@keyframes fade-in-up {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
.animate-fade-in-up {
  animation: fade-in-up 0.3s ease-out forwards;
}

/* Skeleton Loading */
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.skeleton {
  background: linear-gradient(90deg, #f1f5f9 25%, #e2e8f0 50%, #f1f5f9 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}
```

### 6.2 Toast Notifications

```html
<!-- Success Toast -->
<div class="
  fixed bottom-20 left-1/2 -translate-x-1/2
  px-4 py-3
  bg-slate-900 text-white
  rounded-xl
  shadow-lg
  flex items-center gap-2
  animate-fade-in-up
">
  <span class="text-emerald-400">✓</span>
  <span class="text-sm font-medium">제출이 완료되었습니다</span>
</div>

<!-- Error Toast -->
<div class="
  fixed bottom-20 left-1/2 -translate-x-1/2
  px-4 py-3
  bg-red-500 text-white
  rounded-xl
  shadow-lg
  flex items-center gap-2
">
  <span>⚠️</span>
  <span class="text-sm font-medium">오류가 발생했습니다</span>
</div>
```

---

## 7. Responsive Breakpoints

```typescript
// Tailwind default breakpoints
const breakpoints = {
  sm: '640px',   // Large phones
  md: '768px',   // Tablets
  lg: '1024px',  // Laptops
  xl: '1280px',  // Desktops
  '2xl': '1536px', // Large desktops
};

// Usage patterns
// Mobile: default (no prefix)
// Tablet: md:
// Desktop: lg:
```

### Layout Strategy

| Screen | Tester | Advertiser | Admin |
|--------|--------|------------|-------|
| Mobile | Single column, bottom nav | Single column, sidebar hidden | Not optimized (redirect to desktop) |
| Tablet | Single column, wider cards | Sidebar + content | Split view (stacked) |
| Desktop | Max-width container | Full sidebar + content | Split view (side by side) |

---

## 8. Tailwind Configuration

```typescript
// tailwind.config.ts

import type { Config } from "tailwindcss";

const config = {
  darkMode: ["class"],
  content: [
    './pages/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './app/**/*.{ts,tsx}',
    './src/**/*.{ts,tsx}',
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      fontFamily: {
        sans: ["var(--font-pretendard)", "sans-serif"],
        mono: ["var(--font-roboto-mono)", "monospace"],
      },
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "#0052CC",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#00C7BE",
          foreground: "#FFFFFF",
        },
        destructive: {
          DEFAULT: "#FF5A5F",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F1F5F9",
          foreground: "#64748B",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#0F172A",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        'toss': '0 4px 20px -2px rgba(0, 0, 0, 0.08)',
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translateY(10px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "shimmer": {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "fade-in-up": "fade-in-up 0.3s ease-out forwards",
        "shimmer": "shimmer 1.5s infinite",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;

export default config;
```

---

## 9. CSS Variables (globals.css)

```css
/* src/app/globals.css */

@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 210 40% 98%; /* #F8FAFC */
    --foreground: 222 47% 11%; /* #0F172A */
    
    --card: 0 0% 100%;
    --card-foreground: 222 47% 11%;
    
    --primary: 214 100% 40%; /* #0052CC */
    --primary-foreground: 0 0% 100%;
    
    --secondary: 177 100% 39%; /* #00C7BE */
    --secondary-foreground: 0 0% 100%;
    
    --destructive: 358 100% 68%; /* #FF5A5F */
    --destructive-foreground: 0 0% 100%;
    
    --muted: 210 40% 96%;
    --muted-foreground: 215 16% 47%;
    
    --border: 214 32% 91%;
    --input: 214 32% 91%;
    --ring: 214 100% 40%;
    
    --radius: 1rem; /* 16px */
  }
}

@layer base {
  * {
    @apply border-border;
  }
  body {
    @apply bg-background text-foreground;
    font-feature-settings: "rlig" 1, "calt" 1;
  }
}

/* Utility Classes */
@layer utilities {
  .tabular-nums {
    font-variant-numeric: tabular-nums;
  }
  
  .pb-safe {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .skeleton {
    @apply bg-gradient-to-r from-slate-100 via-slate-200 to-slate-100;
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
  }
}
```

---

## 10. Component Library Recommendations

### Recommended: shadcn/ui

```bash
npx shadcn-ui@latest init
npx shadcn-ui@latest add button card input textarea badge dialog toast
```

### Additional Libraries

| Purpose | Library | Usage |
|---------|---------|-------|
| Icons | `lucide-react` | UI icons |
| Date Picker | `react-day-picker` | Campaign end date |
| Image Upload | `react-dropzone` | Screenshot upload |
| Charts | `recharts` | AI Insights charts |
| Toast | `sonner` | Notifications |

---

## 11. Accessibility Checklist

- [ ] All interactive elements have `focus:ring` states
- [ ] Color contrast ratio ≥ 4.5:1 for text
- [ ] Touch targets ≥ 44x44px on mobile
- [ ] Form inputs have associated labels
- [ ] Loading states announced to screen readers
- [ ] Keyboard navigation supported (Tab, Enter, Escape)
- [ ] Admin shortcuts (A/R) have visible hints

---

*End of Design Guide Document*
