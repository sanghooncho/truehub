"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { formatDistanceToNow } from "date-fns";
import { ko } from "date-fns/locale";
import {
  Gift,
  Search,
  ShoppingBag,
  ChevronRight,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Phone,
  LogIn,
} from "lucide-react";
import { toast } from "sonner";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const CATEGORIES = [
  { id: null, name: "전체" },
  { id: 1, name: "커피/음료" },
  { id: 2, name: "베이커리" },
  { id: 3, name: "아이스크림" },
  { id: 4, name: "편의점" },
  { id: 5, name: "치킨/피자" },
  { id: 6, name: "외식" },
  { id: 8, name: "기프티콘" },
] as const;

interface GoodsItem {
  goodsCode: string;
  goodsName: string;
  brandCode: string;
  brandName: string;
  brandIconImg: string;
  goodsImgS: string;
  goodsImgB: string;
  salePrice: number;
  discountPrice: number;
  discountRate: number;
  limitDay: number;
  goodsTypeDtlNm: string;
  affiliate: string;
}

interface ExchangeItem {
  id: string;
  goodsCode: string;
  goodsName: string;
  brandName: string;
  goodsImageUrl: string | null;
  amount: number;
  discountPrice: number;
  pointsUsed: number;
  phoneNumber: string;
  status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "CANCELLED";
  orderNo: string | null;
  pinNo: string | null;
  couponImageUrl: string | null;
  validUntil: string | null;
  failReason: string | null;
  createdAt: string;
}

interface Summary {
  totalEarned: number;
  totalUsed: number;
  availablePoints: number;
  totalExchanges: number;
}

const STATUS_CONFIG = {
  PENDING: { label: "대기중", icon: Clock, className: "bg-amber-100 text-amber-700" },
  PROCESSING: { label: "처리중", icon: Loader2, className: "bg-blue-100 text-blue-700" },
  COMPLETED: { label: "완료", icon: CheckCircle2, className: "bg-emerald-100 text-emerald-700" },
  FAILED: { label: "실패", icon: AlertCircle, className: "bg-red-100 text-red-700" },
  CANCELLED: { label: "취소", icon: X, className: "bg-slate-100 text-slate-700" },
};

export default function GiftShopPage() {
  const router = useRouter();
  const { data: session, status } = useSession();
  const isAuthenticated = status === "authenticated";

  const [activeTab, setActiveTab] = useState("shop");
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchInput, setSearchInput] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(1);
  const [selectedGoods, setSelectedGoods] = useState<GoodsItem | null>(null);
  const [dialogStep, setDialogStep] = useState<"detail" | "exchange">("detail");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isExchanging, setIsExchanging] = useState(false);
  const [exchangeResult, setExchangeResult] = useState<{
    success: boolean;
    data?: {
      goodsName: string;
      couponImageUrl?: string;
      pinNo?: string;
      validUntil?: string;
    };
    error?: string;
  } | null>(null);

  const fetchGoods = useCallback(async (search: string, category: number | null) => {
    try {
      const params = new URLSearchParams({ size: "100" });
      if (search) params.set("search", search);
      if (category) params.set("category", String(category));

      const response = await fetch(`/api/v1/giftshop/goods?${params}`);
      if (!response.ok) throw new Error("상품 목록을 불러오는데 실패했습니다");
      const json = await response.json();
      setGoods(json.data?.goods || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다";
      toast.error(message);
    }
  }, []);

  const fetchExchanges = useCallback(async () => {
    // 로그인하지 않은 사용자는 교환 내역을 불러오지 않음
    if (!isAuthenticated) {
      setExchanges([]);
      setSummary(null);
      return;
    }

    try {
      const response = await fetch("/api/v1/giftshop/exchange/my");
      if (!response.ok) throw new Error("교환 내역을 불러오는데 실패했습니다");
      const json = await response.json();
      setExchanges(json.data?.exchanges || []);
      setSummary(json.data?.summary || null);
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다";
      toast.error(message);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchGoods(searchQuery, selectedCategory), fetchExchanges()]).finally(() =>
      setIsLoading(false)
    );
  }, [searchQuery, selectedCategory, fetchGoods, fetchExchanges]);

  const handleSearch = () => {
    setSearchQuery(searchInput);
  };

  const handleExchange = async () => {
    if (!selectedGoods) return;

    if (!isAuthenticated) {
      toast.error("로그인이 필요합니다");
      router.push("/tester/login");
      return;
    }

    const cleanPhone = phoneNumber.replace(/-/g, "");
    if (!/^01[0-9]{8,9}$/.test(cleanPhone)) {
      toast.error("유효한 휴대폰 번호를 입력해주세요");
      return;
    }

    if (!summary || summary.availablePoints < selectedGoods.discountPrice) {
      toast.error("포인트가 부족합니다");
      return;
    }

    setIsExchanging(true);
    try {
      const response = await fetch("/api/v1/giftshop/exchange", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          goodsCode: selectedGoods.goodsCode,
          phoneNumber: cleanPhone,
        }),
      });

      const json = await response.json();

      if (json.success) {
        setExchangeResult({
          success: true,
          data: {
            goodsName: json.data.goodsName,
            couponImageUrl: json.data.couponImageUrl,
            pinNo: json.data.pinNo,
            validUntil: json.data.validUntil,
          },
        });
        await fetchExchanges();
        toast.success("기프티콘이 성공적으로 발송되었습니다!");
      } else {
        setExchangeResult({
          success: false,
          error: json.error?.message || "교환에 실패했습니다",
        });
        toast.error(json.error?.message || "교환에 실패했습니다");
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다";
      setExchangeResult({ success: false, error: message });
      toast.error(message);
    } finally {
      setIsExchanging(false);
    }
  };

  const closeDialog = () => {
    setSelectedGoods(null);
    setDialogStep("detail");
    setPhoneNumber("");
    setExchangeResult(null);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="animate-fade-in-up min-h-screen pb-24">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 px-5 pt-6 pb-8 text-white">
        {/* Decorative elements */}
        <div className="pointer-events-none absolute -top-20 -right-20 h-40 w-40 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-10 -left-10 h-32 w-32 rounded-full bg-white/10 blur-2xl" />

        <h1 className="relative mb-2 text-2xl font-bold">기프티콘 교환</h1>
        <p className="relative mb-4 text-sm text-blue-100">포인트를 기프티콘으로 교환하세요</p>
        {isAuthenticated ? (
          <Link
            href="/tester/rewards"
            className="relative block rounded-[1.5rem] border border-white/20 bg-white/20 p-5 backdrop-blur-sm transition-all hover:bg-white/30 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">사용 가능 포인트</p>
                <p className="text-3xl font-bold text-white tabular-nums">
                  {(summary?.availablePoints ?? 0).toLocaleString()}
                  <span className="ml-1 text-lg">P</span>
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <Gift className="h-8 w-8 text-white" />
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-100/80">탭하여 포인트 내역 보기</p>
          </Link>
        ) : (
          <Link
            href="/tester/login"
            className="relative block rounded-[1.5rem] border border-white/20 bg-white/20 p-5 backdrop-blur-sm transition-all hover:bg-white/30 active:scale-[0.98]"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-blue-100">로그인하고 포인트 받기</p>
                <p className="mt-1 text-lg font-semibold text-white">
                  미션 완료하고 리워드를 받아보세요
                </p>
              </div>
              <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 backdrop-blur-sm">
                <LogIn className="h-7 w-7 text-white" />
              </div>
            </div>
            <p className="mt-2 text-xs text-blue-100/80">탭하여 로그인하기</p>
          </Link>
        )}
      </div>

      <div className="px-5 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 rounded-2xl bg-slate-100 p-1">
            <TabsTrigger
              value="shop"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <ShoppingBag className="mr-2 h-4 w-4" />
              기프티콘 구매
            </TabsTrigger>
            <TabsTrigger
              value="history"
              className="rounded-xl data-[state=active]:bg-white data-[state=active]:shadow-md"
            >
              <Clock className="mr-2 h-4 w-4" />
              교환 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="mt-4">
            <div className="relative mb-3 flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-blue-500" />
                <Input
                  placeholder="상품명 또는 브랜드 검색"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="rounded-2xl border-0 bg-white/80 pl-10 shadow-sm backdrop-blur-sm focus-visible:ring-2 focus-visible:ring-blue-200"
                />
              </div>
              <Button
                onClick={handleSearch}
                className="shrink-0 rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 px-4"
              >
                검색
              </Button>
            </div>

            <div className="scrollbar-hide mb-4 flex gap-2 overflow-x-auto pb-2">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id ?? "all"}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={cn(
                    "shrink-0 rounded-full px-4 py-2 text-sm font-medium transition-all",
                    selectedCategory === cat.id
                      ? "bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-md"
                      : "bg-white/80 text-slate-600 hover:bg-white"
                  )}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            {goods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
                  <ShoppingBag className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-medium text-slate-600">검색 결과가 없습니다</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3">
                {goods.map((item) => (
                  <GoodsCard
                    key={item.goodsCode}
                    item={item}
                    availablePoints={summary?.availablePoints ?? 0}
                    onSelect={() => setSelectedGoods(item)}
                  />
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="history" className="mt-4">
            {!isAuthenticated ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
                  <LogIn className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-bold text-slate-800">로그인이 필요합니다</p>
                <p className="mt-1 text-sm text-slate-500">로그인하고 교환 내역을 확인하세요</p>
                <Button
                  onClick={() => router.push("/tester/login")}
                  className="mt-4 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 px-6"
                >
                  <LogIn className="mr-2 h-4 w-4" />
                  로그인하기
                </Button>
              </div>
            ) : exchanges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-[1.25rem] bg-gradient-to-br from-blue-100 to-cyan-100 shadow-lg shadow-blue-100/50">
                  <Gift className="h-8 w-8 text-blue-500" />
                </div>
                <p className="font-bold text-slate-800">교환 내역이 없습니다</p>
                <p className="mt-1 text-sm text-slate-500">기프티콘을 교환하고 내역을 확인하세요</p>
              </div>
            ) : (
              <div className="space-y-3">
                {exchanges.map((item) => (
                  <ExchangeCard key={item.id} item={item} />
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      <Dialog
        open={!!selectedGoods && !exchangeResult}
        onOpenChange={(open) => !open && closeDialog()}
      >
        <DialogContent className="max-w-sm overflow-hidden p-0" showCloseButton={false}>
          <DialogHeader className="sr-only">
            <VisuallyHidden>
              <DialogTitle>상품 상세</DialogTitle>
            </VisuallyHidden>
          </DialogHeader>
          {selectedGoods && dialogStep === "detail" && (
            <div className="animate-fade-in-up">
              {/* Hero Image Section */}
              <div className="relative aspect-[4/3] w-full overflow-hidden">
                <img
                  src={selectedGoods.goodsImgB || selectedGoods.goodsImgS}
                  alt={selectedGoods.goodsName}
                  className="h-full w-full object-cover"
                />
                {/* Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />

                {/* Discount Badge */}
                {selectedGoods.discountRate > 0 && (
                  <div className="absolute top-4 right-4">
                    <Badge className="rounded-full bg-gradient-to-r from-rose-500 to-pink-500 px-3 py-1 text-sm font-bold shadow-lg shadow-rose-500/30">
                      -{selectedGoods.discountRate}%
                    </Badge>
                  </div>
                )}

                {/* Close Button */}
                <button
                  onClick={closeDialog}
                  className="absolute top-4 left-4 flex h-8 w-8 items-center justify-center rounded-full bg-black/30 backdrop-blur-sm transition-all hover:bg-black/50"
                >
                  <X className="h-4 w-4 text-white" />
                </button>

                {/* Product Info Overlay */}
                <div className="absolute right-0 bottom-0 left-0 p-5">
                  <div className="mb-2 flex items-center gap-2">
                    {selectedGoods.brandIconImg && (
                      <img
                        src={selectedGoods.brandIconImg}
                        alt=""
                        className="h-6 w-6 rounded-lg border border-white/20 bg-white/90 p-0.5"
                      />
                    )}
                    <span className="text-sm font-medium text-white/90">
                      {selectedGoods.brandName}
                    </span>
                  </div>
                  <h3 className="line-clamp-2 text-lg leading-snug font-bold text-white">
                    {selectedGoods.goodsName}
                  </h3>
                </div>
              </div>

              {/* Content Section */}
              <div className="space-y-5 p-5">
                {/* Price Section */}
                <div className="flex items-center justify-between">
                  <div className="flex items-baseline gap-2">
                    {selectedGoods.salePrice !== selectedGoods.discountPrice && (
                      <span className="text-sm text-slate-400 line-through">
                        {selectedGoods.salePrice.toLocaleString()}원
                      </span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-3xl font-bold text-transparent tabular-nums">
                      {selectedGoods.discountPrice.toLocaleString()}
                    </span>
                    <span className="text-lg font-semibold text-slate-400">P</span>
                  </div>
                </div>

                {/* Info Grid */}
                <div className="space-y-3 rounded-2xl bg-slate-50/80 p-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100">
                        <Clock className="h-4 w-4 text-blue-600" />
                      </div>
                      <span>유효기간</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      발행 후 {selectedGoods.limitDay}일
                    </span>
                  </div>
                  <div className="h-px bg-slate-200/80" />
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2 text-slate-500">
                      <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-cyan-100">
                        <Gift className="h-4 w-4 text-cyan-600" />
                      </div>
                      <span>상품유형</span>
                    </div>
                    <span className="font-semibold text-slate-700">
                      {selectedGoods.goodsTypeDtlNm || "모바일쿠폰"}
                    </span>
                  </div>
                  {selectedGoods.affiliate && (
                    <>
                      <div className="h-px bg-slate-200/80" />
                      <div className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2 text-slate-500">
                          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100">
                            <ShoppingBag className="h-4 w-4 text-emerald-600" />
                          </div>
                          <span>판매사</span>
                        </div>
                        <span className="font-semibold text-slate-700">
                          {selectedGoods.affiliate}
                        </span>
                      </div>
                    </>
                  )}
                </div>

                {isAuthenticated ? (
                  <>
                    {(summary?.availablePoints ?? 0) < selectedGoods.discountPrice && (
                      <div className="flex items-center gap-3 rounded-2xl border border-red-100 bg-red-50 p-4">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-red-100">
                          <AlertCircle className="h-5 w-5 text-red-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-red-600">포인트가 부족해요</p>
                          <p className="text-sm text-red-500">
                            보유: {(summary?.availablePoints ?? 0).toLocaleString()}P
                          </p>
                        </div>
                      </div>
                    )}
                    <Button
                      onClick={() => setDialogStep("exchange")}
                      disabled={(summary?.availablePoints ?? 0) < selectedGoods.discountPrice}
                      className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-bold shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                    >
                      <span className="tabular-nums">
                        {selectedGoods.discountPrice.toLocaleString()}P
                      </span>
                      <span className="mx-1">로</span>
                      <span>교환하기</span>
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                  </>
                ) : (
                  <>
                    <div className="flex items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50 p-4">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
                        <LogIn className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <p className="font-semibold text-blue-600">로그인이 필요해요</p>
                        <p className="text-sm text-blue-500">로그인하고 기프티콘을 교환하세요</p>
                      </div>
                    </div>
                    <Button
                      onClick={() => {
                        toast.error("로그인이 필요합니다");
                        router.push("/tester/login");
                      }}
                      className="h-14 w-full rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 text-base font-bold shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98]"
                    >
                      <LogIn className="mr-2 h-5 w-5" />
                      <span>로그인하고 교환하기</span>
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </Button>
                  </>
                )}
              </div>
            </div>
          )}

          {selectedGoods && dialogStep === "exchange" && (
            <div className="animate-fade-in-up p-5">
              {/* Header with gradient accent */}
              <div className="mb-6">
                <div className="mb-2 flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 shadow-lg shadow-blue-500/25">
                    <Phone className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-slate-900">기프티콘 받을 번호</h2>
                    <p className="text-sm text-slate-500">입력한 번호로 MMS가 발송됩니다</p>
                  </div>
                </div>
              </div>

              {/* Product Summary Card */}
              <div className="mb-6 flex items-center gap-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100/50 p-4">
                <div className="relative">
                  <img
                    src={selectedGoods.goodsImgS}
                    alt={selectedGoods.goodsName}
                    className="h-16 w-16 rounded-xl object-cover shadow-md"
                  />
                  <div className="absolute -right-1 -bottom-1 flex h-6 w-6 items-center justify-center rounded-full bg-gradient-to-r from-blue-600 to-cyan-500 shadow-md">
                    <Gift className="h-3 w-3 text-white" />
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-500">{selectedGoods.brandName}</p>
                  <p className="truncate font-semibold text-slate-900">{selectedGoods.goodsName}</p>
                  <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-sm font-bold text-transparent tabular-nums">
                    {selectedGoods.discountPrice.toLocaleString()}P
                  </p>
                </div>
              </div>

              {/* Phone Input */}
              <div className="mb-6">
                <label className="mb-2 block text-sm font-semibold text-slate-700">
                  휴대폰 번호
                </label>
                <div className="relative">
                  <Input
                    type="tel"
                    placeholder="010-0000-0000"
                    value={phoneNumber
                      .replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3")
                      .replace(/(\d{3})(\d{4})(\d{0,4})/, (_, p1, p2, p3) =>
                        p3 ? `${p1}-${p2}-${p3}` : `${p1}-${p2}`
                      )
                      .replace(/(\d{3})(\d{0,4})/, (_, p1, p2) => (p2 ? `${p1}-${p2}` : p1))}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                    maxLength={13}
                    autoFocus
                    className="h-14 rounded-2xl border-2 border-slate-200 bg-white px-4 text-center text-lg font-medium tracking-wider transition-all placeholder:text-slate-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10"
                  />
                </div>
              </div>

              {/* Warning Notice */}
              <div className="mb-6 rounded-2xl border border-amber-100 bg-amber-50 p-4">
                <div className="flex items-start gap-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-100">
                    <AlertCircle className="h-4 w-4 text-amber-600" />
                  </div>
                  <div className="space-y-1 text-sm text-amber-700">
                    <p className="font-medium">교환 전 확인해 주세요</p>
                    <ul className="space-y-0.5 text-xs text-amber-600">
                      <li>• 유효기간 내 미사용 시 자동 소멸</li>
                      <li>• 기간 연장 및 환불 불가</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setDialogStep("detail")}
                  className="h-14 flex-1 rounded-2xl border-2 border-slate-200 font-semibold text-slate-600 transition-all hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
                >
                  이전
                </Button>
                <Button
                  onClick={handleExchange}
                  disabled={isExchanging || !phoneNumber || phoneNumber.length < 10}
                  className="h-14 flex-[2] rounded-2xl bg-gradient-to-r from-blue-600 to-cyan-500 font-bold shadow-lg shadow-blue-500/25 transition-all hover:from-blue-700 hover:to-cyan-600 hover:shadow-xl hover:shadow-blue-500/30 active:scale-[0.98] disabled:opacity-50 disabled:shadow-none"
                >
                  {isExchanging ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      발송 중...
                    </>
                  ) : (
                    <>
                      발송하기
                      <ChevronRight className="ml-1 h-5 w-5" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      <Dialog open={!!exchangeResult} onOpenChange={(open) => !open && closeDialog()}>
        <DialogContent className="max-w-sm">
          {exchangeResult?.success ? (
            <>
              <DialogHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                  <CheckCircle2 className="h-8 w-8 text-emerald-600" />
                </div>
                <DialogTitle className="text-center">교환 완료!</DialogTitle>
                <DialogDescription className="text-center">
                  기프티콘이 성공적으로 발송되었습니다
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-4">
                <div className="rounded-lg bg-slate-50 p-4 text-center">
                  <p className="text-sm text-slate-500">상품명</p>
                  <p className="font-medium text-slate-900">{exchangeResult.data?.goodsName}</p>
                </div>

                {exchangeResult.data?.couponImageUrl && (
                  <div className="text-center">
                    <p className="mb-2 text-sm text-slate-500">쿠폰 이미지</p>
                    <img
                      src={exchangeResult.data.couponImageUrl}
                      alt="쿠폰"
                      className="mx-auto max-w-full rounded-lg"
                    />
                  </div>
                )}

                {exchangeResult.data?.pinNo && (
                  <div className="rounded-lg bg-violet-50 p-4 text-center">
                    <p className="text-sm text-slate-500">쿠폰 번호</p>
                    <p className="font-mono text-lg font-bold text-violet-600">
                      {exchangeResult.data.pinNo}
                    </p>
                  </div>
                )}

                {exchangeResult.data?.validUntil && (
                  <p className="text-center text-xs text-slate-500">
                    유효기간: {new Date(exchangeResult.data.validUntil).toLocaleDateString("ko-KR")}
                    까지
                  </p>
                )}
              </div>

              <DialogFooter>
                <Button onClick={closeDialog} className="w-full bg-violet-600 hover:bg-violet-700">
                  확인
                </Button>
              </DialogFooter>
            </>
          ) : (
            <>
              <DialogHeader>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                  <AlertCircle className="h-8 w-8 text-red-600" />
                </div>
                <DialogTitle className="text-center">교환 실패</DialogTitle>
                <DialogDescription className="text-center">
                  {exchangeResult?.error}
                </DialogDescription>
              </DialogHeader>

              <DialogFooter>
                <Button onClick={closeDialog} variant="outline" className="w-full">
                  닫기
                </Button>
              </DialogFooter>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function GoodsCard({
  item,
  availablePoints,
  onSelect,
}: {
  item: GoodsItem;
  availablePoints: number;
  onSelect: () => void;
}) {
  const canAfford = availablePoints >= item.discountPrice;

  return (
    <div
      className="cursor-pointer overflow-hidden rounded-[1.25rem] border border-white/50 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-blue-200/30"
      onClick={onSelect}
    >
      <div className="relative aspect-square bg-gradient-to-br from-slate-100 to-slate-50">
        <img
          src={item.goodsImgS}
          alt={item.goodsName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {item.discountRate > 0 && (
          <Badge className="absolute top-2 right-2 rounded-full bg-gradient-to-r from-red-500 to-rose-500 shadow-md">
            {item.discountRate}%
          </Badge>
        )}
      </div>
      <div className="p-3">
        <p className="mb-1 text-xs font-medium text-slate-500">{item.brandName}</p>
        <p className="mb-2 line-clamp-2 text-sm font-semibold text-slate-800">{item.goodsName}</p>
        <div className="flex items-baseline justify-between">
          <div>
            {item.salePrice !== item.discountPrice && (
              <p className="text-xs text-slate-400 line-through">
                {item.salePrice.toLocaleString()}P
              </p>
            )}
            <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text font-bold text-transparent">
              {item.discountPrice.toLocaleString()}P
            </p>
          </div>
          {canAfford ? (
            <ChevronRight className="h-5 w-5 text-blue-400" />
          ) : (
            <span className="text-xs font-medium text-red-500">포인트 부족</span>
          )}
        </div>
      </div>
    </div>
  );
}

function ExchangeCard({ item }: { item: ExchangeItem }) {
  const config = STATUS_CONFIG[item.status];
  const StatusIcon = config.icon;

  return (
    <div className="overflow-hidden rounded-[1.25rem] border border-white/50 bg-white/80 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
      <div className="flex gap-3 p-4">
        {item.goodsImageUrl && (
          <img
            src={item.goodsImageUrl}
            alt={item.goodsName}
            className="h-16 w-16 rounded-xl object-cover"
          />
        )}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs font-medium text-slate-500">{item.brandName}</p>
            <Badge variant="secondary" className={cn("rounded-full text-xs", config.className)}>
              <StatusIcon
                className={cn("mr-1 h-3 w-3", item.status === "PROCESSING" && "animate-spin")}
              />
              {config.label}
            </Badge>
          </div>
          <p className="font-semibold text-slate-800">{item.goodsName}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="bg-gradient-to-r from-blue-600 to-cyan-500 bg-clip-text text-sm font-bold text-transparent">
              -{item.pointsUsed.toLocaleString()}P
            </p>
            <p className="text-xs text-slate-400">
              {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true, locale: ko })}
            </p>
          </div>
          {item.status === "COMPLETED" && item.validUntil && (
            <p className="mt-1 text-xs text-slate-500">
              유효기간: {new Date(item.validUntil).toLocaleDateString("ko-KR")}까지
            </p>
          )}
          {item.status === "FAILED" && item.failReason && (
            <p className="mt-1 text-xs font-medium text-red-500">사유: {item.failReason}</p>
          )}
        </div>
      </div>
      {item.status === "COMPLETED" && item.couponImageUrl && (
        <div className="border-t border-slate-100 bg-gradient-to-r from-blue-50/50 to-cyan-50/50 p-3">
          <a
            href={item.couponImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm font-medium text-blue-600 hover:underline"
          >
            쿠폰 이미지 보기
          </a>
        </div>
      )}
    </div>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen">
      <div className="relative overflow-hidden bg-gradient-to-br from-blue-600 via-cyan-500 to-emerald-500 px-5 pt-6 pb-8">
        <Skeleton className="mb-2 h-8 w-32 bg-white/20" />
        <Skeleton className="mb-4 h-4 w-48 bg-white/20" />
        <Skeleton className="h-28 rounded-[1.5rem] bg-white/20" />
      </div>
      <div className="px-5 pt-4">
        <Skeleton className="mb-4 h-12 w-full rounded-2xl" />
        <Skeleton className="mb-4 h-12 w-full rounded-2xl" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-[1.25rem]" />
          ))}
        </div>
      </div>
    </div>
  );
}
