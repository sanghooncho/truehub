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
    default: "TrueHub - 리워드 앱 체험/피드백 플랫폼",
    template: "%s | TrueHub",
  },
  description:
    "앱을 체험하고 피드백을 남기면 리워드를 받는 플랫폼입니다. 테스터로 참여하거나 광고주로 캠페인을 만들어보세요.",
  keywords: ["리워드", "앱 체험", "피드백", "테스터", "캠페인"],
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
