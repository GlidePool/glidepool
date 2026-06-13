import { anthropic } from "@workspace/integrations-anthropic-ai";
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
    const response = await anthropic.messages.create({
      model: "claude-opus-4-8",
      max_tokens: 8192,
      system: SYSTEM_PROMPT,
      messages: [
        { role: "user", content: prompt },
      ],
    });

    const block = response.content[0];
    rawContent = block.type === "text" ? block.text : null;
    if (!rawContent) throw new Error("Empty Claude response");

    const parsed = JSON.parse(rawContent) as unknown;
    const validated = recommendationSchema.parse(parsed);
    return validated;
  } catch (err) {
    logger.error({ err, rawContent }, "Claude advisor error");

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
