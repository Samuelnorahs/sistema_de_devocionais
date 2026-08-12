import Link from "next/link";
import { DoveLogo } from "./DoveLogo";

export function PublicHeader() {
  return (
    <header className="border-b border-gold-200 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="mx-auto max-w-3xl px-4 py-4 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-3 group">
          <DoveLogo className="w-10 h-10 text-gold-500 group-hover:text-gold-600 transition-colors" />
          <div>
            <span className="font-serif text-lg font-semibold text-navy-900">
              Deus Proverá
            </span>
            <p className="text-xs text-navy-500 hidden sm:block">Devocionais ICDP</p>
          </div>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link
            href="/palavra-da-semana"
            className="text-navy-600 hover:text-gold-600 transition-colors"
          >
            Palavra da Semana
          </Link>
          <Link
            href="/historico"
            className="text-navy-600 hover:text-gold-600 transition-colors hidden sm:inline"
          >
            Histórico
          </Link>
        </nav>
      </div>
    </header>
  );
}

export function PublicFooter() {
  return (
    <footer className="border-t border-gold-200 bg-white mt-auto">
      <div className="mx-auto max-w-3xl px-4 py-8 text-center">
        <DoveLogo className="w-8 h-8 text-gold-400 mx-auto mb-3" />
        <p className="text-sm text-navy-500">
          Domingo recebemos a Palavra · Segunda a sábado vivemos a Palavra
        </p>
        <p className="text-xs text-navy-400 mt-2">
          Igreja Cristã Deus Proverá — ICDP
        </p>
      </div>
    </footer>
  );
}
