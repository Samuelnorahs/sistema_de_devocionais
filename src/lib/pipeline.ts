import { prisma } from "./prisma";
import { getStorage } from "./storage";
import {
  transcribeAudio,
  analyzeSermon,
  generateDevotionals,
  mockTranscribe,
  mockAnalyze,
  mockGenerateDevotionals,
  isOpenAIConfigured,
} from "./openai";
import type { JobType, SermonStatus } from "@prisma/client";

const STATUS_MAP: Record<JobType, SermonStatus> = {
  TRANSCRIBE: "TRANSCREVENDO",
  ANALYZE: "ANALISANDO",
  GENERATE_DEVOTIONALS: "CRIANDO_DEVOCIONAIS",
};

export async function enqueuePipeline(sermonId: string): Promise<void> {
  await prisma.processingJob.createMany({
    data: [
      { sermonId, type: "TRANSCRIBE" },
      { sermonId, type: "ANALYZE" },
      { sermonId, type: "GENERATE_DEVOTIONALS" },
    ],
  });

  processNextJob(sermonId).catch(console.error);
}

export async function retryFromStep(sermonId: string, step: JobType): Promise<void> {
  await prisma.processingJob.deleteMany({
    where: {
      sermonId,
      type: { in: getStepsFrom(step) },
    },
  });

  const stepsToCreate = getStepsFrom(step);
  await prisma.processingJob.createMany({
    data: stepsToCreate.map((type) => ({ sermonId, type })),
  });

  await prisma.sermon.update({
    where: { id: sermonId },
    data: { status: STATUS_MAP[step], errorMessage: null },
  });

  processNextJob(sermonId).catch(console.error);
}

function getStepsFrom(step: JobType): JobType[] {
  const all: JobType[] = ["TRANSCRIBE", "ANALYZE", "GENERATE_DEVOTIONALS"];
  const idx = all.indexOf(step);
  return all.slice(idx);
}

async function processNextJob(sermonId: string): Promise<void> {
  const job = await prisma.processingJob.findFirst({
    where: { sermonId, status: "PENDING" },
    orderBy: { createdAt: "asc" },
  });

  if (!job) return;

  await prisma.processingJob.update({
    where: { id: job.id },
    data: { status: "RUNNING", startedAt: new Date(), attempts: { increment: 1 } },
  });

  await prisma.sermon.update({
    where: { id: sermonId },
    data: { status: STATUS_MAP[job.type], errorMessage: null },
  });

  try {
    switch (job.type) {
      case "TRANSCRIBE":
        await runTranscription(sermonId);
        break;
      case "ANALYZE":
        await runAnalysis(sermonId);
        break;
      case "GENERATE_DEVOTIONALS":
        await runDevotionalGeneration(sermonId);
        break;
    }

    await prisma.processingJob.update({
      where: { id: job.id },
      data: { status: "COMPLETED", completedAt: new Date() },
    });

    const nextJob = await prisma.processingJob.findFirst({
      where: { sermonId, status: "PENDING" },
    });

    if (nextJob) {
      await processNextJob(sermonId);
    } else {
      await prisma.sermon.update({
        where: { id: sermonId },
        data: { status: "PRONTO_REVISAO" },
      });
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    await prisma.processingJob.update({
      where: { id: job.id },
      data: { status: "FAILED", errorMessage: message },
    });
    await prisma.sermon.update({
      where: { id: sermonId },
      data: { status: "ERRO", errorMessage: message },
    });
  }
}

async function runTranscription(sermonId: string): Promise<void> {
  const sermon = await prisma.sermon.findUniqueOrThrow({ where: { id: sermonId } });
  const storage = getStorage();
  const audioBuffer = await storage.read(sermon.audioUrl);

  let text: string;
  if (isOpenAIConfigured()) {
    text = await transcribeAudio(audioBuffer, sermon.audioUrl);
  } else {
    text = await mockTranscribe();
  }

  await prisma.transcription.upsert({
    where: { sermonId },
    create: { sermonId, fullText: text },
    update: { fullText: text },
  });
}

async function runAnalysis(sermonId: string): Promise<void> {
  const transcription = await prisma.transcription.findUniqueOrThrow({
    where: { sermonId },
  });

  let analysis;
  if (isOpenAIConfigured()) {
    analysis = await analyzeSermon(transcription.fullText);
  } else {
    analysis = await mockAnalyze();
  }

  await prisma.sermonAnalysis.upsert({
    where: { sermonId },
    create: {
      sermonId,
      centralTheme: analysis.centralTheme,
      mainBibleText: analysis.mainBibleText,
      otherTexts: analysis.otherTexts,
      objective: analysis.objective,
      taughtPoints: analysis.taughtPoints,
      spiritualPrinciples: analysis.spiritualPrinciples,
      practicalApplications: analysis.practicalApplications,
      keyPhrases: analysis.keyPhrases,
      logicalSequence: analysis.logicalSequence,
      rawJson: analysis,
    },
    update: {
      centralTheme: analysis.centralTheme,
      mainBibleText: analysis.mainBibleText,
      otherTexts: analysis.otherTexts,
      objective: analysis.objective,
      taughtPoints: analysis.taughtPoints,
      spiritualPrinciples: analysis.spiritualPrinciples,
      practicalApplications: analysis.practicalApplications,
      keyPhrases: analysis.keyPhrases,
      logicalSequence: analysis.logicalSequence,
      rawJson: analysis,
    },
  });
}

async function runDevotionalGeneration(sermonId: string): Promise<void> {
  const analysisRecord = await prisma.sermonAnalysis.findUniqueOrThrow({
    where: { sermonId },
  });

  const analysis = {
    centralTheme: analysisRecord.centralTheme,
    mainBibleText: analysisRecord.mainBibleText,
    otherTexts: analysisRecord.otherTexts,
    objective: analysisRecord.objective,
    taughtPoints: analysisRecord.taughtPoints,
    spiritualPrinciples: analysisRecord.spiritualPrinciples,
    practicalApplications: analysisRecord.practicalApplications,
    keyPhrases: analysisRecord.keyPhrases,
    logicalSequence: analysisRecord.logicalSequence,
  };

  let devotionals;
  if (isOpenAIConfigured()) {
    devotionals = await generateDevotionals(analysis);
  } else {
    devotionals = await mockGenerateDevotionals();
  }

  await prisma.devotional.deleteMany({ where: { sermonId } });

  await prisma.devotional.createMany({
    data: devotionals.map((d) => ({
      sermonId,
      dayOfWeek: d.dayOfWeek,
      verse: d.verse,
      title: d.title,
      reflection: d.reflection,
      personalApplication: d.personalApplication,
      reflectionQuestion: d.reflectionQuestion,
      prayer: d.prayer,
      practicalChallenge: d.practicalChallenge,
      status: "RASCUNHO",
    })),
  });
}

export async function getSermonProcessingStatus(sermonId: string) {
  const sermon = await prisma.sermon.findUnique({
    where: { id: sermonId },
    include: {
      jobs: { orderBy: { createdAt: "asc" } },
    },
  });
  return sermon;
}
