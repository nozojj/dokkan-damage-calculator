import type { Metadata } from "next";
import Link from "next/link";
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
        <nav className="flex justify-center gap-4 border-b border-zinc-200 bg-white px-4 py-2 text-sm dark:border-zinc-800 dark:bg-zinc-950">
          <Link href="/" className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100">
            計算機・データ管理
          </Link>
          <Link
            href="/tools/party-builder"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            パーティ編成
          </Link>
          <Link
            href="/tools/incoming-damage"
            className="text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-100"
          >
            被ダメージ計算(パーティ)
          </Link>
        </nav>
        <div className="flex flex-1 flex-col">{children}</div>
        <footer className="border-t border-zinc-200 bg-zinc-50 px-4 py-4 text-center text-xs text-zinc-500 dark:border-zinc-800 dark:bg-black dark:text-zinc-400">
          キャラクターデータの一部は Dragon Ball Z Dokkan Battle Wiki (Fandom) の情報を基にしており、CC BY-SA 3.0 のもとで提供されています。
        </footer>
      </body>
    </html>
  );
}
