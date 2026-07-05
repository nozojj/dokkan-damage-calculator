import type { Metadata } from "next";
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

export const metadata: Metadata = {
  title: "ドッカンバトル ダメージ計算機",
  description: "ドッカンバトルのダメージ計算ツール",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-zinc-200 bg-zinc-50 px-4 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
          キャラクターデータの一部は Dragon Ball Z Dokkan Battle Wiki (Fandom) の情報を基にしており、CC BY-SA 3.0 のもとで提供されています。
        </footer>
      </body>
    </html>
  );
}
