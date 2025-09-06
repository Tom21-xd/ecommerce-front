import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Ecommerce - UDLA",
  description: "E-commerce demo con Next.js + Nest + Prisma",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="min-h-dvh flex flex-col bg-neutral-50 text-neutral-900">
        <Header />
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster richColors />
      </body>
    </html>
  );
}
