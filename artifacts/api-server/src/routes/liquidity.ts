import { Router } from "express";
import { z } from "zod";
import { isAddress } from "viem";
import { computeRemoveParams, computeAddParams } from "../chain/liquidityParams.js";
import { getPositionDetail } from "../chain/positionReader.js";

const router = Router();

const removeSchema = z.object({
  nftId: z.string().min(1),
  userAddress: z.string().min(1),
  poolAddress: z.string().min(1),
  withdrawPercent: z.number().int().min(1).max(100),
});

const addSchema = z.object({
  poolAddress: z.string().min(1),
  kind: z.union([z.literal(1), z.literal(2), z.literal(4), z.literal(8)]),
  lowerTick: z.number().int(),
  upperTick: z.number().int(),
  userAddress: z.string().min(1),
  tokenAAmount: z.string().nullable().optional(),
  tokenBAmount: z.string().nullable().optional(),
});

router.post("/remove-params", async (req, res) => {
  const parsed = removeSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { nftId, userAddress, poolAddress, withdrawPercent } = parsed.data;

  if (!isAddress(userAddress) || !isAddress(poolAddress)) {
    res.status(400).json({ error: "Invalid address format" });
    return;
  }

  try {
    const detail = await getPositionDetail(userAddress, nftId);
    if (!detail) {
      res.status(404).json({ error: "Position not found" });
      return;
    }

    const result = await computeRemoveParams(
      nftId,
      userAddress,
      poolAddress,
      withdrawPercent,
      detail.binIds,
      detail.amountA,
      detail.amountB
    );

    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to compute remove params");
    res.status(500).json({ error: "Failed to compute remove parameters" });
  }
});

router.post("/add-params", async (req, res) => {
  const parsed = addSchema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { poolAddress, kind, lowerTick, upperTick, userAddress } = parsed.data;

  if (!isAddress(userAddress) || !isAddress(poolAddress)) {
    res.status(400).json({ error: "Invalid address format" });
    return;
  }

  if (upperTick <= lowerTick) {
    res.status(400).json({ error: "upperTick must be greater than lowerTick" });
    return;
  }

  if (upperTick - lowerTick > 100) {
    res.status(400).json({ error: "Tick range too wide (max 100 bins)" });
    return;
  }

  try {
    const result = await computeAddParams(poolAddress, kind, lowerTick, upperTick, userAddress);
    res.json(result);
  } catch (err) {
    req.log.error({ err }, "Failed to compute add params");
    res.status(500).json({ error: "Failed to compute add liquidity parameters" });
  }
});

export default router;
