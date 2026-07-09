import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "react-hot-toast";
import { AppProviders } from "@/lib/app-providers";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Thera - OVGS",
  description: "Thera - Sistema de Gestão de Ordens de Venda ",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR">
      <body className={`${inter.variable} font-sans antialiased`}>
        <AppProviders>
          {children}
          <Toaster position="top-right" />
        </AppProviders>
      </body>
    </html>
  );
}
