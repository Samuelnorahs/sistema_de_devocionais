import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { SERMON_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { canUpload, canReview } from "@/lib/auth";
import { requireAdmin } from "@/lib/session";

function statusColor(status: string) {
  switch (status) {
    case "PUBLICADO":
      return "green";
    case "PRONTO_REVISAO":
      return "blue";
    case "ERRO":
      return "red";
    default:
      return "yellow";
  }
}

export default async function AdminDashboardPage() {
  const session = await requireAdmin();

  const recentSermons = await prisma.sermon.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      _count: { select: { devotionals: true } },
    },
  });

  const stats = {
    total: await prisma.sermon.count(),
    published: await prisma.sermon.count({ where: { status: "PUBLICADO" } }),
    pending: await prisma.sermon.count({ where: { status: "PRONTO_REVISAO" } }),
    processing: await prisma.sermon.count({
      where: {
        status: {
          in: ["RECEBENDO_AUDIO", "TRANSCREVENDO", "ANALISANDO", "CRIANDO_DEVOCIONAIS"],
        },
      },
    }),
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-serif text-3xl font-bold text-navy-900">
            Painel Administrativo
          </h1>
          <p className="text-navy-500 mt-1">
            Bem-vindo, {session.user.name}
          </p>
        </div>
        {canUpload(session.user.role) && (
          <Link href="/admin/nova-pregacao">
            <Button>Nova Pregação</Button>
          </Link>
        )}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: "Total", value: stats.total },
          { label: "Publicadas", value: stats.published },
          { label: "Aguardando revisão", value: stats.pending },
          { label: "Processando", value: stats.processing },
        ].map((stat) => (
          <Card key={stat.label}>
            <CardContent className="py-4 text-center">
              <p className="text-2xl font-bold text-navy-900">{stat.value}</p>
              <p className="text-xs text-navy-500">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-serif text-lg font-semibold">Pregações recentes</h2>
        </CardHeader>
        <CardContent>
          {recentSermons.length === 0 ? (
            <p className="text-navy-500 text-center py-8">
              Nenhuma pregação cadastrada ainda.
            </p>
          ) : (
            <div className="space-y-3">
              {recentSermons.map((sermon) => (
                <Link key={sermon.id} href={`/admin/sermons/${sermon.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-lg hover:bg-gold-50 transition-colors">
                    <div>
                      <p className="font-medium text-navy-900">{sermon.title}</p>
                      <p className="text-sm text-navy-500">
                        {sermon.preacher} · {formatDate(sermon.date)} ·{" "}
                        {sermon._count.devotionals} devocionais
                      </p>
                    </div>
                    <Badge color={statusColor(sermon.status)}>
                      {SERMON_STATUS_LABELS[sermon.status]}
                    </Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
          <div className="mt-4 text-center">
            <Link href="/admin/historico">
              <Button variant="outline" size="sm">
                Ver histórico completo
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
