import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL environment variable. Please add DATABASE_URL in Vercel Project Settings > Environment Variables."
  );
}

// Validate DATABASE_URL format
if (!databaseUrl.startsWith("postgresql://") && !databaseUrl.startsWith("postgres://")) {
  throw new Error(
    "Invalid DATABASE_URL format. Must be a valid PostgreSQL connection string (postgresql:// or postgres://)"
  );
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

// Initialize Prisma client with error handling
function createPrismaClient() {
  return new PrismaClient({
    log:
      process.env.NODE_ENV === "development"
        ? ["error", "warn", "query"]
        : ["error"],
    errorFormat: "pretty"
  });
}

export const prisma =
  globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}

// Handle disconnection gracefully
prisma.$on("error", (e: Error) => {
  console.error("❌ Prisma client error:", e.message);
});

// Test connection on initialization in development
if (process.env.NODE_ENV === "development") {
  validateConnection().catch((error) => {
    console.error("⚠️ Database connection validation failed during initialization:", error);
  });
}

async function validateConnection(): Promise<void> {
  try {
    await prisma.$queryRaw`SELECT 1`;
    console.log("✓ Database connection validated successfully");
  } catch (error) {
    console.error(
      "✗ Database connection failed:",
      error instanceof Error ? error.message : String(error)
    );
    await prisma.$disconnect();
    throw new Error("Database connection validation failed");
  }
}

// Graceful shutdown
process.on("SIGTERM", async () => {
  console.log("SIGTERM received, disconnecting Prisma client...");
  await prisma.$disconnect();
  process.exit(0);
});

process.on("SIGINT", async () => {
  console.log("SIGINT received, disconnecting Prisma client...");
  await prisma.$disconnect();
  process.exit(0);
});
