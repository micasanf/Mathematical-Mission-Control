import type { Metadata } from "next";
import { Geist, Geist_Mono, Orbitron, Electrolize } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/toaster";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const orbitron = Orbitron({
  variable: "--font-orbitron",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const electrolize = Electrolize({
  variable: "--font-electrolize",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Mathematical Mission Control — Explore Math in Space",
  description: "An immersive space-themed educational platform for learning mathematical sequences and algorithms through interactive missions.",
  keywords: ["mathematics", "education", "sequences", "algorithms", "Fibonacci", "Collatz", "Euclidean", "interactive"],
  authors: [{ name: "Mathematical Mission Control" }],
  icons: {
    icon: "https://z-cdn.chatglm.cn/z-ai/static/logo.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark" suppressHydrationWarning>
      <link rel="preconnect" href="https://fonts.googleapis.com" />
      <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${orbitron.variable} ${electrolize.variable} antialiased bg-black text-white`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
