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
      <body className="bg-amber-50 text-slate-900 antialiased min-h-screen flex flex-col">
        <div className="flex-1">{children}</div>
        <footer className="py-2 text-center text-[10px] text-slate-500 bg-slate-100 border-t border-slate-200">
          Desenvolvido pelo Departamento de Tecnologia da SME.
        </footer>
      </body>
    </html>
  );
}
