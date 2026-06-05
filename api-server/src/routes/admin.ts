import { Router } from "express";
import { db, usersTable, applicationsTable, walletRequestsTable, servicesTable, categoriesTable } from "@workspace/db";
import { eq, sql } from "drizzle-orm";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/admin/stats", requireAdmin, async (_req, res): Promise<void> => {
  const [totalUsers] = await db.select({ count: sql<number>`count(*)::int` }).from(usersTable).where(eq(usersTable.role, "user"));
  const [totalApps] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable);
  const [pending] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable).where(eq(applicationsTable.status, "pending"));
  const [processing] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable).where(eq(applicationsTable.status, "processing"));
  const [success] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable).where(eq(applicationsTable.status, "success"));
  const [rejected] = await db.select({ count: sql<number>`count(*)::int` }).from(applicationsTable).where(eq(applicationsTable.status, "rejected"));
  const [pendingWallet] = await db.select({ count: sql<number>`count(*)::int` }).from(walletRequestsTable).where(eq(walletRequestsTable.status, "pending"));
  const [totalServices] = await db.select({ count: sql<number>`count(*)::int` }).from(servicesTable);
  const [totalCategories] = await db.select({ count: sql<number>`count(*)::int` }).from(categoriesTable);

  const successApps = await db.select({ serviceId: applicationsTable.serviceId }).from(applicationsTable).where(eq(applicationsTable.status, "success"));
  const serviceIds = successApps.map(a => a.serviceId);
  let revenue = 0;
  if (serviceIds.length > 0) {
    const services = await db.select().from(servicesTable);
    const serviceMap = new Map(services.map(s => [s.id, parseFloat(s.price)]));
    revenue = serviceIds.reduce((sum, id) => sum + (serviceMap.get(id) ?? 0), 0);
  }

  res.json({
    totalUsers: totalUsers?.count ?? 0,
    totalApplications: totalApps?.count ?? 0,
    pendingApplications: pending?.count ?? 0,
    processingApplications: processing?.count ?? 0,
    successApplications: success?.count ?? 0,
    rejectedApplications: rejected?.count ?? 0,
    pendingWalletRequests: pendingWallet?.count ?? 0,
    totalRevenue: revenue,
    totalServices: totalServices?.count ?? 0,
    totalCategories: totalCategories?.count ?? 0,
  });
});

router.get("/admin/export/applications", requireAdmin, async (req, res): Promise<void> => {
  const { status } = req.query;

  let apps = await db.select().from(applicationsTable).orderBy(applicationsTable.createdAt);
  if (status && typeof status === "string") {
    apps = apps.filter(a => a.status === status);
  }

  const users = await db.select().from(usersTable);
  const services = await db.select().from(servicesTable);
  const userMap = new Map(users.map(u => [u.id, u]));
  const serviceMap = new Map(services.map(s => [s.id, s]));

  const rows = apps.map(app => {
    const user = userMap.get(app.userId);
    const service = serviceMap.get(app.serviceId);
    return [
      app.id,
      user?.name ?? "",
      user?.email ?? "",
      service?.name ?? "",
      service?.price ?? 0,
      app.status,
      app.createdAt.toISOString(),
      app.updatedAt.toISOString(),
    ].map(String).join(",");
  });

  const csv = ["ID,User Name,User Email,Service,Price,Status,Created At,Updated At", ...rows].join("\n");

  res.setHeader("Content-Type", "text/csv");
  res.setHeader("Content-Disposition", "attachment; filename=applications.csv");
  res.send(csv);
});

export default router;
