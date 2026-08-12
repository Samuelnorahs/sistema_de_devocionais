"use client";

import { useEffect, useState } from "react";
import { SERMON_STATUS_LABELS, getPipelineProgress, PIPELINE_STEPS } from "@/lib/constants";
import { Badge } from "../ui/Badge";
import { cn } from "@/lib/utils";

interface Job {
  id: string;
  type: string;
  status: string;
  errorMessage: string | null;
}

interface PipelineStatusProps {
  sermonId: string;
  initialStatus: string;
  initialError?: string | null;
}

export function PipelineStatus({
  sermonId,
  initialStatus,
  initialError,
}: PipelineStatusProps) {
  const [status, setStatus] = useState(initialStatus);
  const [errorMessage, setErrorMessage] = useState(initialError);
  const [jobs, setJobs] = useState<Job[]>([]);

  useEffect(() => {
    if (status === "PUBLICADO" || status === "PRONTO_REVISAO") return;

    const interval = setInterval(async () => {
      try {
        const res = await fetch(`/api/sermons/${sermonId}/status`);
        if (res.ok) {
          const data = await res.json();
          setStatus(data.status);
          setErrorMessage(data.errorMessage);
          setJobs(data.jobs);
          if (data.status === "PUBLICADO" || data.status === "PRONTO_REVISAO" || data.status === "ERRO") {
            clearInterval(interval);
          }
        }
      } catch {
        // ignore polling errors
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [sermonId, status]);

  const progress = getPipelineProgress(status);
  const isProcessing = !["PUBLICADO", "PRONTO_REVISAO", "ERRO"].includes(status);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Badge color={status === "ERRO" ? "red" : isProcessing ? "yellow" : status === "PUBLICADO" ? "green" : "blue"}>
          {SERMON_STATUS_LABELS[status] || status}
        </Badge>
        {isProcessing && (
          <span className="text-xs text-navy-500 animate-pulse-gold">Processando...</span>
        )}
      </div>

      <div className="w-full bg-gold-100 rounded-full h-2">
        <div
          className={cn(
            "h-2 rounded-full transition-all duration-500",
            status === "ERRO" ? "bg-red-500" : "bg-gold-500"
          )}
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
        {PIPELINE_STEPS.map((step) => {
          const stepIdx = PIPELINE_STEPS.indexOf(step);
          const currentIdx = PIPELINE_STEPS.indexOf(status as typeof PIPELINE_STEPS[number]);
          const isDone = stepIdx < currentIdx || status === "PUBLICADO";
          const isCurrent = step === status;

          return (
            <div
              key={step}
              className={cn(
                "text-center text-xs p-2 rounded-lg",
                isDone && "bg-green-50 text-green-700",
                isCurrent && "bg-gold-100 text-gold-800 font-medium",
                !isDone && !isCurrent && "bg-navy-50 text-navy-400"
              )}
            >
              {SERMON_STATUS_LABELS[step]?.split(" ")[0]}
            </div>
          );
        })}
      </div>

      {errorMessage && (
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
          {errorMessage}
        </div>
      )}
    </div>
  );
}
