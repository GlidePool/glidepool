import { pgTable, uuid, text, real, integer, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const customPools = pgTable("custom_pools", {
  id: uuid("id").defaultRandom().primaryKey(),
  poolAddress: text("pool_address").notNull().unique(),
  tokenA: text("token_a").notNull(),
  tokenB: text("token_b").notNull(),
  tokenASymbol: text("token_a_symbol").notNull(),
  tokenBSymbol: text("token_b_symbol").notNull(),
  tokenADecimals: integer("token_a_decimals").notNull().default(18),
  tokenBDecimals: integer("token_b_decimals").notNull().default(18),
  feeRate: real("fee_rate").notNull().default(0),
  tickSpacing: integer("tick_spacing").notNull().default(1),
  registeredBy: text("registered_by"),
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
});

export const insertCustomPoolSchema = createInsertSchema(customPools).omit({
  id: true,
  createdAt: true,
});

export type CustomPool = typeof customPools.$inferSelect;
export type InsertCustomPool = z.infer<typeof insertCustomPoolSchema>;
