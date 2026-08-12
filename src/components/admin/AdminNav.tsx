import Link from "next/link";
import { signOut } from "@/lib/auth";
import { DoveLogo } from "../DoveLogo";
import { Button } from "../ui/Button";

export function AdminNav({ userName, userRole }: { userName: string; userRole: string }) {
  return (
    <header className="border-b border-gold-200 bg-navy-900 text-white">
      <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
        <Link href="/admin" className="flex items-center gap-2">
          <DoveLogo className="w-8 h-8 text-gold-400" />
          <span className="font-serif font-semibold">Painel ICDP</span>
        </Link>
        <nav className="flex items-center gap-4 text-sm">
          <Link href="/admin" className="hover:text-gold-300 transition-colors">
            Início
          </Link>
          <Link href="/admin/nova-pregacao" className="hover:text-gold-300 transition-colors">
            Nova Pregação
          </Link>
          <Link href="/admin/historico" className="hover:text-gold-300 transition-colors">
            Histórico
          </Link>
          <Link href="/" className="hover:text-gold-300 transition-colors text-navy-300">
            Site
          </Link>
          <div className="flex items-center gap-2 ml-4 pl-4 border-l border-navy-700">
            <span className="text-navy-300 text-xs">
              {userName} ({userRole})
            </span>
            <form
              action={async () => {
                "use server";
                await signOut({ redirectTo: "/admin/login" });
              }}
            >
              <Button type="submit" variant="ghost" size="sm" className="text-navy-300 hover:text-white hover:bg-navy-800">
                Sair
              </Button>
            </form>
          </div>
        </nav>
      </div>
    </header>
  );
}
