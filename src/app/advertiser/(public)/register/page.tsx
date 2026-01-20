"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function AdvertiserRegisterPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    passwordConfirm: "",
    companyName: "",
    contactName: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.passwordConfirm) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    if (formData.password.length < 8) {
      toast.error("비밀번호는 8자 이상이어야 합니다.");
      return;
    }

    if (!/[A-Z]/.test(formData.password)) {
      toast.error("비밀번호에 대문자를 포함해주세요.");
      return;
    }

    if (!/[0-9]/.test(formData.password)) {
      toast.error("비밀번호에 숫자를 포함해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/v1/auth/advertiser/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password,
          companyName: formData.companyName,
          contactName: formData.contactName || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMessages: Record<string, string> = {
          AUTH_EMAIL_EXISTS: "이미 등록된 이메일입니다.",
          VALIDATION_ERROR: "입력 정보를 확인해주세요.",
        };
        toast.error(errorMessages[data.error?.code] || "회원가입에 실패했습니다.");
        return;
      }

      toast.success("회원가입이 완료되었습니다!");
      router.push("/advertiser/login");
    } catch {
      toast.error("오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <main className="flex flex-1 flex-col items-center justify-center px-5 py-10">
        <div className="w-full max-w-md">
          <div className="mb-8 text-center">
            <Image
              src="/logo.png"
              alt="TrueHub"
              width={180}
              height={120}
              className="mx-auto mb-3"
              priority
            />
            <p className="text-base text-slate-500">광고주 회원가입</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">이메일</Label>
              <Input
                id="email"
                type="email"
                placeholder="email@company.com"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">비밀번호</Label>
              <Input
                id="password"
                type="password"
                placeholder="8자 이상, 대문자와 숫자 포함"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="passwordConfirm">비밀번호 확인</Label>
              <Input
                id="passwordConfirm"
                type="password"
                placeholder="비밀번호를 다시 입력해주세요"
                value={formData.passwordConfirm}
                onChange={(e) => setFormData({ ...formData, passwordConfirm: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="companyName">회사명</Label>
              <Input
                id="companyName"
                type="text"
                placeholder="회사명"
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="contactName">담당자명 (선택)</Label>
              <Input
                id="contactName"
                type="text"
                placeholder="담당자명"
                value={formData.contactName}
                onChange={(e) => setFormData({ ...formData, contactName: e.target.value })}
                disabled={isLoading}
              />
            </div>
            <Button type="submit" className="h-[52px] w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  가입 중...
                </>
              ) : (
                "가입하기"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-slate-500">
            이미 계정이 있으신가요?{" "}
            <Link href="/advertiser/login" className="text-primary font-medium hover:underline">
              로그인
            </Link>
          </p>
        </div>
      </main>
    </div>
  );
}
