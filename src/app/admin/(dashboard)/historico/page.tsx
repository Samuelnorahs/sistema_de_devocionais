import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { SERMON_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";

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

export default async function AdminHistoricoPage() {
  const sermons = await prisma.sermon.findMany({
    orderBy: { date: "desc" },
    include: {
      analysis: { select: { centralTheme: true } },
      _count: { select: { devotionals: true } },
    },
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy-900">
          Histórico de Pregações
        </h1>
        <p className="text-navy-500 mt-1">
          Todas as pregações processadas no sistema
        </p>
      </div>

      <Card>
        <CardContent className="py-4">
          {sermons.length === 0 ? (
            <p className="text-navy-500 text-center py-8">
              Nenhuma pregação cadastrada.
            </p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gold-100 text-left text-navy-500">
                    <th className="py-3 pr-4">Título</th>
                    <th className="py-3 pr-4">Pregador</th>
                    <th className="py-3 pr-4">Data</th>
                    <th className="py-3 pr-4">Status</th>
                    <th className="py-3">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {sermons.map((sermon) => (
                    <tr
                      key={sermon.id}
                      className="border-b border-gold-50 hover:bg-gold-50/50"
                    >
                      <td className="py-3 pr-4">
                        <p className="font-medium text-navy-900">{sermon.title}</p>
                        {sermon.analysis && (
                          <p className="text-xs text-gold-600">
                            {sermon.analysis.centralTheme}
                          </p>
                        )}
                      </td>
                      <td className="py-3 pr-4 text-navy-600">{sermon.preacher}</td>
                      <td className="py-3 pr-4 text-navy-600">
                        {formatDate(sermon.date)}
                      </td>
                      <td className="py-3 pr-4">
                        <Badge color={statusColor(sermon.status)}>
                          {SERMON_STATUS_LABELS[sermon.status]}
                        </Badge>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-2">
                          <Link
                            href={`/admin/sermons/${sermon.id}`}
                            className="text-gold-600 hover:text-gold-700 text-xs"
                          >
                            Gerenciar
                          </Link>
                          {sermon.status === "PUBLICADO" && (
                            <Link
                              href={`/palavra-da-semana/${sermon.id}`}
                              className="text-navy-500 hover:text-navy-700 text-xs"
                            >
                              Ver site
                            </Link>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
