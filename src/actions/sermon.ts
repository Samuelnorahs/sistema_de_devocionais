"use server";

import { prisma } from "@/lib/prisma";
import { auth, canReview, canUpload } from "@/lib/auth";
import { getStorage } from "@/lib/storage";
import { enqueuePipeline, retryFromStep } from "@/lib/pipeline";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import type { JobType, WeekDay } from "@prisma/client";

export async function createSermon(formData: FormData) {
  const session = await auth();
  if (!session?.user || !canUpload(session.user.role)) {
    throw new Error("Sem permissão");
  }

  const title = formData.get("title") as string;
  const date = formData.get("date") as string;
  const preacher = formData.get("preacher") as string;
  const audioFile = formData.get("audio") as File;

  if (!title || !date || !preacher || !audioFile?.size) {
    throw new Error("Preencha todos os campos e selecione um áudio");
  }

  const buffer = Buffer.from(await audioFile.arrayBuffer());
  const storage = getStorage();
  const audioKey = await storage.upload(buffer, audioFile.name, audioFile.type);

  const sermon = await prisma.sermon.create({
    data: {
      title,
      date: new Date(date),
      preacher,
      audioUrl: audioKey,
      status: "RECEBENDO_AUDIO",
    },
  });

  await enqueuePipeline(sermon.id);

  revalidatePath("/admin");
  redirect(`/admin/sermons/${sermon.id}`);
}

export async function retrySermonStep(sermonId: string, step: JobType) {
  const session = await auth();
  if (!session?.user || !canUpload(session.user.role)) {
    throw new Error("Sem permissão");
  }

  await retryFromStep(sermonId, step);
  revalidatePath(`/admin/sermons/${sermonId}`);
}

export async function updateDevotional(
  devotionalId: string,
  data: {
    verse: string;
    title: string;
    reflection: string;
    personalApplication: string;
    reflectionQuestion: string;
    prayer: string;
    practicalChallenge: string;
  }
) {
  const session = await auth();
  if (!session?.user || !canReview(session.user.role)) {
    throw new Error("Sem permissão");
  }

  await prisma.devotional.update({
    where: { id: devotionalId },
    data: {
      ...data,
      editedById: session.user.id,
      editedAt: new Date(),
    },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "EDIT_DEVOTIONAL",
      entityType: "Devotional",
      entityId: devotionalId,
      details: data,
    },
  });

  const devotional = await prisma.devotional.findUniqueOrThrow({
    where: { id: devotionalId },
  });

  revalidatePath(`/admin/sermons/${devotional.sermonId}`);
}

export async function approveDevotional(devotionalId: string) {
  const session = await auth();
  if (!session?.user || !canReview(session.user.role)) {
    throw new Error("Sem permissão");
  }

  await prisma.devotional.update({
    where: { id: devotionalId },
    data: { status: "APROVADO" },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "APPROVE_DEVOTIONAL",
      entityType: "Devotional",
      entityId: devotionalId,
    },
  });

  const devotional = await prisma.devotional.findUniqueOrThrow({
    where: { id: devotionalId },
  });

  revalidatePath(`/admin/sermons/${devotional.sermonId}`);
}

export async function approveAllAndPublish(sermonId: string) {
  const session = await auth();
  if (!session?.user || !canReview(session.user.role)) {
    throw new Error("Sem permissão");
  }

  await prisma.devotional.updateMany({
    where: { sermonId },
    data: { status: "PUBLICADO" },
  });

  await prisma.sermon.update({
    where: { id: sermonId },
    data: { status: "PUBLICADO", publishedAt: new Date() },
  });

  await prisma.auditLog.create({
    data: {
      userId: session.user.id,
      action: "PUBLISH_SERMON",
      entityType: "Sermon",
      entityId: sermonId,
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath("/palavra-da-semana");
  redirect("/admin/historico");
}

export async function publishDevotional(devotionalId: string) {
  const session = await auth();
  if (!session?.user || !canReview(session.user.role)) {
    throw new Error("Sem permissão");
  }

  await prisma.devotional.update({
    where: { id: devotionalId },
    data: { status: "PUBLICADO" },
  });

  const devotional = await prisma.devotional.findUniqueOrThrow({
    where: { id: devotionalId },
    include: { sermon: { include: { devotionals: true } } },
  });

  const allPublished = devotional.sermon.devotionals.every(
    (d) => d.status === "PUBLICADO" || d.id === devotionalId
  );

  if (allPublished) {
    await prisma.sermon.update({
      where: { id: devotional.sermonId },
      data: { status: "PUBLICADO", publishedAt: new Date() },
    });
  }

  revalidatePath(`/admin/sermons/${devotional.sermonId}`);
  revalidatePath("/");
  revalidatePath("/palavra-da-semana");
}

export async function getPublishedSermons() {
  return prisma.sermon.findMany({
    where: { status: "PUBLICADO" },
    orderBy: { date: "desc" },
    include: {
      analysis: { select: { centralTheme: true } },
      devotionals: {
        where: { status: "PUBLICADO" },
        select: { dayOfWeek: true, title: true, id: true },
      },
    },
  });
}

export async function getCurrentWeekSermon() {
  return prisma.sermon.findFirst({
    where: { status: "PUBLICADO" },
    orderBy: { publishedAt: "desc" },
    include: {
      analysis: true,
      devotionals: {
        where: { status: "PUBLICADO" },
        orderBy: { dayOfWeek: "asc" },
      },
    },
  });
}

export async function getDevotionalByDay(sermonId: string, day: WeekDay) {
  return prisma.devotional.findFirst({
    where: { sermonId, dayOfWeek: day, status: "PUBLICADO" },
    include: {
      sermon: {
        include: { analysis: { select: { centralTheme: true } } },
      },
    },
  });
}

export async function getTodaysDevotional() {
  const { getCurrentWeekDay } = await import("@/lib/constants");
  const today = getCurrentWeekDay();
  if (!today) return null;

  const sermon = await getCurrentWeekSermon();
  if (!sermon) return null;

  const devotional = sermon.devotionals.find((d) => d.dayOfWeek === today);
  if (!devotional) return null;

  return { sermon, devotional };
}
