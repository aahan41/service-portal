import { Router } from "express";
import { db, walletRequestsTable, usersTable, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  ListWalletRequestsQueryParams,
  CreateWalletRequestBody,
  UpdateWalletRequestParams,
  UpdateWalletRequestBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/wallet/balance", requireAuth, async (req, res): Promise<void> => {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) {
    res.status(404).json({ error: "User not found" });
    return;
  }
  res.json({ balance: parseFloat(user.walletBalance) });
});

router.get("/wallet/requests", requireAuth, async (req, res): Promise<void> => {
  const params = ListWalletRequestsQueryParams.safeParse(req.query);
  const isAdmin = req.user!.role === "admin";

  const filters: ReturnType<typeof and>[] = [];
  if (!isAdmin) filters.push(eq(walletRequestsTable.userId, req.user!.id));
  if (params.success && params.data.status) filters.push(eq(walletRequestsTable.status, params.data.status));

  const requests = await db
    .select()
    .from(walletRequestsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(walletRequestsTable.createdAt));

  const users = await db.select().from(usersTable);
  const userMap = new Map(users.map(u => [u.id, u]));

  res.json(requests.map(r => ({
    id: r.id,
    userId: r.userId,
    userName: userMap.get(r.userId)?.name ?? null,
    userEmail: userMap.get(r.userId)?.email ?? null,
    amount: parseFloat(r.amount),
    status: r.status,
    paymentProof: r.paymentProof,
    adminNote: r.adminNote,
    createdAt: r.createdAt.toISOString(),
  })));
});

router.post("/wallet/requests", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateWalletRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [request] = await db.insert(walletRequestsTable).values({
    userId: req.user!.id,
    amount: String(parsed.data.amount),
    status: "pending",
    paymentProof: parsed.data.paymentProof ?? null,
  }).returning();

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));

  res.status(201).json({
    id: request.id,
    userId: request.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    amount: parseFloat(request.amount),
    status: request.status,
    paymentProof: request.paymentProof,
    adminNote: request.adminNote,
    createdAt: request.createdAt.toISOString(),
  });
});

router.patch("/wallet/requests/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateWalletRequestParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateWalletRequestBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(walletRequestsTable).where(eq(walletRequestsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Wallet request not found" });
    return;
  }

  const [request] = await db
    .update(walletRequestsTable)
    .set({ status: parsed.data.status, adminNote: parsed.data.adminNote ?? null })
    .where(eq(walletRequestsTable.id, params.data.id))
    .returning();

  if (parsed.data.status === "approved") {
    const [user] = await db.select().from(usersTable).where(eq(usersTable.id, existing.userId));
    if (user) {
      const newBalance = parseFloat(user.walletBalance) + parseFloat(existing.amount);
      await db.update(usersTable).set({ walletBalance: String(newBalance) }).where(eq(usersTable.id, existing.userId));
    }
    await db.insert(notificationsTable).values({
      userId: existing.userId,
      message: `Your wallet top-up request of ₹${parseFloat(existing.amount).toFixed(2)} has been approved.`,
      type: "wallet",
      isRead: false,
    });
  } else if (parsed.data.status === "rejected") {
    await db.insert(notificationsTable).values({
      userId: existing.userId,
      message: `Your wallet top-up request of ₹${parseFloat(existing.amount).toFixed(2)} has been rejected.${parsed.data.adminNote ? ` Reason: ${parsed.data.adminNote}` : ""}`,
      type: "wallet",
      isRead: false,
    });
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, request.userId));

  res.json({
    id: request.id,
    userId: request.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    amount: parseFloat(request.amount),
    status: request.status,
    paymentProof: request.paymentProof,
    adminNote: request.adminNote,
    createdAt: request.createdAt.toISOString(),
  });
});

export default router;
