/**
 * Prisma Client Instance
 *
 * Connects directly to PostgreSQL using @prisma/client
 */

import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const isDev = typeof process !== "undefined" && process.env["NODE_ENV"] === "development";
const isNotProd = typeof process !== "undefined" && process.env["NODE_ENV"] !== "production";

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isDev ? ["warn", "error"] : ["error"],
  });

if (isNotProd) globalForPrisma.prisma = prisma;

export type {
  Job as PrismaJobRecord,
  User as PrismaUserRecord,
  SyncLog as PrismaSyncLog,
  ServiceRequest as ServiceRequestRecord,
  SystemRole as SystemRoleRecord,
} from "@prisma/client";
