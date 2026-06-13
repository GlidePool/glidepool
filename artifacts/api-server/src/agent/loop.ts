import { db } from "@workspace/db";
import { agents, agentActions } from "@workspace/db";
import { eq, and, lte, or, isNull } from "drizzle-orm";
import { readPoolState } from "../chain/poolReader.js";
import { runAdvisor, buildMarketContext } from "../llm/advisor.js";
import { logger } from "../lib/logger.js";

const LOOP_INTERVAL_MS = 30_000;
let loopTimer: ReturnType<typeof setInterval> | null = null;

async function analyzeAgent(agent: typeof agents.$inferSelect) {
  try {
    const pool = await readPoolState(agent.poolAddress);
    const marketContext = buildMarketContext(pool);

    const recommendation = await runAdvisor({
      pool,
      position: null,
      marketContext,
      userGoal: `Strategy: ${agent.strategy}. Budget: ${agent.budgetUsdc} USDC. Maximize fee income while managing IL.`,
    });

    const actionType = recommendation.recommendation.action;
    const status = actionType === "hold" ? "completed" : "pending_signature";

    await db.insert(agentActions).values({
      agentId: agent.id,
      actionType,
      poolSnapshot: pool as unknown as Record<string, unknown>,
      llmReasoning: recommendation.recommendation.reasoning,
      llmRecommendation: recommendation as unknown as Record<string, unknown>,
      status,
    });

    await db
      .update(agents)
      .set({ lastAnalysisAt: new Date(), updatedAt: new Date() })
      .where(eq(agents.id, agent.id));

    logger.info(
      { agentId: agent.id, pool: agent.poolAddress, action: actionType },
      "Agent analysis complete"
    );
  } catch (err) {
    logger.error({ err, agentId: agent.id }, "Agent analysis failed");
  }
}

async function runLoop() {
  try {
    const now = new Date();
    const activeAgents = await db
      .select()
      .from(agents)
      .where(eq(agents.status, "active"));

    for (const agent of activeAgents) {
      const intervalMs = agent.analysisIntervalSec * 1000;
      const due =
        agent.lastAnalysisAt === null ||
        now.getTime() - agent.lastAnalysisAt.getTime() >= intervalMs;

      if (due) {
        void analyzeAgent(agent);
      }
    }
  } catch (err) {
    logger.error({ err }, "Agent loop error");
  }
}

export function startAgentLoop() {
  if (loopTimer) return;
  logger.info("Starting agent loop");
  loopTimer = setInterval(() => {
    void runLoop();
  }, LOOP_INTERVAL_MS);
  void runLoop();
}

export function stopAgentLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}
