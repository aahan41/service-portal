import { Router } from "express";
import { db, servicesTable, categoriesTable } from "@workspace/db";
import { eq, and, ilike, sql } from "drizzle-orm";
import {
  ListServicesQueryParams,
  CreateServiceBody,
  GetServiceParams,
  UpdateServiceParams,
  UpdateServiceBody,
  DeleteServiceParams,
} from "@workspace/api-zod";
import { requireAdmin, requireAuth } from "../middlewares/auth";

const router = Router();

async function buildServiceWithCategory(s: typeof servicesTable.$inferSelect) {
  const [cat] = await db.select().from(categoriesTable).where(eq(categoriesTable.id, s.categoryId));
  return {
    id: s.id,
    name: s.name,
    description: s.description,
    price: parseFloat(s.price),
    icon: s.icon,
    isActive: s.isActive,
    categoryId: s.categoryId,
    categoryName: cat?.name ?? "",
    formFields: s.formFields,
    createdAt: s.createdAt.toISOString(),
  };
}

router.get("/services", async (req, res): Promise<void> => {
  const params = ListServicesQueryParams.safeParse(req.query);
  const filters: ReturnType<typeof and>[] = [];

  if (params.success) {
    if (params.data.categoryId) filters.push(eq(servicesTable.categoryId, params.data.categoryId));
    if (params.data.isActive !== undefined) filters.push(eq(servicesTable.isActive, params.data.isActive));
  }

  let services = await db.select().from(servicesTable).where(filters.length > 0 ? and(...filters) : undefined);

  if (params.success && params.data.search) {
    const q = params.data.search.toLowerCase();
    services = services.filter(s => s.name.toLowerCase().includes(q) || s.description.toLowerCase().includes(q));
  }

  const cats = await db.select().from(categoriesTable);
  const catMap = new Map(cats.map(c => [c.id, c.name]));

  res.json(services.map(s => ({
    id: s.id,
    name: s.name,
    description: s.description,
    price: parseFloat(s.price),
    icon: s.icon,
    isActive: s.isActive,
    categoryId: s.categoryId,
    categoryName: catMap.get(s.categoryId) ?? "",
    formFields: s.formFields,
    createdAt: s.createdAt.toISOString(),
  })));
});

router.post("/services", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [service] = await db.insert(servicesTable).values({
    name: parsed.data.name,
    description: parsed.data.description,
    price: String(parsed.data.price),
    icon: parsed.data.icon,
    categoryId: parsed.data.categoryId,
    formFields: parsed.data.formFields ?? null,
    isActive: parsed.data.isActive ?? true,
  }).returning();

  res.status(201).json(await buildServiceWithCategory(service));
});

router.get("/services/:id", requireAuth, async (req, res): Promise<void> => {
  const params = GetServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [service] = await db.select().from(servicesTable).where(eq(servicesTable.id, params.data.id));
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(await buildServiceWithCategory(service));
});

router.patch("/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateServiceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const updateData: Partial<typeof servicesTable.$inferInsert> = {};
  if (parsed.data.name !== undefined) updateData.name = parsed.data.name;
  if (parsed.data.description !== undefined) updateData.description = parsed.data.description;
  if (parsed.data.price !== undefined) updateData.price = String(parsed.data.price);
  if (parsed.data.icon !== undefined) updateData.icon = parsed.data.icon;
  if (parsed.data.categoryId !== undefined) updateData.categoryId = parsed.data.categoryId;
  if (parsed.data.formFields !== undefined) updateData.formFields = parsed.data.formFields;
  if (parsed.data.isActive !== undefined) updateData.isActive = parsed.data.isActive;

  const [service] = await db.update(servicesTable).set(updateData).where(eq(servicesTable.id, params.data.id)).returning();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json(await buildServiceWithCategory(service));
});

router.delete("/services/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteServiceParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [service] = await db.delete(servicesTable).where(eq(servicesTable.id, params.data.id)).returning();
  if (!service) {
    res.status(404).json({ error: "Service not found" });
    return;
  }

  res.json({ message: "Service deleted" });
});

export default router;
