import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#ffb6c1",
};

export const metadata: Metadata = {
  title: "Couple Diary",
  description: "커플 추억 기록 다이어리 앱",
  manifest: "/manifest.json",
  referrer: "origin",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "Our Diary",
  },
};

import { Providers } from "@/components/Providers";

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-50">
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
