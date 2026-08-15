import Image from "next/image";
import Link from "next/link";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { getTodaysDevotional, getPublishedSermons } from "@/actions/sermon";
import { getCurrentWeekDay, getWeekDayLabel } from "@/lib/constants";
import { formatDateLong } from "@/lib/utils";

// Passos do formato "Palavra da Semana" e áreas de oração diárias.
// Conteúdo estático de apresentação — não depende de dados do banco.
const HOW_IT_WORKS = [
  {
    step: "1",
    title: "Domingo recebemos a Palavra",
    text: "A pregação do domingo se torna o ponto de partida da semana inteira.",
  },
  {
    step: "2",
    title: "Uma pílula por dia",
    text: "De segunda a sábado, um devocional curto aprofunda a Palavra recebida.",
  },
  {
    step: "3",
    title: "20 minutos de primícia",
    text: "Antes de qualquer outra coisa, separe um tempo para ler, meditar e orar.",
  },
  {
    step: "4",
    title: "Um alvo de oração por dia",
    text: "Família, trabalho, vida espiritual, saúde, finanças e igreja.",
  },
];

const PRAYER_FOCUS = [
  "Família",
  "Trabalho",
  "Vida espiritual",
  "Saúde",
  "Finanças",
  "Igreja",
];

export default async function HomePage() {
  const todayDevotional = await getTodaysDevotional();
  const recentSermons = await getPublishedSermons();
  const today = getCurrentWeekDay();

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Scroll suave ao navegar para âncoras (ex.: botão do hero) */}
      <style>{`html { scroll-behavior: smooth; }`}</style>

      <PublicHeader />

      <main className="flex-1">
        {/* Hero — escuro, com a pomba como centro de luz */}
        <section className="relative overflow-hidden bg-gradient-to-b from-navy-900 via-navy-800 to-navy-900 px-4 py-24 sm:py-32">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-1/3 flex justify-center"
          >
            <div className="h-[460px] w-[460px] rounded-full bg-gold-500/20 blur-[100px]" />
          </div>

          <div className="relative mx-auto max-w-2xl text-center">
            <p className="text-xs sm:text-sm font-semibold tracking-[0.35em] text-gold-400 mb-8">
              IGREJA CRISTÃ
            </p>

            <div className="relative mx-auto mb-8 h-28 w-28">
              <Image
                src="/images/logo-pomba-dourada.png"
                alt="Pomba dourada, símbolo da Igreja Cristã Deus Proverá"
                fill
                priority
                className="object-contain drop-shadow-[0_0_25px_rgba(201,168,76,0.35)]"
              />
            </div>

            <h1 className="font-serif text-5xl sm:text-6xl font-bold tracking-tight text-white mb-6">
              Deus Proverá
            </h1>

            <p className="font-serif italic text-lg sm:text-xl text-gold-200 mb-2">
              Domingo recebemos a Palavra.
            </p>
            <p className="font-serif italic text-lg sm:text-xl text-gold-200 mb-10">
              Segunda a sábado vivemos a Palavra.
            </p>

            <a
              href="#palavra-da-semana"
              className="inline-flex items-center gap-2 rounded-full bg-gold-500 px-7 py-3 text-sm font-semibold text-navy-900 transition-colors hover:bg-gold-400"
            >
              Conhecer a Palavra da Semana
              <span aria-hidden="true">↓</span>
            </a>
          </div>
        </section>

        {/* Palavra da Semana — como funciona */}
        <section id="palavra-da-semana" className="px-4 py-20 bg-white scroll-mt-4">
          <div className="mx-auto max-w-3xl">
            <div className="text-center mb-14">
              <p className="text-xs sm:text-sm font-semibold tracking-[0.3em] text-gold-600 mb-3">
                PALAVRA DA SEMANA
              </p>
              <p className="text-navy-700 leading-relaxed max-w-xl mx-auto">
                A cada domingo, recebemos uma Palavra. Durante a semana, vamos
                meditar e praticar essa Palavra por meio de uma pílula diária,
                cada dia com um alvo de oração por uma área da nossa vida.
              </p>
            </div>

            <div className="grid gap-8 sm:grid-cols-2 mb-14">
              {HOW_IT_WORKS.map((item) => (
                <div key={item.step} className="flex gap-4">
                  <span className="font-serif text-2xl font-bold text-gold-400 shrink-0">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-medium text-navy-900 mb-1">
                      {item.title}
                    </h3>
                    <p className="text-sm text-navy-600 leading-relaxed">
                      {item.text}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2 mb-14">
              {PRAYER_FOCUS.map((area) => (
                <span
                  key={area}
                  className="rounded-full border border-gold-200 bg-gold-50 px-4 py-1.5 text-sm text-navy-700"
                >
                  {area}
                </span>
              ))}
            </div>

            <div className="rounded-2xl border border-gold-200 bg-gold-50/60 px-6 py-6 sm:px-8 sm:py-8 mb-14">
              <p className="text-navy-800 leading-relaxed">
                <span className="mr-2" aria-hidden="true">
                  🌅
                </span>
                <span className="font-semibold">Nosso desafio:</span> fazer
                deste momento uma primícia do dia. Antes de qualquer outra
                coisa, separar pelo menos 20 minutos para buscar a Deus, ler,
                meditar, orar e colocar a Palavra em prática.
              </p>
            </div>

            <div className="text-center border-t border-gold-100 pt-10">
              <p className="font-serif italic text-lg sm:text-xl text-navy-900 mb-3">
                &ldquo;Receba no domingo. Busque a Deus todos os dias.
                Viva a Palavra durante a semana.&rdquo;
              </p>
              <p className="text-sm tracking-widest text-gold-600">
                — ICDP · IGREJA CRISTÃ DEUS PROVERÁ
              </p>
            </div>
          </div>
        </section>

        {/* Devocional do dia */}
        <section className="px-4 py-16 bg-navy-900">
          <div className="mx-auto max-w-2xl">
            {todayDevotional ? (
              <Card className="overflow-hidden border-0 shadow-xl">
                <div className="bg-gold-500 px-6 py-3">
                  <p className="text-navy-900 text-sm font-medium">
                    Devocional de {today ? getWeekDayLabel(today) : "hoje"} ·{" "}
                    {formatDateLong(new Date())}
                  </p>
                </div>
                <CardContent className="py-7 bg-white">
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
              <Card className="border-0 shadow-xl">
                <CardContent className="py-14 text-center bg-white">
                  <div className="relative mx-auto mb-4 h-12 w-12 opacity-40">
                    <Image
                      src="/images/logo-pomba-dourada.png"
                      alt=""
                      fill
                      className="object-contain"
                    />
                  </div>
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
          <section className="px-4 py-16 bg-white">
            <div className="mx-auto max-w-2xl">
              <h2 className="font-serif text-2xl font-bold text-navy-900 mb-8 text-center">
                Semanas anteriores
              </h2>
              <div className="space-y-3">
                {recentSermons.slice(0, 5).map((sermon) => (
                  <Link key={sermon.id} href={`/palavra-da-semana/${sermon.id}`}>
                    <Card className="border-gold-100 hover:border-gold-400 hover:shadow-md transition-all cursor-pointer">
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
                <div className="mt-6 text-center">
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