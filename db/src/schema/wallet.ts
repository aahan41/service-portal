import { pgTable, serial, text, integer, numeric, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const walletRequestsTable = pgTable("wallet_requests", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  amount: numeric("amount", { precision: 10, scale: 2 }).notNull(),
  status: text("status").notNull().default("pending"),
  paymentProof: text("payment_proof"),
  adminNote: text("admin_note"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow().$onUpdate(() => new Date()),
});

export const insertWalletRequestSchema = createInsertSchema(walletRequestsTable).omit({ id: true, createdAt: true, updatedAt: true });
export type InsertWalletRequest = z.infer<typeof insertWalletRequestSchema>;
export type WalletRequest = typeof walletRequestsTable.$inferSelect;
