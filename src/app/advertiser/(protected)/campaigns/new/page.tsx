"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { toast } from "sonner";
import { Loader2, ChevronLeft, Upload, X } from "lucide-react";
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
  endAt: string;
  question1: string;
  question2: string;
  screenshot1Mission: string;
  screenshot2Mission: string;
  screenshot1RefKey: string;
  screenshot2RefKey: string;
}

interface RefImageState {
  file: File | null;
  preview: string;
  key: string;
  uploading: boolean;
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
    endAt: "",
    question1: "",
    question2: "",
    screenshot1Mission: "",
    screenshot2Mission: "",
    screenshot1RefKey: "",
    screenshot2RefKey: "",
  });
  const [refImage1, setRefImage1] = useState<RefImageState>({
    file: null,
    preview: "",
    key: "",
    uploading: false,
  });
  const [refImage2, setRefImage2] = useState<RefImageState>({
    file: null,
    preview: "",
    key: "",
    uploading: false,
  });
  const fileInput1Ref = useRef<HTMLInputElement>(null);
  const fileInput2Ref = useRef<HTMLInputElement>(null);
  const [errors, setErrors] = useState<FormErrors>({});

  const uploadRefImage = async (
    file: File,
    slot: 1 | 2,
    setRefImage: React.Dispatch<React.SetStateAction<RefImageState>>
  ) => {
    setRefImage((prev) => ({ ...prev, uploading: true }));

    try {
      const presignedRes = await fetch("/api/v1/advertiser/uploads/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      const presignedData = await presignedRes.json();

      if (!presignedData.success) {
        throw new Error("Failed to get upload URL");
      }

      const uploadRes = await fetch(presignedData.data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload image");
      }

      const key = presignedData.data.key;
      setRefImage({ file, preview: URL.createObjectURL(file), key, uploading: false });
      setFormData((prev) => ({
        ...prev,
        [`screenshot${slot}RefKey`]: key,
      }));
      toast.success(`참조 이미지 ${slot} 업로드 완료`);
    } catch (error) {
      console.error(error);
      toast.error("이미지 업로드에 실패했습니다");
      setRefImage((prev) => ({ ...prev, uploading: false }));
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, slot: 1 | 2) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("이미지 파일만 업로드 가능합니다");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("파일 크기는 10MB 이하여야 합니다");
      return;
    }

    const setRefImage = slot === 1 ? setRefImage1 : setRefImage2;
    uploadRefImage(file, slot, setRefImage);
  };

  const removeRefImage = (slot: 1 | 2) => {
    if (slot === 1) {
      if (refImage1.preview) URL.revokeObjectURL(refImage1.preview);
      setRefImage1({ file: null, preview: "", key: "", uploading: false });
      setFormData((prev) => ({ ...prev, screenshot1RefKey: "" }));
      if (fileInput1Ref.current) fileInput1Ref.current.value = "";
    } else {
      if (refImage2.preview) URL.revokeObjectURL(refImage2.preview);
      setRefImage2({ file: null, preview: "", key: "", uploading: false });
      setFormData((prev) => ({ ...prev, screenshot2RefKey: "" }));
      if (fileInput2Ref.current) fileInput2Ref.current.value = "";
    }
  };

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
        endAt: new Date(formData.endAt + "T23:59:59").toISOString(),
        screenshot1Mission: formData.screenshot1Mission || undefined,
        screenshot2Mission: formData.screenshot2Mission || undefined,
        screenshot1RefKey: formData.screenshot1RefKey || undefined,
        screenshot2RefKey: formData.screenshot2RefKey || undefined,
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
              <h3 className="text-sm font-medium text-slate-900">스크린샷 미션 (AI 자동 검증)</h3>
              <p className="text-xs text-slate-500">
                참조 이미지를 업로드하면 AI가 테스터의 스크린샷과 비교하여 자동 검증합니다.
                <br />
                참조 이미지가 없으면 해당 스크린샷은 필수가 아닙니다.
              </p>
              <div className="grid gap-6">
                <div className="space-y-3 rounded-lg border p-4">
                  <Label>스크린샷 1</Label>
                  <div className="space-y-2">
                    <Input
                      id="screenshot1Mission"
                      placeholder="미션 설명 (예: 앱 홈화면을 캡처해주세요)"
                      value={formData.screenshot1Mission}
                      onChange={(e) =>
                        setFormData({ ...formData, screenshot1Mission: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">참조 이미지</Label>
                    {refImage1.preview ? (
                      <div className="relative inline-block">
                        <Image
                          src={refImage1.preview}
                          alt="참조 이미지 1"
                          width={120}
                          height={120}
                          className="rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeRefImage(1)}
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInput1Ref.current?.click()}
                        className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                      >
                        {refImage1.uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-slate-400" />
                            <span className="text-xs text-slate-400">업로드</span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInput1Ref}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 1)}
                    />
                  </div>
                </div>

                <div className="space-y-3 rounded-lg border p-4">
                  <Label>스크린샷 2</Label>
                  <div className="space-y-2">
                    <Input
                      id="screenshot2Mission"
                      placeholder="미션 설명 (예: 회원가입 완료 화면을 캡처해주세요)"
                      value={formData.screenshot2Mission}
                      onChange={(e) =>
                        setFormData({ ...formData, screenshot2Mission: e.target.value })
                      }
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs text-slate-500">참조 이미지</Label>
                    {refImage2.preview ? (
                      <div className="relative inline-block">
                        <Image
                          src={refImage2.preview}
                          alt="참조 이미지 2"
                          width={120}
                          height={120}
                          className="rounded-lg border object-cover"
                        />
                        <button
                          type="button"
                          onClick={() => removeRefImage(2)}
                          className="absolute -top-2 -right-2 rounded-full bg-red-500 p-1 text-white hover:bg-red-600"
                        >
                          <X className="h-3 w-3" />
                        </button>
                      </div>
                    ) : (
                      <div
                        onClick={() => fileInput2Ref.current?.click()}
                        className="flex h-24 w-32 cursor-pointer flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-200 hover:border-slate-400 hover:bg-slate-50"
                      >
                        {refImage2.uploading ? (
                          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
                        ) : (
                          <>
                            <Upload className="h-5 w-5 text-slate-400" />
                            <span className="text-xs text-slate-400">업로드</span>
                          </>
                        )}
                      </div>
                    )}
                    <input
                      ref={fileInput2Ref}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleFileChange(e, 2)}
                    />
                  </div>
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
