import type { Metadata } from "next";

export const metadata: Metadata = {
  title: {
    default: "광고주 | TrueHub - 테스터 모집 플랫폼",
    template: "%s | TrueHub 광고주",
  },
  description:
    "TrueHub에서 실제 사용자에게 앱 테스트를 맡기고 진짜 피드백을 받으세요. AI 기반 인사이트 리포트 제공. 테스터 모집 플랫폼.",
  keywords: [
    "테스터 모집 플랫폼",
    "앱 테스트 서비스",
    "사용자 피드백 수집",
    "UX 리서치",
    "앱 피드백",
    "베타 테스터 모집",
  ],
  openGraph: {
    title: "TrueHub 광고주 - 테스터 모집하고 실제 피드백 받기",
    description:
      "실제 사용자에게 앱 테스트를 맡기고 AI 기반 인사이트 리포트를 받으세요. 프로모 코드로 무료 시작!",
    type: "website",
    locale: "ko_KR",
    siteName: "TrueHub",
    images: [
      {
        url: "https://truehub.previewapp.co.kr/logo.png",
        width: 800,
        height: 400,
        alt: "TrueHub - 테스터 모집 플랫폼",
      },
    ],
  },
};

export default function AdvertiserRootLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
