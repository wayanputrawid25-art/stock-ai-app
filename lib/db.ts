import { PrismaClient } from "@prisma/client";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error(
    "Missing DATABASE_URL environment variable. Please add DATABASE_URL in Vercel Project Settings > Environment Variables."
  );
}

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

function createPrismaClient() {
  return new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
    datasources: {
      db: {
        url: databaseUrl
      }
    }
  });
}

export const prisma = globalForPrisma.prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
