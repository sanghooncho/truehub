"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Image from "next/image";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import {
  ArrowLeft,
  Loader2,
  CheckCircle,
  XCircle,
  AlertTriangle,
  User,
  Calendar,
  Clock,
  ImageIcon,
  MessageSquare,
  Shield,
  CreditCard,
} from "lucide-react";

interface ParticipationDetail {
  id: string;
  status: string;
  submittedAt: string;
  reviewedAt: string | null;
  rejectReason: string | null;
  campaign: {
    id: string;
    title: string;
    description: string;
    rewardAmount: number;
    creditCostPerValid: number;
    questions: { order: number; text: string }[];
  };
  answers: {
    answer1: string | null;
    answer2: string | null;
    feedback: string | null;
  };
  user: {
    id: string;
    email: string;
    profileName: string | null;
    provider: string;
    isBanned: boolean;
    joinedAt: string;
    totalParticipations: number;
  };
  assets: {
    id: string;
    slot: number;
    storageKey: string;
    url: string | null;
    filename: string;
    mimeType: string;
  }[];
  fraud: {
    score: number | null;
    decision: string | null;
    reasons: string[];
    signals: {
      signalType: string;
      signalValue: string | null;
      score: number;
      details: unknown;
    }[];
  };
  reviewer: { id: string; name: string } | null;
}

export default function AdminParticipationDetailPage() {
  const params = useParams();
  const router = useRouter();
  const participationId = params.id as string;

  const [participation, setParticipation] = useState<ParticipationDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/participations/${participationId}`);
      const data = await res.json();

      if (data.success) {
        setParticipation(data.data);
      } else {
        toast.error(data.error?.message || "데이터를 불러오지 못했습니다");
        router.push("/admin/participations");
      }
    } catch (error) {
      console.error("Failed to fetch participation:", error);
      toast.error("데이터를 불러오지 못했습니다");
      router.push("/admin/participations");
    } finally {
      setIsLoading(false);
    }
  }, [participationId, router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (rejectDialogOpen || !participation || !isPending(participation.status)) return;

      if (e.key === "a" || e.key === "A") {
        e.preventDefault();
        handleApprove();
      } else if (e.key === "r" || e.key === "R") {
        e.preventDefault();
        setRejectDialogOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [participation, rejectDialogOpen]);

  const handleApprove = async () => {
    if (!participation) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/participations/${participationId}/approve`, {
        method: "POST",
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "승인에 실패했습니다");
        return;
      }

      toast.success("참여가 승인되었습니다");
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  const handleReject = async () => {
    if (!participation || !rejectReason.trim()) {
      toast.error("반려 사유를 입력해주세요");
      return;
    }

    setActionLoading(true);
    try {
      const res = await fetch(`/api/v1/admin/participations/${participationId}/reject`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: rejectReason }),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error?.message || "반려에 실패했습니다");
        return;
      }

      toast.success("참여가 반려되었습니다");
      setRejectDialogOpen(false);
      fetchData();
    } catch {
      toast.error("오류가 발생했습니다");
    } finally {
      setActionLoading(false);
    }
  };

  const isPending = (status: string) =>
    ["SUBMITTED", "PENDING_REVIEW", "MANUAL_REVIEW"].includes(status);

  if (isLoading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <Loader2 className="text-primary h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!participation) return null;

  const fraudColor = getFraudScoreColor(participation.fraud.score);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => router.push("/admin/participations")}>
          <ArrowLeft className="h-5 w-5" />
        </Button>
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-slate-900">참여 심사</h1>
          <p className="text-slate-500">
            {participation.campaign.title} · ID: {participation.id.slice(0, 8)}
          </p>
        </div>
        <StatusBadge status={participation.status} large />
      </div>

      {/* Split View */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Left: Evidence */}
        <div className="space-y-6">
          {/* Screenshots */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ImageIcon className="h-5 w-5" />
                스크린샷
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                {participation.assets.length > 0 ? (
                  participation.assets.map((asset) =>
                    asset.url ? (
                      <button
                        key={asset.id}
                        onClick={() => setImagePreview(asset.url)}
                        className="relative aspect-[9/16] overflow-hidden rounded-lg border border-slate-200 bg-slate-50 transition-transform hover:scale-[1.02]"
                      >
                        <Image
                          src={asset.url}
                          alt={`Screenshot ${asset.slot}`}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                        <div className="absolute bottom-2 left-2 rounded bg-black/50 px-2 py-1 text-xs text-white">
                          캡처 {asset.slot}
                        </div>
                      </button>
                    ) : (
                      <div
                        key={asset.id}
                        className="flex aspect-[9/16] items-center justify-center rounded-lg border border-slate-200 bg-slate-50 text-slate-400"
                      >
                        이미지 로드 실패
                      </div>
                    )
                  )
                ) : (
                  <div className="col-span-2 py-8 text-center text-slate-400">
                    업로드된 스크린샷이 없습니다
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Answers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-5 w-5" />
                답변 내용
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {participation.campaign.questions.map((q, idx) => {
                const answerKey = `answer${idx + 1}` as keyof typeof participation.answers;
                const answer = participation.answers[answerKey];
                return (
                  <div key={q.order} className="space-y-2">
                    <p className="text-sm font-medium text-slate-700">
                      Q{q.order}. {q.text}
                    </p>
                    <p className="rounded-lg bg-slate-50 p-3 text-sm text-slate-600">
                      {answer || "(답변 없음)"}
                    </p>
                  </div>
                );
              })}

              {participation.answers.feedback && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">자유 의견</p>
                  <p className="rounded-lg bg-slate-50 p-3 text-sm whitespace-pre-wrap text-slate-600">
                    {participation.answers.feedback}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Right: Action Panel */}
        <div className="space-y-6">
          {/* Fraud Score */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                사기 탐지
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Score */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-700">Fraud Score</span>
                  <span className={`text-lg font-bold tabular-nums ${fraudColor.text}`}>
                    {participation.fraud.score !== null
                      ? `${Math.round(participation.fraud.score)}점`
                      : "N/A"}
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className={`h-full ${fraudColor.bar} transition-all`}
                    style={{
                      width: `${Math.min(participation.fraud.score || 0, 100)}%`,
                    }}
                  />
                </div>
                <Badge className={fraudColor.badge}>{fraudColor.label}</Badge>
              </div>

              {/* Signals */}
              {participation.fraud.signals.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">탐지 신호</p>
                  <div className="space-y-2">
                    {participation.fraud.signals.map((signal, idx) => (
                      <div
                        key={idx}
                        className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-sm"
                      >
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                        <span className="flex-1 text-amber-700">
                          {getSignalLabel(signal.signalType)}
                        </span>
                        <span className="font-medium text-amber-600">+{signal.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {participation.fraud.reasons.length > 0 && (
                <div className="space-y-2 border-t border-slate-100 pt-4">
                  <p className="text-sm font-medium text-slate-700">판정 사유</p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-slate-600">
                    {participation.fraud.reasons.map((reason, idx) => (
                      <li key={idx}>{reason}</li>
                    ))}
                  </ul>
                </div>
              )}
            </CardContent>
          </Card>

          {/* User Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                사용자 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow label="ID" value={participation.user.id.slice(0, 8) + "..."} />
              <InfoRow label="이메일" value={participation.user.email} />
              <InfoRow label="닉네임" value={participation.user.profileName || "-"} />
              <InfoRow
                label="로그인"
                value={
                  <Badge variant="outline" className="capitalize">
                    {participation.user.provider}
                  </Badge>
                }
              />
              <InfoRow
                label="상태"
                value={
                  participation.user.isBanned ? (
                    <Badge variant="destructive">차단됨</Badge>
                  ) : (
                    <Badge variant="outline" className="bg-green-50 text-green-700">
                      정상
                    </Badge>
                  )
                }
              />
              <InfoRow
                label="가입일"
                value={new Date(participation.user.joinedAt).toLocaleDateString("ko-KR")}
              />
              <InfoRow label="총 참여" value={`${participation.user.totalParticipations}건`} />
            </CardContent>
          </Card>

          {/* Campaign & Credit Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                보상 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="사용자 보상"
                value={
                  <span className="text-secondary font-bold">
                    {participation.campaign.rewardAmount.toLocaleString()}P
                  </span>
                }
              />
              <InfoRow
                label="차감 크레딧"
                value={
                  <span className="font-medium text-slate-900">
                    ₩{participation.campaign.creditCostPerValid.toLocaleString()}
                  </span>
                }
              />
            </CardContent>
          </Card>

          {/* Submission Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5" />
                제출 정보
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <InfoRow
                label="제출일시"
                value={new Date(participation.submittedAt).toLocaleString("ko-KR")}
              />
              {participation.reviewedAt && (
                <InfoRow
                  label="심사일시"
                  value={new Date(participation.reviewedAt).toLocaleString("ko-KR")}
                />
              )}
              {participation.reviewer && (
                <InfoRow label="심사자" value={participation.reviewer.name} />
              )}
              {participation.rejectReason && (
                <div className="space-y-1 border-t border-slate-100 pt-3">
                  <p className="text-sm font-medium text-slate-500">반려 사유</p>
                  <p className="text-sm text-red-600">{participation.rejectReason}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons */}
          {isPending(participation.status) && (
            <div className="space-y-3">
              <Button
                className="h-12 w-full text-base"
                onClick={handleApprove}
                disabled={actionLoading}
              >
                {actionLoading ? (
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                ) : (
                  <CheckCircle className="mr-2 h-5 w-5" />
                )}
                승인
                <kbd className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-xs">A</kbd>
              </Button>
              <Button
                variant="destructive"
                className="h-12 w-full text-base"
                onClick={() => setRejectDialogOpen(true)}
                disabled={actionLoading}
              >
                <XCircle className="mr-2 h-5 w-5" />
                반려
                <kbd className="ml-2 rounded bg-white/20 px-1.5 py-0.5 text-xs">R</kbd>
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Reject Dialog */}
      <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>참여 반려</DialogTitle>
            <DialogDescription>반려 사유를 입력해주세요</DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="반려 사유를 입력하세요..."
            value={rejectReason}
            onChange={(e) => setRejectReason(e.target.value)}
            className="min-h-[100px]"
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRejectDialogOpen(false)}>
              취소
            </Button>
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={!rejectReason.trim() || actionLoading}
            >
              {actionLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              반려하기
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Image Preview Dialog */}
      <Dialog open={!!imagePreview} onOpenChange={() => setImagePreview(null)}>
        <DialogContent className="max-w-3xl p-0">
          {imagePreview && (
            <div className="relative aspect-[9/16] w-full">
              <Image
                src={imagePreview}
                alt="Screenshot Preview"
                fill
                className="object-contain"
                unoptimized
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm text-slate-900">{value}</span>
    </div>
  );
}

function StatusBadge({ status, large }: { status: string; large?: boolean }) {
  const config: Record<string, { label: string; className: string }> = {
    SUBMITTED: { label: "대기", className: "bg-amber-100 text-amber-700" },
    PENDING_REVIEW: { label: "대기", className: "bg-amber-100 text-amber-700" },
    MANUAL_REVIEW: { label: "검토", className: "bg-blue-100 text-blue-700" },
    APPROVED: { label: "승인", className: "bg-green-100 text-green-700" },
    PAID: { label: "지급완료", className: "bg-green-100 text-green-700" },
    REJECTED: { label: "반려", className: "bg-red-100 text-red-700" },
    AUTO_REJECTED: { label: "자동반려", className: "bg-red-100 text-red-700" },
  };
  const { label, className } = config[status] || { label: status, className: "bg-slate-100" };
  return <Badge className={`${className} ${large ? "px-3 py-1 text-sm" : ""}`}>{label}</Badge>;
}

function getFraudScoreColor(score: number | null) {
  if (score === null) {
    return {
      bar: "bg-slate-300",
      badge: "bg-slate-100 text-slate-600",
      text: "text-slate-500",
      label: "N/A",
    };
  }
  if (score < 40) {
    return {
      bar: "bg-emerald-500",
      badge: "bg-emerald-100 text-emerald-700",
      text: "text-emerald-500",
      label: "PASS",
    };
  }
  if (score < 70) {
    return {
      bar: "bg-amber-500",
      badge: "bg-amber-100 text-amber-700",
      text: "text-amber-500",
      label: "REVIEW",
    };
  }
  return {
    bar: "bg-red-500",
    badge: "bg-red-100 text-red-700",
    text: "text-red-500",
    label: "REJECT",
  };
}

function getSignalLabel(signalType: string): string {
  const labels: Record<string, string> = {
    SIMILAR_IMAGE: "유사 이미지 감지",
    SAME_DEVICE: "동일 기기 반복",
    RAPID_SUBMISSION: "빠른 제출",
    DUPLICATE_HASH: "중복 해시 감지",
    SUSPICIOUS_PATTERN: "의심 패턴",
    LOW_QUALITY: "저품질 컨텐츠",
    BANNED_USER: "차단된 사용자",
  };
  return labels[signalType] || signalType;
}
