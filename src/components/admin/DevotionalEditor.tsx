"use client";

import { useState } from "react";
import { updateDevotional, approveDevotional } from "@/actions/sermon";
import { Button } from "@/components/ui/Button";
import { Input, Textarea } from "@/components/ui/Input";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getWeekDayLabel, DEVOTIONAL_STATUS_LABELS } from "@/lib/constants";
import type { Devotional, WeekDay } from "@prisma/client";

interface DevotionalEditorProps {
  devotional: Devotional;
  canReview: boolean;
}

export function DevotionalEditor({ devotional, canReview }: DevotionalEditorProps) {
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    verse: devotional.verse,
    title: devotional.title,
    reflection: devotional.reflection,
    personalApplication: devotional.personalApplication,
    reflectionQuestion: devotional.reflectionQuestion,
    prayer: devotional.prayer,
    practicalChallenge: devotional.practicalChallenge,
  });

  async function handleSave() {
    setSaving(true);
    try {
      await updateDevotional(devotional.id, form);
      setEditing(false);
    } finally {
      setSaving(false);
    }
  }

  async function handleApprove() {
    await approveDevotional(devotional.id);
  }

  const statusColor =
    devotional.status === "PUBLICADO"
      ? "green"
      : devotional.status === "APROVADO"
        ? "blue"
        : "default";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-navy-500 uppercase tracking-wide">
              {getWeekDayLabel(devotional.dayOfWeek as WeekDay)}
            </p>
            <h3 className="font-serif text-lg font-semibold text-navy-900">
              {devotional.title}
            </h3>
          </div>
          <Badge color={statusColor}>
            {DEVOTIONAL_STATUS_LABELS[devotional.status]}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        {editing ? (
          <div className="space-y-4">
            <Input
              label="Versículo"
              value={form.verse}
              onChange={(e) => setForm({ ...form, verse: e.target.value })}
            />
            <Input
              label="Título"
              value={form.title}
              onChange={(e) => setForm({ ...form, title: e.target.value })}
            />
            <Textarea
              label="Reflexão"
              value={form.reflection}
              onChange={(e) => setForm({ ...form, reflection: e.target.value })}
              rows={4}
            />
            <Textarea
              label="Aplicação pessoal"
              value={form.personalApplication}
              onChange={(e) => setForm({ ...form, personalApplication: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Pergunta de reflexão"
              value={form.reflectionQuestion}
              onChange={(e) => setForm({ ...form, reflectionQuestion: e.target.value })}
              rows={2}
            />
            <Textarea
              label="Oração"
              value={form.prayer}
              onChange={(e) => setForm({ ...form, prayer: e.target.value })}
              rows={3}
            />
            <Textarea
              label="Desafio prático"
              value={form.practicalChallenge}
              onChange={(e) => setForm({ ...form, practicalChallenge: e.target.value })}
              rows={2}
            />
            <div className="flex gap-2">
              <Button onClick={handleSave} loading={saving}>
                Salvar
              </Button>
              <Button variant="ghost" onClick={() => setEditing(false)}>
                Cancelar
              </Button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <p className="text-sm italic text-gold-700">{devotional.verse}</p>
            <p className="text-sm text-navy-700 line-clamp-3">{devotional.reflection}</p>
            <div className="flex gap-2">
              {canReview && (
                <>
                  <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
                    Editar
                  </Button>
                  {devotional.status === "RASCUNHO" && (
                    <Button size="sm" onClick={handleApprove}>
                      Aprovar
                    </Button>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
