import { Skeleton } from "@/components/ui/skeleton";

function CampaignCardSkeleton() {
  return (
    <div className="rounded-[1.25rem] border border-white/50 bg-white/80 p-5 shadow-xl shadow-slate-200/40 backdrop-blur-sm">
      <div className="mb-3 flex items-center gap-2">
        <Skeleton className="h-6 w-16 rounded-full" />
      </div>

      <Skeleton className="mb-2 h-5 w-full" />
      <Skeleton className="mb-1 h-5 w-3/4" />

      <Skeleton className="mb-4 h-3 w-20" />

      <Skeleton className="mb-4 h-2 w-full rounded-full" />

      <div className="flex items-end justify-between">
        <div className="flex items-center gap-3">
          <Skeleton className="h-6 w-16 rounded-lg" />
          <Skeleton className="h-6 w-20 rounded-lg" />
        </div>
        <Skeleton className="h-7 w-20" />
      </div>
    </div>
  );
}

export function CampaignListSkeleton() {
  return (
    <div className="animate-fade-in-up">
      <div className="sticky top-14 z-40 border-b border-white/50 bg-white/70 backdrop-blur-xl">
        <div className="space-y-3 px-5 py-4">
          <Skeleton className="h-11 w-full rounded-2xl" />
          <div className="flex items-center justify-between">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-9 w-24 rounded-xl" />
          </div>
        </div>
      </div>

      <div className="space-y-4 px-5 pt-4 pb-8">
        {Array.from({ length: 5 }).map((_, i) => (
          <CampaignCardSkeleton key={i} />
        ))}
      </div>
    </div>
  );
}
