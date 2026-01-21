"use client";

import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent } from "@/components/ui/card";
import { Loader2, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function PaymentCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("결제 확인 중...");

  useEffect(() => {
    const verifyPayment = async () => {
      const paymentId = searchParams.get("paymentId");
      const code = searchParams.get("code");

      // 결제 실패 또는 취소
      if (code) {
        setStatus("error");
        setMessage(searchParams.get("message") || "결제가 취소되었습니다");
        return;
      }

      if (!paymentId) {
        setStatus("error");
        setMessage("결제 정보를 찾을 수 없습니다");
        return;
      }

      // localStorage에서 금액 정보 가져오기
      const storedAmount = localStorage.getItem("pendingPaymentAmount");
      const storedPaymentId = localStorage.getItem("pendingPaymentId");

      if (!storedAmount || storedPaymentId !== paymentId) {
        setStatus("error");
        setMessage("결제 정보가 일치하지 않습니다");
        return;
      }

      const amount = parseInt(storedAmount);

      try {
        const verifyRes = await fetch("/api/v1/advertiser/topups/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            paymentId,
            amount,
          }),
        });

        const verifyData = await verifyRes.json();

        if (!verifyRes.ok) {
          setStatus("error");
          setMessage(verifyData.error?.message || "결제 확인에 실패했습니다");
          return;
        }

        // 결제 성공 - localStorage 정리
        localStorage.removeItem("pendingPaymentAmount");
        localStorage.removeItem("pendingPaymentId");

        setStatus("success");
        setMessage("크레딧이 충전되었습니다!");
        toast.success("크레딧이 충전되었습니다!");

        // 2초 후 크레딧 페이지로 이동
        setTimeout(() => {
          router.push("/advertiser/credits");
        }, 2000);
      } catch {
        setStatus("error");
        setMessage("결제 처리 중 오류가 발생했습니다");
      }
    };

    verifyPayment();
  }, [searchParams, router]);

  return (
    <div className="mx-auto max-w-lg py-12">
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          {status === "loading" && (
            <>
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <p className="mt-4 text-lg font-medium">{message}</p>
            </>
          )}

          {status === "success" && (
            <>
              <CheckCircle className="h-12 w-12 text-green-500" />
              <p className="mt-4 text-lg font-medium text-green-600">{message}</p>
              <p className="mt-2 text-sm text-slate-500">잠시 후 크레딧 페이지로 이동합니다...</p>
            </>
          )}

          {status === "error" && (
            <>
              <XCircle className="h-12 w-12 text-red-500" />
              <p className="mt-4 text-lg font-medium text-red-600">{message}</p>
              <Button
                className="mt-4"
                onClick={() => router.push("/advertiser/credits/topup")}
              >
                다시 시도하기
              </Button>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
