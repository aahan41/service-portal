import { Router } from "express";
import { db, applicationsTable, usersTable, servicesTable, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import {
  ListApplicationsQueryParams,
  CreateApplicationBody,
  GetApplicationParams,
  UpdateApplicationParams,
  UpdateApplicationBody,
} from "@workspace/api-zod";
import { requireAuth, requireAdmin } from "../middlewares/auth";

const router = Router();

async function buildApplicationDetail(app: typeof applicationsTable.$inferSelect) {
  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, app.userId));
  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, app.serviceId));
  return {
    id: app.id,
    userId: app.userId,
    userName: user?.name ?? null,
    userEmail: user?.email ?? null,
    serviceId: app.serviceId,
    serviceName: service?.name ?? null,
    servicePrice: service ? parseFloat(service.price) : null,
    status: app.status,
    formData: app.formData,
    resultFile: app.resultFile,
    resultText: app.resultText,
    adminNotes: app.adminNotes,
    createdAt: app.createdAt.toISOString(),
    updatedAt: app.updatedAt.toISOString(),
  };
}

router.get("/applications", requireAuth, async (req, res): Promise<void> => {
  const params = ListApplicationsQueryParams.safeParse(req.query);
  const isAdmin = req.user!.role === "admin";
  const filters: ReturnType<typeof and>[] = [];

  if (!isAdmin) {
    filters.push(eq(applicationsTable.userId, req.user!.id));
  }

  if (params.success) {
    if (params.data.status) filters.push(eq(applicationsTable.status, params.data.status));
    if (isAdmin && params.data.userId) filters.push(eq(applicationsTable.userId, params.data.userId));
    if (params.data.serviceId) filters.push(eq(applicationsTable.serviceId, params.data.serviceId));
  }

  const page = params.success ? (params.data.page ?? 1) : 1;
  const limit = params.success ? (params.data.limit ?? 50) : 50;
  const offset = (page - 1) * limit;

  const apps = await db
    .select()
    .from(applicationsTable)
    .where(filters.length > 0 ? and(...filters) : undefined)
    .orderBy(desc(applicationsTable.createdAt))
    .limit(limit)
    .offset(offset);

  const total = await db
    .select({ count: applicationsTable.id })
    .from(applicationsTable)
    .where(filters.length > 0 ? and(...filters) : undefined);

  const users = await db.select().from(usersTable);
  const services = await db.select().from(servicesTable);

  const userMap = new Map(users.map(u => [u.id, u]));
  const serviceMap = new Map(services.map(s => [s.id, s]));

  const result = apps.map(app => {
    const user = userMap.get(app.userId);
    const service = serviceMap.get(app.serviceId);
    return {
      id: app.id,
      userId: app.userId,
      userName: user?.name ?? null,
      userEmail: user?.email ?? null,
      serviceId: app.serviceId,
      serviceName: service?.name ?? null,
      servicePrice: service ? parseFloat(service.price) : null,
      status: app.status,
      formData: app.formData,
      resultFile: app.resultFile,
      resultText: app.resultText,
      adminNotes: app.adminNotes,
      createdAt: app.createdAt.toISOString(),
      updatedAt: app.updatedAt.toISOString(),
    };
  });

  res.json({ applications: result, total: total.length });
});

router.post("/applications", requireAuth, async (req, res): Promise<void> => {
  const parsed = CreateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, parsed.data.serviceId));
  if (!service || !service.isActive) {
    res.status(404).json({ error: "Service not found or inactive" });
    return;
  }

  const [user] = await db.select().from(usersTable).where(eq(usersTable.id, req.user!.id));
  const userBalance = parseFloat(user?.walletBalance ?? "0");
  const servicePrice = parseFloat(service.price);

  if (userBalance < servicePrice) {
    res.status(400).json({ error: "Insufficient wallet balance" });
    return;
  }

  const newBalance = userBalance - servicePrice;
  await db.update(usersTable).set({ walletBalance: String(newBalance) }).where(eq(usersTable.id, req.user!.id));

  const [app] = await db.insert(applicationsTable).values({
    userId: req.user!.id,
    serviceId: parsed.data.serviceId,
    status: "pending",
    formData: parsed.data.formData,
  }).returning();

  await db.insert(notificationsTable).values({
    userId: req.user!.id,
    message: `Your application for "${service.name}" has been submitted successfully.`,
    type: "application",
    isRead: false,
  });

  res.status(201).json(await buildApplicationDetail(app));
});

router.get("/applications/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [app] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!app) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  if (req.user!.role !== "admin" && app.userId !== req.user!.id) {
    res.status(403).json({ error: "Access denied" });
    return;
  }

  res.json(await buildApplicationDetail(app));
});

router.patch("/applications/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateApplicationParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateApplicationBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [existing] = await db.select().from(applicationsTable).where(eq(applicationsTable.id, params.data.id));
  if (!existing) {
    res.status(404).json({ error: "Application not found" });
    return;
  }

  const updateData: Partial<typeof applicationsTable.$inferInsert> = {};
  if (parsed.data.status !== undefined) updateData.status = parsed.data.status;
  if (parsed.data.resultFile !== undefined) updateData.resultFile = parsed.data.resultFile;
  if (parsed.data.resultText !== undefined) updateData.resultText = parsed.data.resultText;
  if (parsed.data.adminNotes !== undefined) updateData.adminNotes = parsed.data.adminNotes;

  const [app] = await db
    .update(applicationsTable)
    .set(updateData)
    .where(eq(applicationsTable.id, params.data.id))
    .returning();

  if (parsed.data.status && parsed.data.status !== existing.status) {
    const statusMessages: Record<string, string> = {
      processing: "Your application is now being processed.",
      success: "Your application has been completed successfully. You can now download the result.",
      rejected: "Your application has been rejected. Please contact support for more information.",
    };
    const msg = statusMessages[parsed.data.status];
    if (msg) {
      const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, existing.serviceId));
      await db.insert(notificationsTable).values({
        userId: existing.userId,
        message: `${service?.name ?? "Service"}: ${msg}`,
        type: "status_update",
        isRead: false,
      });
    }
  }

  res.json(await buildApplicationDetail(app));
});

export default router;
