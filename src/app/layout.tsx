import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Deus Proverá — Devocionais ICDP",
  description:
    "Domingo recebemos a Palavra. Segunda a sábado vivemos a Palavra. Devocionais semanais da Igreja Cristã Deus Proverá.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="pt-BR">
      <body className="min-h-screen antialiased">{children}</body>
    </html>
  );
}
