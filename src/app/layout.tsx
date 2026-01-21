import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-pretendard",
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "TrueHub - 앱 테스터 모집 플랫폼 | AI 기반 사용자 피드백 분석",
    template: "%s | TrueHub",
  },
  description:
    "TrueHub에서 검증된 앱 테스터를 모집하고 실제 사용자 피드백을 받으세요. AI가 분석한 인사이트 리포트로 제품 개선점을 즉시 파악할 수 있습니다. 무료로 시작하세요!",
  keywords: [
    "테스터 모집 플랫폼",
    "앱 테스트 서비스",
    "사용자 피드백 수집",
    "UX 리서치 플랫폼",
    "베타 테스터 모집",
    "앱 피드백 분석",
    "AI 피드백 분석",
    "앱 사용성 테스트",
  ],
  openGraph: {
    title: "TrueHub - 앱 테스터 모집 플랫폼 | AI 기반 사용자 피드백 분석",
    description:
      "검증된 테스터를 모집하고 AI가 분석한 인사이트 리포트를 받으세요. 실제 사용자 피드백으로 제품을 빠르게 개선하세요.",
    type: "website",
    locale: "ko_KR",
    siteName: "TrueHub",
    url: "https://truehub.previewapp.co.kr",
    images: [
      {
        url: "https://truehub.previewapp.co.kr/logo.png",
        width: 800,
        height: 400,
        alt: "TrueHub - 리워드 플랫폼",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "TrueHub - 앱 테스터 모집 플랫폼",
    description:
      "검증된 테스터를 모집하고 AI 기반 인사이트 리포트를 받으세요. 실제 사용자 피드백으로 제품을 빠르게 개선!",
    images: ["https://truehub.previewapp.co.kr/logo.png"],
  },
  alternates: {
    canonical: "https://truehub.previewapp.co.kr",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "",
    other: {
      "naver-site-verification": "5c4ec70d5959887cbfe6a3325eabe7265950877c",
    },
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#0052CC",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <body className={`${inter.variable} font-sans antialiased`}>
        {children}
        <Toaster position="bottom-center" />
      </body>
    </html>
  );
}
