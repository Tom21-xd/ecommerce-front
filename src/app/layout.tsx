import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/header";
import Footer from "@/components/layout/footer";
import { Toaster } from "sonner";


// Removed unused font variables geistSans and geistMono

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
  <html lang="es" suppressHydrationWarning>
      <body className="min-h-dvh flex flex-col bg-neutral-50 text-neutral-900 dark:bg-neutral-900 dark:text-neutral-100 transition-colors">
        <Header>
          {/* Aquí irá el ThemePicker */}
        </Header>
        <main className="flex-1 mx-auto w-full max-w-6xl px-4 py-8">
          {children}
        </main>
        <Footer />
        <Toaster richColors />
      </body>
    </html>
  );
}
