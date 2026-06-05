import { Router } from "express";
import { db, categoriesTable, servicesTable } from "@workspace/db";
import { eq, sql, asc } from "drizzle-orm";
import { CreateCategoryBody, UpdateCategoryBody, UpdateCategoryParams, DeleteCategoryParams } from "@workspace/api-zod";
import { requireAdmin } from "../middlewares/auth";

const router = Router();

router.get("/categories", async (_req, res): Promise<void> => {
  const cats = await db.select().from(categoriesTable).orderBy(asc(categoriesTable.order));
  
  const counts = await db
    .select({ categoryId: servicesTable.categoryId, count: sql<number>`count(*)::int` })
    .from(servicesTable)
    .where(eq(servicesTable.isActive, true))
    .groupBy(servicesTable.categoryId);

  const countMap = new Map(counts.map(c => [c.categoryId, c.count]));

  res.json(cats.map(c => ({
    id: c.id,
    name: c.name,
    icon: c.icon,
    order: c.order,
    isActive: c.isActive,
    serviceCount: countMap.get(c.id) ?? 0,
  })));
});

router.post("/categories", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [cat] = await db.insert(categoriesTable).values({
    name: parsed.data.name,
    icon: parsed.data.icon,
    order: parsed.data.order ?? 0,
  }).returning();

  res.status(201).json({ ...cat, serviceCount: 0 });
});

router.patch("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateCategoryBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof categoriesTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
  if (parsed.data.order !== undefined) updateData.order = parsed.data.order;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [cat] = await db.update(categoriesTable).set(updateData).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  const [countRow] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(servicesTable)
    .where(eq(servicesTable.categoryId, cat.id));

  res.json({ ...cat, serviceCount: countRow?.count ?? 0 });
});

router.delete("/categories/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteCategoryParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [cat] = await db.delete(categoriesTable).where(eq(categoriesTable.id, params.data.id)).returning();
  if (!cat) {
    res.status(404).json({ error: "Category not found" });
    return;
  }

  res.json({ message: "Category deleted" });
});

export default router;
