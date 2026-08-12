import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/session";
import { canReview, canUpload } from "@/lib/auth";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { PipelineStatus } from "@/components/admin/PipelineStatus";
import { DevotionalEditor } from "@/components/admin/DevotionalEditor";
import { SERMON_STATUS_LABELS } from "@/lib/constants";
import { formatDate } from "@/lib/utils";
import { approveAllAndPublish } from "@/actions/sermon";
import { RetryButton } from "@/components/admin/RetryButton";

interface PageProps {
  params: Promise<{ id: string }>;
}

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

export default async function SermonDetailPage({ params }: PageProps) {
  const session = await requireAdmin();
  const { id } = await params;

  const sermon = await prisma.sermon.findUnique({
    where: { id },
    include: {
      transcription: true,
      analysis: true,
      devotionals: { orderBy: { dayOfWeek: "asc" } },
      jobs: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!sermon) notFound();

  const canReviewSermon = canReview(session.user.role);
  const canUploadSermon = canUpload(session.user.role);
  const isReadyForReview = sermon.status === "PRONTO_REVISAO";
  const isPublished = sermon.status === "PUBLICADO";
  const hasError = sermon.status === "ERRO";

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/admin"
            className="text-sm text-gold-600 hover:text-gold-700 mb-2 inline-block"
          >
            ← Voltar
          </Link>
          <h1 className="font-serif text-3xl font-bold text-navy-900">
            {sermon.title}
          </h1>
          <p className="text-navy-500">
            {sermon.preacher} · {formatDate(sermon.date)}
          </p>
        </div>
        <Badge color={statusColor(sermon.status)}>
          {SERMON_STATUS_LABELS[sermon.status]}
        </Badge>
      </div>

      {/* Pipeline status */}
      {!isPublished && (
        <Card>
          <CardHeader>
            <h2 className="font-medium">Status do processamento</h2>
          </CardHeader>
          <CardContent>
            <PipelineStatus
              sermonId={sermon.id}
              initialStatus={sermon.status}
              initialError={sermon.errorMessage}
            />
            {hasError && canUploadSermon && (
              <div className="mt-4 flex gap-2">
                {sermon.jobs
                  .filter((j) => j.status === "FAILED")
                  .map((job) => (
                    <RetryButton
                      key={job.id}
                      sermonId={sermon.id}
                      step={job.type}
                      label={`Reprocessar ${job.type}`}
                    />
                  ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Analysis preview */}
      {sermon.analysis && (
        <Card>
          <CardHeader>
            <h2 className="font-medium">Análise da pregação</h2>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <p className="text-xs text-navy-500 uppercase">Tema central</p>
              <p className="font-medium text-gold-700">{sermon.analysis.centralTheme}</p>
            </div>
            <div>
              <p className="text-xs text-navy-500 uppercase">Texto bíblico principal</p>
              <p className="text-sm">{sermon.analysis.mainBibleText}</p>
            </div>
            <div>
              <p className="text-xs text-navy-500 uppercase">Pontos ensinados</p>
              <ul className="text-sm list-disc list-inside">
                {sermon.analysis.taughtPoints.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Devotionals review */}
      {sermon.devotionals.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-serif text-xl font-semibold text-navy-900">
              Devocionais da semana
            </h2>
            {isReadyForReview && canReviewSermon && (
              <form action={approveAllAndPublish.bind(null, sermon.id)}>
                <Button type="submit">Aprovar e Publicar Todos</Button>
              </form>
            )}
            {isPublished && (
              <Link href={`/palavra-da-semana/${sermon.id}`}>
                <Button variant="outline" size="sm">
                  Ver no site
                </Button>
              </Link>
            )}
          </div>

          <div className="grid gap-4">
            {sermon.devotionals.map((devotional) => (
              <DevotionalEditor
                key={devotional.id}
                devotional={devotional}
                canReview={canReviewSermon}
              />
            ))}
          </div>
        </div>
      )}

      {/* Transcription (collapsible info) */}
      {sermon.transcription && (
        <details className="group">
          <summary className="cursor-pointer text-sm text-navy-500 hover:text-navy-700">
            Ver transcrição completa
          </summary>
          <Card className="mt-2">
            <CardContent className="py-4">
              <pre className="text-xs text-navy-600 whitespace-pre-wrap font-sans max-h-96 overflow-y-auto">
                {sermon.transcription.fullText}
              </pre>
            </CardContent>
          </Card>
        </details>
      )}
    </div>
  );
}
