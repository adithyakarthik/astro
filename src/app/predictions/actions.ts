"use server";

import { requireUser } from "@/lib/auth/session";
import { getLanguage } from "@/lib/i18n/server";
import type { ChartData } from "@/lib/astro/engine";
import { generateAstrologyPrediction, PREDICTION_TOPICS, type PredictionTopic } from "@/lib/ai/predictions";

export async function generatePredictionAction(
  chartJson: string,
  contextLabel: string,
  topic: string,
  topicLabel: string
) {
  await requireUser();
  if (!(PREDICTION_TOPICS as readonly string[]).includes(topic)) throw new Error("Invalid topic");

  const lang = await getLanguage();
  const chart = JSON.parse(chartJson) as ChartData;
  return generateAstrologyPrediction({
    topic: topic as PredictionTopic,
    topicLabel,
    chart,
    contextLabel,
    lang,
  });
}
