"use client";

import { useState, useTransition } from "react";

interface PredictionResult {
  prediction: string;
  reasoning: string;
}

export function PredictionPanel({
  action,
  topics,
  labels,
}: {
  /** Bound server action: (topic, topicLabel) => Promise<{ prediction, reasoning }>. */
  action: (topic: string, topicLabel: string) => Promise<PredictionResult>;
  topics: { value: string; label: string }[];
  labels: {
    heading: string;
    subtitle: string;
    generateButton: string;
    loading: string;
    predictionHeading: string;
    reasoningHeading: string;
    notConfigured: string;
    genericError: string;
  };
}) {
  const [topic, setTopic] = useState(topics[0]?.value ?? "");
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  function handleGenerate() {
    setError(null);
    setResult(null);
    const topicLabel = topics.find((t) => t.value === topic)?.label ?? topic;
    startTransition(async () => {
      try {
        const res = await action(topic, topicLabel);
        setResult(res);
      } catch (e) {
        const message = e instanceof Error ? e.message : String(e);
        setError(message === "AI_NOT_CONFIGURED" ? labels.notConfigured : `${labels.genericError}: ${message}`);
      }
    });
  }

  return (
    <div className="rounded-xl border border-teal-200 bg-white p-6 dark:bg-zinc-900 dark:border-teal-900">
      <h2 className="mb-1 text-lg font-semibold text-teal-800 dark:text-teal-400">{labels.heading}</h2>
      <p className="mb-3 text-sm text-zinc-500 dark:text-zinc-400">{labels.subtitle}</p>
      <div className="flex flex-wrap items-center gap-3">
        <select
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-100"
        >
          {topics.map((t) => (
            <option key={t.value} value={t.value}>
              {t.label}
            </option>
          ))}
        </select>
        <button
          type="button"
          onClick={handleGenerate}
          disabled={isPending}
          className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-medium text-white hover:bg-amber-700 disabled:opacity-50"
        >
          {isPending ? labels.loading : labels.generateButton}
        </button>
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">{error}</p>
      )}

      {result && (
        <div className="mt-4 flex flex-col gap-3">
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{labels.predictionHeading}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{result.prediction}</p>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">{labels.reasoningHeading}</h3>
            <p className="mt-1 whitespace-pre-wrap text-sm text-zinc-600 dark:text-zinc-400">{result.reasoning}</p>
          </div>
        </div>
      )}
    </div>
  );
}
