"use client";

import { useState } from "react";
import { createSermon } from "@/actions/sermon";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export default function NovaPregacaoPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    try {
      await createSermon(formData);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erro ao enviar pregação");
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="font-serif text-3xl font-bold text-navy-900">
          Nova Pregação
        </h1>
        <p className="text-navy-500 mt-1">
          Envie o áudio da pregação de domingo para gerar os devocionais da semana.
        </p>
      </div>

      <Card>
        <CardHeader>
          <h2 className="font-medium text-navy-800">Dados da pregação</h2>
        </CardHeader>
        <CardContent>
          <form action={handleSubmit} className="space-y-4">
            <Input
              label="Título da pregação"
              name="title"
              required
              placeholder="Ex: Deus proverá — Filipenses 4"
            />
            <Input
              label="Data da pregação"
              name="date"
              type="date"
              required
            />
            <Input
              label="Pregador"
              name="preacher"
              required
              placeholder="Nome do pregador"
            />

            <div className="space-y-1">
              <label className="block text-sm font-medium text-navy-700">
                Arquivo de áudio
              </label>
              <input
                type="file"
                name="audio"
                accept="audio/*,.mp3,.wav,.m4a,.ogg,.webm"
                required
                className="w-full text-sm text-navy-600 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-gold-100 file:text-gold-800 hover:file:bg-gold-200"
              />
              <p className="text-xs text-navy-400">
                Formatos aceitos: MP3, WAV, M4A, OGG, WebM
              </p>
            </div>

            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}

            <Button type="submit" loading={loading} className="w-full">
              Enviar e Processar
            </Button>
          </form>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="py-4">
          <h3 className="text-sm font-medium text-navy-700 mb-2">
            O que acontece depois?
          </h3>
          <ol className="text-sm text-navy-500 space-y-1 list-decimal list-inside">
            <li>O áudio é transcrito automaticamente</li>
            <li>A IA analisa a pregação e extrai os pontos principais</li>
            <li>6 devocionais são gerados (Segunda a Sábado)</li>
            <li>Você revisa e aprova antes da publicação</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}
