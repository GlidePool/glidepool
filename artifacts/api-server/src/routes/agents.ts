import { Router } from "express";
import { z } from "zod";
import { isAddress } from "viem";
import { db } from "@workspace/db";
import { agents, agentActions, x402Payments } from "@workspace/db";
import { eq, desc, and } from "drizzle-orm";
import { verifyUsdcPayment } from "../x402/middleware.js";
import { logger } from "../lib/logger.js";

const router = Router();

// ── Schemas ───────────────────────────────────────────────────────────────────
const createAgentSchema = z.object({
  userAddress: z.string().min(1),
  poolAddress: z.string().min(1),
  strategy: z.enum(["static", "balanced", "aggressive"]).default("balanced"),
  budgetUsdc: z.number().positive().default(100),
  analysisIntervalSec: z.number().int().min(30).max(3600).default(60),
  paymentTxHash: z.string().optional(),
  // Optional: agent wallet private key for autonomous x402 payment.
  // Must be a 0x-prefixed 32-byte hex string (burner wallet only).
  agentPrivateKey: z.string().regex(/^0x[0-9a-fA-F]{64}$/).optional(),
});

const updateStatusSchema = z.object({
  status: z.enum(["active", "paused", "stopped"]),
});

const confirmTxSchema = z.object({
  txHash: z.string().min(1),
});

// Strip agentPrivateKey before sending any agent record to client
function sanitizeAgent(agent: Record<string, unknown>) {
  const { agentPrivateKey: _pk, ...safe } = agent;
  return safe;
}

// ── POST /api/agents ──────────────────────────────────────────────────────────
router.post("/", async (req, res) => {
  const parsed = createAgentSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { userAddress, poolAddress, strategy, budgetUsdc, analysisIntervalSec, paymentTxHash, agentPrivateKey } = parsed.data;

  if (!isAddress(userAddress, { strict: false }) || !isAddress(poolAddress, { strict: false })) {
    res.status(400).json({ error: "Invalid address" });
    return;
  }

  if (process.env.X402_ENABLED === "true" && paymentTxHash) {
    const { valid, reason } = await verifyUsdcPayment({
      txHash: paymentTxHash as `0x${string}`,
      from: userAddress,
      amount: String(Math.round(budgetUsdc * 1e6)),
    });

    if (!valid) {
      res.status(402).json({ error: `Payment invalid: ${reason}` });
      return;
    }

    await db.insert(x402Payments).values({
      userAddress: userAddress.toLowerCase(),
      txHash: paymentTxHash,
      amountUsdc: String(budgetUsdc),
      verified: true,
      verifiedAt: new Date(),
    }).onConflictDoNothing();
  }

  try {
    const [agent] = await db.insert(agents).values({
      userAddress: userAddress.toLowerCase(),
      poolAddress: poolAddress.toLowerCase(),
      strategy,
      budgetUsdc: String(budgetUsdc),
      analysisIntervalSec,
      status: "active",
      paymentTxHash: paymentTxHash ?? null,
      agentPrivateKey: agentPrivateKey ?? null,
    }).returning();

    logger.info(
      { agentId: agent!.id, userAddress, poolAddress, hasKey: !!agentPrivateKey },
      "Agent created"
    );
    res.status(201).json(sanitizeAgent(agent as unknown as Record<string, unknown>));
  } catch (err) {
    logger.error({ err }, "Failed to create agent");
    res.status(500).json({ error: "Failed to create agent" });
  }
});

// ── GET /api/agents?userAddress=0x… ──────────────────────────────────────────
router.get("/", async (req, res) => {
  const { userAddress } = req.query;

  if (!userAddress || typeof userAddress !== "string" || !isAddress(userAddress, { strict: false })) {
    res.status(400).json({ error: "userAddress query param required" });
    return;
  }

  try {
    const rows = await db
      .select()
      .from(agents)
      .where(eq(agents.userAddress, userAddress.toLowerCase()))
      .orderBy(desc(agents.createdAt));

    res.json(rows.map((r) => sanitizeAgent(r as unknown as Record<string, unknown>)));
  } catch (err) {
    logger.error({ err }, "Failed to list agents");
    res.status(500).json({ error: "Failed to list agents" });
  }
});

// ── GET /api/agents/:agentId ──────────────────────────────────────────────────
router.get("/:agentId", async (req, res) => {
  const { agentId } = req.params;

  try {
    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    const actions = await db
      .select()
      .from(agentActions)
      .where(eq(agentActions.agentId, agentId))
      .orderBy(desc(agentActions.createdAt))
      .limit(20);

    res.json({ ...sanitizeAgent(agent as unknown as Record<string, unknown>), recentActions: actions });
  } catch (err) {
    logger.error({ err, agentId }, "Failed to get agent");
    res.status(500).json({ error: "Failed to get agent" });
  }
});

// ── PUT /api/agents/:agentId/status ──────────────────────────────────────────
router.put("/:agentId/status", async (req, res) => {
  const { agentId } = req.params;
  const { userAddress } = req.query;
  const parsed = updateStatusSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "status must be active|paused|stopped" });
    return;
  }

  try {
    const [agent] = await db.select().from(agents).where(eq(agents.id, agentId));
    if (!agent) {
      res.status(404).json({ error: "Agent not found" });
      return;
    }

    if (userAddress && agent.userAddress !== (userAddress as string).toString().toLowerCase()) {
      res.status(403).json({ error: "Not authorized" });
      return;
    }

    const [updated] = await db
      .update(agents)
      .set({ status: parsed.data.status, updatedAt: new Date() })
      .where(eq(agents.id, agentId))
      .returning();

    res.json(sanitizeAgent(updated as unknown as Record<string, unknown>));
  } catch (err) {
    logger.error({ err, agentId }, "Failed to update agent status");
    res.status(500).json({ error: "Failed to update agent" });
  }
});

// ── GET /api/agents/:agentId/actions ─────────────────────────────────────────
router.get("/:agentId/actions", async (req, res) => {
  const { agentId } = req.params;
  const limit = Math.min(Number(req.query.limit ?? 50), 100);

  try {
    const actions = await db
      .select()
      .from(agentActions)
      .where(eq(agentActions.agentId, agentId))
      .orderBy(desc(agentActions.createdAt))
      .limit(limit);

    res.json(actions);
  } catch (err) {
    logger.error({ err, agentId }, "Failed to get agent actions");
    res.status(500).json({ error: "Failed to get actions" });
  }
});

// ── POST /api/agents/:agentId/actions/:actionId/confirm ──────────────────────
router.post("/:agentId/actions/:actionId/confirm", async (req, res) => {
  const { agentId, actionId } = req.params;
  const parsed = confirmTxSchema.safeParse(req.body);

  if (!parsed.success) {
    res.status(400).json({ error: "txHash required" });
    return;
  }

  try {
    const [action] = await db
      .update(agentActions)
      .set({ txHash: parsed.data.txHash, status: "signed" })
      .where(and(eq(agentActions.id, actionId), eq(agentActions.agentId, agentId)))
      .returning();

    if (!action) {
      res.status(404).json({ error: "Action not found" });
      return;
    }

    res.json(action);
  } catch (err) {
    logger.error({ err, actionId }, "Failed to confirm action");
    res.status(500).json({ error: "Failed to confirm" });
  }
});

export default router;
