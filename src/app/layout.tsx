// app/layout.tsx
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import { Providers } from "./providers";
import AlertOnLogin from "./components/AlertOnLogin";
import SweetAlertProvider from "./components/SweetAlertProvider";
import { GlobalLoading } from "../components/ui/GlobalLoading";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Wise Attitude - Management System",
  description: "ระบบจัดการทรัพย์สินที่พัฒนาด้วย Next.js และ Prisma",
  icons: {
    icon: "/assets/images/Logo.jpg",
    shortcut: "/assets/images/Logo.jpg",
    apple: "/assets/images/Logo.jpg",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="th">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <SweetAlertProvider>
            {children}
            <AlertOnLogin />
            <GlobalLoading />
          </SweetAlertProvider>
        </Providers>
      </body>
    </html>
  );
}
