import { db } from "@workspace/db";
import { agents, agentActions } from "@workspace/db";
import { eq, desc } from "drizzle-orm";
import { readPoolState } from "../chain/poolReader.js";
import { runAdvisor, buildMarketContext } from "../llm/advisor.js";
import { publicClient } from "../chain/viemClient.js";
import { logger } from "../lib/logger.js";
import { createWalletClient, http, parseAbi } from "viem";
import { privateKeyToAccount } from "viem/accounts";
import { base } from "viem/chains";

const LOOP_INTERVAL_MS = 30_000;
let loopTimer: ReturnType<typeof setInterval> | null = null;

const USDC_BASE      = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913" as const;
const TREASURY       = process.env.TREASURY_ADDRESS ?? "";
const ADVISOR_PRICE  = Number(process.env.ADVISOR_PRICE_USDC ?? "0.001");

const USDC_TRANSFER_ABI = parseAbi([
  "function transfer(address to, uint256 amount) returns (bool)",
]);

// ── Auto-pay x402 using the agent's private key ───────────────────────────────
async function autoPayX402(privateKey: string, agentId: string): Promise<string | null> {
  if (!TREASURY) {
    logger.warn({ agentId }, "x402 enabled but TREASURY_ADDRESS not set — skipping auto-pay");
    return null;
  }

  try {
    const account      = privateKeyToAccount(privateKey as `0x${string}`);
    const walletClient = createWalletClient({ account, chain: base, transport: http("https://mainnet.base.org") });

    const amountMicro = BigInt(Math.round(ADVISOR_PRICE * 1e6));
    const hash        = await walletClient.writeContract({
      address:      USDC_BASE,
      abi:          USDC_TRANSFER_ABI,
      functionName: "transfer",
      args:         [TREASURY as `0x${string}`, amountMicro],
    });

    await publicClient.waitForTransactionReceipt({ hash });

    logger.info({ agentId, hash, amountUsdc: ADVISOR_PRICE }, "Agent x402 auto-pay confirmed");

    // Return base64-encoded proof for the advisor middleware
    const proof = Buffer.from(
      JSON.stringify({ txHash: hash, from: account.address, amount: String(ADVISOR_PRICE) })
    ).toString("base64");

    return proof;
  } catch (err) {
    logger.error({ err, agentId }, "Agent x402 auto-pay failed — proceeding without payment");
    return null;
  }
}

// ── Analyze one agent ─────────────────────────────────────────────────────────
async function analyzeAgent(agent: typeof agents.$inferSelect) {
  try {
    const pool          = await readPoolState(agent.poolAddress);
    const marketContext = buildMarketContext(pool);

    // If x402 is enabled and the agent has a private key, auto-pay before each LLM call.
    if (process.env.X402_ENABLED === "true" && agent.agentPrivateKey) {
      const proof = await autoPayX402(agent.agentPrivateKey, agent.id);
      if (proof) {
        logger.info({ agentId: agent.id }, "x402 proof obtained — proceeding with paid advisor call");
      }
      // proof is available here for future HTTP-based calls; direct runAdvisor() is used below
      // which bypasses the HTTP middleware. The USDC transfer still hits the treasury correctly.
    }

    const recommendation = await runAdvisor({
      pool,
      position:      null,
      marketContext,
      userGoal: `Strategy: ${agent.strategy}. Budget: ${agent.budgetUsdc} USDC. Maximize fee income while managing IL.`,
    });

    const actionType = recommendation.recommendation.action;
    const status     = actionType === "hold" ? "completed" : "pending_signature";

    await db.insert(agentActions).values({
      agentId:          agent.id,
      actionType,
      poolSnapshot:     pool as unknown as Record<string, unknown>,
      llmReasoning:     recommendation.recommendation.reasoning,
      llmRecommendation: recommendation as unknown as Record<string, unknown>,
      status,
    });

    await db
      .update(agents)
      .set({ lastAnalysisAt: new Date(), updatedAt: new Date() })
      .where(eq(agents.id, agent.id));

    logger.info(
      { agentId: agent.id, pool: agent.poolAddress, action: actionType, autonomous: !!agent.agentPrivateKey },
      "Agent analysis complete"
    );
  } catch (err) {
    logger.error({ err, agentId: agent.id }, "Agent analysis failed");
  }
}

// ── Loop ──────────────────────────────────────────────────────────────────────
async function runLoop() {
  try {
    const now          = new Date();
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
  loopTimer = setInterval(() => { void runLoop(); }, LOOP_INTERVAL_MS);
  void runLoop();
}

export function stopAgentLoop() {
  if (loopTimer) {
    clearInterval(loopTimer);
    loopTimer = null;
  }
}
