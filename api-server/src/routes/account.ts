import { Router } from "express";
import bcrypt from "bcryptjs";
import { db, usersTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

function formatUser(u: typeof usersTable.$inferSelect) {
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    phone: u.phone,
    role: u.role,
    walletBalance: parseFloat(u.walletBalance),
    isActive: u.isActive,
    createdAt: u.createdAt.toISOString(),
  };
}

// PATCH /api/account/password — change own password
router.patch("/account/password", requireAuth, async (req, res): Promise<void> => {
  const { currentPassword, newPassword } = req.body as Record<string, unknown>;
  if (typeof currentPassword !== "string" || typeof newPassword !== "string" || newPassword.length < 6) {
    res.status(400).json({ error: "currentPassword and newPassword (min 6 chars) required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }

  const hash = await bcrypt.hash(newPassword, 10);
  await db.update(usersTable).set({ passwordHash: hash }).where(eq(usersTable.id, user.id));
  res.json({ message: "Password updated successfully" });
});

// PATCH /api/account/email — change own email
router.patch("/account/email", requireAuth, async (req, res): Promise<void> => {
  const { email, currentPassword } = req.body as Record<string, unknown>;
  if (typeof email !== "string" || !email.includes("@") || typeof currentPassword !== "string") {
    res.status(400).json({ error: "Valid email and current password required" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  if (!user) { res.status(404).json({ error: "User not found" }); return; }

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) { res.status(401).json({ error: "Current password is incorrect" }); return; }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing && existing.id !== user.id) { res.status(409).json({ error: "Email already in use" }); return; }

  const [updated] = await db.update(usersTable).set({ email }).where(eq(usersTable.id, user.id)).returning();
  res.json(formatUser(updated));
});

// GET /api/account/admins — list all admin accounts (admin only)
router.get("/account/admins", requireAdmin, async (_req, res): Promise<void> => {
  const admins = await db.select().from(usersTable).where(eq(usersTable.role, "admin"));
  res.json(admins.map(formatUser));
});

// POST /api/account/admins — create a new admin account (admin only)
router.post("/account/admins", requireAdmin, async (req, res): Promise<void> => {
  const { name, email, password } = req.body as Record<string, unknown>;
  if (typeof name !== "string" || name.length < 2 ||
      typeof email !== "string" || !email.includes("@") ||
      typeof password !== "string" || password.length < 6) {
    res.status(400).json({ error: "name (min 2), valid email, and password (min 6 chars) required" });
    return;
  }

  const [existing] = await db.select().from(usersTable).where(eq(usersTable.email, email));
  if (existing) { res.status(409).json({ error: "Email already registered" }); return; }

  const hash = await bcrypt.hash(password, 10);
  const [newAdmin] = await db.insert(usersTable).values({
    name,
    email,
    passwordHash: hash,
    role: "admin",
    walletBalance: "0",
    isActive: true,
  }).returning();

  res.status(201).json(formatUser(newAdmin));
});

// PATCH /api/account/admins/:id — update admin account (disable/enable, admin only)
router.patch("/account/admins/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? "0"));
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  const { isActive, name } = req.body as Record<string, unknown>;
  const updateData: Partial<typeof usersTable.$inferInsert> = {};
  if (typeof isActive === "boolean") updateData.isActive = isActive;
  if (typeof name === "string" && name.length >= 2) updateData.name = name;

  const [updated] = await db.update(usersTable).set(updateData).where(eq(usersTable.id, id)).returning();
  if (!updated) { res.status(404).json({ error: "Admin not found" }); return; }
  res.json(formatUser(updated));
});

// DELETE /api/account/admins/:id — delete an admin account (admin only)
router.delete("/account/admins/:id", requireAdmin, async (req, res): Promise<void> => {
  const id = parseInt(String(req.params["id"] ?? "0"));
  if (!id) { res.status(400).json({ error: "Invalid id" }); return; }

  if (id === req.user!.id) {
    res.status(400).json({ error: "Cannot delete your own account" });
    return;
  }

  const [deleted] = await db.delete(usersTable).where(eq(usersTable.id, id)).returning();
  if (!deleted) { res.status(404).json({ error: "Admin not found" }); return; }
  res.json({ message: "Admin account deleted" });
});

export default router;
