"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import * as PortOne from "@portone/browser-sdk/v2";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { ChevronLeft, Loader2, Copy, Check, CreditCard, Zap, Clock, AlertCircle, CheckCircle2, Shield } from "lucide-react";

interface TopupResult {
  id: string;
  amount: number;
  depositCode: string;
  expiresAt: string;
  bankInfo: {
    bankName: string;
    accountNumber: string;
    accountHolder: string;
    depositMessage: string;
  } | null;
}

const PRESET_AMOUNTS = [50000, 100000, 300000, 500000, 1000000];

export default function TopupPage() {
  const router = useRouter();
  const [amount, setAmount] = useState("");
  const [method, setMethod] = useState<"BANK_TRANSFER" | "CARD">("CARD");
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<TopupResult | null>(null);
  const [copied, setCopied] = useState(false);

  const handleCardPayment = async (numAmount: number) => {
    const paymentId = `topup_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    // 모바일 리다이렉트를 위해 결제 정보 저장
    localStorage.setItem("pendingPaymentAmount", numAmount.toString());
    localStorage.setItem("pendingPaymentId", paymentId);

    try {
      const response = await PortOne.requestPayment({
        storeId: process.env.NEXT_PUBLIC_PORTONE_STORE_ID!,
        channelKey: process.env.NEXT_PUBLIC_PORTONE_CHANNEL_KEY!,
        paymentId,
        orderName: `TrueHub 크레딧 ${numAmount.toLocaleString()}원 충전`,
        totalAmount: numAmount,
        currency: "CURRENCY_KRW",
        payMethod: "CARD",
        customer: {
          fullName: "TrueHub 광고주",
          email: "advertiser@truehub.kr",
          phoneNumber: "01000000000",
        },
        // 모바일 결제를 위한 리다이렉트 URL
        redirectUrl: `${window.location.origin}/advertiser/credits/topup/callback`,
      });

      // 모바일에서는 리다이렉트되므로 여기까지 오지 않음
      // PC에서만 아래 코드 실행

      if (response?.code) {
        // 결제 실패 또는 취소 - localStorage 정리
        localStorage.removeItem("pendingPaymentAmount");
        localStorage.removeItem("pendingPaymentId");

        if (response.code === "FAILURE_TYPE_PG") {
          toast.error(response.message || "결제에 실패했습니다");
        } else {
          toast.error("결제가 취소되었습니다");
        }
        return;
      }

      // 결제 성공 - 서버에 검증 요청
      const verifyRes = await fetch("/api/v1/advertiser/topups/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          paymentId,
          amount: numAmount,
        }),
      });

      const verifyData = await verifyRes.json();

      if (!verifyRes.ok) {
        toast.error(verifyData.error?.message || "결제 확인에 실패했습니다");
        return;
      }

      // 성공 - localStorage 정리
      localStorage.removeItem("pendingPaymentAmount");
      localStorage.removeItem("pendingPaymentId");

      toast.success("크레딧이 충전되었습니다!");
      router.push("/advertiser/credits");
    } catch (error) {
      console.error("Payment error:", error);
      localStorage.removeItem("pendingPaymentAmount");
      localStorage.removeItem("pendingPaymentId");
      toast.error("결제 중 오류가 발생했습니다");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const numAmount = parseInt(amount.replace(/,/g, ""));
    if (isNaN(numAmount) || numAmount < 10000) {
      toast.error("최소 10,000원 이상 충전해야 합니다");
      return;
    }

    if (numAmount > 10000000) {
      toast.error("최대 10,000,000원까지 충전 가능합니다");
      return;
    }

    setIsLoading(true);

    try {
      if (method === "CARD") {
        await handleCardPayment(numAmount);
      } else {
        // 무통장 입금
        const res = await fetch("/api/v1/advertiser/topups", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ amount: numAmount, method }),
        });

        const data = await res.json();

        if (!res.ok) {
          toast.error(data.error?.message || "충전 요청에 실패했습니다");
          return;
        }

        setResult(data.data);
        toast.success("충전 요청이 생성되었습니다");
      }
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const formatAmount = (value: string) => {
    const num = value.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("복사되었습니다");
  };

  if (result) {
    return (
      <div className="mx-auto max-w-lg">
        <div className="mb-6 flex items-center gap-4">
          <Link href="/advertiser/credits">
            <Button variant="ghost" size="icon" className="h-9 w-9">
              <ChevronLeft className="h-5 w-5" />
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-slate-900">충전 요청 완료</h1>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center text-green-600">입금 안내</CardTitle>
            <CardDescription className="text-center">아래 정보로 입금해주세요</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="rounded-lg bg-slate-50 p-4 text-center">
              <p className="text-sm text-slate-500">충전 금액</p>
              <p className="text-3xl font-bold text-slate-900">
                {result.amount.toLocaleString()}원
              </p>
            </div>

            {result.bankInfo && (
              <div className="space-y-4">
                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-slate-500">입금 은행</p>
                    <p className="font-medium">{result.bankInfo.bankName}</p>
                  </div>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-slate-500">계좌번호</p>
                    <p className="font-medium">{result.bankInfo.accountNumber}</p>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => copyToClipboard(result.bankInfo!.accountNumber)}
                  >
                    {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                  </Button>
                </div>

                <div className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="text-sm text-slate-500">예금주</p>
                    <p className="font-medium">{result.bankInfo.accountHolder}</p>
                  </div>
                </div>

                <div className="border-primary/20 bg-primary/5 rounded-lg border p-4">
                  <p className="text-sm text-slate-500">입금자명 (필수)</p>
                  <p className="text-primary text-lg font-bold">{result.depositCode}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    반드시 위 코드를 입금자명으로 입력해주세요
                  </p>
                </div>
              </div>
            )}

            <div className="rounded-lg bg-amber-50 p-4 text-sm text-amber-700">
              <p className="font-medium">주의사항</p>
              <ul className="mt-2 list-inside list-disc space-y-1">
                <li>입금자명을 반드시 코드로 입력해주세요</li>
                <li>입금 확인 후 자동으로 크레딧이 충전됩니다 (영업일 기준 1-2시간 소요)</li>
                <li>유효기간: {new Date(result.expiresAt).toLocaleString("ko-KR")}</li>
              </ul>
            </div>

            <Button className="w-full" onClick={() => router.push("/advertiser/credits")}>
              확인
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <div className="mb-6 flex items-center gap-4">
        <Link href="/advertiser/credits">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
          </Button>
        </Link>
        <h1 className="text-2xl font-bold text-slate-900">크레딧 충전</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>충전 금액 선택</CardTitle>
          <CardDescription>충전할 금액을 선택하거나 직접 입력하세요</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-3 gap-2">
              {PRESET_AMOUNTS.map((preset) => (
                <Button
                  key={preset}
                  type="button"
                  variant={amount === preset.toString() ? "default" : "outline"}
                  onClick={() => setAmount(preset.toString())}
                >
                  {(preset / 10000).toLocaleString()}만원
                </Button>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="amount">직접 입력</Label>
              <div className="relative">
                <Input
                  id="amount"
                  type="text"
                  placeholder="금액 입력"
                  value={formatAmount(amount)}
                  onChange={(e) => setAmount(e.target.value.replace(/,/g, ""))}
                  className="pr-8"
                />
                <span className="absolute top-1/2 right-3 -translate-y-1/2 text-slate-400">원</span>
              </div>
              <p className="text-xs text-slate-500">최소 10,000원 ~ 최대 10,000,000원</p>
            </div>

            <div className="space-y-3">
              <Label>결제 방법</Label>
              <RadioGroup
                value={method}
                onValueChange={(v) => setMethod(v as "BANK_TRANSFER" | "CARD")}
              >
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="CARD" id="card" />
                  <Label htmlFor="card" className="flex-1 cursor-pointer">
                    <span className="flex items-center gap-2 font-medium">
                      <CreditCard className="h-4 w-4" />
                      카드 결제
                    </span>
                    <span className="block text-sm text-slate-500">신용카드/체크카드로 즉시 결제</span>
                  </Label>
                </div>
                <div className="flex items-center space-x-2 rounded-lg border p-4">
                  <RadioGroupItem value="BANK_TRANSFER" id="bank" />
                  <Label htmlFor="bank" className="flex-1 cursor-pointer">
                    <span className="font-medium">무통장 입금</span>
                    <span className="block text-sm text-slate-500">계좌로 직접 입금 (입금 확인 후 충전)</span>
                  </Label>
                </div>
              </RadioGroup>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading || !amount}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  처리 중...
                </>
              ) : (
                "충전 요청하기"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* 상품 정보 */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">상품 정보 - TrueHub 크레딧</CardTitle>
          <CardDescription>앱 테스터 모집 캠페인 운영을 위한 디지털 상품</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="rounded-lg bg-slate-50 p-4">
            <p className="text-sm text-slate-500">판매 가격</p>
            <p className="text-xl font-bold text-slate-900">10,000원 ~ 10,000,000원</p>
            <p className="text-xs text-slate-500 mt-1">원하는 금액을 자유롭게 선택</p>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex items-start gap-3">
              <Zap className="h-5 w-5 text-amber-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">즉시 충전</p>
                <p className="text-slate-500">결제 완료 즉시 크레딧이 계정에 충전됩니다.</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Shield className="h-5 w-5 text-green-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">안전 결제</p>
                <p className="text-slate-500">KG이니시스 결제 시스템으로 안전하게 결제</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-blue-500 mt-0.5" />
              <div>
                <p className="font-medium text-slate-900">유효기간 1년</p>
                <p className="text-slate-500">충전일로부터 365일간 사용 가능합니다.</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 배송 정보 */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">배송 정보</CardTitle>
        </CardHeader>
        <CardContent>
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
          <div className="mt-4 text-sm text-slate-600 space-y-1">
            <p><strong>평균 제공 시간:</strong> 결제 완료 후 즉시 (1분 이내)</p>
            <p><strong>제공 방법:</strong> 회원 계정 크레딧 월렛에 자동 충전</p>
          </div>
        </CardContent>
      </Card>

      {/* 교환 및 환불 규정 */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">교환 및 환불 규정</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
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

          <div className="text-sm text-slate-600 space-y-1">
            <p><strong>교환:</strong> 디지털 상품 특성상 교환 불가. 금액 변경 필요 시 환불 후 재충전</p>
            <p><strong>환불 처리 기간:</strong> 영업일 기준 3~5일</p>
            <p><strong>환불 신청:</strong> previewapp@naver.com</p>
          </div>

          <Link href="/policy/refund" className="text-blue-600 hover:underline text-sm inline-block">
            환불 정책 전문 보기 →
          </Link>
        </CardContent>
      </Card>

      {/* 판매자 정보 */}
      <Card className="mt-4">
        <CardHeader>
          <CardTitle className="text-base">판매자 정보</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-slate-600 space-y-1">
          <p><strong>상호명:</strong> 프리뷰</p>
          <p><strong>대표자:</strong> 조상훈</p>
          <p><strong>사업자등록번호:</strong> 659-44-01557</p>
          <p><strong>통신판매업 신고번호:</strong> 제2025-서울광진-1698호</p>
          <p><strong>주소:</strong> 서울특별시 광진구 군자로12길 46, 102동 501호</p>
          <p><strong>전화:</strong> 0502-1925-0051</p>
          <p><strong>이메일:</strong> previewapp@naver.com</p>
        </CardContent>
      </Card>
    </div>
  );
}
