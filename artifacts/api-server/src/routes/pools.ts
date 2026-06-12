import { Router } from "express";
import { listSupportedPools, readPoolState } from "../chain/poolReader.js";
import { isAddress } from "viem";

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
