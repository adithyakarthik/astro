import type { ChartData } from "@/lib/astro/engine";

export const PREDICTION_TOPICS = [
  "profession",
  "health",
  "family",
  "children",
  "wealthMoney",
  "foreignTravel",
  "parents",
  "siblings",
  "property",
] as const;

export type PredictionTopic = (typeof PREDICTION_TOPICS)[number];

// Classical house significators per topic, given to the model as a grounding
// hint (it still reasons over the actual chart, this just points it at the
// houses a human astrologer would check first).
const TOPIC_HOUSES: Record<PredictionTopic, string> = {
  profession: "10th (karma/career), 6th (service), 2nd (income)",
  health: "1st (body), 6th (illness), 8th (chronic/longevity)",
  family: "2nd (family), 4th (home/mother)",
  children: "5th (children/progeny)",
  wealthMoney: "2nd (accumulated wealth), 11th (gains/income)",
  foreignTravel: "9th (long journeys), 12th (foreign lands)",
  parents: "4th (mother), 9th (father)",
  siblings: "3rd (siblings/courage), 11th (elder siblings)",
  property: "4th (property/vehicles/home)",
};

const ANTHROPIC_MODEL = "claude-sonnet-5";
const ANTHROPIC_API_URL = "https://api.anthropic.com/v1/messages";

/** Thrown when ANTHROPIC_API_KEY isn't configured — callers should show a setup hint, not a raw error. */
export class PredictionConfigError extends Error {
  constructor() {
    super("AI_NOT_CONFIGURED");
  }
}

function houseOf(rasiIndex: number, ascendantRasiIndex: number): number {
  return ((rasiIndex - ascendantRasiIndex + 12) % 12) + 1;
}

function activeDashaAt(chart: ChartData, atMs: number) {
  const maha = chart.vimshottariDasha.find((d) => atMs >= new Date(d.startDate).getTime() && atMs < new Date(d.endDate).getTime());
  if (!maha) return null;
  const antar = maha.antardashas.find((a) => atMs >= new Date(a.startDate).getTime() && atMs < new Date(a.endDate).getTime());
  return { mahadasha: maha.planet, antardasha: antar?.planet };
}

function summarizeChartForPrompt(chart: ChartData): string {
  const ascHouse = chart.ascendant.rasiIndex;
  const lines: string[] = [];
  lines.push(`Ascendant (Lagna): ${chart.ascendant.rasiName} ${chart.ascendant.degreeInSign.toFixed(2)}°`);
  for (const p of chart.planets) {
    const house = houseOf(p.rasiIndex, ascHouse);
    lines.push(
      `${p.planet}: house ${house}, sign ${p.rasiName} ${p.degreeInSign.toFixed(2)}°, nakshatra ${p.nakshatraName} pada ${p.pada}, navamsa sign ${p.navamsaRasiName}`
    );
  }
  const dasha = activeDashaAt(chart, Date.now());
  if (dasha) {
    lines.push(`Current running Mahadasha: ${dasha.mahadasha}${dasha.antardasha ? `, Antardasha: ${dasha.antardasha}` : ""}`);
  }
  return lines.join("\n");
}

export interface GeneratedPrediction {
  prediction: string;
  reasoning: string;
}

function parsePredictionResponse(text: string): GeneratedPrediction {
  const predictionMatch = /PREDICTION:\s*([\s\S]*?)(?:\n *REASONING:|$)/i.exec(text);
  const reasoningMatch = /REASONING:\s*([\s\S]*)$/i.exec(text);
  return {
    prediction: predictionMatch?.[1]?.trim() || text.trim(),
    reasoning: reasoningMatch?.[1]?.trim() || "",
  };
}

const LANGUAGE_NAMES: Record<string, string> = { en: "English", ta: "Tamil", hi: "Hindi" };

export async function generateAstrologyPrediction(input: {
  topic: PredictionTopic;
  topicLabel: string;
  chart: ChartData;
  contextLabel: string;
  lang: string;
}): Promise<GeneratedPrediction> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) throw new PredictionConfigError();

  const languageName = LANGUAGE_NAMES[input.lang] ?? "English";
  const houses = TOPIC_HOUSES[input.topic];
  const chartSummary = summarizeChartForPrompt(input.chart);

  const systemPrompt = `You are an expert Vedic (Jyotish) astrologer assistant helping a professional astrologer draft a client reading. Analyze the given chart using classical Vedic astrology principles (house lordships, planetary placement and strength, nakshatra, and the current Vimshottari dasha). Produce a focused reading for exactly one requested life topic. Ground every claim in the specific chart data provided — name the actual planets, houses, signs, and dasha lord involved. Be balanced (mention supportive AND challenging factors) and never make absolute/fatalistic claims; this is guidance for a professional to refine, not a final verdict. Respond in ${languageName}.

Respond in exactly this format and nothing else:
PREDICTION: <2-4 sentence prediction for the topic, written for the astrologer to share with their client>
REASONING: <3-6 sentences of astrological reasoning citing the specific placements and dasha that justify the prediction>`;

  const userPrompt = `Topic: ${input.topicLabel}
Classical significator houses for this topic: ${houses}
Chart context: ${input.contextLabel}

Chart data:
${chartSummary}

Give a prediction and reasoning for the topic above.`;

  const res = await fetch(ANTHROPIC_API_URL, {
    method: "POST",
    headers: {
      "content-type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: ANTHROPIC_MODEL,
      max_tokens: 700,
      system: systemPrompt,
      messages: [{ role: "user", content: userPrompt }],
    }),
  });

  if (!res.ok) {
    const bodyText = await res.text().catch(() => "");
    throw new Error(`AI prediction request failed (${res.status}): ${bodyText.slice(0, 300)}`);
  }

  const data = (await res.json()) as { content?: { type: string; text?: string }[] };
  const text = data.content?.find((block) => block.type === "text")?.text ?? "";
  return parsePredictionResponse(text);
}
