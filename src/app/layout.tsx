import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "Arraiá da Educação 2026",
  description: "Confirme sua presença no Arraiá da Educação 2026",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className="bg-amber-50 text-slate-900 antialiased">
        {children}
      </body>
    </html>
  );
}
