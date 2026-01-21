# TrueHub SEO 전략 문서

> 마지막 업데이트: 2026년 1월 21일

---

## 현재 SEO 설정 상태

### 완료된 작업

| 항목 | 파일 | 상태 |
|------|------|------|
| 메타 타이틀/설명 | `layout.tsx` | ✅ 완료 |
| 키워드 메타 태그 | `layout.tsx` | ✅ 완료 |
| Open Graph 태그 | `layout.tsx` | ✅ 완료 |
| OG 이미지 | `layout.tsx` (logo.png 사용) | ✅ 완료 |
| Twitter Card 태그 | `layout.tsx` | ✅ 완료 |
| Canonical URL | `layout.tsx` | ✅ 완료 |
| robots 설정 | `layout.tsx` | ✅ 완료 |
| sitemap.xml | `sitemap.ts` | ✅ 완료 |
| robots.txt | `robots.ts` | ✅ 완료 |
| 테스터 캠페인 페이지 메타 | `tester/(public)/layout.tsx` | ✅ 완료 |
| 광고주 페이지 메타 | `advertiser/layout.tsx` | ✅ 완료 |
| 네이버 인증 코드 | `layout.tsx` | ✅ 완료 |
| Google Search Console 등록 | - | ✅ 완료 |
| Sitemap 제출 (Google) | - | ✅ 완료 |
| **캠페인 페이지 SSR 전환** | `tester/(public)/campaigns/page.tsx` | ✅ 완료 |
| **페이지별 SEO 키워드 분리** | `layout.tsx`, `page.tsx` | ✅ 완료 |
| **홈페이지 SSR 전환** | `page.tsx` | ✅ 완료 |

### 배포 후 해야 할 작업

| 항목 | 상태 | 설명 |
|------|------|------|
| 네이버 서치어드바이저 소유확인 | ✅ 완료 | 2026.01.21 완료 |
| 네이버 Sitemap 제출 | ✅ 완료 | 2026.01.21 19:08 제출 완료 |
| Google 인증 코드 추가 | 📝 선택 | Search Console에서 HTML 태그 인증 시 |

---

## 1. 핵심 키워드 전략 (페이지별 분리)

### 검색 유입 전략

```
┌─────────────────────────────────────────────────────────────┐
│  일반 사용자 (B2C)                                           │
│  "포인트 적립", "리뷰 미션", "앱 테스트 알바"                    │
│                    ↓                                        │
│           /tester/campaigns  ← 메인 SEO 타겟                 │
│                    ↓                                        │
│        캠페인 참여 → 포인트 적립 → 기프티콘 교환                 │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  광고주/기업 (B2B)                                           │
│  "테스터 모집", "앱 피드백", "UX 리서치"                        │
│                    ↓                                        │
│               /  (홈페이지)                                  │
│                    ↓                                        │
│        서비스 이해 → 광고주 가입 → 캠페인 생성                   │
└─────────────────────────────────────────────────────────────┘
```

### 페이지별 타겟 키워드

| 페이지 | 타겟 | 메인 키워드 | 우선순위 |
|--------|------|------------|---------|
| `/tester/campaigns` | B2C (일반 사용자) | 리뷰 미션, 포인트 적립 사이트, 참여형 미션, 기프티콘 교환 | ⭐⭐⭐⭐⭐ |
| `/` | B2B (광고주) | 테스터 모집 플랫폼, 앱 테스트 서비스, AI 피드백 분석 | ⭐⭐⭐⭐ |
| `/advertiser/*` | B2B (광고주) | 테스터 모집, 사용자 피드백 수집, UX 리서치 | ⭐⭐⭐ |

### B2C 연관 키워드 (롱테일) - `/tester/campaigns` 타겟

- 스타벅스 기프티콘 무료
- 편의점 쿠폰 받기
- 앱 체험 리워드
- 미션 포인트 적립
- 앱 테스트 알바
- 리뷰 쓰고 돈 벌기

### B2B 연관 키워드 (롱테일) - `/` 타겟

- 앱 사용성 테스트
- 베타 테스터 모집
- 사용자 피드백 수집
- UX 리서치 플랫폼
- 앱 품질 개선

---

## 2. 페이지별 SEO 설정 현황

### 2.1 메인 랜딩 페이지 (`/`) - B2B 타겟 ⭐

```
Title: TrueHub - 앱 테스터 모집 플랫폼 | AI 기반 사용자 피드백 분석
Description: TrueHub에서 검증된 앱 테스터를 모집하고 실제 사용자 피드백을 받으세요. AI가 분석한 인사이트 리포트로 제품 개선점을 즉시 파악할 수 있습니다.
Canonical: https://truehub.previewapp.co.kr
OG Image: https://truehub.previewapp.co.kr/logo.png
```

**타겟 키워드**: 테스터 모집 플랫폼, 앱 테스트 서비스, 사용자 피드백 수집, AI 피드백 분석, 베타 테스터 모집

**SSR 적용**: ✅ Server Component로 전환 완료
- 정적 콘텐츠는 서버에서 렌더링
- 애니메이션만 클라이언트 컴포넌트로 분리 (`components/landing/`)
- 검색엔진 크롤러가 모든 B2B 키워드를 즉시 인식 가능

**페이지 내 키워드 배치**:
| 위치 | 문구 | 포함 키워드 |
|------|------|------------|
| 배지 | "AI 기반 앱 테스터 모집 플랫폼" | 테스터 모집 플랫폼 |
| H1 | "실제 유저 피드백으로 앱 성장을 가속화하세요" | 유저 피드백 |
| 서브헤딩 | "검증된 앱 테스터를 모집하고 진짜 사용자 피드백을 받으세요" | 앱 테스터 모집, 사용자 피드백 |
| H2 | "간단한 3단계로 테스터 모집 시작" | 테스터 모집 |
| H2 (CTA) | "앱 테스터 모집, TrueHub와 함께하세요" | 앱 테스터 모집 |
| CTA 버튼 | "무료로 테스터 모집 시작하기" | 테스터 모집 |
| Footer | "앱 테스터 모집부터 AI 기반 사용자 피드백 분석까지..." | 테스터 모집, AI 피드백 분석, 베타 테스터 모집, UX 리서치 |

### 2.2 캠페인 목록 페이지 (`/tester/campaigns`) - B2C 메인 타겟 ⭐

```
Title: 리뷰 미션 참여하고 포인트 받기 | 참여형 미션 리워드 플랫폼
Description: 앱 리뷰 미션에 참여하고 포인트를 적립하세요. 적립한 포인트는 스타벅스, 편의점 기프티콘으로 즉시 교환!
Canonical: https://truehub.previewapp.co.kr/tester/campaigns
OG Image: https://truehub.previewapp.co.kr/logo.png
```

**타겟 키워드**: 참여형 미션 사이트, 포인트 적립 사이트, 리뷰 미션, 포인트 기프티콘 교환

**SSR 적용**: ✅ Server Component로 전환 완료
- 서버에서 캠페인 데이터 조회 (Prisma 직접 호출)
- ISR 적용 (`revalidate = 60`)
- 검색엔진 크롤러가 캠페인 목록을 즉시 인식 가능

**페이지 내 키워드 배치**:
| 위치 | 문구 | 포함 키워드 |
|------|------|------------|
| H1 | "리뷰 미션 참여하고 포인트로 기프티콘 교환" | 리뷰 미션, 포인트, 기프티콘 |
| 서브헤딩 | "앱 리뷰 미션에 참여하고 포인트를 적립하세요" | 리뷰 미션, 포인트 적립 |
| 태그 | "#참여형미션 #포인트적립 #리워드플랫폼" | 참여형 미션, 포인트 적립, 리워드 플랫폼 |
| H2 (Footer) | "TrueHub 참여형 미션 리워드 플랫폼" | 참여형 미션, 리워드 플랫폼 |
| 키워드 배지 | "리워드 플랫폼, 참여형 미션 사이트, 포인트 적립 사이트, 리뷰 미션, 포인트 기프티콘 교환" | 모든 B2C 키워드 |

### 2.3 광고주 페이지 (`/advertiser/*`) - B2B 타겟

```
Title: 광고주 | TrueHub - 테스터 모집 플랫폼
Description: TrueHub에서 실제 사용자에게 앱 테스트를 맡기고 진짜 피드백을 받으세요. AI 기반 인사이트 리포트 제공.
OG Image: https://truehub.previewapp.co.kr/logo.png
```

**타겟 키워드**: 테스터 모집 플랫폼, 앱 테스트 서비스, 사용자 피드백 수집

---

## 3. 기술적 SEO 파일 구조

### 캠페인 페이지 컴포넌트 구조 (SSR)

```
src/app/tester/(public)/campaigns/
├── page.tsx              # Server Component (SSR) - 캠페인 데이터 조회
├── campaign-list.tsx     # Client Component - 검색/정렬 인터랙션
└── campaign-skeleton.tsx # 로딩 스켈레톤 UI
```

### sitemap.xml (`/sitemap.xml`)

```
우선순위:
├── 1.0  /                      (홈페이지 - B2B)
├── 0.9  /tester/campaigns      (캠페인 목록 - B2C) ⭐ 메인 타겟
├── 0.8  /advertiser/register   (광고주 가입)
├── 0.7  /tester/login          (테스터 로그인)
├── 0.6  /advertiser/login      (광고주 로그인)
├── 0.3  /policy/terms          (이용약관)
├── 0.3  /policy/privacy        (개인정보처리방침)
└── 0.3  /policy/refund         (환불정책)
```

### robots.txt (`/robots.txt`)

```
User-agent: *
Allow: /

Disallow:
├── /api/
├── /admin/
├── /tester/my/
├── /tester/submit/
├── /tester/rewards/
├── /tester/settings/
├── /tester/giftshop/
├── /advertiser/dashboard/
├── /advertiser/campaigns/
├── /advertiser/credits/
└── /advertiser/settings/

Sitemap: https://truehub.previewapp.co.kr/sitemap.xml
```

---

## 4. 검색엔진 등록 현황

### Google Search Console

| 항목 | 상태 | 비고 |
|------|------|------|
| 속성 등록 | ✅ 완료 | `truehub.previewapp.co.kr` |
| 소유권 인증 | ✅ 완료 | DNS 자동 인증 |
| Sitemap 제출 | ✅ 완료 | 배포 후 크롤링 시작 |

### 네이버 서치어드바이저

| 항목 | 상태 | 비고 |
|------|------|------|
| 사이트 등록 | ✅ 완료 | `truehub.previewapp.co.kr` |
| 인증 코드 | ✅ 추가됨 | `5c4ec70d5959887cbfe6a3325eabe7265950877c` |
| 소유확인 | ✅ 완료 | 2026.01.21 완료 |
| Sitemap 제출 | ✅ 완료 | 2026.01.21 19:08 제출 |

---

## 5. 배포 후 체크리스트

### 즉시 실행

- [x] 네이버 서치어드바이저에서 "소유확인" 클릭 (2026.01.21 완료)
- [x] 네이버에서 Sitemap 제출: `https://truehub.previewapp.co.kr/sitemap.xml` (2026.01.21 19:08 완료)
- [x] `/sitemap.xml` 접근 가능 확인
- [x] `/robots.txt` 접근 가능 확인

### 1주 후 확인

- [ ] Google Search Console에서 색인 상태 확인
- [ ] 네이버 서치어드바이저에서 수집 현황 확인
- [ ] "truehub" 브랜드 검색 시 노출 확인
- [ ] "리뷰 미션", "포인트 적립 사이트" 검색 시 `/tester/campaigns` 노출 확인

### 모니터링 지표

| 지표 | 도구 | 목표 |
|------|------|------|
| 검색 노출수 | Google Search Console | 월 10,000회 이상 |
| 검색 클릭수 | Google Search Console | 월 1,000회 이상 |
| 평균 게재순위 | Google Search Console | 상위 20위 이내 |
| 네이버 검색 유입 | 네이버 애널리틱스 | 월 500회 이상 |

---

## 6. 향후 개선 로드맵

### Phase 1 (완료) ✅
- [x] 메타 태그 최적화
- [x] sitemap.xml 생성
- [x] robots.txt 설정
- [x] OG 이미지 설정
- [x] Google Search Console 등록
- [x] 네이버 인증 코드 추가
- [x] 광고주 페이지 SEO 추가
- [x] **캠페인 페이지 SSR 전환**
- [x] **페이지별 SEO 키워드 분리 (B2B/B2C)**
- [x] **홈페이지 SSR 전환** (2026.01.21)

### Phase 2 (배포 후) ✅
- [x] 네이버 서치어드바이저 소유확인 (2026.01.21 완료)
- [x] 네이버 Sitemap 제출 (2026.01.21 19:08 완료)
- [ ] 검색 노출 모니터링 시작

### Phase 3 (1개월 후)
- [ ] 키워드 순위 분석 및 전략 수정
- [ ] 블로그/콘텐츠 마케팅 검토
- [ ] 백링크 구축 전략

### Phase 4 (3개월 후)
- [ ] A/B 테스트 (타이틀/설명)
- [ ] Core Web Vitals 최적화
- [ ] 구조화 데이터 (JSON-LD) 추가 검토

---

## 7. 파일 위치 참조

```
src/
├── app/
│   ├── layout.tsx                    # 전역 메타데이터 (B2B 키워드), OG, 네이버 인증
│   ├── page.tsx                      # SSR 홈페이지 (B2B 키워드 최적화) ⭐
│   ├── sitemap.ts                    # sitemap.xml 생성
│   ├── robots.ts                     # robots.txt 생성
│   ├── tester/
│   │   └── (public)/
│   │       ├── layout.tsx            # 테스터 페이지 메타데이터 (B2C 키워드)
│   │       └── campaigns/
│   │           ├── page.tsx          # SSR - 캠페인 목록 (B2C 메인 타겟) ⭐
│   │           ├── campaign-list.tsx # Client Component
│   │           └── campaign-skeleton.tsx
│   └── advertiser/
│       └── layout.tsx                # 광고주 페이지 메타데이터 (B2B 키워드)
└── components/
    └── landing/                      # 홈페이지 클라이언트 컴포넌트
        ├── hero-section.tsx          # Hero 애니메이션
        ├── animated-card.tsx         # 카드 애니메이션
        └── cta-button.tsx            # CTA 버튼 애니메이션
```

---

## 8. 주요 URL

- **도메인**: `https://truehub.previewapp.co.kr`
- **Sitemap**: `https://truehub.previewapp.co.kr/sitemap.xml`
- **Robots**: `https://truehub.previewapp.co.kr/robots.txt`
- **OG 이미지**: `https://truehub.previewapp.co.kr/logo.png`
- **B2C 메인 타겟**: `https://truehub.previewapp.co.kr/tester/campaigns`

---

*이 문서는 SEO 작업 진행 상황을 추적하고, 향후 개선 방향을 기록하기 위한 용도입니다.*
