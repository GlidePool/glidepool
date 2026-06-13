import { pgTable, uuid, text, numeric, integer, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const agents = pgTable("agents", {
  id: uuid("id").defaultRandom().primaryKey(),
  userAddress: text("user_address").notNull(),
  poolAddress: text("pool_address").notNull(),
  strategy: text("strategy").notNull().default("balanced"),
  budgetUsdc: numeric("budget_usdc").notNull().default("100"),
  status: text("status").notNull().default("active"),
  analysisIntervalSec: integer("analysis_interval_sec").notNull().default(60),
  lastAnalysisAt: timestamp("last_analysis_at", { withTimezone: true }),
  paymentTxHash: text("payment_tx_hash"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertAgentSchema = createInsertSchema(agents).omit({
  id: true,
  lastAnalysisAt: true,
  createdAt: true,
  updatedAt: true,
});

export type Agent = typeof agents.$inferSelect;
export type InsertAgent = z.infer<typeof insertAgentSchema>;
