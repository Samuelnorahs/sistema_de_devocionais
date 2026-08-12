import { WeekDay } from "@prisma/client";

export const WEEK_DAYS: { key: WeekDay; label: string; short: string }[] = [
  { key: "SEGUNDA", label: "Segunda-feira", short: "Seg" },
  { key: "TERCA", label: "Terça-feira", short: "Ter" },
  { key: "QUARTA", label: "Quarta-feira", short: "Qua" },
  { key: "QUINTA", label: "Quinta-feira", short: "Qui" },
  { key: "SEXTA", label: "Sexta-feira", short: "Sex" },
  { key: "SABADO", label: "Sábado", short: "Sáb" },
];

export const SERMON_STATUS_LABELS: Record<string, string> = {
  RECEBENDO_AUDIO: "Recebendo áudio",
  TRANSCREVENDO: "Transcrevendo",
  ANALISANDO: "Analisando pregação",
  CRIANDO_DEVOCIONAIS: "Criando devocionais",
  PRONTO_REVISAO: "Pronto para revisão",
  PUBLICADO: "Publicado",
  ERRO: "Erro",
};

export const DEVOTIONAL_STATUS_LABELS: Record<string, string> = {
  RASCUNHO: "Rascunho",
  APROVADO: "Aprovado",
  PUBLICADO: "Publicado",
};

export function getWeekDayFromDate(date: Date): WeekDay | null {
  const day = date.getDay();
  const map: Record<number, WeekDay | null> = {
    0: null, // domingo
    1: "SEGUNDA",
    2: "TERCA",
    3: "QUARTA",
    4: "QUINTA",
    5: "SEXTA",
    6: "SABADO",
  };
  return map[day] ?? null;
}

export function getWeekDayLabel(day: WeekDay): string {
  return WEEK_DAYS.find((d) => d.key === day)?.label ?? day;
}

export function getCurrentWeekDay(): WeekDay | null {
  return getWeekDayFromDate(new Date());
}

export const PIPELINE_STEPS = [
  "RECEBENDO_AUDIO",
  "TRANSCREVENDO",
  "ANALISANDO",
  "CRIANDO_DEVOCIONAIS",
  "PRONTO_REVISAO",
  "PUBLICADO",
] as const;

export function getPipelineProgress(status: string): number {
  const idx = PIPELINE_STEPS.indexOf(status as (typeof PIPELINE_STEPS)[number]);
  if (idx === -1) return 0;
  return Math.round(((idx + 1) / PIPELINE_STEPS.length) * 100);
}
