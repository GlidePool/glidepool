import { pgTable, uuid, text, numeric, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const x402Payments = pgTable("x402_payments", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: text("user_address").notNull(),
  txHash: text("tx_hash").notNull().unique(),
  amountUsdc: numeric("amount_usdc").notNull(),
  verified: boolean("verified").notNull().default(false),
  verifiedAt: timestamp("verified_at", { withTimezone: true }),
  usedForAgentId: uuid("used_for_agent_id"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertX402PaymentSchema = createInsertSchema(x402Payments).omit({
  id: true,
  verified: true,
  verifiedAt: true,
  createdAt: true,
});

export type X402Payment = typeof x402Payments.$inferSelect;
export type InsertX402Payment = z.infer<typeof insertX402PaymentSchema>;
