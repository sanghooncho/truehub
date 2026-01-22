import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  ChevronLeft,
  CreditCard,
  Zap,
  Shield,
  Clock,
  CheckCircle2,
  AlertCircle
} from "lucide-react";

export const metadata = {
  title: "크레딧 상품 안내 | TrueHub",
  description: "TrueHub 크레딧을 충전하여 앱 테스터 모집 캠페인을 운영하세요. 신용카드 결제로 즉시 충전, 충전 후 7일 이내 미사용 시 전액 환불 가능.",
};

export default function CreditProductPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 to-white">
      {/* Header */}
      <header className="sticky top-0 z-10 border-b border-slate-100 bg-white/80 backdrop-blur-lg">
        <div className="mx-auto flex h-14 max-w-4xl items-center gap-3 px-4">
          <Link href="/" className="rounded-full p-1 hover:bg-slate-100">
            <ChevronLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <h1 className="text-lg font-semibold text-slate-900">상품 상세</h1>
        </div>
      </header>

      <main className="mx-auto max-w-4xl p-5">
        {/* 상품 이미지 및 기본 정보 */}
        <div className="mb-8 grid gap-8 md:grid-cols-2">
          {/* 상품 이미지 */}
          <div className="flex items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 via-blue-600 to-cyan-500 p-12">
            <div className="text-center text-white">
              <CreditCard className="mx-auto h-24 w-24 mb-4" />
              <h2 className="text-3xl font-bold">TrueHub 크레딧</h2>
              <p className="mt-2 text-blue-100">앱 테스터 모집 캠페인 운영권</p>
            </div>
          </div>

          {/* 상품 정보 */}
          <div className="space-y-6">
            <div>
              <span className="inline-block rounded-full bg-blue-100 px-3 py-1 text-sm font-medium text-blue-700">
                디지털 상품
              </span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900">
                TrueHub 크레딧 충전
              </h1>
              <p className="mt-2 text-slate-600">
                크레딧을 충전하여 앱 테스터 모집 캠페인을 운영하세요.
                테스터의 리뷰 참여가 승인될 때 크레딧이 차감됩니다.
              </p>
            </div>

            <div className="rounded-xl bg-slate-50 p-4">
              <div className="text-sm text-slate-500">판매 가격</div>
              <div className="mt-1 text-3xl font-bold text-slate-900">
                10,000원 ~ 10,000,000원
              </div>
              <p className="mt-1 text-sm text-slate-500">
                원하는 금액을 자유롭게 선택하여 충전
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex items-center gap-3 text-slate-700">
                <Zap className="h-5 w-5 text-amber-500" />
                <span><strong>즉시 충전</strong> - 결제 완료 즉시 크레딧 지급</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Shield className="h-5 w-5 text-green-500" />
                <span><strong>안전 결제</strong> - KG이니시스 결제 시스템</span>
              </div>
              <div className="flex items-center gap-3 text-slate-700">
                <Clock className="h-5 w-5 text-blue-500" />
                <span><strong>유효기간 1년</strong> - 충전일로부터 365일</span>
              </div>
            </div>

            <Button asChild size="lg" className="w-full">
              <Link href="/advertiser/register">
                회원가입 후 크레딧 충전하기
              </Link>
            </Button>
            <p className="text-center text-sm text-slate-500">
              이미 회원이신가요? <Link href="/advertiser/login" className="text-blue-600 hover:underline">로그인</Link>
            </p>
          </div>
        </div>

        {/* 상품 상세 설명 */}
        <div className="space-y-8">
          {/* 상품 설명 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">상품 설명</h3>
              <div className="prose prose-slate max-w-none text-sm">
                <p>
                  TrueHub 크레딧은 앱 테스터 모집 캠페인을 운영하기 위한 디지털 화폐입니다.
                </p>
                <ul className="mt-4 space-y-2">
                  <li>✅ 캠페인 생성 및 테스터 모집에 사용</li>
                  <li>✅ 테스터 참여 승인 시 리워드 금액만큼 차감</li>
                  <li>✅ AI 기반 피드백 분석 리포트 제공</li>
                  <li>✅ 어뷰징 자동 탐지로 신뢰성 있는 리뷰 수집</li>
                </ul>
              </div>
            </CardContent>
          </Card>

          {/* 배송 정보 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">배송 정보</h3>
              <div className="rounded-lg bg-blue-50 p-4">
                <div className="flex items-start gap-3">
                  <CheckCircle2 className="h-5 w-5 text-blue-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-blue-900">디지털 상품 - 즉시 제공</p>
                    <p className="mt-1 text-sm text-blue-700">
                      본 상품은 디지털 상품으로, 결제 완료 즉시 회원 계정에 크레딧이 충전됩니다.
                      별도의 배송 절차가 없으며, 충전된 크레딧은 바로 사용 가능합니다.
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-4 text-sm text-slate-600">
                <p><strong>평균 제공 시간:</strong> 결제 완료 후 즉시 (1분 이내)</p>
                <p className="mt-1"><strong>제공 방법:</strong> 회원 계정 크레딧 월렛에 자동 충전</p>
              </div>
            </CardContent>
          </Card>

          {/* 교환/환불 정보 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">교환 및 환불 규정</h3>

              <div className="space-y-4">
                <div className="rounded-lg bg-green-50 p-4">
                  <h4 className="font-medium text-green-900 flex items-center gap-2">
                    <CheckCircle2 className="h-5 w-5" />
                    환불 가능한 경우
                  </h4>
                  <ul className="mt-2 text-sm text-green-700 space-y-1">
                    <li>• 충전 후 7일 이내, 미사용 크레딧 전액 환불 가능</li>
                    <li>• 서비스 장애로 정상 이용 불가 시</li>
                    <li>• 회사 귀책사유로 서비스 중단 시</li>
                  </ul>
                </div>

                <div className="rounded-lg bg-amber-50 p-4">
                  <h4 className="font-medium text-amber-900 flex items-center gap-2">
                    <AlertCircle className="h-5 w-5" />
                    환불이 제한되는 경우
                  </h4>
                  <ul className="mt-2 text-sm text-amber-700 space-y-1">
                    <li>• 이미 캠페인에 사용(차감)된 크레딧</li>
                    <li>• 충전 후 7일 경과한 크레딧</li>
                    <li>• 유효기간(1년) 경과한 크레딧</li>
                    <li>• 프로모션/이벤트로 무상 지급된 크레딧</li>
                  </ul>
                </div>

                <div className="text-sm text-slate-600">
                  <p><strong>교환:</strong> 디지털 상품 특성상 교환 불가. 금액 변경 필요 시 환불 후 재충전</p>
                  <p className="mt-2"><strong>환불 처리 기간:</strong> 영업일 기준 3~5일</p>
                  <p className="mt-2"><strong>환불 신청:</strong> previewapp@naver.com</p>
                </div>

                <div className="pt-4 border-t">
                  <Link href="/policy/refund" className="text-blue-600 hover:underline text-sm">
                    환불 정책 전문 보기 →
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 결제 수단 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">결제 수단</h3>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <CreditCard className="h-8 w-8 text-blue-600" />
                    <div>
                      <p className="font-medium text-slate-900">신용카드 / 체크카드</p>
                      <p className="text-sm text-slate-500">즉시 결제 및 충전</p>
                    </div>
                  </div>
                </div>
                <div className="rounded-lg border p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded bg-slate-100 text-slate-600 font-bold text-sm">
                      계좌
                    </div>
                    <div>
                      <p className="font-medium text-slate-900">무통장 입금</p>
                      <p className="text-sm text-slate-500">입금 확인 후 충전 (1-2시간)</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* 판매자 정보 */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-bold text-slate-900 mb-4">판매자 정보</h3>
              <div className="text-sm text-slate-600 space-y-2">
                <p><strong>상호명:</strong> 프리뷰</p>
                <p><strong>대표자:</strong> 조상훈</p>
                <p><strong>사업자등록번호:</strong> 659-44-01557</p>
                <p><strong>통신판매업 신고번호:</strong> 제2025-서울광진-1698호</p>
                <p><strong>주소:</strong> 서울특별시 광진구 군자로12길 46, 102동 501호(군자동, 일성파크아파트)</p>
                <p><strong>전화:</strong> 0502-1925-0051</p>
                <p><strong>이메일:</strong> previewapp@naver.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* 하단 CTA */}
        <div className="mt-8 sticky bottom-4">
          <Button asChild size="lg" className="w-full shadow-lg">
            <Link href="/advertiser/register">
              회원가입 후 크레딧 충전하기
            </Link>
          </Button>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-12 border-t bg-slate-50 py-8">
        <div className="mx-auto max-w-4xl px-5 text-center text-sm text-slate-500">
          <p>
            <span className="font-semibold text-slate-600">프리뷰</span> | 대표: 조상훈 | 사업자등록번호: 659-44-01557
          </p>
          <p className="mt-1">통신판매업 신고번호: 제2025-서울광진-1698호</p>
          <p className="mt-1">주소: 서울특별시 광진구 군자로12길 46, 102동 501호</p>
          <p className="mt-1">전화: 0502-1925-0051 | 이메일: previewapp@naver.com</p>
          <p className="mt-4 text-slate-400">&copy; {new Date().getFullYear()} 프리뷰. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
