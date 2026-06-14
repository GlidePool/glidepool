import { Router } from "express";
import { listSupportedPools, readPoolState } from "../chain/poolReader.js";
import { isAddress } from "viem";
import { z } from "zod";
import { db, customPools } from "@workspace/db";
import { TOKEN_DECIMALS } from "../chain/constants.js";

const router = Router();

router.get("/", async (req, res) => {
  try {
    const pools = await listSupportedPools();
    res.json(pools);
  } catch (err) {
    req.log.error({ err }, "Failed to list pools");
    res.status(500).json({ error: "Failed to fetch pool list" });
  }
});

router.post("/register", async (req, res) => {
  const schema = z.object({
    poolAddress: z.string().refine((v) => isAddress(v), { message: "Invalid address" }),
    registeredBy: z.string().optional(),
  });

  const parsed = schema.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: "Invalid input", details: parsed.error.flatten() });
    return;
  }

  const { poolAddress, registeredBy } = parsed.data;

  try {
    const state = await readPoolState(poolAddress);

    await db
      .insert(customPools)
      .values({
        poolAddress: poolAddress.toLowerCase(),
        tokenA: state.tokenA.toLowerCase(),
        tokenB: state.tokenB.toLowerCase(),
        tokenASymbol: state.tokenASymbol,
        tokenBSymbol: state.tokenBSymbol,
        tokenADecimals: TOKEN_DECIMALS[state.tokenA.toLowerCase()] ?? 18,
        tokenBDecimals: TOKEN_DECIMALS[state.tokenB.toLowerCase()] ?? 18,
        feeRate: Number(state.feeAIn) / 1e18,
        tickSpacing: Number(state.tickSpacing),
        registeredBy: registeredBy ?? null,
      })
      .onConflictDoUpdate({
        target: customPools.poolAddress,
        set: {
          tokenASymbol: state.tokenASymbol,
          tokenBSymbol: state.tokenBSymbol,
          feeRate: Number(state.feeAIn) / 1e18,
          tickSpacing: Number(state.tickSpacing),
        },
      });

    req.log.info({ poolAddress }, "Pool registered");
    res.json({ success: true, poolAddress: poolAddress.toLowerCase(), state });
  } catch (err) {
    req.log.error({ err, poolAddress }, "Failed to register pool");
    res.status(500).json({ error: "Failed to register pool — check address is a valid Maverick V2 pool" });
  }
});

router.get("/:poolAddress", async (req, res) => {
  const { poolAddress } = req.params;

  if (!isAddress(poolAddress)) {
    res.status(400).json({ error: "Invalid pool address" });
    return;
  }

  try {
    const state = await readPoolState(poolAddress);
    res.json(state);
  } catch (err) {
    req.log.error({ err, poolAddress }, "Failed to fetch pool state");
    res.status(404).json({ error: "Pool not found or RPC error" });
  }
});

export default router;
