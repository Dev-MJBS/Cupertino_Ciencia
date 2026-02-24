import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Ciência Pedagogia - Escrita Científica Estruturada",
  description: "Plataforma para construção de artigos científicos com auxílio de IA.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className="bg-[#0a0a0a]">
      <body className={`${inter.className} bg-[#0a0a0a] text-white`}>{children}</body>
    </html>
  );
}
