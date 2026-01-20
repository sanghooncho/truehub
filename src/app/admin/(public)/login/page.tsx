"use client";

import { useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Shield, KeyRound, Loader2 } from "lucide-react";

type LoginStep = "credentials" | "totp" | "setup";

interface TotpSetupData {
  tempToken: string;
  totpSecret: string;
  totpQrCode: string;
}

export default function AdminLoginPage() {
  const router = useRouter();
  const [step, setStep] = useState<LoginStep>("credentials");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [totpCode, setTotpCode] = useState("");
  const [tempToken, setTempToken] = useState("");
  const [setupData, setSetupData] = useState<TotpSetupData | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleCredentialSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/operator/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "로그인에 실패했습니다");
        return;
      }

      if (data.data.requiresTotp) {
        setTempToken(data.data.tempToken);
        setStep("totp");
      } else if (data.data.requiresTotpSetup) {
        setTempToken(data.data.tempToken);
        setSetupData({
          tempToken: data.data.tempToken,
          totpSecret: data.data.totpSecret,
          totpQrCode: data.data.totpQrCode,
        });
        setStep("setup");
      }
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleTotpSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/operator/verify-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, totpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "인증에 실패했습니다");
        return;
      }

      toast.success("로그인 성공");
      router.push("/admin/dashboard");
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  const handleSetupSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/operator/setup-totp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tempToken, totpCode }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "설정에 실패했습니다");
        return;
      }

      toast.success("2FA 설정 완료");
      router.push("/admin/dashboard");
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <Image
            src="/logo.png"
            alt="TrueHub"
            width={150}
            height={100}
            className="mx-auto mb-2"
            priority
          />
          <CardTitle className="text-xl text-slate-500">Admin</CardTitle>
          <CardDescription>
            {step === "credentials" && "관리자 계정으로 로그인하세요"}
            {step === "totp" && "2단계 인증 코드를 입력하세요"}
            {step === "setup" && "2FA를 설정하세요"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {step === "credentials" && (
            <form onSubmit={handleCredentialSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">이메일</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@truehub.kr"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">비밀번호</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>
              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  "다음"
                )}
              </Button>
            </form>
          )}

          {step === "totp" && (
            <form onSubmit={handleTotpSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="totp">인증 코드</Label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 text-center text-lg tracking-widest"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">
                  Google Authenticator 또는 호환 앱에서 6자리 코드를 입력하세요
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || totpCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    확인 중...
                  </>
                ) : (
                  "로그인"
                )}
              </Button>
              <Button
                type="button"
                variant="ghost"
                className="w-full"
                onClick={() => {
                  setStep("credentials");
                  setTotpCode("");
                }}
              >
                이전으로
              </Button>
            </form>
          )}

          {step === "setup" && setupData && (
            <form onSubmit={handleSetupSubmit} className="space-y-4">
              <div className="rounded-lg bg-slate-50 p-4 text-center">
                <p className="mb-3 text-sm text-slate-600">
                  아래 QR 코드를 Google Authenticator 앱으로 스캔하세요
                </p>
                <img src={setupData.totpQrCode} alt="TOTP QR Code" className="mx-auto h-48 w-48" />
                <div className="mt-3">
                  <p className="text-xs text-slate-500">수동 입력용 시크릿 키:</p>
                  <code className="mt-1 block rounded bg-slate-200 px-2 py-1 font-mono text-xs break-all">
                    {setupData.totpSecret}
                  </code>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="setup-totp">인증 코드 확인</Label>
                <div className="relative">
                  <KeyRound className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
                  <Input
                    id="setup-totp"
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    maxLength={6}
                    placeholder="000000"
                    value={totpCode}
                    onChange={(e) => setTotpCode(e.target.value.replace(/\D/g, ""))}
                    className="pl-10 text-center text-lg tracking-widest"
                    disabled={isLoading}
                    required
                  />
                </div>
                <p className="text-xs text-slate-500">
                  앱에 표시된 6자리 코드를 입력하여 설정을 완료하세요
                </p>
              </div>
              <Button
                type="submit"
                className="w-full"
                disabled={isLoading || totpCode.length !== 6}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    설정 중...
                  </>
                ) : (
                  "2FA 설정 완료"
                )}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
