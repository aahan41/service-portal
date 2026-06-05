import { Router } from "express";
import { db, usersTable } from "@workspace/db";
import { eq, ilike, or, sql } from "drizzle-orm";
import {
  ListUsersQueryParams,
  GetUserParams,
  UpdateUserParams,
  UpdateUserBody,
  AdjustUserWalletParams,
  AdjustUserWalletBody,
} from "@workspace/api-zod";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

function formatUser(user: typeof usersTable.$inferSelect) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role,
    walletBalance: parseFloat(user.walletBalance),
    isActive: user.isActive,
    createdAt: user.createdAt.toISOString(),
  };
}

router.get("/users", requireAdmin, async (req, res): Promise<void> => {
  const params = ListUsersQueryParams.safeParse(req.query);

  let users = await db.select().from(usersTable).orderBy(usersTable.createdAt);

  if (params.success && params.data.search) {
    const q = params.data.search.toLowerCase();
    users = users.filter(u =>
      u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)
    );
  }

  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 50) : 50;
  const offset = (page - 1) * limit;
  const paged = users.slice(offset, offset + limit);

  res.json({ users: paged.map(formatUser), total: users.length });
});

router.get("/users/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  if (req.user!.role !== "admin" && req.user!.id !== params.data.id) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

router.patch("/users/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateUserParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateUserBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.phone !== undefined) updateData.phone = parsed.data.phone;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;
  if (parsed.data.role !== undefined) updateData.role = parsed.data.role;

  const [user] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, params.data.id)).returning();
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  res.json(formatUser(user));
});

router.patch("/users/:id/wallet", requireAdmin, async (req, res): Promise<void> => {
  const params = AdjustUserWalletParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = AdjustUserWalletBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, params.data.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }

  const newBalance = parseFloat(user.walletBalance) + parsed.data.amount;
  const [updated] = await db
    .update(usersTable)
    .set({ walletBalance: String(Math.max(0, newBalance)) })
    .where(eq(usersTable.id, params.data.id))
    .returning();

  res.json(formatUser(updated));
});

export default router;
