import type { Request, Response, NextFunction } from "express";
import { getAddress, parseAbi } from "viem";
import { publicClient } from "../chain/viemClient.js";

const ADVISOR_PRICE_USDC = Number(process.env.ADVISOR_PRICE_USDC ?? "0.05");
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS ?? "";
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";
const MAX_TX_AGE_MS = 30 * 60 * 1000; // 30 min

export interface X402PaymentProof {
  txHash: `0x${string}`;
  from: string;
  amount: string;
}

const USDC_TRANSFER_ABI = parseAbi([
  "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

function extractPaymentProof(req: Request): X402PaymentProof | null {
  const header = req.headers["x-payment-proof"];
  if (!header || typeof header !== "string") return null;
  try {
    return JSON.parse(Buffer.from(header, "base64").toString()) as X402PaymentProof;
  } catch {
    return null;
  }
}

export async function verifyUsdcPayment(proof: X402PaymentProof): Promise<{ valid: boolean; reason?: string }> {
  if (!TREASURY_ADDRESS || TREASURY_ADDRESS === "") {
    return { valid: false, reason: "TREASURY_ADDRESS not configured" };
  }

  if (!proof.txHash?.startsWith("0x")) {
    return { valid: false, reason: "Missing or malformed txHash" };
  }

  try {
    const receipt = await publicClient.getTransactionReceipt({ hash: proof.txHash as `0x${string}` });

    if (receipt.status !== "success") {
      return { valid: false, reason: "Transaction reverted" };
    }

    const block = await publicClient.getBlock({ blockNumber: receipt.blockNumber });
    const txAgeMs = (Date.now() / 1000 - Number(block.timestamp)) * 1000;
    if (txAgeMs > MAX_TX_AGE_MS) {
      return { valid: false, reason: "Payment too old (>30 min)" };
    }

    const requiredAmount = BigInt(Math.round(ADVISOR_PRICE_USDC * 1e6));
    const treasury = getAddress(TREASURY_ADDRESS);

    const transferLogs = receipt.logs.filter(
      (log) => log.address.toLowerCase() === USDC_ADDRESS_BASE.toLowerCase() && log.topics.length >= 3
    );

    let totalReceived = 0n;
    for (const log of transferLogs) {
      try {
        const toAddr = getAddress("0x" + log.topics[2]!.slice(26));
        if (toAddr.toLowerCase() !== treasury.toLowerCase()) continue;
        const value = BigInt(log.data);
        totalReceived += value;
      } catch {
        continue;
      }
    }

    if (totalReceived < requiredAmount) {
      return {
        valid: false,
        reason: `Insufficient payment: got ${totalReceived} µUSDC, need ${requiredAmount} µUSDC`,
      };
    }

    return { valid: true };
  } catch (err) {
    return { valid: false, reason: `RPC error: ${String(err)}` };
  }
}

export function x402Middleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.X402_ENABLED !== "true") {
    next();
    return;
  }

  const proof = extractPaymentProof(req);

  if (!proof) {
    res.status(402).json({
      message: `Payment required. Send ${ADVISOR_PRICE_USDC} USDC on Base mainnet.`,
      amount: String(ADVISOR_PRICE_USDC),
      currency: "USDC",
      recipient: TREASURY_ADDRESS,
      network: "base",
      token: USDC_ADDRESS_BASE,
      instructions: "Send USDC to recipient on Base, then retry with header: x-payment-proof: base64(JSON{txHash,from,amount})",
    });
    return;
  }

  verifyUsdcPayment(proof)
    .then(({ valid, reason }) => {
      if (!valid) {
        res.status(402).json({
          message: `Payment invalid: ${reason}`,
          amount: String(ADVISOR_PRICE_USDC),
          currency: "USDC",
          recipient: TREASURY_ADDRESS,
          network: "base",
          token: USDC_ADDRESS_BASE,
        });
        return;
      }
      next();
    })
    .catch((err) => {
      res.status(402).json({ message: "Payment verification failed", error: String(err) });
    });
}
