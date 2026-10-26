/**
 * Prisma Client Instance
 *
 * Connects directly to PostgreSQL using @prisma/client
 */

import { PrismaClient } from "@prisma/client";

// Extended Prisma interface to ensure VS Code TypeScript Server recognizes
// dynamically generated models (customer, contactPerson, site, item, masterRecord)
// even when tsserver caches prior @prisma/client declarations.
export type TelesonicPrismaClient = PrismaClient & {
  customer: any;
  contactPerson: any;
  site: any;
  item: any;
  serialRegister: any;
  equipment: any;
  otherBrandEquipment: any;
  equipmentSystem: any;
  technician: any;
  subcontractor: any;
  serviceRoleMaster: any;
  serviceTypeMaster: any;
  masterRecord: any;
  [key: string]: any;
};

const globalForPrisma = globalThis as unknown as {
  prisma: TelesonicPrismaClient | undefined;
};

const isDev = typeof process !== "undefined" && process.env["NODE_ENV"] === "development";
const isNotProd = typeof process !== "undefined" && process.env["NODE_ENV"] !== "production";

export const prisma: TelesonicPrismaClient =
  globalForPrisma.prisma ??
  (new PrismaClient({
    log: isDev ? ["warn", "error"] : ["error"],
  }) as TelesonicPrismaClient);

if (isNotProd) globalForPrisma.prisma = prisma;

export type {
  Job as PrismaJobRecord,
  User as PrismaUserRecord,
  SyncLog as PrismaSyncLog,
  ServiceRequest as ServiceRequestRecord,
  SystemRole as SystemRoleRecord,
} from "@prisma/client";
