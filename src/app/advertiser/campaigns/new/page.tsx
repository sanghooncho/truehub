"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { toast } from "sonner";
import { Loader2, ChevronLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";

interface FormData {
  title: string;
  description: string;
  appLinkIos: string;
  appLinkAndroid: string;
  targetCount: string;
  rewardAmount: string;
  creditCostPerValid: string;
  endAt: string;
  question1: string;
  question2: string;
}

interface FormErrors {
  [key: string]: string;
}

export default function NewCampaignPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({
    title: "",
    description: "",
    appLinkIos: "",
    appLinkAndroid: "",
    targetCount: "",
    rewardAmount: "",
    creditCostPerValid: "",
    endAt: "",
    question1: "",
    question2: "",
  });
  const [errors, setErrors] = useState<FormErrors>({});

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    let isValid = true;

    if (formData.title.length < 5 || formData.title.length > 100) {
      newErrors.title = "제목은 5자 이상 100자 이하로 입력해주세요.";
      isValid = false;
    }

    if (formData.description.length < 20 || formData.description.length > 2000) {
      newErrors.description = "설명은 20자 이상 2000자 이하로 입력해주세요.";
      isValid = false;
    }

    const targetCount = Number(formData.targetCount);
    if (isNaN(targetCount) || targetCount < 10 || targetCount > 10000) {
      newErrors.targetCount = "목표 참여자 수는 10명 이상 10,000명 이하로 설정해주세요.";
      isValid = false;
    }

    const rewardAmount = Number(formData.rewardAmount);
    if (isNaN(rewardAmount) || rewardAmount < 1000 || rewardAmount > 50000) {
      newErrors.rewardAmount = "리워드 금액은 1,000원 이상 50,000원 이하로 설정해주세요.";
      isValid = false;
    }

    const creditCost = Number(formData.creditCostPerValid);
    if (isNaN(creditCost) || creditCost < rewardAmount) {
      newErrors.creditCostPerValid = "유효 참여당 비용은 리워드 금액보다 커야 합니다.";
      isValid = false;
    }

    if (!formData.endAt) {
      newErrors.endAt = "종료일을 선택해주세요.";
      isValid = false;
    } else {
      const selectedDate = new Date(formData.endAt);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const maxDate = new Date();
      maxDate.setDate(today.getDate() + 90);

      if (selectedDate <= today) {
        newErrors.endAt = "종료일은 내일 이후여야 합니다.";
        isValid = false;
      }
      if (selectedDate > maxDate) {
        newErrors.endAt = "종료일은 최대 90일 이내로 설정해주세요.";
        isValid = false;
      }
    }

    if (formData.question1.length < 10 || formData.question1.length > 500) {
      newErrors.question1 = "질문 내용은 10자 이상 500자 이하로 입력해주세요.";
      isValid = false;
    }
    if (formData.question2.length < 10 || formData.question2.length > 500) {
      newErrors.question2 = "질문 내용은 10자 이상 500자 이하로 입력해주세요.";
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) {
      toast.error("입력 정보를 확인해주세요.");
      return;
    }

    setIsLoading(true);

    try {
      const payload = {
        title: formData.title,
        description: formData.description,
        appLinkIos: formData.appLinkIos || undefined,
        appLinkAndroid: formData.appLinkAndroid || undefined,
        targetCount: Number(formData.targetCount),
        rewardAmount: Number(formData.rewardAmount),
        creditCostPerValid: Number(formData.creditCostPerValid),
        endAt: new Date(formData.endAt + "T23:59:59").toISOString(),
        questions: [
          { order: 1, text: formData.question1 },
          { order: 2, text: formData.question2 },
        ],
      };

      const res = await fetch("/api/v1/advertiser/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || "캠페인 생성에 실패했습니다.");
      }

      toast.success("캠페인이 성공적으로 생성되었습니다.");
      router.push("/advertiser/campaigns");
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : "오류가 발생했습니다.");
    } finally {
      setIsLoading(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const maxDate = new Date();
  maxDate.setDate(maxDate.getDate() + 90);
  const maxDateStr = maxDate.toISOString().split("T")[0];

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/advertiser/campaigns">
          <Button variant="ghost" size="icon" className="h-9 w-9">
            <ChevronLeft className="h-5 w-5" />
            <span className="sr-only">뒤로가기</span>
          </Button>
        </Link>
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">새 캠페인 만들기</h1>
          <p className="text-sm text-slate-500">
            새로운 광고 캠페인을 생성하고 참여자를 모집하세요.
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <CardTitle>캠페인 정보</CardTitle>
            <CardDescription>캠페인의 기본 정보와 목표를 설정해주세요.</CardDescription>
          </CardHeader>

          <CardContent className="space-y-8">
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900">기본 정보</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">
                    캠페인 제목 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="캠페인 제목을 입력하세요 (5-100자)"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    disabled={isLoading}
                    className={errors.title ? "border-red-500" : ""}
                  />
                  {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="description">
                    캠페인 설명 <span className="text-red-500">*</span>
                  </Label>
                  <Textarea
                    id="description"
                    placeholder="참여자가 수행해야 할 미션과 캠페인에 대한 상세 설명을 입력하세요 (20-2000자)"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    disabled={isLoading}
                    className={`min-h-[120px] ${errors.description ? "border-red-500" : ""}`}
                  />
                  {errors.description && (
                    <p className="text-xs text-red-500">{errors.description}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900">앱스토어 링크 (선택)</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="appLinkIos">iOS 앱스토어 링크</Label>
                  <Input
                    id="appLinkIos"
                    placeholder="https://apps.apple.com/..."
                    value={formData.appLinkIos}
                    onChange={(e) => setFormData({ ...formData, appLinkIos: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="appLinkAndroid">Android 플레이스토어 링크</Label>
                  <Input
                    id="appLinkAndroid"
                    placeholder="https://play.google.com/..."
                    value={formData.appLinkAndroid}
                    onChange={(e) => setFormData({ ...formData, appLinkAndroid: e.target.value })}
                    disabled={isLoading}
                  />
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900">목표 및 예산</h3>
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="targetCount">
                    목표 참여자 수 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="targetCount"
                    type="number"
                    placeholder="100"
                    value={formData.targetCount}
                    onChange={(e) => setFormData({ ...formData, targetCount: e.target.value })}
                    disabled={isLoading}
                    className={errors.targetCount ? "border-red-500" : ""}
                  />
                  {errors.targetCount && (
                    <p className="text-xs text-red-500">{errors.targetCount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="endAt">
                    종료일 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="endAt"
                    type="date"
                    min={today}
                    max={maxDateStr}
                    value={formData.endAt}
                    onChange={(e) => setFormData({ ...formData, endAt: e.target.value })}
                    disabled={isLoading}
                    className={errors.endAt ? "border-red-500" : ""}
                  />
                  {errors.endAt && <p className="text-xs text-red-500">{errors.endAt}</p>}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="rewardAmount">
                    참여자 리워드 (KRW) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="rewardAmount"
                    type="number"
                    placeholder="1000"
                    value={formData.rewardAmount}
                    onChange={(e) => setFormData({ ...formData, rewardAmount: e.target.value })}
                    disabled={isLoading}
                    className={errors.rewardAmount ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-slate-500">
                    참여자에게 지급될 포인트입니다 (1,000 ~ 50,000)
                  </p>
                  {errors.rewardAmount && (
                    <p className="text-xs text-red-500">{errors.rewardAmount}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="creditCostPerValid">
                    유효 참여당 비용 (Credit) <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="creditCostPerValid"
                    type="number"
                    placeholder="1200"
                    value={formData.creditCostPerValid}
                    onChange={(e) =>
                      setFormData({ ...formData, creditCostPerValid: e.target.value })
                    }
                    disabled={isLoading}
                    className={errors.creditCostPerValid ? "border-red-500" : ""}
                  />
                  <p className="text-xs text-slate-500">리워드보다 커야 합니다</p>
                  {errors.creditCostPerValid && (
                    <p className="text-xs text-red-500">{errors.creditCostPerValid}</p>
                  )}
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-sm font-medium text-slate-900">퀴즈 설정</h3>
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="question1">
                    질문 1 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="question1"
                    placeholder="참여자가 답변해야 할 첫 번째 질문을 입력하세요 (10-500자)"
                    value={formData.question1}
                    onChange={(e) => setFormData({ ...formData, question1: e.target.value })}
                    disabled={isLoading}
                    className={errors.question1 ? "border-red-500" : ""}
                  />
                  {errors.question1 && <p className="text-xs text-red-500">{errors.question1}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="question2">
                    질문 2 <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="question2"
                    placeholder="참여자가 답변해야 할 두 번째 질문을 입력하세요 (10-500자)"
                    value={formData.question2}
                    onChange={(e) => setFormData({ ...formData, question2: e.target.value })}
                    disabled={isLoading}
                    className={errors.question2 ? "border-red-500" : ""}
                  />
                  {errors.question2 && <p className="text-xs text-red-500">{errors.question2}</p>}
                </div>
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-end gap-2 border-t bg-slate-50 p-6">
            <Link href="/advertiser/campaigns">
              <Button variant="outline" type="button" disabled={isLoading}>
                취소
              </Button>
            </Link>
            <Button type="submit" disabled={isLoading} className="min-w-[100px]">
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                "캠페인 생성"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
