import type { Request, Response, NextFunction } from "express";

const ADVISOR_PRICE_USDC = process.env.ADVISOR_PRICE_USDC ?? "0.05";
const TREASURY_ADDRESS = process.env.TREASURY_ADDRESS ?? "0x0000000000000000000000000000000000000001";
const USDC_ADDRESS_BASE = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export interface X402PaymentProof {
  txHash: string;
  from: string;
  amount: string;
}

function extractPaymentProof(req: Request): X402PaymentProof | null {
  const header = req.headers["x-payment-proof"];
  if (!header || typeof header !== "string") return null;

  try {
    return JSON.parse(Buffer.from(header, "base64").toString()) as X402PaymentProof;
  } catch {
    return null;
  }
}

async function verifyPaymentOnChain(proof: X402PaymentProof): Promise<boolean> {
  if (process.env.X402_ENABLED !== "true") return true;

  if (!proof.txHash || !proof.txHash.startsWith("0x")) return false;
  if (!proof.from || !proof.amount) return false;

  const requiredAmount = Number(ADVISOR_PRICE_USDC) * 1e6;
  if (Number(proof.amount) < requiredAmount) return false;

  return true;
}

export function x402Middleware(req: Request, res: Response, next: NextFunction): void {
  if (process.env.X402_ENABLED !== "true") {
    next();
    return;
  }

  const proof = extractPaymentProof(req);

  if (!proof) {
    res.status(402).json({
      message: `Payment required to access GlidePool AI Advisor. Send ${ADVISOR_PRICE_USDC} USDC on Base.`,
      amount: ADVISOR_PRICE_USDC,
      currency: "USDC",
      recipient: TREASURY_ADDRESS,
      network: "base",
      token: USDC_ADDRESS_BASE,
      instructions:
        "Transfer USDC to the recipient address on Base mainnet, then retry with the x-payment-proof header (base64 JSON with txHash, from, amount).",
    });
    return;
  }

  verifyPaymentOnChain(proof)
    .then((valid) => {
      if (!valid) {
        res.status(402).json({
          message: "Payment proof invalid or insufficient.",
          amount: ADVISOR_PRICE_USDC,
          currency: "USDC",
          recipient: TREASURY_ADDRESS,
          network: "base",
          token: USDC_ADDRESS_BASE,
        });
        return;
      }
      next();
    })
    .catch(() => {
      res.status(402).json({
        message: "Payment verification failed.",
        amount: ADVISOR_PRICE_USDC,
        currency: "USDC",
        recipient: TREASURY_ADDRESS,
        network: "base",
        token: USDC_ADDRESS_BASE,
      });
    });
}
