import bcrypt from "bcryptjs";
import { db, usersTable, categoriesTable, servicesTable } from "@workspace/db";
import { eq } from "drizzle-orm";
import { logger } from "./lib/logger";

const DEMO_PASSWORD = "admin123";

const DEFAULT_CATEGORIES = [
  { name: "Aadhaar Services", icon: "fingerprint", order: 1 },
  { name: "PAN Card", icon: "credit-card", order: 2 },
  { name: "Voter Services", icon: "vote", order: 3 },
  { name: "Driving Licence", icon: "car", order: 4 },
  { name: "Vehicle Services", icon: "truck", order: 5 },
  { name: "Ration Card", icon: "shopping-basket", order: 6 },
  { name: "Certificate Services", icon: "scroll", order: 7 },
  { name: "Banking & Payment", icon: "landmark", order: 8 },
  { name: "Labour Services", icon: "hard-hat", order: 9 },
  { name: "Lookup & Intelligence", icon: "globe", order: 10 },
  { name: "Electricity Services", icon: "zap", order: 11 },
];

const DEFAULT_SERVICES: { name: string; icon: string; categoryOrder: number }[] = [
  { name: "Aadhaar Manual", icon: "fingerprint", categoryOrder: 1 },
  { name: "Aadhaar OTP eKYC", icon: "shield-check", categoryOrder: 1 },
  { name: "UID to Name", icon: "user", categoryOrder: 1 },
  { name: "Aadhaar Intelligence", icon: "search", categoryOrder: 1 },
  { name: "Check Aadhaar Validity", icon: "check-circle", categoryOrder: 1 },
  { name: "Generate EID to PDF", icon: "file-down", categoryOrder: 1 },
  { name: "Name Mobile to PDF", icon: "file-text", categoryOrder: 1 },
  { name: "Mobile to PAN", icon: "phone", categoryOrder: 2 },
  { name: "Lost PAN Card No Find", icon: "search", categoryOrder: 2 },
  { name: "PAN No to Aadhaar No", icon: "link", categoryOrder: 2 },
  { name: "PAN Card Detail Find", icon: "credit-card", categoryOrder: 2 },
  { name: "PAN Card Manual Print", icon: "printer", categoryOrder: 2 },
  { name: "Voter Mobile Link", icon: "link", categoryOrder: 3 },
  { name: "Voter Card PDF Org", icon: "file-down", categoryOrder: 3 },
  { name: "Voter Advance Print", icon: "printer", categoryOrder: 3 },
  { name: "Driving Licence PDF", icon: "car", categoryOrder: 4 },
  { name: "Learning Licence PDF", icon: "file-text", categoryOrder: 4 },
  { name: "Learning Licence Exam", icon: "book-open", categoryOrder: 4 },
  { name: "LL Exam Pass", icon: "award", categoryOrder: 4 },
  { name: "DL Card PDF", icon: "id-card", categoryOrder: 4 },
  { name: "DL Mobile No Find", icon: "phone", categoryOrder: 4 },
  { name: "RC Owner Book", icon: "book", categoryOrder: 5 },
  { name: "RC Card PDF", icon: "file-down", categoryOrder: 5 },
  { name: "Vehicle Challan", icon: "alert-triangle", categoryOrder: 5 },
  { name: "PUC Certificate", icon: "shield", categoryOrder: 5 },
  { name: "UP Ration to UID", icon: "link", categoryOrder: 6 },
  { name: "Ration Card PDF", icon: "file-down", categoryOrder: 6 },
  { name: "Ration to Aadhaar", icon: "link", categoryOrder: 6 },
  { name: "Ration to Aadhaar All State", icon: "map", categoryOrder: 6 },
  { name: "Ration PDF by UID", icon: "file-text", categoryOrder: 6 },
  { name: "UP Birth Original", icon: "file-text", categoryOrder: 7 },
  { name: "Bihar Caste/Income/Residence", icon: "scroll", categoryOrder: 7 },
  { name: "IFSC Details", icon: "landmark", categoryOrder: 8 },
  { name: "NPCI Status Check", icon: "activity", categoryOrder: 8 },
  { name: "eShram Card PDF", icon: "hard-hat", categoryOrder: 9 },
  { name: "Universal Lookup", icon: "globe", categoryOrder: 10 },
  { name: "Mobile Intelligence", icon: "smartphone", categoryOrder: 10 },
  { name: "UPPCL Mobile Number Update", icon: "smartphone", categoryOrder: 11 },
  { name: "Electricity Bill PDF", icon: "file-down", categoryOrder: 11 },
  { name: "Electricity Bill Details", icon: "receipt", categoryOrder: 11 },
  { name: "Electricity Consumer Verification", icon: "shield-check", categoryOrder: 11 },
];

export async function seedDatabase() {
  try {
    logger.info("Running startup seed check...");

    // Only INSERT demo accounts if they don't already exist.
    // Never UPDATE existing accounts — admins manage credentials via the Admin panel.
    const [existingAdmin] = await db.select().from(usersTable).where(eq(usersTable.email, "admin@portal.com"));
    if (!existingAdmin) {
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await db.insert(usersTable).values({
        name: "Admin User",
        email: "admin@portal.com",
        passwordHash: hash,
        role: "admin",
        walletBalance: "0",
        isActive: false, // disabled by default on fresh install
      });
      logger.info("Seeded demo admin (inactive)");
    }

    const [existingUser] = await db.select().from(usersTable).where(eq(usersTable.email, "user@portal.com"));
    if (!existingUser) {
      const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
      await db.insert(usersTable).values({
        name: "Demo User",
        email: "user@portal.com",
        passwordHash: hash,
        role: "user",
        walletBalance: "500",
        isActive: false, // disabled by default on fresh install
      });
      logger.info("Seeded demo user (inactive)");
    }

    // Seed categories + services only if none exist
    const existingCats = await db.select().from(categoriesTable);
    if (existingCats.length === 0) {
      for (const cat of DEFAULT_CATEGORIES) {
        await db.insert(categoriesTable).values({ ...cat, isActive: true });
      }
      logger.info({ count: DEFAULT_CATEGORIES.length }, "Seeded categories");

      const allCats = await db.select().from(categoriesTable);
      const catByOrder: Record<number, number> = {};
      for (const cat of allCats) {
        catByOrder[cat.order] = cat.id;
      }

      for (const svc of DEFAULT_SERVICES) {
        const categoryId = catByOrder[svc.categoryOrder];
        if (!categoryId) continue;
        await db.insert(servicesTable).values({
          name: svc.name,
          description: "",
          price: "0",
          icon: svc.icon,
          categoryId,
          formFields: null,
          isActive: false,
        });
      }
      logger.info({ count: DEFAULT_SERVICES.length }, "Seeded services (price=0, inactive)");
    } else {
      // Ensure Electricity Services category exists on existing installs
      const electricityCat = existingCats.find(c => c.name === "Electricity Services");
      if (!electricityCat) {
        const [newCat] = await db.insert(categoriesTable)
          .values({ name: "Electricity Services", icon: "zap", order: 11, isActive: true })
          .returning();
        const electricityServices = DEFAULT_SERVICES.filter(s => s.categoryOrder === 11);
        for (const svc of electricityServices) {
          await db.insert(servicesTable).values({
            name: svc.name, description: "", price: "0",
            icon: svc.icon, categoryId: newCat.id, formFields: null, isActive: false,
          });
        }
        logger.info("Seeded electricity services category");
      }
    }

    logger.info("Startup seed complete");
  } catch (err) {
    logger.error({ err }, "Seed error — continuing startup anyway");
  }
}
