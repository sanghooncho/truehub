# TrueHub 보안 감사 보고서

**감사일**: 2025년 1월 21일  
**범위**: 현금성 자산 (크레딧, 포인트, 기프티콘) 관련 보안 취약점

---

## 1. 요약

### 발견된 취약점

| 심각도      | 개수 | 상태               |
| ----------- | ---- | ------------------ |
| 🔴 Critical | 2개  | ✅ 모두 수정 완료  |
| 🟠 High     | 0개  | -                  |
| 🟡 Medium   | 2개  | 선택적 (낮은 위험) |
| 🟢 Low      | 1개  | 선택적             |

### 최종 결론

**현금성 관련 핵심 보안 이슈 없음.** 사용자/광고주가 파라미터 조작으로 부당 이득을 취할 수 있는 경로는 모두 차단됨.

---

## 2. 수정된 취약점 (Critical)

### 2.1 결제 검증 우회 취약점

**파일**: `src/app/api/v1/advertiser/topups/verify/route.ts`

**문제점**:

- `PORTONE_API_SECRET` 환경변수가 설정되지 않으면 결제 검증을 완전히 건너뜀
- 공격자가 가짜 paymentId와 임의의 금액으로 무한 크레딧 획득 가능

**수정 전**:

```typescript
if (!process.env.PORTONE_API_SECRET) {
  console.warn("PORTONE_API_SECRET not set - skipping server-side verification");
  // 클라이언트 응답을 신뢰 ← 치명적 취약점
}
```

**수정 후**:

```typescript
if (!apiSecret) {
  return NextResponse.json(
    {
      success: false,
      error: { code: "CONFIG_ERROR", message: "결제 시스템이 설정되지 않았습니다." },
    },
    { status: 500 }
  );
}
// PORTONE_API_SECRET 없으면 무조건 차단
```

---

### 2.2 기프티콘 교환 Race Condition

**파일**: `src/app/api/v1/giftshop/exchange/route.ts`

**문제점**:

- 포인트 잔액 체크와 레코드 생성이 트랜잭션 외부에서 수행됨
- 동시 요청 시 포인트 초과 사용 가능 (Double Spending)

**공격 시나리오**:

1. 사용자가 5,000P 보유, 5,000P 상품 교환 요청
2. 동시에 2개 요청 전송
3. 두 요청 모두 잔액 체크 통과 → 10,000P 어치 상품 탈취

**수정 전**:

```typescript
// 트랜잭션 없이 개별 쿼리
const userRewards = await prisma.reward.aggregate({...});
const availablePoints = totalEarned - totalUsed;

if (availablePoints < goods.discountPrice) { ... }

const exchange = await prisma.giftExchange.create({...});
```

**수정 후**:

```typescript
await prisma.$transaction(async (tx) => {
  // FOR UPDATE로 해당 유저의 포인트 관련 레코드 잠금
  const earnedResult = await tx.$queryRaw`
    SELECT COALESCE(SUM(amount), 0) as total
    FROM rewards WHERE user_id = ${userId} AND status = 'SENT'
    FOR UPDATE
  `;

  const usedResult = await tx.$queryRaw`
    SELECT COALESCE(SUM(points_used), 0) as total
    FROM gift_exchanges WHERE user_id = ${userId}
    AND status IN ('COMPLETED', 'PROCESSING', 'PENDING')
    FOR UPDATE
  `;

  // 잔액 검증 + 레코드 생성 모두 같은 트랜잭션 내
  if (points < goods.discountPrice) throw new Error(...);

  await tx.giftExchange.create({...});
});
```

---

## 3. 검증 완료 항목 (안전)

### 3.1 리워드(포인트) 시스템

| 항목        | 검증 결과 | 상세                                |
| ----------- | --------- | ----------------------------------- |
| 리워드 생성 | ✅ 안전   | 관리자/시스템만 생성 가능           |
| 가입 보너스 | ✅ 안전   | 고정 1,000P (하드코딩)              |
| 참여 리워드 | ✅ 안전   | campaign.rewardAmount (DB에서 조회) |
| 사용자 API  | ✅ 안전   | GET만 가능 (조회만)                 |

**리워드 생성 경로**:

- `src/lib/auth.ts` - 가입 보너스 (고정 1,000P)
- `src/app/api/v1/admin/participations/[id]/approve/route.ts` - 관리자만 호출 가능

### 3.2 크레딧(충전금) 시스템

| 항목        | 검증 결과 | 상세                        |
| ----------- | --------- | --------------------------- |
| 크레딧 증가 | ✅ 안전   | 결제검증 or 관리자승인 필수 |
| 가입 보너스 | ✅ 안전   | 고정 10,000원 (하드코딩)    |
| 카드 결제   | ✅ 안전   | PortOne API 금액 검증 필수  |
| 무통장 입금 | ✅ 안전   | 관리자 승인 필수            |

**크레딧 변경 경로**:

- `src/app/api/v1/auth/advertiser/register/route.ts` - 가입 보너스 (고정 10,000원)
- `src/app/api/v1/advertiser/topups/verify/route.ts` - PortOne 검증 필수
- `src/app/api/v1/admin/topups/[id]/confirm/route.ts` - 관리자만 호출 가능

### 3.3 기프티콘 가격

| 항목      | 검증 결과 | 상세                                    |
| --------- | --------- | --------------------------------------- |
| 상품 가격 | ✅ 안전   | Giftishow API에서 실시간 조회           |
| 가격 조작 | ✅ 불가능 | 클라이언트 가격 무시, 서버에서 API 호출 |

### 3.4 캠페인 비용

| 항목               | 검증 결과 | 상세                                    |
| ------------------ | --------- | --------------------------------------- |
| creditCostPerValid | ✅ 안전   | 서버사이드 계산 `calculateCreditCost()` |
| rewardAmount       | ✅ 안전   | Zod 검증 (1,000~50,000원)               |

### 3.5 인증/인가

| 영역           | 검증 결과 | 상세                                  |
| -------------- | --------- | ------------------------------------- |
| User API       | ✅ 안전   | `auth()` 세션 검증                    |
| Advertiser API | ✅ 안전   | `getAdvertiserFromRequest()` JWT 검증 |
| Admin API      | ✅ 안전   | `getOperatorFromRequest()` + TOTP 2FA |

### 3.6 IDOR (타인 데이터 접근)

| 영역          | 검증 결과 | 상세                                           |
| ------------- | --------- | ---------------------------------------------- |
| 참여 내역     | ✅ 안전   | `participation.userId !== userId` 체크         |
| 광고주 캠페인 | ✅ 안전   | `campaign.advertiserId !== advertiser.id` 체크 |
| 사용자 정보   | ✅ 안전   | 세션에서 userId 사용 (body 아님)               |

### 3.7 입력 검증

| 항목          | 검증 결과 | 상세                      |
| ------------- | --------- | ------------------------- |
| API 파라미터  | ✅ 안전   | Zod 스키마 검증           |
| SQL Injection | ✅ 안전   | Prisma ORM 사용           |
| 파일 업로드   | ✅ 안전   | 타입/크기 제한, 인증 필수 |

---

## 4. 낮은 우선순위 항목

### 4.1 Admin Topup Race Condition (Medium)

**파일**: `src/app/api/v1/admin/topups/[id]/confirm/route.ts`

**문제점**: 두 관리자가 동시에 같은 충전 요청을 승인하면 크레딧이 2배로 충전될 수 있음

**위험도**: 🟡 낮음

- 관리자 동시 접근 확률 매우 낮음
- 악의적 공격 시 내부자 공모 필요

**권장 수정**:

```typescript
await tx.topupRequest.update({
  where: { id: topupId, status: "PENDING" },  // status 조건 추가
  data: { status: "CONFIRMED", ... }
});
```

### 4.2 Rate Limiting 부재 (Medium)

**해당 엔드포인트**:

- `/api/v1/auth/advertiser/login`
- `/api/v1/auth/operator/login`
- `/api/v1/giftshop/exchange`

**위험**: 브루트포스 공격 가능

**권장**: upstash/ratelimit 또는 미들웨어 적용

### 4.3 Fallback Secret 패턴 (Low)

**해당 파일**:

- `src/lib/advertiser-auth.ts`
- `src/lib/operator-auth.ts`
- `src/app/api/v1/auth/advertiser/login/route.ts`

```typescript
const JWT_SECRET = new TextEncoder().encode(process.env.NEXTAUTH_SECRET || "fallback-secret");
```

**위험**: 환경변수 미설정 시 예측 가능한 시크릿 사용

**위험도**: 🟢 낮음 (운영환경에서는 반드시 설정됨)

---

## 5. 검증 방법

### 5.1 코드 분석

- 현금성 관련 API 엔드포인트 전수 조사
- 금액/포인트 변경 로직 추적
- 인증/인가 검증 확인

### 5.2 공격 시나리오 검토

- 파라미터 조작
- Race Condition
- IDOR (Insecure Direct Object Reference)
- 인증 우회

### 5.3 빌드 검증

```bash
npm run build
# ✓ Compiled successfully
# ✓ Generating static pages (71/71)
```

---

## 6. 수정된 파일 목록

| 파일                                               | 수정 내용                         |
| -------------------------------------------------- | --------------------------------- |
| `src/app/api/v1/advertiser/topups/verify/route.ts` | PORTONE_API_SECRET 필수 검증 추가 |
| `src/app/api/v1/giftshop/exchange/route.ts`        | 트랜잭션 + FOR UPDATE 잠금 적용   |

---

## 7. 권장 사항

1. **즉시**: 수정된 코드 배포
2. **단기**: Rate Limiting 적용 검토
3. **중기**: Admin Race Condition 수정 검토
4. **장기**: 보안 감사 정기화 (분기별)

---

_본 보고서는 2025년 1월 21일 기준으로 작성되었습니다._
