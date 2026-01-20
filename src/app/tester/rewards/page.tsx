import { Card } from "@/components/ui/card";

export default function RewardsPage() {
  return (
    <div className="p-5">
      <h1 className="mb-6 text-2xl font-bold text-slate-900">리워드</h1>
      <div className="mb-6 grid grid-cols-2 gap-4">
        <Card className="p-4">
          <p className="text-sm text-slate-500">총 적립</p>
          <p className="tabular-nums text-2xl font-bold text-slate-900">15,000P</p>
        </Card>
        <Card className="p-4">
          <p className="text-sm text-slate-500">지급 대기</p>
          <p className="tabular-nums text-2xl font-bold text-secondary">5,000P</p>
        </Card>
      </div>
      <h2 className="mb-4 text-lg font-semibold text-slate-900">리워드 내역</h2>
      <div className="space-y-3">
        <RewardItem title="새로운 배달 앱 테스트" amount={5000} status="REQUESTED" date="2024-01-15" />
        <RewardItem title="금융 앱 사용성 테스트" amount={3000} status="SENT" date="2024-01-10" />
        <RewardItem title="게임 앱 첫인상 피드백" amount={2000} status="SENT" date="2024-01-05" />
      </div>
    </div>
  );
}

function RewardItem({
  title,
  amount,
  status,
  date,
}: {
  title: string;
  amount: number;
  status: string;
  date: string;
}) {
  return (
    <div className="flex items-center justify-between rounded-xl bg-white p-4 shadow-sm">
      <div>
        <p className="font-medium text-slate-900">{title}</p>
        <p className="text-xs text-slate-400">{date}</p>
      </div>
      <div className="text-right">
        <p className="tabular-nums font-bold text-secondary">+{amount.toLocaleString()}P</p>
        <p className="text-xs text-slate-400">{status === "SENT" ? "지급완료" : "대기중"}</p>
      </div>
    </div>
  );
}
