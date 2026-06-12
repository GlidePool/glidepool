import { openai } from "@workspace/integrations-openai-ai-server";
import { z } from "zod";
import {
  SYSTEM_PROMPT,
  USER_PROMPT_TEMPLATE,
  AdvisorInput,
  AdvisorRecommendation,
} from "./prompt.js";
import { logger } from "../lib/logger.js";

const recommendationSchema = z.object({
  summary: z.string().min(1),
  riskLevel: z.enum(["low", "medium", "high"]),
  recommendation: z.object({
    action: z.enum(["hold", "rebalance", "withdraw", "add_liquidity", "switch_mode"]),
    reasoning: z.string().min(1),
    suggestedMode: z.enum(["static", "right", "left", "both"]).nullable(),
    suggestedBinRange: z
      .object({ lowerTick: z.number().int(), upperTick: z.number().int() })
      .nullable(),
    suggestedWithdrawPercent: z.number().int().min(0).max(100),
  }),
});

function buildMarketContext(pool: {
  sqrtPrice?: string;
  activeTick?: string;
  lastTwaD8?: string;
  currentPrice?: number;
}) {
  const currentPrice = pool.currentPrice ?? 0;
  const twa = pool.lastTwaD8 ? Number(pool.lastTwaD8) / 256 : 0;
  const priceDivergencePercent = twa !== 0
    ? Math.abs((currentPrice - twa) / twa) * 100
    : 0;

  return {
    currentPrice,
    twa,
    priceDivergencePercent: priceDivergencePercent.toFixed(4),
    activeTick: pool.activeTick ?? "0",
  };
}

export async function runAdvisor(input: AdvisorInput): Promise<AdvisorRecommendation> {
  const prompt = USER_PROMPT_TEMPLATE(input);

  let rawContent: string | null = null;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-5.4",
      max_completion_tokens: 2048,
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        { role: "user", content: prompt },
      ],
    });

    rawContent = response.choices[0]?.message?.content ?? null;
    if (!rawContent) throw new Error("Empty LLM response");

    const parsed = JSON.parse(rawContent) as unknown;
    const validated = recommendationSchema.parse(parsed);
    return validated;
  } catch (err) {
    logger.error({ err, rawContent }, "LLM advisor error");

    return {
      summary:
        "Unable to generate AI recommendation at this time. Please review your position manually.",
      riskLevel: "medium",
      recommendation: {
        action: "hold",
        reasoning:
          "Advisor encountered an error. No action has been recommended to avoid unintended fund movement.",
        suggestedMode: null,
        suggestedBinRange: null,
        suggestedWithdrawPercent: 0,
      },
    };
  }
}

export { buildMarketContext };
