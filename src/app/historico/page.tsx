import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { getPublishedSermons } from "@/actions/sermon";
import { formatDate } from "@/lib/utils";

export default async function HistoricoPage() {
  const sermons = await getPublishedSermons();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <h1 className="font-serif text-3xl font-bold text-navy-900 mb-8">
            Histórico de Semanas
          </h1>

          {sermons.length === 0 ? (
            <p className="text-navy-500 text-center py-12">
              Nenhuma semana publicada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {sermons.map((sermon) => (
                <Link key={sermon.id} href={`/palavra-da-semana/${sermon.id}`}>
                  <Card className="hover:border-gold-400 transition-colors cursor-pointer">
                    <CardContent className="py-4">
                      <h3 className="font-medium text-navy-900">{sermon.title}</h3>
                      <p className="text-sm text-navy-500">
                        {sermon.preacher} · {formatDate(sermon.date)}
                      </p>
                      {sermon.analysis && (
                        <p className="text-sm text-gold-600 mt-1">
                          {sermon.analysis.centralTheme}
                        </p>
                      )}
                      <p className="text-xs text-navy-400 mt-2">
                        {sermon.devotionals.length} devocionais
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          )}
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
