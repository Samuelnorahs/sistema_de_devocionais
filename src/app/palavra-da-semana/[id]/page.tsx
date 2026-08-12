import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicHeader, PublicFooter } from "@/components/PublicHeader";
import { Card, CardContent } from "@/components/ui/Card";
import { prisma } from "@/lib/prisma";
import { WEEK_DAYS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function PalavraDaSemanaDetailPage({ params }: PageProps) {
  const { id } = await params;

  const sermon = await prisma.sermon.findFirst({
    where: { id, status: "PUBLICADO" },
    include: {
      analysis: true,
      devotionals: {
        where: { status: "PUBLICADO" },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });

  if (!sermon) notFound();

  return (
    <div className="min-h-screen flex flex-col">
      <PublicHeader />

      <main className="flex-1 py-12 px-4">
        <div className="mx-auto max-w-3xl">
          <div className="mb-8">
            <p className="text-sm text-gold-600 uppercase tracking-wide mb-1">
              Palavra da Semana
            </p>
            <h1 className="font-serif text-3xl font-bold text-navy-900 mb-2">
              {sermon.title}
            </h1>
            <p className="text-navy-500">
              {sermon.preacher} · {formatDate(sermon.date)}
            </p>
            {sermon.analysis && (
              <p className="mt-3 text-lg text-gold-700 font-medium">
                {sermon.analysis.centralTheme}
              </p>
            )}
          </div>

          <div className="grid gap-3">
            {WEEK_DAYS.map((day) => {
              const devotional = sermon.devotionals.find(
                (d) => d.dayOfWeek === day.key
              );
              const isAvailable = !!devotional;

              return (
                <Link
                  key={day.key}
                  href={
                    isAvailable
                      ? `/devocional/${sermon.id}/${day.key.toLowerCase()}`
                      : "#"
                  }
                  className={!isAvailable ? "pointer-events-none" : ""}
                >
                  <Card
                    className={
                      isAvailable
                        ? "hover:border-gold-400 transition-colors cursor-pointer"
                        : "opacity-50"
                    }
                  >
                    <CardContent className="py-4 flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-gold-100 flex items-center justify-center shrink-0">
                        <span className="text-sm font-bold text-gold-700">
                          {day.short}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="text-xs text-navy-500">{day.label}</p>
                        <p className="font-medium text-navy-900">
                          {devotional?.title || "Em breve"}
                        </p>
                      </div>
                      {isAvailable && <span className="text-gold-500">→</span>}
                    </CardContent>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
