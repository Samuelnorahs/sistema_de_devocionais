import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { getPublishedSermons } from "@/actions/sermon";
import { formatDate } from "@/lib/utils";

const DAY_MAP: Record<string, string> = {
  segunda: "SEGUNDA",
  terca: "TERCA",
  quarta: "QUARTA",
  quinta: "QUINTA",
  sexta: "SEXTA",
  sabado: "SABADO",
};

interface PageProps {
  params: Promise<{ sermonId: string; day: string }>;
}

export default async function DevocionalPage({ params }: PageProps) {
  const { sermonId, day } = await params;
  const dayKey = DAY_MAP[day.toLowerCase()];

  if (!dayKey) notFound();

  const { getDevotionalByDay } = await import("@/actions/sermon");
  const devotional = await getDevotionalByDay(
    sermonId,
    dayKey as "SEGUNDA" | "TERCA" | "QUARTA" | "QUINTA" | "SEXTA" | "SABADO"
  );

  if (!devotional) notFound();

  const { getWeekDayLabel } = await import("@/lib/constants");

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-8 px-4">
        <div className="mx-auto max-w-2xl">
          <Link
            href={`/palavra-da-semana/${sermonId}`}
            className="text-sm text-gold-600 hover:text-gold-700 mb-6 inline-block"
          >
            ← Voltar para Palavra da Semana
          </Link>

          <article>
            <header className="mb-8">
              <p className="text-sm text-gold-600 uppercase tracking-wide mb-1">
                {getWeekDayLabel(devotional.dayOfWeek)}
              </p>
              {devotional.sermon.analysis && (
                <p className="text-xs text-navy-500 mb-2">
                  {devotional.sermon.analysis.centralTheme}
                </p>
              )}
              <h1 className="font-serif text-3xl font-bold text-navy-900 mb-4">
                {devotional.title}
              </h1>
              <blockquote className="border-l-4 border-gold-400 pl-4 italic text-gold-800">
                {devotional.verse}
              </blockquote>
            </header>

            <div className="prose-devotional space-y-8 text-navy-800">
              <section>
                <h2 className="font-serif text-xl font-semibold text-navy-900 mb-3">
                  Reflexão
                </h2>
                {devotional.reflection.split("\n").map((p, i) => (
                  <p key={i}>{p}</p>
                ))}
              </section>

              <section className="bg-gold-50 rounded-xl p-6">
                <h2 className="font-serif text-xl font-semibold text-navy-900 mb-3">
                  Aplicação pessoal
                </h2>
                <p>{devotional.personalApplication}</p>
              </section>

              <section>
                <h2 className="font-serif text-xl font-semibold text-navy-900 mb-3">
                  Pergunta para reflexão
                </h2>
                <p className="italic">{devotional.reflectionQuestion}</p>
              </section>

              <section className="bg-navy-900 text-white rounded-xl p-6">
                <h2 className="font-serif text-xl font-semibold mb-3">Oração</h2>
                <p className="text-navy-100">{devotional.prayer}</p>
              </section>

              <section className="border-2 border-gold-300 rounded-xl p-6">
                <h2 className="font-serif text-xl font-semibold text-gold-800 mb-3">
                  Desafio prático
                </h2>
                <p className="text-gold-900 font-medium">
                  {devotional.practicalChallenge}
                </p>
              </section>
            </div>
          </article>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
