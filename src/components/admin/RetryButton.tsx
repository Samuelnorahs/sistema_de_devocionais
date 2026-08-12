"use client";

import { useTransition } from "react";
import { retrySermonStep } from "@/actions/sermon";
import { Button } from "@/components/ui/Button";
import type { JobType } from "@prisma/client";

interface RetryButtonProps {
  sermonId: string;
  step: JobType;
  label: string;
}

export function RetryButton({ sermonId, step, label }: RetryButtonProps) {
  const [isPending, startTransition] = useTransition();

  return (
    <Button
      variant="outline"
      size="sm"
      loading={isPending}
      onClick={() => {
        startTransition(async () => {
          await retrySermonStep(sermonId, step);
        });
      }}
    >
      {label}
    </Button>
  );
}
