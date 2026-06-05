import app from "./app";
import { logger } from "./lib/logger";
import { seedDatabase } from "./seed";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

// Listen immediately on 0.0.0.0 so the health check at /api/healthz
// passes right away — seed runs in the background after the server is up.
app.listen(port, "0.0.0.0", (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port, host: "0.0.0.0" }, "Server listening");

  // Seed in background — never blocks startup
  seedDatabase().catch((seedErr) => {
    logger.error({ err: seedErr }, "Background seed failed");
  });
});
