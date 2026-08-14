import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { DoveLogo } from "@/components/DoveLogo"; //Logo da igreja icdp
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getTodaysDevotional, getPublishedSermons } from "@/actions/sermon";
import { getCurrentWeekDay, getWeekDayLabel } from "@/lib/constants";
import { formatDateLong } from "@/lib/utils";

export default async function HomePage() {
  const todayDevotional = await getTodaysDevotional();
  const recentSermons = await getPublishedSermons();
  const today = getCurrentWeekDay();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="bg-gradient-to-b from-gold-100 to-gold-50 py-16 px-4">
          <div className="mx-auto max-w-3xl text-center">
            <DoveLogo className="w-16 h-16 text-gold-500 mx-auto mb-6" />
            <h1 className="font-serif text-4xl sm:text-5xl font-bold text-navy-900 mb-4">
              Deus Proverá
            </h1>
            <p className="text-lg text-navy-600 mb-2">
              Domingo recebemos a Palavra
            </p>
            <p className="text-lg text-gold-700 font-medium">
              Segunda a sábado vivemos a Palavra
            </p>
          </div>
        </section>

        {/* Devocional do dia */}
        <section className="py-12 px-4">
          <div className="mx-auto max-w-3xl">
            {todayDevotional ? (
              <Card className="overflow-hidden">
                <div className="bg-gold-500 px-6 py-3">
                  <p className="text-gold-100 text-sm">
                    Devocional de {today ? getWeekDayLabel(today) : "hoje"} ·{" "}
                    {formatDateLong(new Date())}
                  </p>
                </div>
                <CardContent className="py-6">
                  <p className="text-xs uppercase tracking-wide text-gold-600 mb-2">
                    {todayDevotional.sermon.analysis?.centralTheme}
                  </p>
                  <h2 className="font-serif text-2xl font-bold text-navy-900 mb-3">
                    {todayDevotional.devotional.title}
                  </h2>
                  <p className="text-sm italic text-gold-700 mb-4">
                    {todayDevotional.devotional.verse}
                  </p>
                  <p className="text-navy-700 line-clamp-4 mb-6">
                    {todayDevotional.devotional.reflection}
                  </p>
                  <Link
                    href={`/devocional/${todayDevotional.sermon.id}/${todayDevotional.devotional.dayOfWeek.toLowerCase()}`}
                  >
                    <Button>Ler devocional completo</Button>
                  </Link>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <DoveLogo className="w-12 h-12 text-gold-300 mx-auto mb-4" />
                  {today === null ? (
                    <>
                      <h2 className="font-serif text-xl text-navy-800 mb-2">
                        Domingo — Dia de receber a Palavra
                      </h2>
                      <p className="text-navy-500">
                        Os devocionais da semana estarão disponíveis a partir de segunda-feira.
                      </p>
                    </>
                  ) : (
                    <>
                      <h2 className="font-serif text-xl text-navy-800 mb-2">
                        Nenhum devocional publicado ainda
                      </h2>
                      <p className="text-navy-500">
                        Em breve teremos a Palavra da Semana disponível para você.
                      </p>
                    </>
                  )}
                </CardContent>
              </Card>
            )}
          </div>
        </section>

        {/* Semanas anteriores */}
        {recentSermons.length > 0 && (
          <section className="py-12 px-4 bg-white">
            <div className="mx-auto max-w-3xl">
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-6">
                Semanas anteriores
              </h2>
              <div className="space-y-3">
                {recentSermons.slice(0, 5).map((sermon) => (
                  <Link key={sermon.id} href={`/palavra-da-semana/${sermon.id}`}>
                    <Card className="hover:border-gold-400 transition-colors cursor-pointer">
                      <CardContent className="py-4 flex items-center justify-between">
                        <div>
                          <h3 className="font-medium text-navy-900">{sermon.title}</h3>
                          <p className="text-sm text-navy-500">
                            {sermon.preacher} ·{" "}
                            {new Date(sermon.date).toLocaleDateString("pt-BR")}
                          </p>
                          {sermon.analysis && (
                            <p className="text-sm text-gold-600 mt-1">
                              {sermon.analysis.centralTheme}
                            </p>
                          )}
                        </div>
                        <span className="text-gold-500">→</span>
                      </CardContent>
                    </Card>
                  </Link>
                ))}
              </div>
              {recentSermons.length > 5 && (
                <div className="mt-4 text-center">
                  <Link href="/historico">
                    <Button variant="outline">Ver todo o histórico</Button>
                  </Link>
                </div>
              )}
            </div>
          </section>
        )}
      </main>

      <PublicFooter />
    </div>
  );
}
