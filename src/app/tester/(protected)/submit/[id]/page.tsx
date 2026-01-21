"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowLeft, Camera, Check, ChevronRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import FingerprintJS from "@fingerprintjs/fingerprintjs";

import { Skeleton } from "@/components/ui/skeleton";

interface Campaign {
  id: string;
  title: string;
  rewardAmount: number;
  questions: { order: number; text: string }[];
  screenshot1Mission?: string | null;
  screenshot2Mission?: string | null;
  image1Required?: boolean;
  image2Required?: boolean;
}

interface FormData {
  image1Key: string;
  image2Key: string;
  answer1: string;
  answer2: string;
  feedback: string;
}

const STEPS_WITH_IMAGES = [
  { id: 1, label: "스크린샷" },
  { id: 2, label: "질문 답변" },
  { id: 3, label: "피드백" },
] as const;

const STEPS_WITHOUT_IMAGES = [
  { id: 1, label: "질문 답변" },
  { id: 2, label: "피드백" },
] as const;

const MIN_FEEDBACK_LENGTH = 30;

export default function CampaignSubmitPage() {
  const params = useParams();
  const router = useRouter();
  const campaignId = params.id as string;

  const [campaign, setCampaign] = useState<Campaign | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [deviceFingerprint, setDeviceFingerprint] = useState<string>("");

  const requiresImages = campaign?.image1Required || campaign?.image2Required;
  const STEPS = requiresImages ? STEPS_WITH_IMAGES : STEPS_WITHOUT_IMAGES;
  const totalSteps = STEPS.length;
  const [formData, setFormData] = useState<FormData>({
    image1Key: "",
    image2Key: "",
    answer1: "",
    answer2: "",
    feedback: "",
  });

  useEffect(() => {
    FingerprintJS.load()
      .then((fp) => fp.get())
      .then((result) => setDeviceFingerprint(result.visitorId))
      .catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchCampaign() {
      try {
        setIsLoading(true);
        const res = await fetch(`/api/v1/campaigns/${campaignId}`);
        if (!res.ok) throw new Error("캠페인을 불러올 수 없습니다.");
        const json = await res.json();
        // API returns { success: true, data: {...} } format
        const campaignData = json.data || json;
        setCampaign(campaignData);
      } catch {
        toast.error("캠페인을 불러올 수 없습니다.");
        router.back();
      } finally {
        setIsLoading(false);
      }
    }

    if (campaignId) fetchCampaign();
  }, [campaignId, router]);

  const handleImageUpload = (slot: 1 | 2, key: string) => {
    setFormData((prev) => ({
      ...prev,
      [slot === 1 ? "image1Key" : "image2Key"]: key,
    }));
  };

  const canProceedFromStep = (step: number): boolean => {
    if (requiresImages) {
      switch (step) {
        case 1: {
          const image1Ok = !campaign?.image1Required || !!formData.image1Key;
          const image2Ok = !campaign?.image2Required || !!formData.image2Key;
          return image1Ok && image2Ok;
        }
        case 2:
          return formData.answer1.trim().length > 0 && formData.answer2.trim().length > 0;
        case 3:
          return formData.feedback.trim().length >= MIN_FEEDBACK_LENGTH;
        default:
          return false;
      }
    } else {
      switch (step) {
        case 1:
          return formData.answer1.trim().length > 0 && formData.answer2.trim().length > 0;
        case 2:
          return formData.feedback.trim().length >= MIN_FEEDBACK_LENGTH;
        default:
          return false;
      }
    }
  };

  const handleNext = () => {
    if (currentStep < totalSteps && canProceedFromStep(currentStep)) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    } else {
      router.back();
    }
  };

  const handleSubmit = async () => {
    if (!canProceedFromStep(totalSteps) || !campaign) return;

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/v1/participations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          campaignId,
          answer1: formData.answer1,
          answer2: formData.answer2,
          feedback: formData.feedback,
          image1Key: formData.image1Key || undefined,
          image2Key: formData.image2Key || undefined,
          deviceFingerprint: deviceFingerprint || undefined,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        const errorMessage = getErrorMessage(errorData.code || res.status);
        toast.error(errorMessage);
        return;
      }

      toast.success(`제출 완료! ${campaign.rewardAmount.toLocaleString()}P를 받을 수 있어요`);
      router.push("/tester/my");
    } catch {
      toast.error("제출 중 오류가 발생했습니다. 다시 시도해주세요.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const getErrorMessage = (code: string | number): string => {
    const errorMessages: Record<string, string> = {
      ALREADY_PARTICIPATED: "이미 참여한 캠페인이에요.",
      DAILY_LIMIT_EXCEEDED: "오늘 참여 가능한 횟수를 초과했어요. (최대 3회/일)",
      CAMPAIGN_CLOSED: "종료된 캠페인이에요.",
      CAMPAIGN_FULL: "모집이 마감되었어요.",
      "400": "입력 정보를 다시 확인해주세요.",
      "401": "로그인이 필요합니다.",
      "404": "캠페인을 찾을 수 없습니다.",
    };
    return errorMessages[String(code)] || "오류가 발생했습니다. 다시 시도해주세요.";
  };

  if (isLoading) {
    return <SubmitPageSkeleton />;
  }

  if (!campaign) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="flex min-h-screen flex-col pb-24"
    >
      <div className="sticky top-14 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="flex h-12 items-center gap-3 px-5">
          <button
            onClick={handleBack}
            className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-slate-100 to-slate-50 shadow-sm transition-all hover:shadow-md hover:scale-105"
          >
            <ArrowLeft className="h-5 w-5 text-slate-700" />
          </button>
          <span className="text-base font-bold text-slate-800">참여 제출</span>
        </div>

        <div className="px-5 pb-4">
          <ProgressIndicator currentStep={currentStep} steps={STEPS} />
        </div>
      </div>

      <div className="flex-1 p-5">
        <AnimatePresence mode="wait">
          {requiresImages && currentStep === 1 && (
            <StepWrapper key="step-images">
              <StepImages
                image1Key={formData.image1Key}
                image2Key={formData.image2Key}
                mission1={campaign.screenshot1Mission}
                mission2={campaign.screenshot2Mission}
                image1Required={campaign.image1Required}
                image2Required={campaign.image2Required}
                onUpload={handleImageUpload}
              />
            </StepWrapper>
          )}

          {((requiresImages && currentStep === 2) || (!requiresImages && currentStep === 1)) && (
            <StepWrapper key="step-questions">
              <StepQuestions
                questions={campaign.questions}
                answer1={formData.answer1}
                answer2={formData.answer2}
                onChange={(field, value) => setFormData((prev) => ({ ...prev, [field]: value }))}
              />
            </StepWrapper>
          )}

          {((requiresImages && currentStep === 3) || (!requiresImages && currentStep === 2)) && (
            <StepWrapper key="step-feedback">
              <StepFeedback
                feedback={formData.feedback}
                onChange={(value) => setFormData((prev) => ({ ...prev, feedback: value }))}
                rewardAmount={campaign.rewardAmount}
              />
            </StepWrapper>
          )}
        </AnimatePresence>
      </div>

      <div className="pb-safe fixed right-0 bottom-16 left-0 border-t border-white/50 bg-white/80 p-4 backdrop-blur-xl">
        <div className="mx-auto max-w-md">
          {currentStep < totalSteps ? (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleNext}
              disabled={!canProceedFromStep(currentStep)}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              다음
              <ChevronRight className="h-5 w-5" />
            </motion.button>
          ) : (
            <motion.button
              whileTap={{ scale: 0.96 }}
              onClick={handleSubmit}
              disabled={!canProceedFromStep(totalSteps) || isSubmitting}
              className="flex h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-semibold text-white shadow-lg shadow-blue-500/25 transition-all hover:-translate-y-0.5 hover:shadow-xl hover:shadow-blue-500/30 active:scale-95 disabled:cursor-not-allowed disabled:opacity-50 disabled:shadow-none"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  제출 중...
                </>
              ) : (
                `제출하고 ${campaign.rewardAmount.toLocaleString()}P 받기`
              )}
            </motion.button>
          )}
        </div>
      </div>
    </motion.div>
  );
}

function ProgressIndicator({
  currentStep,
  steps,
}: {
  currentStep: number;
  steps: readonly { id: number; label: string }[];
}) {
  return (
    <div className="flex items-center gap-2">
      {steps.map((step, index) => (
        <div key={step.id} className="flex flex-1 items-center">
          <div className="flex flex-1 items-center gap-2">
            <div
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold shadow-sm transition-all ${
                index + 1 < currentStep
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                  : index + 1 === currentStep
                    ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-lg shadow-blue-200"
                    : "bg-slate-100 text-slate-400"
              }`}
            >
              {index + 1 < currentStep ? <Check className="h-4 w-4" /> : index + 1}
            </div>
            <span
              className={`text-xs font-semibold transition-colors ${
                index + 1 === currentStep ? "text-slate-800" : "text-slate-400"
              }`}
            >
              {step.label}
            </span>
          </div>
          {index < steps.length - 1 && (
            <div
              className={`mx-2 h-0.5 flex-1 rounded-full transition-colors ${
                index + 1 < currentStep ? "bg-gradient-to-r from-emerald-500 to-cyan-500" : "bg-slate-100"
              }`}
            />
          )}
        </div>
      ))}
    </div>
  );
}

function StepWrapper({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      transition={{ duration: 0.2 }}
    >
      {children}
    </motion.div>
  );
}

function StepImages({
  image1Key,
  image2Key,
  mission1,
  mission2,
  image1Required,
  image2Required,
  onUpload,
}: {
  image1Key: string;
  image2Key: string;
  mission1?: string | null;
  mission2?: string | null;
  image1Required?: boolean;
  image2Required?: boolean;
  onUpload: (slot: 1 | 2, key: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
      <div className="mb-5">
        <h2 className="mb-2 text-lg font-bold text-slate-800">스크린샷 업로드</h2>
        <p className="text-sm text-slate-500">광고주가 요청한 화면을 캡처해주세요.</p>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {image1Required && (
          <ImageUpload
            slot={1}
            imageKey={image1Key}
            mission={mission1}
            onUpload={(key) => onUpload(1, key)}
          />
        )}
        {image2Required && (
          <ImageUpload
            slot={2}
            imageKey={image2Key}
            mission={mission2}
            onUpload={(key) => onUpload(2, key)}
          />
        )}
      </div>
    </div>
  );
}

function ImageUpload({
  slot,
  imageKey,
  mission,
  onUpload,
}: {
  slot: 1 | 2;
  imageKey: string;
  mission?: string | null;
  onUpload: (key: string) => void;
}) {
  const [preview, setPreview] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onloadend = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setIsUploading(true);
    try {
      const presignedRes = await fetch("/api/v1/uploads/presigned-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          filename: file.name,
          contentType: file.type,
          fileSize: file.size,
        }),
      });

      if (!presignedRes.ok) {
        throw new Error("Failed to get upload URL");
      }

      const { data } = await presignedRes.json();

      const uploadRes = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type },
        body: file,
      });

      if (!uploadRes.ok) {
        throw new Error("Failed to upload file");
      }

      onUpload(data.key);
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("이미지 업로드에 실패했습니다.");
      setPreview(null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    onUpload("");
  };

  if (preview) {
    return (
      <div className="space-y-2">
        <div className="relative aspect-square overflow-hidden rounded-xl">
          <img src={preview} alt={`캡처 ${slot}`} className="h-full w-full object-cover" />
          {isUploading ? (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30">
              <Loader2 className="h-6 w-6 animate-spin text-white" />
            </div>
          ) : (
            <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500">
              <Check className="h-3 w-3 text-white" />
            </div>
          )}
          <button
            onClick={handleRemove}
            disabled={isUploading}
            className="absolute top-2 left-2 flex h-6 w-6 items-center justify-center rounded-full bg-black/50 text-xs text-white disabled:opacity-50"
          >
            ✕
          </button>
        </div>
        {mission && (
          <p className="line-clamp-2 px-1 text-center text-xs text-slate-600">{mission}</p>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <label className="flex aspect-square cursor-pointer flex-col items-center justify-center rounded-2xl border-2 border-dashed border-blue-200 bg-gradient-to-br from-blue-50/50 to-cyan-50/50 transition-all hover:border-blue-400 hover:bg-gradient-to-br hover:from-blue-50 hover:to-cyan-50">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-blue-100 to-cyan-100 mb-2">
          <Camera className="h-6 w-6 text-blue-500" />
        </div>
        <span className="text-sm font-medium text-slate-500">캡처 {slot}</span>
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
      </label>
      {mission && <p className="line-clamp-2 px-1 text-center text-xs text-slate-600">{mission}</p>}
    </div>
  );
}

function StepQuestions({
  questions,
  answer1,
  answer2,
  onChange,
}: {
  questions: { order: number; text: string }[];
  answer1: string;
  answer2: string;
  onChange: (field: "answer1" | "answer2", value: string) => void;
}) {
  return (
    <div className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
      <div className="mb-5">
        <h2 className="mb-2 text-lg font-bold text-slate-800">질문에 답해주세요</h2>
        <p className="text-sm text-slate-500">앱 사용 경험을 바탕으로 솔직하게 답변해주세요.</p>
      </div>

      <div className="space-y-5">
        {questions.map((q, idx) => (
          <div key={q.order} className="space-y-3">
            <div className="flex items-start gap-3">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-r from-blue-500 to-cyan-500 text-xs font-bold text-white shadow-md shadow-blue-200">
                {q.order}
              </span>
              <p className="text-sm font-semibold text-slate-800">{q.text}</p>
            </div>
            <textarea
              value={idx === 0 ? answer1 : answer2}
              onChange={(e) => onChange(idx === 0 ? "answer1" : "answer2", e.target.value)}
              placeholder="답변을 입력해주세요..."
              className="min-h-[100px] w-full resize-none rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 text-base text-slate-800 transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:outline-none"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function StepFeedback({
  feedback,
  onChange,
  rewardAmount,
}: {
  feedback: string;
  onChange: (value: string) => void;
  rewardAmount: number;
}) {
  const charCount = feedback.trim().length;
  const isValid = charCount >= MIN_FEEDBACK_LENGTH;

  return (
    <div className="space-y-4">
      <div className="rounded-[1.5rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
        <div className="mb-5">
          <h2 className="mb-2 text-lg font-bold text-slate-800">자유 의견</h2>
          <p className="text-sm text-slate-500">
            앱에 대한 솔직한 의견을 {MIN_FEEDBACK_LENGTH}자 이상 작성해주세요.
          </p>
        </div>

        <div className="space-y-2">
          <textarea
            value={feedback}
            onChange={(e) => onChange(e.target.value)}
            placeholder="앱 사용 후 느낀 점, 개선 아이디어, 좋았던 점 등을 자유롭게 적어주세요..."
            className="min-h-[180px] w-full resize-none rounded-xl bg-gradient-to-br from-slate-50 to-blue-50/50 p-4 text-base text-slate-800 transition-shadow placeholder:text-slate-400 focus:ring-2 focus:ring-blue-200 focus:outline-none"
          />
          <div className="flex justify-end">
            <span
              className={`text-xs font-semibold tabular-nums ${
                isValid ? "text-emerald-600" : "text-slate-400"
              }`}
            >
              {charCount} / {MIN_FEEDBACK_LENGTH}자
            </span>
          </div>
        </div>
      </div>

      <div className="rounded-[1.25rem] bg-gradient-to-r from-blue-50 to-cyan-50 p-4 shadow-sm">
        <p className="text-sm font-medium text-blue-700">
          제출 완료 시{" "}
          <span className="font-bold tabular-nums bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-transparent">{rewardAmount.toLocaleString()}P</span>를 받을 수
          있어요!
        </p>
      </div>
    </div>
  );
}

function SubmitPageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col pb-24">
      <div className="sticky top-14 z-40 border-b border-slate-100 bg-white">
        <div className="flex h-12 items-center gap-3 px-5">
          <Skeleton className="h-9 w-9 rounded-full" />
          <Skeleton className="h-5 w-24" />
        </div>
        <div className="px-5 pb-4">
          <div className="flex items-center gap-2">
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-0.5 flex-1" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-16" />
            <Skeleton className="h-0.5 flex-1" />
            <Skeleton className="h-7 w-7 rounded-full" />
            <Skeleton className="h-4 w-16" />
          </div>
        </div>
      </div>

      <div className="flex-1 bg-slate-50 p-5">
        <div className="rounded-2xl bg-white p-5 shadow-sm">
          <div className="mb-5 space-y-2">
            <Skeleton className="h-6 w-32" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Skeleton className="aspect-square rounded-xl" />
            <Skeleton className="aspect-square rounded-xl" />
          </div>
        </div>
      </div>

      <div className="fixed right-0 bottom-16 left-0 border-t border-slate-100 bg-white p-4">
        <div className="mx-auto max-w-md">
          <Skeleton className="h-[52px] w-full rounded-xl" />
        </div>
      </div>
    </div>
  );
}
