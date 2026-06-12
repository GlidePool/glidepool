import { Router } from "express";
import { z } from "zod";
import { isAddress } from "viem";
import { x402Middleware } from "../x402/middleware.js";
import { runAdvisor, buildMarketContext } from "../llm/advisor.js";
import { readPoolState } from "../chain/poolReader.js";
import { getPositionDetail } from "../chain/positionReader.js";

const router = Router();

const querySchema = z.object({
  poolAddress: z.string().min(1),
  nftId: z.string().optional(),
  userGoal: z.string().optional(),
  userAddress: z.string().optional(),
});

router.get("/", x402Middleware, async (req, res) => {
  const parsed = querySchema.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: "poolAddress is required" });
    return;
  }

  const { poolAddress, nftId, userGoal, userAddress } = parsed.data;

  if (!isAddress(poolAddress)) {
    res.status(400).json({ error: "Invalid pool address" });
    return;
  }

  try {
    const pool = await readPoolState(poolAddress);
    const marketContext = buildMarketContext(pool);

    let position = null;
    if (nftId && userAddress && isAddress(userAddress)) {
      try {
        position = await getPositionDetail(userAddress, nftId);
      } catch {
        req.log.warn({ nftId }, "Could not fetch position detail for advisor");
      }
    }

    const recommendation = await runAdvisor({
      pool,
      position,
      marketContext,
      userGoal: userGoal ?? "maximize fee income while minimizing impermanent loss",
    });

    res.json(recommendation);
  } catch (err) {
    req.log.error({ err, poolAddress }, "Advisor request failed");
    res.status(500).json({ error: "Advisor request failed" });
  }
});

export default router;
