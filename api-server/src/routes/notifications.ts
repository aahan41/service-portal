import { Router } from "express";
import { db, notificationsTable } from "@workspace/db";
import { eq, and, desc } from "drizzle-orm";
import { MarkNotificationReadParams } from "@workspace/api-zod";
import { requireAuth } from "../middlewares/auth";

const router = Router();

router.get("/notifications", requireAuth, async (req, res): Promise<void> => {
  const notifications = await db
    .select()
    .from(notificationsTable)
    .where(eq(notificationsTable.userId, req.user!.id))
    .orderBy(desc(notificationsTable.createdAt))
    .limit(50);

  res.json(notifications.map(n => ({
    id: n.id,
    userId: n.userId,
    message: n.message,
    type: n.type,
    isRead: n.isRead,
    createdAt: n.createdAt.toISOString(),
  })));
});

router.patch("/notifications/:id/read", requireAuth, async (req, res): Promise<void> => {
  const params = MarkNotificationReadParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [notification] = await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.id, params.data.id), eq(notificationsTable.userId, req.user!.id)))
    .returning();

  if (!notification) {
    res.status(404).json({ error: "Notification not found" });
    return;
  }

  res.json({
    id: notification.id,
    userId: notification.userId,
    message: notification.message,
    type: notification.type,
    isRead: notification.isRead,
    createdAt: notification.createdAt.toISOString(),
  });
});

router.patch("/notifications/read-all", requireAuth, async (req, res): Promise<void> => {
  await db
    .update(notificationsTable)
    .set({ isRead: true })
    .where(and(eq(notificationsTable.userId, req.user!.id), eq(notificationsTable.isRead, false)));

  res.json({ message: "All notifications marked as read" });
});

export default router;
