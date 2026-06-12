import { Router } from "express";
import { getUserPositions, getPositionDetail } from "../chain/positionReader.js";
import { isAddress } from "viem";

const router = Router();

router.get("/:userAddress", async (req, res) => {
  const { userAddress } = req.params;

  if (!isAddress(userAddress)) {
    res.status(400).json({ error: "Invalid wallet address" });
    return;
  }

  try {
    const positions = await getUserPositions(userAddress);
    res.json(positions);
  } catch (err) {
    req.log.error({ err, userAddress }, "Failed to fetch user positions");
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

router.get("/:userAddress/:nftId", async (req, res) => {
  const { userAddress, nftId } = req.params;

  if (!isAddress(userAddress)) {
    res.status(400).json({ error: "Invalid wallet address" });
    return;
  }

  if (!nftId || isNaN(Number(nftId))) {
    res.status(400).json({ error: "Invalid NFT ID" });
    return;
  }

  try {
    const detail = await getPositionDetail(userAddress, nftId);
    if (!detail) {
      res.status(404).json({ error: "Position not found" });
      return;
    }
    res.json(detail);
  } catch (err) {
    req.log.error({ err, userAddress, nftId }, "Failed to fetch position detail");
    res.status(404).json({ error: "Position not found or RPC error" });
  }
});

export default router;
