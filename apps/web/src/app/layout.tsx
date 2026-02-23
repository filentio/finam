import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "@/app/providers";
import { Toaster } from "@/components/ui/sonner";

export const metadata: Metadata = {
  title: process.env.NEXT_PUBLIC_APP_NAME || "HH Apply MVP",
  description: "Web кабинет для поиска вакансий, писем и откликов (HH.ru).",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" suppressHydrationWarning>
      <body className="min-h-screen antialiased">
        <Providers>
          {children}
          <Toaster />
        </Providers>
      </body>
    </html>
  );
}
