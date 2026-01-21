"use client";

import { useState, useEffect, useCallback } from "react";
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
  const [activeTab, setActiveTab] = useState("shop");
  const [goods, setGoods] = useState<GoodsItem[]>([]);
  const [exchanges, setExchanges] = useState<ExchangeItem[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGoods, setSelectedGoods] = useState<GoodsItem | null>(null);
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

  const fetchGoods = useCallback(async () => {
    try {
      const response = await fetch(
        `/api/v1/giftshop/goods?size=100&search=${encodeURIComponent(searchQuery)}`
      );
      if (!response.ok) throw new Error("상품 목록을 불러오는데 실패했습니다");
      const json = await response.json();
      setGoods(json.data?.goods || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다";
      toast.error(message);
    }
  }, [searchQuery]);

  const fetchExchanges = useCallback(async () => {
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
  }, []);

  useEffect(() => {
    setIsLoading(true);
    Promise.all([fetchGoods(), fetchExchanges()]).finally(() => setIsLoading(false));
  }, [fetchGoods, fetchExchanges]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchQuery !== undefined) {
        fetchGoods();
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, fetchGoods]);

  const handleExchange = async () => {
    if (!selectedGoods) return;

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
        toast.success("상품권이 성공적으로 발송되었습니다!");
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
    setPhoneNumber("");
    setExchangeResult(null);
  };

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  return (
    <div className="animate-fade-in-up min-h-screen bg-slate-50 pb-24">
      <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-5 pt-6 pb-8 text-white">
        <h1 className="mb-2 text-2xl font-bold">상품권 교환</h1>
        <p className="mb-4 text-sm text-violet-200">포인트를 상품권으로 교환하세요</p>
        <Card className="border-0 bg-indigo-500 p-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-violet-100">사용 가능 포인트</p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {(summary?.availablePoints ?? 0).toLocaleString()}
                <span className="ml-1 text-lg">P</span>
              </p>
            </div>
            <Gift className="h-12 w-12 text-violet-200" />
          </div>
        </Card>
      </div>

      <div className="px-5 pt-4">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-slate-100">
            <TabsTrigger value="shop" className="data-[state=active]:bg-white">
              <ShoppingBag className="mr-2 h-4 w-4" />
              상품권 구매
            </TabsTrigger>
            <TabsTrigger value="history" className="data-[state=active]:bg-white">
              <Clock className="mr-2 h-4 w-4" />
              교환 내역
            </TabsTrigger>
          </TabsList>

          <TabsContent value="shop" className="mt-4">
            <div className="relative mb-4">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <Input
                placeholder="상품명 또는 브랜드 검색"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>

            {goods.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <ShoppingBag className="mb-4 h-12 w-12 text-slate-300" />
                <p className="text-slate-500">검색 결과가 없습니다</p>
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
            {exchanges.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Gift className="mb-4 h-12 w-12 text-slate-300" />
                <p className="font-medium text-slate-700">교환 내역이 없습니다</p>
                <p className="mt-1 text-sm text-slate-500">상품권을 교환하고 내역을 확인하세요</p>
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
        <DialogContent className="max-w-sm">
          <DialogHeader>
            <DialogTitle>상품권 교환</DialogTitle>
            <DialogDescription>휴대폰 번호로 상품권이 전송됩니다</DialogDescription>
          </DialogHeader>

          {selectedGoods && (
            <div className="space-y-4">
              <div className="flex items-center gap-3 rounded-lg bg-slate-50 p-3">
                <img
                  src={selectedGoods.goodsImgS}
                  alt={selectedGoods.goodsName}
                  className="h-16 w-16 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="text-xs text-slate-500">{selectedGoods.brandName}</p>
                  <p className="font-medium text-slate-900">{selectedGoods.goodsName}</p>
                  <p className="text-sm font-bold text-violet-600">
                    {selectedGoods.discountPrice.toLocaleString()}P
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">
                  <Phone className="mr-1 inline h-4 w-4" />
                  받으실 휴대폰 번호
                </label>
                <Input
                  type="tel"
                  placeholder="01012345678"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, ""))}
                  maxLength={11}
                />
              </div>

              <div className="rounded-lg bg-amber-50 p-3 text-sm text-amber-700">
                <p className="font-medium">유의사항</p>
                <ul className="mt-1 list-inside list-disc space-y-1 text-xs">
                  <li>유효기간: 발행일로부터 {selectedGoods.limitDay}일</li>
                  <li>기간 연장/환불 불가</li>
                  <li>상품권은 입력하신 번호로 MMS 발송됩니다</li>
                </ul>
              </div>
            </div>
          )}

          <DialogFooter className="gap-2 sm:gap-0">
            <Button variant="outline" onClick={closeDialog}>
              취소
            </Button>
            <Button
              onClick={handleExchange}
              disabled={isExchanging || !phoneNumber || phoneNumber.length < 10}
              className="bg-violet-600 hover:bg-violet-700"
            >
              {isExchanging ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  교환 중...
                </>
              ) : (
                <>교환하기</>
              )}
            </Button>
          </DialogFooter>
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
                  상품권이 성공적으로 발송되었습니다
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
    <Card
      className="cursor-pointer overflow-hidden transition-all hover:shadow-md"
      onClick={onSelect}
    >
      <div className="relative aspect-square bg-slate-100">
        <img
          src={item.goodsImgS}
          alt={item.goodsName}
          className="h-full w-full object-cover"
          loading="lazy"
        />
        {item.discountRate > 0 && (
          <Badge className="absolute top-2 right-2 bg-red-500">{item.discountRate}%</Badge>
        )}
      </div>
      <div className="p-3">
        <p className="mb-1 text-xs text-slate-500">{item.brandName}</p>
        <p className="mb-2 line-clamp-2 text-sm font-medium text-slate-900">{item.goodsName}</p>
        <div className="flex items-baseline justify-between">
          <div>
            {item.salePrice !== item.discountPrice && (
              <p className="text-xs text-slate-400 line-through">
                {item.salePrice.toLocaleString()}P
              </p>
            )}
            <p className="font-bold text-violet-600">{item.discountPrice.toLocaleString()}P</p>
          </div>
          {canAfford ? (
            <ChevronRight className="h-5 w-5 text-slate-400" />
          ) : (
            <span className="text-xs text-red-500">포인트 부족</span>
          )}
        </div>
      </div>
    </Card>
  );
}

function ExchangeCard({ item }: { item: ExchangeItem }) {
  const config = STATUS_CONFIG[item.status];
  const StatusIcon = config.icon;

  return (
    <Card className="overflow-hidden">
      <div className="flex gap-3 p-4">
        {item.goodsImageUrl && (
          <img
            src={item.goodsImageUrl}
            alt={item.goodsName}
            className="h-16 w-16 rounded-lg object-cover"
          />
        )}
        <div className="flex-1">
          <div className="mb-1 flex items-center justify-between">
            <p className="text-xs text-slate-500">{item.brandName}</p>
            <Badge variant="secondary" className={cn("text-xs", config.className)}>
              <StatusIcon
                className={cn("mr-1 h-3 w-3", item.status === "PROCESSING" && "animate-spin")}
              />
              {config.label}
            </Badge>
          </div>
          <p className="font-medium text-slate-900">{item.goodsName}</p>
          <div className="mt-2 flex items-center justify-between">
            <p className="text-sm font-bold text-violet-600">
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
            <p className="mt-1 text-xs text-red-500">사유: {item.failReason}</p>
          )}
        </div>
      </div>
      {item.status === "COMPLETED" && item.couponImageUrl && (
        <div className="border-t bg-slate-50 p-3">
          <a
            href={item.couponImageUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-violet-600 hover:underline"
          >
            쿠폰 이미지 보기
          </a>
        </div>
      )}
    </Card>
  );
}

function LoadingSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-gradient-to-br from-violet-600 to-indigo-600 px-5 pt-6 pb-8">
        <Skeleton className="mb-2 h-8 w-32 bg-white/20" />
        <Skeleton className="mb-4 h-4 w-48 bg-white/20" />
        <Skeleton className="h-24 rounded-xl bg-white/20" />
      </div>
      <div className="px-5 pt-4">
        <Skeleton className="mb-4 h-10 w-full" />
        <Skeleton className="mb-4 h-10 w-full" />
        <div className="grid grid-cols-2 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="aspect-[3/4] rounded-xl" />
          ))}
        </div>
      </div>
    </div>
  );
}
