-- ============================================================================
-- TELESONIC SERVICE MANAGER — COMPLETE SUPABASE POSTGRESQL SCHEMA
-- Generated from prisma/schema.prisma (All Masters, Transactions, Jobs, Auth,
-- Assets, Incidents, Problems, Changes, Catalog, Knowledge, Equipment, Incentives)
-- Safe to execute multiple times (Idempotent: IF NOT EXISTS)
-- ============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE IF NOT EXISTS "jobs" (
    "id" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerContact" TEXT,
    "town" TEXT NOT NULL,
    "window" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "siteName" TEXT,
    "siteAddress" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "scheduledDate" TEXT NOT NULL,
    "syncStatus" TEXT NOT NULL DEFAULT 'synced',
    "syncedAt" TIMESTAMP(3),
    "version" INTEGER NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "jobs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "jobs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "customerContact" TEXT,
  ADD COLUMN IF NOT EXISTS "town" TEXT,
  ADD COLUMN IF NOT EXISTS "window" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "siteName" TEXT,
  ADD COLUMN IF NOT EXISTS "siteAddress" TEXT,
  ADD COLUMN IF NOT EXISTS "technicianName" TEXT,
  ADD COLUMN IF NOT EXISTS "scheduledDate" TEXT,
  ADD COLUMN IF NOT EXISTS "syncStatus" TEXT NOT NULL DEFAULT 'synced',
  ADD COLUMN IF NOT EXISTS "syncedAt" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "version" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT,
    "callType" TEXT,
    "customerName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "priority" TEXT NOT NULL DEFAULT 'P3 - Medium',
    "assignedTo" TEXT,
    "scheduledDate" TEXT,
    "requestNo" TEXT,
    "requestDate" TEXT,
    "channel" TEXT,
    "receivedBy" TEXT,
    "customer" TEXT,
    "contact" TEXT,
    "site" TEXT,
    "requestType" TEXT,
    "equipmentSystem" TEXT,
    "customerOrigin" TEXT,
    "equipmentOrigin" TEXT,
    "entitlement" TEXT,
    "description" TEXT,
    "data" JSONB DEFAULT '{}',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_requests"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "title" TEXT,
  ADD COLUMN IF NOT EXISTS "callType" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'P3 - Medium',
  ADD COLUMN IF NOT EXISTS "assignedTo" TEXT,
  ADD COLUMN IF NOT EXISTS "scheduledDate" TEXT,
  ADD COLUMN IF NOT EXISTS "requestNo" TEXT,
  ADD COLUMN IF NOT EXISTS "requestDate" TEXT,
  ADD COLUMN IF NOT EXISTS "channel" TEXT,
  ADD COLUMN IF NOT EXISTS "receivedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "customer" TEXT,
  ADD COLUMN IF NOT EXISTS "contact" TEXT,
  ADD COLUMN IF NOT EXISTS "site" TEXT,
  ADD COLUMN IF NOT EXISTS "requestType" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentSystem" TEXT,
  ADD COLUMN IF NOT EXISTS "customerOrigin" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentOrigin" TEXT,
  ADD COLUMN IF NOT EXISTS "entitlement" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "data" JSONB DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sync_logs" (
    "id" TEXT NOT NULL,
    "batchId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "itemCount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "details" TEXT,
    "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "sync_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "sync_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batchId" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "deviceId" TEXT,
  ADD COLUMN IF NOT EXISTS "itemCount" INTEGER,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT,
  ADD COLUMN IF NOT EXISTS "syncedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "labour_logs" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "technicianName" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "hours" DOUBLE PRECISION NOT NULL,
    "rateType" TEXT NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "labour_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "labour_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "jobId" TEXT,
  ADD COLUMN IF NOT EXISTS "technicianName" TEXT,
  ADD COLUMN IF NOT EXISTS "date" TEXT,
  ADD COLUMN IF NOT EXISTS "hours" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "rateType" TEXT,
  ADD COLUMN IF NOT EXISTS "activityDescription" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "parts_used" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "partCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qtyUsed" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parts_used_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "parts_used"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "jobId" TEXT,
  ADD COLUMN IF NOT EXISTS "partCode" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "qtyUsed" INTEGER,
  ADD COLUMN IF NOT EXISTS "unitPrice" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "inspections" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicianName" TEXT NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "generalNotes" TEXT,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "inspections"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "jobId" TEXT,
  ADD COLUMN IF NOT EXISTS "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "technicianName" TEXT,
  ADD COLUMN IF NOT EXISTS "overallStatus" TEXT,
  ADD COLUMN IF NOT EXISTS "generalNotes" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "hold_requests" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "estimatedDelayHours" DOUBLE PRECISION NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "hold_requests_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "hold_requests"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "jobId" TEXT,
  ADD COLUMN IF NOT EXISTS "reason" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "estimatedDelayHours" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "status" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "phone" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "users"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "password" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "system_roles" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "permissions" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "system_roles_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "system_roles"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "permissions" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "master_records" (
    "id" SERIAL NOT NULL,
    "screenCode" TEXT NOT NULL,
    "recordKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_records_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "master_records"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "screenCode" TEXT,
  ADD COLUMN IF NOT EXISTS "recordKey" TEXT,
  ADD COLUMN IF NOT EXISTS "data" JSONB,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "customers" (
    "id" SERIAL NOT NULL,
    "customerCode" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "customerGroup" TEXT NOT NULL,
    "territory" TEXT,
    "mobile" TEXT NOT NULL,
    "nicBrNo" TEXT,
    "customerType" TEXT NOT NULL,
    "grade" TEXT,
    "firstChannel" TEXT,
    "preferredChannel" TEXT,
    "customerOrigin" TEXT DEFAULT 'Telesonic-sold',
    "relationshipStatus" TEXT DEFAULT 'Active',
    "paymentHold" TEXT DEFAULT 'No',
    "balanceLkr" DOUBLE PRECISION DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "customers_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "customers"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "customerCode" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "customerGroup" TEXT,
  ADD COLUMN IF NOT EXISTS "territory" TEXT,
  ADD COLUMN IF NOT EXISTS "mobile" TEXT,
  ADD COLUMN IF NOT EXISTS "nicBrNo" TEXT,
  ADD COLUMN IF NOT EXISTS "customerType" TEXT,
  ADD COLUMN IF NOT EXISTS "grade" TEXT,
  ADD COLUMN IF NOT EXISTS "firstChannel" TEXT,
  ADD COLUMN IF NOT EXISTS "preferredChannel" TEXT,
  ADD COLUMN IF NOT EXISTS "customerOrigin" TEXT DEFAULT 'Telesonic-sold',
  ADD COLUMN IF NOT EXISTS "relationshipStatus" TEXT DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "paymentHold" TEXT DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS "balanceLkr" DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "contact_persons" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerCode" TEXT,
    "contactName" TEXT NOT NULL,
    "position" TEXT,
    "mobile" TEXT NOT NULL,
    "email" TEXT,
    "site" TEXT,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "validFrom" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contact_persons_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "contact_persons"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "customerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "customerCode" TEXT,
  ADD COLUMN IF NOT EXISTS "contactName" TEXT,
  ADD COLUMN IF NOT EXISTS "position" TEXT,
  ADD COLUMN IF NOT EXISTS "mobile" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "site" TEXT,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "validFrom" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sites" (
    "id" SERIAL NOT NULL,
    "customerId" INTEGER NOT NULL,
    "customerCode" TEXT,
    "customerName" TEXT,
    "siteCode" TEXT NOT NULL,
    "siteName" TEXT NOT NULL,
    "building" TEXT,
    "floor" TEXT,
    "room" TEXT,
    "addressLine1" TEXT NOT NULL,
    "cityTown" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "province" TEXT NOT NULL,
    "landmark" TEXT,
    "gpsLatLong" TEXT,
    "siteContact" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sites_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "sites"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "customerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "customerCode" TEXT,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "siteCode" TEXT,
  ADD COLUMN IF NOT EXISTS "siteName" TEXT,
  ADD COLUMN IF NOT EXISTS "building" TEXT,
  ADD COLUMN IF NOT EXISTS "floor" TEXT,
  ADD COLUMN IF NOT EXISTS "room" TEXT,
  ADD COLUMN IF NOT EXISTS "addressLine1" TEXT,
  ADD COLUMN IF NOT EXISTS "cityTown" TEXT,
  ADD COLUMN IF NOT EXISTS "district" TEXT,
  ADD COLUMN IF NOT EXISTS "province" TEXT,
  ADD COLUMN IF NOT EXISTS "landmark" TEXT,
  ADD COLUMN IF NOT EXISTS "gpsLatLong" TEXT,
  ADD COLUMN IF NOT EXISTS "siteContact" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "items" (
    "id" SERIAL NOT NULL,
    "itemCode" TEXT NOT NULL,
    "itemName" TEXT NOT NULL,
    "itemGroup" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "equipmentCategory" TEXT NOT NULL,
    "componentRole" TEXT,
    "serviceable" TEXT NOT NULL DEFAULT 'Yes',
    "warrantyMonths" INTEGER DEFAULT 12,
    "componentWarrantyMonths" INTEGER DEFAULT 6,
    "serialManaged" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "items"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "itemCode" TEXT,
  ADD COLUMN IF NOT EXISTS "itemName" TEXT,
  ADD COLUMN IF NOT EXISTS "itemGroup" TEXT,
  ADD COLUMN IF NOT EXISTS "brand" TEXT,
  ADD COLUMN IF NOT EXISTS "model" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "componentRole" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceable" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "warrantyMonths" INTEGER DEFAULT 12,
  ADD COLUMN IF NOT EXISTS "componentWarrantyMonths" INTEGER DEFAULT 6,
  ADD COLUMN IF NOT EXISTS "serialManaged" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "serials" (
    "id" SERIAL NOT NULL,
    "serialNo" TEXT NOT NULL,
    "itemId" INTEGER,
    "itemCode" TEXT,
    "itemName" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Available',
    "warehouse" TEXT,
    "customerId" INTEGER,
    "customerName" TEXT,
    "siteId" INTEGER,
    "siteName" TEXT,
    "systemId" TEXT,
    "componentRole" TEXT,
    "warrantyStart" TEXT,
    "replacesSerial" TEXT,
    "replacedBy" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "serials_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "serials"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "serialNo" TEXT,
  ADD COLUMN IF NOT EXISTS "itemId" INTEGER,
  ADD COLUMN IF NOT EXISTS "itemCode" TEXT,
  ADD COLUMN IF NOT EXISTS "itemName" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Available',
  ADD COLUMN IF NOT EXISTS "warehouse" TEXT,
  ADD COLUMN IF NOT EXISTS "customerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "siteId" INTEGER,
  ADD COLUMN IF NOT EXISTS "siteName" TEXT,
  ADD COLUMN IF NOT EXISTS "systemId" TEXT,
  ADD COLUMN IF NOT EXISTS "componentRole" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyStart" TEXT,
  ADD COLUMN IF NOT EXISTS "replacesSerial" TEXT,
  ADD COLUMN IF NOT EXISTS "replacedBy" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "equipments" (
    "id" SERIAL NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "customerId" INTEGER,
    "customerName" TEXT,
    "siteId" INTEGER,
    "siteName" TEXT,
    "itemCategory" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT,
    "serialId" INTEGER,
    "serialNo" TEXT,
    "origin" TEXT NOT NULL DEFAULT 'Telesonic-originated',
    "serviceProvider" TEXT NOT NULL DEFAULT 'Telesonic In-House SRE',
    "installedDate" TEXT,
    "commissionedDate" TEXT,
    "warrantyTo" TEXT,
    "relationship" TEXT DEFAULT 'Active Under Warranty',
    "systemId" TEXT,
    "meterReading" DOUBLE PRECISION DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'Installed',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "equipments"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "equipmentId" TEXT,
  ADD COLUMN IF NOT EXISTS "customerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "siteId" INTEGER,
  ADD COLUMN IF NOT EXISTS "siteName" TEXT,
  ADD COLUMN IF NOT EXISTS "itemCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "brand" TEXT,
  ADD COLUMN IF NOT EXISTS "model" TEXT,
  ADD COLUMN IF NOT EXISTS "serialId" INTEGER,
  ADD COLUMN IF NOT EXISTS "serialNo" TEXT,
  ADD COLUMN IF NOT EXISTS "origin" TEXT NOT NULL DEFAULT 'Telesonic-originated',
  ADD COLUMN IF NOT EXISTS "serviceProvider" TEXT NOT NULL DEFAULT 'Telesonic In-House SRE',
  ADD COLUMN IF NOT EXISTS "installedDate" TEXT,
  ADD COLUMN IF NOT EXISTS "commissionedDate" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyTo" TEXT,
  ADD COLUMN IF NOT EXISTS "relationship" TEXT DEFAULT 'Active Under Warranty',
  ADD COLUMN IF NOT EXISTS "systemId" TEXT,
  ADD COLUMN IF NOT EXISTS "meterReading" DOUBLE PRECISION DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Installed',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "other_brand_equipments" (
    "id" SERIAL NOT NULL,
    "equipmentId" TEXT NOT NULL,
    "customerId" INTEGER,
    "customerName" TEXT,
    "siteId" INTEGER,
    "siteName" TEXT,
    "equipmentCategory" TEXT NOT NULL,
    "brand" TEXT NOT NULL,
    "model" TEXT NOT NULL,
    "serial" TEXT,
    "serialUnknown" TEXT NOT NULL DEFAULT 'No',
    "previousSupplier" TEXT,
    "takeoverDate" TEXT,
    "takeoverCondition" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "other_brand_equipments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "other_brand_equipments"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "equipmentId" TEXT,
  ADD COLUMN IF NOT EXISTS "customerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "siteId" INTEGER,
  ADD COLUMN IF NOT EXISTS "siteName" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "brand" TEXT,
  ADD COLUMN IF NOT EXISTS "model" TEXT,
  ADD COLUMN IF NOT EXISTS "serial" TEXT,
  ADD COLUMN IF NOT EXISTS "serialUnknown" TEXT NOT NULL DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS "previousSupplier" TEXT,
  ADD COLUMN IF NOT EXISTS "takeoverDate" TEXT,
  ADD COLUMN IF NOT EXISTS "takeoverCondition" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "equipment_systems" (
    "id" SERIAL NOT NULL,
    "systemId" TEXT NOT NULL,
    "customerId" INTEGER,
    "customerName" TEXT,
    "siteId" INTEGER,
    "siteName" TEXT,
    "location" TEXT,
    "equipmentCategory" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "installedDate" TEXT,
    "commissionedDate" TEXT,
    "warrantyStart" TEXT,
    "warrantyEnd" TEXT,
    "contract" TEXT,
    "project" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_systems_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "equipment_systems"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "systemId" TEXT,
  ADD COLUMN IF NOT EXISTS "customerId" INTEGER,
  ADD COLUMN IF NOT EXISTS "customerName" TEXT,
  ADD COLUMN IF NOT EXISTS "siteId" INTEGER,
  ADD COLUMN IF NOT EXISTS "siteName" TEXT,
  ADD COLUMN IF NOT EXISTS "location" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "installedDate" TEXT,
  ADD COLUMN IF NOT EXISTS "commissionedDate" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyStart" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyEnd" TEXT,
  ADD COLUMN IF NOT EXISTS "contract" TEXT,
  ADD COLUMN IF NOT EXISTS "project" TEXT,
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "technicians" (
    "id" SERIAL NOT NULL,
    "employeeId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "position" TEXT,
    "department" TEXT,
    "branch" TEXT,
    "mobile" TEXT,
    "technicianType" TEXT DEFAULT 'Direct In-House Staff',
    "team" TEXT,
    "certifications" TEXT,
    "normalRate" DOUBLE PRECISION DEFAULT 0.0,
    "overtimeRate" DOUBLE PRECISION DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "technicians_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "technicians"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "employeeId" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "position" TEXT,
  ADD COLUMN IF NOT EXISTS "department" TEXT,
  ADD COLUMN IF NOT EXISTS "branch" TEXT,
  ADD COLUMN IF NOT EXISTS "mobile" TEXT,
  ADD COLUMN IF NOT EXISTS "technicianType" TEXT DEFAULT 'Direct In-House Staff',
  ADD COLUMN IF NOT EXISTS "team" TEXT,
  ADD COLUMN IF NOT EXISTS "certifications" TEXT,
  ADD COLUMN IF NOT EXISTS "normalRate" DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "overtimeRate" DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "subcontractors" (
    "id" SERIAL NOT NULL,
    "vendorCode" TEXT NOT NULL,
    "vendorName" TEXT NOT NULL,
    "subcontractorType" TEXT NOT NULL,
    "territory" TEXT NOT NULL,
    "paymentTerms" TEXT,
    "rating" DOUBLE PRECISION DEFAULT 8.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "subcontractors_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "subcontractors"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "vendorCode" TEXT,
  ADD COLUMN IF NOT EXISTS "vendorName" TEXT,
  ADD COLUMN IF NOT EXISTS "subcontractorType" TEXT,
  ADD COLUMN IF NOT EXISTS "territory" TEXT,
  ADD COLUMN IF NOT EXISTS "paymentTerms" TEXT,
  ADD COLUMN IF NOT EXISTS "rating" DOUBLE PRECISION DEFAULT 8.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_roles" (
    "id" SERIAL NOT NULL,
    "roleCode" TEXT NOT NULL,
    "roleName" TEXT NOT NULL,
    "internalSubcontractor" TEXT DEFAULT 'Both Internal and Subcontractor',
    "incentiveEligible" TEXT NOT NULL DEFAULT 'Yes',
    "incentiveBasisRef" TEXT,
    "multiplePerCall" TEXT DEFAULT 'No',
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_roles_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_roles"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "roleCode" TEXT,
  ADD COLUMN IF NOT EXISTS "roleName" TEXT,
  ADD COLUMN IF NOT EXISTS "internalSubcontractor" TEXT DEFAULT 'Both Internal and Subcontractor',
  ADD COLUMN IF NOT EXISTS "incentiveEligible" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "incentiveBasisRef" TEXT,
  ADD COLUMN IF NOT EXISTS "multiplePerCall" TEXT DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_types" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "listType" TEXT NOT NULL,
    "defaultPriority" TEXT DEFAULT 'P2 - Normal Schedule',
    "checklistTemplate" TEXT,
    "slaRule" TEXT,
    "chargeableDefault" TEXT DEFAULT 'No',
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_types_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_types"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "listType" TEXT,
  ADD COLUMN IF NOT EXISTS "defaultPriority" TEXT DEFAULT 'P2 - Normal Schedule',
  ADD COLUMN IF NOT EXISTS "checklistTemplate" TEXT,
  ADD COLUMN IF NOT EXISTS "slaRule" TEXT,
  ADD COLUMN IF NOT EXISTS "chargeableDefault" TEXT DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "hold_reasons" (
    "id" SERIAL NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "customerWording" TEXT NOT NULL,
    "excludeFromSla" TEXT DEFAULT 'Yes (Clock Paused)',
    "maxHoldDays" INTEGER DEFAULT 14,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hold_reasons_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "hold_reasons"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "reasonCode" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "customerWording" TEXT,
  ADD COLUMN IF NOT EXISTS "excludeFromSla" TEXT DEFAULT 'Yes (Clock Paused)',
  ADD COLUMN IF NOT EXISTS "maxHoldDays" INTEGER DEFAULT 14,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "repeat_reasons" (
    "id" SERIAL NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "countsAsPoorService" TEXT DEFAULT 'Yes',
    "detectionPeriodDays" INTEGER NOT NULL DEFAULT 30,
    "appliesToCategory" TEXT,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "repeat_reasons_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "repeat_reasons"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "reasonCode" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "countsAsPoorService" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "detectionPeriodDays" INTEGER NOT NULL DEFAULT 30,
  ADD COLUMN IF NOT EXISTS "appliesToCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "sla_rules" (
    "id" SERIAL NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "area" TEXT,
    "resourceType" TEXT,
    "responseHours" DOUBLE PRECISION NOT NULL,
    "resolutionHours" DOUBLE PRECISION NOT NULL,
    "warningPct" DOUBLE PRECISION DEFAULT 75.0,
    "calendar" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sla_rules_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "sla_rules"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "ruleCode" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceType" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT,
  ADD COLUMN IF NOT EXISTS "area" TEXT,
  ADD COLUMN IF NOT EXISTS "resourceType" TEXT,
  ADD COLUMN IF NOT EXISTS "responseHours" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "resolutionHours" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "warningPct" DOUBLE PRECISION DEFAULT 75.0,
  ADD COLUMN IF NOT EXISTS "calendar" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "checklist_templates" (
    "id" SERIAL NOT NULL,
    "templateCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "equipmentCategory" TEXT NOT NULL,
    "serviceType" TEXT NOT NULL,
    "version" INTEGER DEFAULT 1,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "checklist_templates_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "checklist_templates"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "templateCode" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "serviceType" TEXT,
  ADD COLUMN IF NOT EXISTS "version" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "warranty_rules" (
    "id" SERIAL NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "equipmentCategory" TEXT NOT NULL,
    "componentRole" TEXT,
    "channel" TEXT,
    "startBasis" TEXT NOT NULL,
    "months" INTEGER NOT NULL,
    "labourCovered" TEXT DEFAULT 'Yes',
    "replacementTreatment" TEXT DEFAULT 'Repair in Workshop',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "warranty_rules_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "warranty_rules"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "ruleCode" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "componentRole" TEXT,
  ADD COLUMN IF NOT EXISTS "channel" TEXT,
  ADD COLUMN IF NOT EXISTS "startBasis" TEXT,
  ADD COLUMN IF NOT EXISTS "months" INTEGER,
  ADD COLUMN IF NOT EXISTS "labourCovered" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "replacementTreatment" TEXT DEFAULT 'Repair in Workshop',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "free_service_plans" (
    "id" SERIAL NOT NULL,
    "planCode" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "equipmentCategory" TEXT NOT NULL,
    "visits" INTEGER NOT NULL,
    "intervalBasis" TEXT NOT NULL,
    "intervalValue" INTEGER NOT NULL,
    "startBasis" TEXT NOT NULL,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "free_service_plans_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "free_service_plans"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "planCode" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "equipmentCategory" TEXT,
  ADD COLUMN IF NOT EXISTS "visits" INTEGER,
  ADD COLUMN IF NOT EXISTS "intervalBasis" TEXT,
  ADD COLUMN IF NOT EXISTS "intervalValue" INTEGER,
  ADD COLUMN IF NOT EXISTS "startBasis" TEXT,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "contract_templates" (
    "id" SERIAL NOT NULL,
    "template" TEXT NOT NULL,
    "contractKind" TEXT NOT NULL,
    "visitsPerYear" INTEGER DEFAULT 4,
    "coverage" TEXT DEFAULT '24/7 Priority Emergency Coverage',
    "responseHours" INTEGER DEFAULT 4,
    "billingBasis" TEXT DEFAULT 'Quarterly in Advance',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "contract_templates_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "contract_templates"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "template" TEXT,
  ADD COLUMN IF NOT EXISTS "contractKind" TEXT,
  ADD COLUMN IF NOT EXISTS "visitsPerYear" INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS "coverage" TEXT DEFAULT '24/7 Priority Emergency Coverage',
  ADD COLUMN IF NOT EXISTS "responseHours" INTEGER DEFAULT 4,
  ADD COLUMN IF NOT EXISTS "billingBasis" TEXT DEFAULT 'Quarterly in Advance',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "relationship_stages" (
    "id" SERIAL NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "listType" TEXT NOT NULL,
    "appliesTo" TEXT NOT NULL DEFAULT 'All Customer Accounts',
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "relationship_stages_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "relationship_stages"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "listType" TEXT,
  ADD COLUMN IF NOT EXISTS "appliesTo" TEXT NOT NULL DEFAULT 'All Customer Accounts',
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "reminder_rules" (
    "id" SERIAL NOT NULL,
    "ruleCode" TEXT NOT NULL,
    "reminderType" TEXT NOT NULL,
    "customerCategory" TEXT DEFAULT 'All Customers',
    "leadDays" INTEGER NOT NULL,
    "maxReminders" INTEGER NOT NULL DEFAULT 3,
    "intervalDays" INTEGER NOT NULL DEFAULT 7,
    "channel" TEXT NOT NULL DEFAULT 'SMS + WhatsApp',
    "consentRequired" TEXT DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "reminder_rules_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "reminder_rules"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "ruleCode" TEXT,
  ADD COLUMN IF NOT EXISTS "reminderType" TEXT,
  ADD COLUMN IF NOT EXISTS "customerCategory" TEXT DEFAULT 'All Customers',
  ADD COLUMN IF NOT EXISTS "leadDays" INTEGER,
  ADD COLUMN IF NOT EXISTS "maxReminders" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "intervalDays" INTEGER NOT NULL DEFAULT 7,
  ADD COLUMN IF NOT EXISTS "channel" TEXT NOT NULL DEFAULT 'SMS + WhatsApp',
  ADD COLUMN IF NOT EXISTS "consentRequired" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "notification_templates" (
    "id" SERIAL NOT NULL,
    "templateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "language" TEXT DEFAULT 'English',
    "subject" TEXT,
    "body" TEXT NOT NULL,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "notification_templates_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "notification_templates"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "templateId" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "channel" TEXT,
  ADD COLUMN IF NOT EXISTS "language" TEXT DEFAULT 'English',
  ADD COLUMN IF NOT EXISTS "subject" TEXT,
  ADD COLUMN IF NOT EXISTS "body" TEXT,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "project_budgets" (
    "id" SERIAL NOT NULL,
    "projectCode" TEXT NOT NULL,
    "projectName" TEXT NOT NULL,
    "customer" TEXT NOT NULL,
    "projectManager" TEXT NOT NULL,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "budgetVersion" INTEGER DEFAULT 1,
    "versionStatus" TEXT DEFAULT 'Draft',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "project_budgets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "project_budgets"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "projectCode" TEXT,
  ADD COLUMN IF NOT EXISTS "projectName" TEXT,
  ADD COLUMN IF NOT EXISTS "customer" TEXT,
  ADD COLUMN IF NOT EXISTS "projectManager" TEXT,
  ADD COLUMN IF NOT EXISTS "startDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "endDate" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "budgetVersion" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "versionStatus" TEXT DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "cost_element_mappings" (
    "id" SERIAL NOT NULL,
    "costElement" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "glAccount" TEXT NOT NULL,
    "revenueCost" TEXT DEFAULT 'Expense',
    "requiresCallRef" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cost_element_mappings_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "cost_element_mappings"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "costElement" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "glAccount" TEXT,
  ADD COLUMN IF NOT EXISTS "revenueCost" TEXT DEFAULT 'Expense',
  ADD COLUMN IF NOT EXISTS "requiresCallRef" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "labour_rates" (
    "id" SERIAL NOT NULL,
    "rateCode" TEXT NOT NULL,
    "technicianType" TEXT NOT NULL,
    "normalRate" DOUBLE PRECISION NOT NULL,
    "overtimeRate" DOUBLE PRECISION DEFAULT 0.0,
    "subcontractRate" DOUBLE PRECISION DEFAULT 0.0,
    "validFrom" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "labour_rates_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "labour_rates"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "rateCode" TEXT,
  ADD COLUMN IF NOT EXISTS "technicianType" TEXT,
  ADD COLUMN IF NOT EXISTS "normalRate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "overtimeRate" DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "subcontractRate" DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "validFrom" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "franchise_warehouses" (
    "id" SERIAL NOT NULL,
    "franchiseBp" TEXT NOT NULL,
    "franchiseName" TEXT NOT NULL,
    "warehouse" TEXT NOT NULL,
    "stockOwnership" TEXT NOT NULL DEFAULT 'Telesonic Consignment Stock',
    "region" TEXT,
    "countFrequency" TEXT DEFAULT 'Monthly Physical Audit',
    "auditor" TEXT,
    "active" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "franchise_warehouses_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "franchise_warehouses"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "franchiseBp" TEXT,
  ADD COLUMN IF NOT EXISTS "franchiseName" TEXT,
  ADD COLUMN IF NOT EXISTS "warehouse" TEXT,
  ADD COLUMN IF NOT EXISTS "stockOwnership" TEXT NOT NULL DEFAULT 'Telesonic Consignment Stock',
  ADD COLUMN IF NOT EXISTS "region" TEXT,
  ADD COLUMN IF NOT EXISTS "countFrequency" TEXT DEFAULT 'Monthly Physical Audit',
  ADD COLUMN IF NOT EXISTS "auditor" TEXT,
  ADD COLUMN IF NOT EXISTS "active" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "deviation_reasons" (
    "id" SERIAL NOT NULL,
    "reasonCode" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "recoverableFromFranchise" TEXT DEFAULT 'No (Telesonic Absorption)',
    "qtyThreshold" INTEGER DEFAULT 1,
    "valueThresholdLkr" DOUBLE PRECISION DEFAULT 0.0,
    "escalationRecipients" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "deviation_reasons_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "deviation_reasons"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "reasonCode" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "recoverableFromFranchise" TEXT DEFAULT 'No (Telesonic Absorption)',
  ADD COLUMN IF NOT EXISTS "qtyThreshold" INTEGER DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "valueThresholdLkr" DOUBLE PRECISION DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "escalationRecipients" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "export_permissions" (
    "id" SERIAL NOT NULL,
    "role" TEXT NOT NULL,
    "reportGrid" TEXT NOT NULL,
    "excel" TEXT DEFAULT 'Yes',
    "pdf" TEXT DEFAULT 'Yes',
    "restrictedColumns" TEXT,
    "rowLimit" INTEGER DEFAULT 5000,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "export_permissions_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "export_permissions"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "reportGrid" TEXT,
  ADD COLUMN IF NOT EXISTS "excel" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "pdf" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "restrictedColumns" TEXT,
  ADD COLUMN IF NOT EXISTS "rowLimit" INTEGER DEFAULT 5000,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "google_meet_settings" (
    "id" SERIAL NOT NULL,
    "workspaceDomain" TEXT NOT NULL,
    "organiserAccount" TEXT NOT NULL,
    "authMethod" TEXT NOT NULL DEFAULT 'Google Cloud Service Account JWT',
    "defaultDuration" INTEGER DEFAULT 45,
    "inviteCustomer" TEXT DEFAULT 'Yes',
    "inviteFranchise" TEXT DEFAULT 'Yes',
    "retryCount" INTEGER DEFAULT 3,
    "enabled" TEXT NOT NULL DEFAULT 'Yes',
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "google_meet_settings_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "google_meet_settings"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "workspaceDomain" TEXT,
  ADD COLUMN IF NOT EXISTS "organiserAccount" TEXT,
  ADD COLUMN IF NOT EXISTS "authMethod" TEXT NOT NULL DEFAULT 'Google Cloud Service Account JWT',
  ADD COLUMN IF NOT EXISTS "defaultDuration" INTEGER DEFAULT 45,
  ADD COLUMN IF NOT EXISTS "inviteCustomer" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "inviteFranchise" TEXT DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "retryCount" INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "enabled" TEXT NOT NULL DEFAULT 'Yes',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "equipment_category_attributes" (
    "id" SERIAL NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "categoryName" TEXT NOT NULL,
    "industryGroup" TEXT,
    "multiComponent" TEXT DEFAULT 'No',
    "meterType" TEXT DEFAULT 'None',
    "defaultIntervalBasis" TEXT DEFAULT 'Months (Calendar)',
    "defaultInterval" INTEGER DEFAULT 3,
    "checklistSet" TEXT,
    "warrantyRule" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "equipment_category_attributes_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "equipment_category_attributes"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "categoryCode" TEXT,
  ADD COLUMN IF NOT EXISTS "categoryName" TEXT,
  ADD COLUMN IF NOT EXISTS "industryGroup" TEXT,
  ADD COLUMN IF NOT EXISTS "multiComponent" TEXT DEFAULT 'No',
  ADD COLUMN IF NOT EXISTS "meterType" TEXT DEFAULT 'None',
  ADD COLUMN IF NOT EXISTS "defaultIntervalBasis" TEXT DEFAULT 'Months (Calendar)',
  ADD COLUMN IF NOT EXISTS "defaultInterval" INTEGER DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "checklistSet" TEXT,
  ADD COLUMN IF NOT EXISTS "warrantyRule" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "tool_vehicle_assets" (
    "id" SERIAL NOT NULL,
    "assetId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "holder" TEXT,
    "vehicleRegNo" TEXT,
    "meterKm" INTEGER,
    "licenceExpiry" TIMESTAMP(3),
    "insuranceExpiry" TIMESTAMP(3),
    "status" TEXT NOT NULL DEFAULT 'Available in Stores',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tool_vehicle_assets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "tool_vehicle_assets"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "assetId" TEXT,
  ADD COLUMN IF NOT EXISTS "type" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "holder" TEXT,
  ADD COLUMN IF NOT EXISTS "vehicleRegNo" TEXT,
  ADD COLUMN IF NOT EXISTS "meterKm" INTEGER,
  ADD COLUMN IF NOT EXISTS "licenceExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "insuranceExpiry" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Available in Stores',
  ADD COLUMN IF NOT EXISTS "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updatedAt" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_schemes" (
    "id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "scheme_type" TEXT NOT NULL,
    "participant_role" TEXT NOT NULL,
    "calculation_basis" TEXT NOT NULL,
    "age_basis" TEXT NOT NULL,
    "payable_lag_months" INTEGER NOT NULL DEFAULT 1,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "description" TEXT,
    "exclusions" JSONB,
    "posting" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "incentive_schemes_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_schemes"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_name" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_type" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_role" TEXT,
  ADD COLUMN IF NOT EXISTS "calculation_basis" TEXT,
  ADD COLUMN IF NOT EXISTS "age_basis" TEXT,
  ADD COLUMN IF NOT EXISTS "payable_lag_months" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "effective_from" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "effective_to" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "version" TEXT NOT NULL DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "exclusions" JSONB,
  ADD COLUMN IF NOT EXISTS "posting" JSONB,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3);

-- CreateTable
CREATE TABLE IF NOT EXISTS "scheme_rules" (
    "id" TEXT NOT NULL,
    "scheme_id" TEXT NOT NULL,
    "rule" TEXT NOT NULL,
    "parameter" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "source" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheme_rules_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "scheme_rules"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_id" TEXT,
  ADD COLUMN IF NOT EXISTS "rule" TEXT,
  ADD COLUMN IF NOT EXISTS "parameter" TEXT,
  ADD COLUMN IF NOT EXISTS "value" TEXT,
  ADD COLUMN IF NOT EXISTS "source" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "scheme_slabs" (
    "id" TEXT NOT NULL,
    "scheme_id" TEXT NOT NULL,
    "slab_id" TEXT NOT NULL,
    "min_percent" DOUBLE PRECISION NOT NULL,
    "max_percent" DOUBLE PRECISION NOT NULL,
    "payout_percent" DOUBLE PRECISION NOT NULL,
    "multiplier" DOUBLE PRECISION NOT NULL,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheme_slabs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "scheme_slabs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_id" TEXT,
  ADD COLUMN IF NOT EXISTS "slab_id" TEXT,
  ADD COLUMN IF NOT EXISTS "min_percent" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "max_percent" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "payout_percent" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "multiplier" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "scheme_rate_items" (
    "id" TEXT NOT NULL,
    "scheme_id" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "product_line" TEXT NOT NULL,
    "commission_rate" TEXT NOT NULL,
    "payment_term_band" TEXT NOT NULL,
    "basis" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scheme_rate_items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "scheme_rate_items"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_id" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "product_line" TEXT,
  ADD COLUMN IF NOT EXISTS "commission_rate" TEXT,
  ADD COLUMN IF NOT EXISTS "payment_term_band" TEXT,
  ADD COLUMN IF NOT EXISTS "basis" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "scheme_versions" (
    "id" TEXT NOT NULL,
    "scheme_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3) NOT NULL,
    "status" TEXT NOT NULL,
    "created_by" TEXT NOT NULL,
    "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "approved_by" TEXT,
    "approval_date" TIMESTAMP(3),
    "change_summary" TEXT NOT NULL,

    CONSTRAINT "scheme_versions_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "scheme_versions"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_id" TEXT,
  ADD COLUMN IF NOT EXISTS "version" TEXT,
  ADD COLUMN IF NOT EXISTS "effective_from" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "effective_to" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_date" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "approval_date" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "change_summary" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "scheme_history_logs" (
    "id" TEXT NOT NULL,
    "scheme_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT NOT NULL,

    CONSTRAINT "scheme_history_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "scheme_history_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_id" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "user" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "commission_rate_matrices" (
    "id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "matrix_name" TEXT NOT NULL,
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "row_dimension" TEXT NOT NULL DEFAULT 'Capacity Band + Item Type',
    "column_dimension" TEXT NOT NULL DEFAULT 'Payment-term / Credit-age Bands',
    "rate_unit" TEXT NOT NULL DEFAULT '% of Net Invoiced Value',
    "currency" TEXT NOT NULL DEFAULT 'USD ($)',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "description" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'Incentive Administrator',
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "commission_rate_matrices_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "commission_rate_matrices"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "matrix_name" TEXT,
  ADD COLUMN IF NOT EXISTS "version" TEXT NOT NULL DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS "row_dimension" TEXT NOT NULL DEFAULT 'Capacity Band + Item Type',
  ADD COLUMN IF NOT EXISTS "column_dimension" TEXT NOT NULL DEFAULT 'Payment-term / Credit-age Bands',
  ADD COLUMN IF NOT EXISTS "rate_unit" TEXT NOT NULL DEFAULT '% of Net Invoiced Value',
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'USD ($)',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT NOT NULL DEFAULT 'Incentive Administrator',
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "matrix_credit_bands" (
    "id" TEXT NOT NULL,
    "matrix_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "column_key" TEXT NOT NULL,
    "min_days" INTEGER NOT NULL,
    "max_days" INTEGER NOT NULL,
    "description" TEXT,
    "default_factor" DOUBLE PRECISION DEFAULT 1.0,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matrix_credit_bands_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "matrix_credit_bands"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "matrix_id" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "column_key" TEXT,
  ADD COLUMN IF NOT EXISTS "min_days" INTEGER,
  ADD COLUMN IF NOT EXISTS "max_days" INTEGER,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "default_factor" DOUBLE PRECISION DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "matrix_cells" (
    "id" TEXT NOT NULL,
    "matrix_id" TEXT NOT NULL,
    "capacity_band" TEXT NOT NULL,
    "item_type" TEXT NOT NULL,
    "cash_immediate" DOUBLE PRECISION,
    "credit_lt15" DOUBLE PRECISION,
    "credit_lt30" DOUBLE PRECISION,
    "credit_lte45" DOUBLE PRECISION,
    "credit_gt45" DOUBLE PRECISION,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "matrix_cells_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "matrix_cells"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "matrix_id" TEXT,
  ADD COLUMN IF NOT EXISTS "capacity_band" TEXT,
  ADD COLUMN IF NOT EXISTS "item_type" TEXT,
  ADD COLUMN IF NOT EXISTS "cash_immediate" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "credit_lt15" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "credit_lt30" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "credit_lte45" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "credit_gt45" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "matrix_history_logs" (
    "id" TEXT NOT NULL,
    "matrix_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "change_summary" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "matrix_history_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "matrix_history_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "matrix_id" TEXT,
  ADD COLUMN IF NOT EXISTS "version" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "author" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "change_summary" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "target_incentive_slab_tables" (
    "id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "table_name" TEXT NOT NULL,
    "target_type" TEXT NOT NULL DEFAULT 'Turnover Target',
    "slab_method" TEXT NOT NULL DEFAULT 'Highest Slab Reached (Non-Cumulative)',
    "version" TEXT NOT NULL DEFAULT 'v1.0',
    "status" TEXT NOT NULL DEFAULT 'Approved',
    "description" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'Incentive Administrator',
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "target_incentive_slab_tables_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "target_incentive_slab_tables"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "table_name" TEXT,
  ADD COLUMN IF NOT EXISTS "target_type" TEXT NOT NULL DEFAULT 'Turnover Target',
  ADD COLUMN IF NOT EXISTS "slab_method" TEXT NOT NULL DEFAULT 'Highest Slab Reached (Non-Cumulative)',
  ADD COLUMN IF NOT EXISTS "version" TEXT NOT NULL DEFAULT 'v1.0',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Approved',
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT NOT NULL DEFAULT 'Incentive Administrator',
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "slab_tiers" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "slab_tier_name" TEXT NOT NULL,
    "min_achievement_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "volume_incentive_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "turnover_incentive_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "slab_tiers_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "slab_tiers"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "table_id" TEXT,
  ADD COLUMN IF NOT EXISTS "slab_tier_name" TEXT,
  ADD COLUMN IF NOT EXISTS "min_achievement_percent" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "volume_incentive_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "turnover_incentive_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "slab_table_history_logs" (
    "id" TEXT NOT NULL,
    "table_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "change_summary" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "slab_table_history_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "slab_table_history_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "table_id" TEXT,
  ADD COLUMN IF NOT EXISTS "version" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "author" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "change_summary" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "monthly_target_batches" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'All Divisions',
    "target_type" TEXT NOT NULL DEFAULT 'Turnover Target (LKR)',
    "version" TEXT NOT NULL DEFAULT 'v1.0 Draft',
    "currency" TEXT NOT NULL DEFAULT 'LKR',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "is_locked" BOOLEAN NOT NULL DEFAULT false,
    "description" TEXT,
    "created_by" TEXT NOT NULL DEFAULT 'Incentive Administrator',
    "approved_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_target_batches_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "monthly_target_batches"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT NOT NULL DEFAULT 'All Divisions',
  ADD COLUMN IF NOT EXISTS "target_type" TEXT NOT NULL DEFAULT 'Turnover Target (LKR)',
  ADD COLUMN IF NOT EXISTS "version" TEXT NOT NULL DEFAULT 'v1.0 Draft',
  ADD COLUMN IF NOT EXISTS "currency" TEXT NOT NULL DEFAULT 'LKR',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "is_locked" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT NOT NULL DEFAULT 'Incentive Administrator',
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "monthly_target_entries" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "territory" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "base_target_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "stretch_target_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "mtd_actual_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "last_updated" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "monthly_target_entries_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "monthly_target_entries"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_id" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_name" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "territory" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "base_target_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "stretch_target_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "mtd_actual_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "last_updated" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "monthly_target_history_logs" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "version" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "change_summary" TEXT NOT NULL,
    "details" TEXT,

    CONSTRAINT "monthly_target_history_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "monthly_target_history_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "version" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "author" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "change_summary" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_participants" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "sales_employee_code" TEXT,
    "division" TEXT NOT NULL,
    "segment_channel" TEXT,
    "area_manager" TEXT,
    "designation" TEXT NOT NULL,
    "payroll_id" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "phone" TEXT,
    "email" TEXT,
    "join_date" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_participants_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_participants"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "name" TEXT,
  ADD COLUMN IF NOT EXISTS "sales_employee_code" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "segment_channel" TEXT,
  ADD COLUMN IF NOT EXISTS "area_manager" TEXT,
  ADD COLUMN IF NOT EXISTS "designation" TEXT,
  ADD COLUMN IF NOT EXISTS "payroll_id" TEXT,
  ADD COLUMN IF NOT EXISTS "active" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "phone" TEXT,
  ADD COLUMN IF NOT EXISTS "email" TEXT,
  ADD COLUMN IF NOT EXISTS "join_date" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "participant_scheme_assignments" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT,
    "calculation_role" TEXT NOT NULL,
    "is_primary_role" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TIMESTAMP(3) NOT NULL,
    "effective_to" TIMESTAMP(3),
    "target_allocation_percent" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "participant_scheme_assignments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "participant_scheme_assignments"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_name" TEXT,
  ADD COLUMN IF NOT EXISTS "calculation_role" TEXT,
  ADD COLUMN IF NOT EXISTS "is_primary_role" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "effective_from" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "effective_to" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "target_allocation_percent" DOUBLE PRECISION NOT NULL DEFAULT 100.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "participant_history_logs" (
    "id" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "author" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "scheme_code" TEXT,
    "previous_value" TEXT,
    "new_value" TEXT,
    "change_reason" TEXT,

    CONSTRAINT "participant_history_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "participant_history_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_id" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "author" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "event_type" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "previous_value" TEXT,
  ADD COLUMN IF NOT EXISTS "new_value" TEXT,
  ADD COLUMN IF NOT EXISTS "change_reason" TEXT;

-- CreateTable
CREATE TABLE IF NOT EXISTS "attendance_import_batches" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'Consumer Electronics',
    "source" TEXT NOT NULL DEFAULT 'Biometric Punch Terminal (ZKTeco BioTime)',
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "imported_by" TEXT NOT NULL DEFAULT 'Service Coordinator',
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_import_batches_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "attendance_import_batches"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT NOT NULL DEFAULT 'Consumer Electronics',
  ADD COLUMN IF NOT EXISTS "source" TEXT NOT NULL DEFAULT 'Biometric Punch Terminal (ZKTeco BioTime)',
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "imported_by" TEXT NOT NULL DEFAULT 'Service Coordinator',
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "approved_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "attendance_records" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "working_days" INTEGER NOT NULL DEFAULT 22,
    "leave_days" INTEGER NOT NULL DEFAULT 0,
    "absent_days" INTEGER NOT NULL DEFAULT 0,
    "attendance_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "validation_status" TEXT NOT NULL DEFAULT 'Valid',
    "error_messages" JSONB,
    "notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_records_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "attendance_records"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_code" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_name" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "working_days" INTEGER NOT NULL DEFAULT 22,
  ADD COLUMN IF NOT EXISTS "leave_days" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "absent_days" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "attendance_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS "validation_status" TEXT NOT NULL DEFAULT 'Valid',
  ADD COLUMN IF NOT EXISTS "error_messages" JSONB,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "attendance_batch_history_logs" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "details" TEXT,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendance_batch_history_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "attendance_batch_history_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "user_name" TEXT,
  ADD COLUMN IF NOT EXISTS "user_role" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_performance_batches" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'Consumer Electronics',
    "source_system" TEXT NOT NULL DEFAULT 'Servio Service Desk / SAP B1 Service Module',
    "received_on" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "locked_by" TEXT,
    "locked_at" TIMESTAMP(3),
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_performance_batches_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_performance_batches"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT NOT NULL DEFAULT 'Consumer Electronics',
  ADD COLUMN IF NOT EXISTS "source_system" TEXT NOT NULL DEFAULT 'Servio Service Desk / SAP B1 Service Module',
  ADD COLUMN IF NOT EXISTS "received_on" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "locked_by" TEXT,
  ADD COLUMN IF NOT EXISTS "locked_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_performance_technician_lines" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "closed_jobs" INTEGER NOT NULL DEFAULT 0,
    "hod_eligible" INTEGER NOT NULL DEFAULT 0,
    "partial" INTEGER NOT NULL DEFAULT 0,
    "not_eligible" INTEGER NOT NULL DEFAULT 0,
    "excluded" INTEGER NOT NULL DEFAULT 0,
    "avg_quality" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "avg_discipline" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "poor_repeats" INTEGER NOT NULL DEFAULT 0,
    "review_status" TEXT NOT NULL DEFAULT 'Reviewed',
    "notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_performance_technician_lines_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_performance_technician_lines"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_code" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_name" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "closed_jobs" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "hod_eligible" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "partial" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "not_eligible" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "excluded" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "avg_quality" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "avg_discipline" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "poor_repeats" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "review_status" TEXT NOT NULL DEFAULT 'Reviewed',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_performance_job_tickets" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "job_ticket_no" TEXT NOT NULL,
    "employee_code" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "equipment_model" TEXT NOT NULL,
    "completion_date" TEXT NOT NULL,
    "fault_category" TEXT NOT NULL,
    "first_time_fix" BOOLEAN NOT NULL DEFAULT true,
    "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "discipline_score" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
    "eligibility" TEXT NOT NULL DEFAULT 'HOD Eligible',
    "is_poor_repeat" BOOLEAN NOT NULL DEFAULT false,
    "repeat_reference_job" TEXT,
    "hod_reviewed" BOOLEAN NOT NULL DEFAULT true,
    "closure_status" TEXT NOT NULL DEFAULT 'Closed',
    "notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_performance_job_tickets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_performance_job_tickets"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "job_ticket_no" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_code" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_name" TEXT,
  ADD COLUMN IF NOT EXISTS "customer_name" TEXT,
  ADD COLUMN IF NOT EXISTS "equipment_model" TEXT,
  ADD COLUMN IF NOT EXISTS "completion_date" TEXT,
  ADD COLUMN IF NOT EXISTS "fault_category" TEXT,
  ADD COLUMN IF NOT EXISTS "first_time_fix" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "quality_score" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  ADD COLUMN IF NOT EXISTS "discipline_score" DOUBLE PRECISION NOT NULL DEFAULT 10.0,
  ADD COLUMN IF NOT EXISTS "eligibility" TEXT NOT NULL DEFAULT 'HOD Eligible',
  ADD COLUMN IF NOT EXISTS "is_poor_repeat" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "repeat_reference_job" TEXT,
  ADD COLUMN IF NOT EXISTS "hod_reviewed" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "closure_status" TEXT NOT NULL DEFAULT 'Closed',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "service_performance_audit_logs" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "service_performance_audit_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "service_performance_audit_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TEXT,
  ADD COLUMN IF NOT EXISTS "user_name" TEXT,
  ADD COLUMN IF NOT EXISTS "user_role" TEXT,
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_result_batches" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "run_date" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Calculated',
    "run_type" TEXT NOT NULL DEFAULT 'MTD Simulation',
    "total_participants" INTEGER NOT NULL DEFAULT 0,
    "gross_commission_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_incentive_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "penalty_clawback_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_payable_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_result_batches_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_result_batches"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "run_date" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Calculated',
  ADD COLUMN IF NOT EXISTS "run_type" TEXT NOT NULL DEFAULT 'MTD Simulation',
  ADD COLUMN IF NOT EXISTS "total_participants" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "gross_commission_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "target_incentive_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "penalty_clawback_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "net_payable_lkr" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_participant_results" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "technician_code" TEXT NOT NULL,
    "technician_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "target_volume" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_volume" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "volume_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_turnover" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_turnover" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "turnover_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "slab_tier" TEXT NOT NULL DEFAULT 'Tier 1',
    "slab_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "gross_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "attendance_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "penalty_clawback" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'Calculated',
    "job_count" INTEGER NOT NULL DEFAULT 0,
    "overdue_invoice_count" INTEGER NOT NULL DEFAULT 0,
    "notes" TEXT,
    "sort_order" INTEGER DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_participant_results_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_participant_results"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "technician_code" TEXT,
  ADD COLUMN IF NOT EXISTS "technician_name" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_name" TEXT,
  ADD COLUMN IF NOT EXISTS "target_volume" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "actual_volume" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "volume_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "target_turnover" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "actual_turnover" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "turnover_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "slab_tier" TEXT NOT NULL DEFAULT 'Tier 1',
  ADD COLUMN IF NOT EXISTS "slab_multiplier" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS "gross_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "attendance_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS "penalty_clawback" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Calculated',
  ADD COLUMN IF NOT EXISTS "job_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "overdue_invoice_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "sort_order" INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_result_audit_logs" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "user_name" TEXT NOT NULL,
    "user_role" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "details" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_result_audit_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_result_audit_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TEXT,
  ADD COLUMN IF NOT EXISTS "user_name" TEXT,
  ADD COLUMN IF NOT EXISTS "user_role" TEXT,
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "details" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_calculation_runs" (
    "id" TEXT NOT NULL,
    "run_no" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "division" TEXT NOT NULL DEFAULT 'All Divisions',
    "selected_schemes" TEXT NOT NULL DEFAULT 'All Active Schemes (4 Schemes)',
    "run_type" TEXT NOT NULL DEFAULT 'Simulation',
    "data_cutoff" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Simulated',
    "run_by" TEXT NOT NULL,
    "started_at" TEXT,
    "finished_at" TEXT,
    "total_participants" INTEGER NOT NULL DEFAULT 0,
    "total_docs_read" INTEGER NOT NULL DEFAULT 0,
    "total_gross_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_calculation_runs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_calculation_runs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "run_no" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT NOT NULL DEFAULT 'All Divisions',
  ADD COLUMN IF NOT EXISTS "selected_schemes" TEXT NOT NULL DEFAULT 'All Active Schemes (4 Schemes)',
  ADD COLUMN IF NOT EXISTS "run_type" TEXT NOT NULL DEFAULT 'Simulation',
  ADD COLUMN IF NOT EXISTS "data_cutoff" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Simulated',
  ADD COLUMN IF NOT EXISTS "run_by" TEXT,
  ADD COLUMN IF NOT EXISTS "started_at" TEXT,
  ADD COLUMN IF NOT EXISTS "finished_at" TEXT,
  ADD COLUMN IF NOT EXISTS "total_participants" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "total_docs_read" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "total_gross_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "total_target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "total_penalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "total_net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_run_readiness_checks" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "module_name" TEXT NOT NULL,
    "required_state" TEXT NOT NULL,
    "current_state" TEXT NOT NULL,
    "is_ready" BOOLEAN NOT NULL DEFAULT true,
    "signer" TEXT NOT NULL,
    "last_updated" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_run_readiness_checks_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_run_readiness_checks"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "run_id" TEXT,
  ADD COLUMN IF NOT EXISTS "module_name" TEXT,
  ADD COLUMN IF NOT EXISTS "required_state" TEXT,
  ADD COLUMN IF NOT EXISTS "current_state" TEXT,
  ADD COLUMN IF NOT EXISTS "is_ready" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "signer" TEXT,
  ADD COLUMN IF NOT EXISTS "last_updated" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_run_scheme_summaries" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "participants" INTEGER NOT NULL DEFAULT 0,
    "documents_read" INTEGER NOT NULL DEFAULT 0,
    "gross_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "warnings_count" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_run_scheme_summaries_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_run_scheme_summaries"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "run_id" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_name" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "participants" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "documents_read" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "gross_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "penalty" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "warnings_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_run_warnings" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "participant_name" TEXT NOT NULL,
    "severity" TEXT NOT NULL DEFAULT 'Medium',
    "message" TEXT NOT NULL,
    "remediation" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_run_warnings_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_run_warnings"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "run_id" TEXT,
  ADD COLUMN IF NOT EXISTS "code" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_name" TEXT,
  ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS "message" TEXT,
  ADD COLUMN IF NOT EXISTS "remediation" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "calculation_run_logs" (
    "id" TEXT NOT NULL,
    "run_id" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL,
    "level" TEXT NOT NULL DEFAULT 'INFO',
    "message" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "calculation_run_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "calculation_run_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "run_id" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TEXT,
  ADD COLUMN IF NOT EXISTS "level" TEXT NOT NULL DEFAULT 'INFO',
  ADD COLUMN IF NOT EXISTS "message" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_manual_adjustments" (
    "id" TEXT NOT NULL,
    "adjustment_no" TEXT NOT NULL,
    "run_no" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "participant_name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "scheme_code" TEXT NOT NULL,
    "scheme_name" TEXT NOT NULL,
    "adjustment_type" TEXT NOT NULL DEFAULT 'Addition',
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "reason" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "attachment" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "requires_ceo" BOOLEAN NOT NULL DEFAULT false,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_manual_adjustments_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_manual_adjustments"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "adjustment_no" TEXT,
  ADD COLUMN IF NOT EXISTS "run_no" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_id" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_name" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_code" TEXT,
  ADD COLUMN IF NOT EXISTS "scheme_name" TEXT,
  ADD COLUMN IF NOT EXISTS "adjustment_type" TEXT NOT NULL DEFAULT 'Addition',
  ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "reason" TEXT,
  ADD COLUMN IF NOT EXISTS "remarks" TEXT,
  ADD COLUMN IF NOT EXISTS "attachment" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "requires_ceo" BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "manual_adjustment_approvals" (
    "id" TEXT NOT NULL,
    "adjustment_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "role_name" TEXT NOT NULL,
    "approver_name" TEXT NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'Pending',
    "decided_at" TEXT,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_adjustment_approvals_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "manual_adjustment_approvals"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "adjustment_id" TEXT,
  ADD COLUMN IF NOT EXISTS "step_number" INTEGER,
  ADD COLUMN IF NOT EXISTS "role_name" TEXT,
  ADD COLUMN IF NOT EXISTS "approver_name" TEXT,
  ADD COLUMN IF NOT EXISTS "decision" TEXT NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS "decided_at" TEXT,
  ADD COLUMN IF NOT EXISTS "comments" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "manual_adjustment_history" (
    "id" TEXT NOT NULL,
    "adjustment_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_adjustment_history_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "manual_adjustment_history"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "adjustment_id" TEXT,
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "performed_by" TEXT,
  ADD COLUMN IF NOT EXISTS "performed_at" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_approval_batches" (
    "id" TEXT NOT NULL,
    "run_no" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "total_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "posting_method" TEXT NOT NULL DEFAULT 'Accrual JE + payroll export',
    "accrual_je" TEXT,
    "payroll_file" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Submitted',
    "current_step" INTEGER NOT NULL DEFAULT 1,
    "total_steps" INTEGER NOT NULL DEFAULT 4,
    "notes" TEXT,
    "submitted_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_approval_batches_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_approval_batches"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "run_no" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "total_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "posting_method" TEXT NOT NULL DEFAULT 'Accrual JE + payroll export',
  ADD COLUMN IF NOT EXISTS "accrual_je" TEXT,
  ADD COLUMN IF NOT EXISTS "payroll_file" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Submitted',
  ADD COLUMN IF NOT EXISTS "current_step" INTEGER NOT NULL DEFAULT 1,
  ADD COLUMN IF NOT EXISTS "total_steps" INTEGER NOT NULL DEFAULT 4,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "submitted_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "approval_batch_steps" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "step_number" INTEGER NOT NULL,
    "role_name" TEXT NOT NULL,
    "approver_name" TEXT NOT NULL,
    "decision" TEXT NOT NULL DEFAULT 'Pending',
    "decided_at" TEXT,
    "comments" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_batch_steps_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "approval_batch_steps"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "step_number" INTEGER,
  ADD COLUMN IF NOT EXISTS "role_name" TEXT,
  ADD COLUMN IF NOT EXISTS "approver_name" TEXT,
  ADD COLUMN IF NOT EXISTS "decision" TEXT NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS "decided_at" TEXT,
  ADD COLUMN IF NOT EXISTS "comments" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "approval_posting_lines" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "division_cost_centre" TEXT NOT NULL,
    "gl_expense_account" TEXT NOT NULL,
    "gl_expense_name" TEXT NOT NULL,
    "gl_payable_account" TEXT NOT NULL,
    "gl_payable_name" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "dimension" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_posting_lines_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "approval_posting_lines"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "line_no" INTEGER,
  ADD COLUMN IF NOT EXISTS "division_cost_centre" TEXT,
  ADD COLUMN IF NOT EXISTS "gl_expense_account" TEXT,
  ADD COLUMN IF NOT EXISTS "gl_expense_name" TEXT,
  ADD COLUMN IF NOT EXISTS "gl_payable_account" TEXT,
  ADD COLUMN IF NOT EXISTS "gl_payable_name" TEXT,
  ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "dimension" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "approval_batch_history" (
    "id" TEXT NOT NULL,
    "batch_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "performed_at" TEXT NOT NULL,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "approval_batch_history_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "approval_batch_history"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "action" TEXT,
  ADD COLUMN IF NOT EXISTS "performed_by" TEXT,
  ADD COLUMN IF NOT EXISTS "performed_at" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_gl_posting_batches" (
    "id" TEXT NOT NULL,
    "posting_ref" TEXT NOT NULL,
    "run_no" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "posting_date" TEXT NOT NULL,
    "journal_entry_no" TEXT,
    "total_debit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "total_credit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payroll_batch_no" TEXT,
    "payroll_file_name" TEXT,
    "bank_format" TEXT NOT NULL DEFAULT 'SLIPS / CEFT',
    "bank_file_name" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "payment_lag_months" INTEGER NOT NULL DEFAULT 3,
    "disbursement_month" TEXT NOT NULL DEFAULT 'July 2026',
    "notes" TEXT,
    "posted_by" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_gl_posting_batches_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_gl_posting_batches"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "posting_ref" TEXT,
  ADD COLUMN IF NOT EXISTS "run_no" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "posting_date" TEXT,
  ADD COLUMN IF NOT EXISTS "journal_entry_no" TEXT,
  ADD COLUMN IF NOT EXISTS "total_debit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "total_credit" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "payroll_batch_no" TEXT,
  ADD COLUMN IF NOT EXISTS "payroll_file_name" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_format" TEXT NOT NULL DEFAULT 'SLIPS / CEFT',
  ADD COLUMN IF NOT EXISTS "bank_file_name" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "payment_lag_months" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "disbursement_month" TEXT NOT NULL DEFAULT 'July 2026',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "posted_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_by" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_gl_posting_lines" (
    "id" TEXT NOT NULL,
    "posting_batch_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "account_type" TEXT NOT NULL,
    "gl_account_code" TEXT NOT NULL,
    "gl_account_name" TEXT NOT NULL,
    "cost_centre" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "memo" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_gl_posting_lines_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_gl_posting_lines"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "posting_batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "line_no" INTEGER,
  ADD COLUMN IF NOT EXISTS "account_type" TEXT,
  ADD COLUMN IF NOT EXISTS "gl_account_code" TEXT,
  ADD COLUMN IF NOT EXISTS "gl_account_name" TEXT,
  ADD COLUMN IF NOT EXISTS "cost_centre" TEXT,
  ADD COLUMN IF NOT EXISTS "amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "memo" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_payroll_handover_items" (
    "id" TEXT NOT NULL,
    "posting_batch_id" TEXT NOT NULL,
    "employee_id" TEXT NOT NULL,
    "employee_name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "epf_no" TEXT,
    "bank_name" TEXT NOT NULL,
    "bank_account_no" TEXT NOT NULL,
    "gross_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "tax_deduction" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_disbursement" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_status" TEXT NOT NULL DEFAULT 'Pending Handover',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_payroll_handover_items_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_payroll_handover_items"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "posting_batch_id" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_id" TEXT,
  ADD COLUMN IF NOT EXISTS "employee_name" TEXT,
  ADD COLUMN IF NOT EXISTS "designation" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "epf_no" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_name" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_account_no" TEXT,
  ADD COLUMN IF NOT EXISTS "gross_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "tax_deduction" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "net_disbursement" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "payment_status" TEXT NOT NULL DEFAULT 'Pending Handover',
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_participant_statements" (
    "id" TEXT NOT NULL,
    "statement_no" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "sales_code" TEXT,
    "participant_name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "run_no" TEXT NOT NULL,
    "payable_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "service_allowance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "adjustments_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "penalties_clawback" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "payment_lag_months" INTEGER NOT NULL DEFAULT 3,
    "disbursement_month" TEXT NOT NULL DEFAULT 'July 2026',
    "bank_name" TEXT,
    "bank_account_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Calculated',
    "issued_at" TEXT,
    "prepared_by" TEXT NOT NULL,
    "verified_by" TEXT,
    "approved_by" TEXT,
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_participant_statements_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_participant_statements"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "statement_no" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_id" TEXT,
  ADD COLUMN IF NOT EXISTS "sales_code" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_name" TEXT,
  ADD COLUMN IF NOT EXISTS "designation" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "run_no" TEXT,
  ADD COLUMN IF NOT EXISTS "payable_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "target_incentive" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "service_allowance" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "adjustments_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "penalties_clawback" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "net_payable" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "payment_lag_months" INTEGER NOT NULL DEFAULT 3,
  ADD COLUMN IF NOT EXISTS "disbursement_month" TEXT NOT NULL DEFAULT 'July 2026',
  ADD COLUMN IF NOT EXISTS "bank_name" TEXT,
  ADD COLUMN IF NOT EXISTS "bank_account_no" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Calculated',
  ADD COLUMN IF NOT EXISTS "issued_at" TEXT,
  ADD COLUMN IF NOT EXISTS "prepared_by" TEXT,
  ADD COLUMN IF NOT EXISTS "verified_by" TEXT,
  ADD COLUMN IF NOT EXISTS "approved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_statement_lines" (
    "id" TEXT NOT NULL,
    "statement_id" TEXT NOT NULL,
    "line_no" INTEGER NOT NULL,
    "component_type" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "target_value" DOUBLE PRECISION,
    "achievement_value" DOUBLE PRECISION,
    "achievement_pct" DOUBLE PRECISION,
    "earned_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_statement_lines_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_statement_lines"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "statement_id" TEXT,
  ADD COLUMN IF NOT EXISTS "line_no" INTEGER,
  ADD COLUMN IF NOT EXISTS "component_type" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "target_value" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "achievement_value" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "achievement_pct" DOUBLE PRECISION,
  ADD COLUMN IF NOT EXISTS "earned_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "remarks" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_disputes" (
    "id" TEXT NOT NULL,
    "dispute_no" TEXT NOT NULL,
    "participant_id" TEXT NOT NULL,
    "sales_code" TEXT,
    "participant_name" TEXT NOT NULL,
    "designation" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "statement_ref" TEXT,
    "category" TEXT NOT NULL,
    "priority" TEXT NOT NULL DEFAULT 'Medium',
    "claimed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "approved_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "status" TEXT NOT NULL DEFAULT 'New',
    "description" TEXT NOT NULL,
    "investigation_notes" TEXT,
    "resolution_action" TEXT,
    "assigned_to" TEXT,
    "resolved_by" TEXT,
    "resolved_at" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_disputes_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_disputes"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "dispute_no" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_id" TEXT,
  ADD COLUMN IF NOT EXISTS "sales_code" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_name" TEXT,
  ADD COLUMN IF NOT EXISTS "designation" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "statement_ref" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "priority" TEXT NOT NULL DEFAULT 'Medium',
  ADD COLUMN IF NOT EXISTS "claimed_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "approved_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'New',
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "investigation_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "resolution_action" TEXT,
  ADD COLUMN IF NOT EXISTS "assigned_to" TEXT,
  ADD COLUMN IF NOT EXISTS "resolved_by" TEXT,
  ADD COLUMN IF NOT EXISTS "resolved_at" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_division_budgets" (
    "id" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "target_sales" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_sales" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "target_collections" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_collections" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "budget_allocation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_incentive_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "cost_ratio_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "variance_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "participant_count" INTEGER NOT NULL DEFAULT 0,
    "status" TEXT NOT NULL DEFAULT 'On Track',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_division_budgets_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_division_budgets"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "target_sales" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "actual_sales" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "target_collections" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "actual_collections" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "budget_allocation" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "actual_incentive_cost" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "cost_ratio_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "variance_amount" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "participant_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'On Track',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_dashboard_records" (
    "id" TEXT NOT NULL,
    "participant_code" TEXT NOT NULL,
    "display_name" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "volume_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "turnover_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "projected_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "invoices_over_45_days" INTEGER NOT NULL DEFAULT 0,
    "penalty_exposure" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "base_target" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "actual_achievement" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "attendance_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "notes" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_dashboard_records_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_dashboard_records"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_code" TEXT,
  ADD COLUMN IF NOT EXISTS "display_name" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "volume_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "turnover_pct" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "projected_commission" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "invoices_over_45_days" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "penalty_exposure" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "base_target" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "actual_achievement" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "attendance_factor" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "notes" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_clawback_penalties" (
    "id" TEXT NOT NULL,
    "participant_code" TEXT NOT NULL,
    "participant_name" TEXT NOT NULL,
    "division" TEXT NOT NULL,
    "period" TEXT NOT NULL,
    "record_type" TEXT NOT NULL,
    "tab_category" TEXT NOT NULL DEFAULT 'Penalty',
    "invoice_no" TEXT NOT NULL,
    "customer_name" TEXT NOT NULL,
    "net_value" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "due_age_days" INTEGER NOT NULL DEFAULT 0,
    "bracket" TEXT NOT NULL,
    "rate_percent" DECIMAL(6,2) NOT NULL DEFAULT 0.0,
    "penalty_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
    "run_no" TEXT NOT NULL,
    "is_recurring" BOOLEAN NOT NULL DEFAULT true,
    "settlement_status" TEXT NOT NULL DEFAULT 'Pending',
    "settled_at" TIMESTAMP(3),
    "settled_by" TEXT,
    "resolution_remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_clawback_penalties_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_clawback_penalties"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_code" TEXT,
  ADD COLUMN IF NOT EXISTS "participant_name" TEXT,
  ADD COLUMN IF NOT EXISTS "division" TEXT,
  ADD COLUMN IF NOT EXISTS "period" TEXT,
  ADD COLUMN IF NOT EXISTS "record_type" TEXT,
  ADD COLUMN IF NOT EXISTS "tab_category" TEXT NOT NULL DEFAULT 'Penalty',
  ADD COLUMN IF NOT EXISTS "invoice_no" TEXT,
  ADD COLUMN IF NOT EXISTS "customer_name" TEXT,
  ADD COLUMN IF NOT EXISTS "net_value" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "due_age_days" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS "bracket" TEXT,
  ADD COLUMN IF NOT EXISTS "rate_percent" DECIMAL(6,2) NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "penalty_amount" DECIMAL(14,2) NOT NULL DEFAULT 0.0,
  ADD COLUMN IF NOT EXISTS "run_no" TEXT,
  ADD COLUMN IF NOT EXISTS "is_recurring" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "settlement_status" TEXT NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS "settled_at" TIMESTAMP(3),
  ADD COLUMN IF NOT EXISTS "settled_by" TEXT,
  ADD COLUMN IF NOT EXISTS "resolution_remarks" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_audit_logs" (
    "id" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "entity_type" TEXT NOT NULL,
    "entity_id" TEXT NOT NULL,
    "action_type" TEXT NOT NULL,
    "performed_by" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "terminal_ip" TEXT NOT NULL DEFAULT '172.16.0.201',
    "severity" TEXT NOT NULL DEFAULT 'INFO',
    "old_value" TEXT,
    "new_value" TEXT,
    "diff_summary" TEXT NOT NULL,
    "version_tag" TEXT,
    "verification_status" TEXT NOT NULL DEFAULT 'Verified',
    "auditor_notes" TEXT,
    "hash_checksum" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_audit_logs_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_audit_logs"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "entity_type" TEXT,
  ADD COLUMN IF NOT EXISTS "entity_id" TEXT,
  ADD COLUMN IF NOT EXISTS "action_type" TEXT,
  ADD COLUMN IF NOT EXISTS "performed_by" TEXT,
  ADD COLUMN IF NOT EXISTS "role" TEXT,
  ADD COLUMN IF NOT EXISTS "terminal_ip" TEXT NOT NULL DEFAULT '172.16.0.201',
  ADD COLUMN IF NOT EXISTS "severity" TEXT NOT NULL DEFAULT 'INFO',
  ADD COLUMN IF NOT EXISTS "old_value" TEXT,
  ADD COLUMN IF NOT EXISTS "new_value" TEXT,
  ADD COLUMN IF NOT EXISTS "diff_summary" TEXT,
  ADD COLUMN IF NOT EXISTS "version_tag" TEXT,
  ADD COLUMN IF NOT EXISTS "verification_status" TEXT NOT NULL DEFAULT 'Verified',
  ADD COLUMN IF NOT EXISTS "auditor_notes" TEXT,
  ADD COLUMN IF NOT EXISTS "hash_checksum" TEXT,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_system_parameters" (
    "id" TEXT NOT NULL,
    "parameter_key" TEXT NOT NULL,
    "parameter_name" TEXT NOT NULL,
    "category" TEXT NOT NULL,
    "parameter_value" TEXT NOT NULL,
    "unit" TEXT NOT NULL DEFAULT 'Days',
    "default_value" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "is_editable" BOOLEAN NOT NULL DEFAULT true,
    "effective_from" TEXT NOT NULL DEFAULT '2026-01-01',
    "last_updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
    "last_updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_system_parameters_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_system_parameters"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "parameter_key" TEXT,
  ADD COLUMN IF NOT EXISTS "parameter_name" TEXT,
  ADD COLUMN IF NOT EXISTS "category" TEXT,
  ADD COLUMN IF NOT EXISTS "parameter_value" TEXT,
  ADD COLUMN IF NOT EXISTS "unit" TEXT NOT NULL DEFAULT 'Days',
  ADD COLUMN IF NOT EXISTS "default_value" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "is_editable" BOOLEAN NOT NULL DEFAULT true,
  ADD COLUMN IF NOT EXISTS "effective_from" TEXT NOT NULL DEFAULT '2026-01-01',
  ADD COLUMN IF NOT EXISTS "last_updated_by" TEXT NOT NULL DEFAULT 'System Administrator',
  ADD COLUMN IF NOT EXISTS "last_updated_at" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "incentive_divisions" (
    "id" TEXT NOT NULL,
    "division_code" TEXT NOT NULL,
    "division_name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "hod_name" TEXT NOT NULL,
    "hod_email" TEXT,
    "cost_center_code" TEXT NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "incentive_divisions_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "incentive_divisions"
  ADD COLUMN IF NOT EXISTS "id" TEXT,
  ADD COLUMN IF NOT EXISTS "division_code" TEXT,
  ADD COLUMN IF NOT EXISTS "division_name" TEXT,
  ADD COLUMN IF NOT EXISTS "description" TEXT,
  ADD COLUMN IF NOT EXISTS "hod_name" TEXT,
  ADD COLUMN IF NOT EXISTS "hod_email" TEXT,
  ADD COLUMN IF NOT EXISTS "cost_center_code" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE IF NOT EXISTS "transaction_records" (
    "id" SERIAL NOT NULL,
    "process_key" TEXT NOT NULL,
    "record_no" TEXT NOT NULL,
    "customer" TEXT,
    "site" TEXT,
    "equipment" TEXT,
    "call_no" TEXT,
    "request_no" TEXT,
    "status" TEXT NOT NULL DEFAULT 'Draft',
    "data" JSONB NOT NULL DEFAULT '{}',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "transaction_records_pkey" PRIMARY KEY ("id")
);
ALTER TABLE "transaction_records"
  ADD COLUMN IF NOT EXISTS "id" SERIAL NOT NULL,
  ADD COLUMN IF NOT EXISTS "process_key" TEXT,
  ADD COLUMN IF NOT EXISTS "record_no" TEXT,
  ADD COLUMN IF NOT EXISTS "customer" TEXT,
  ADD COLUMN IF NOT EXISTS "site" TEXT,
  ADD COLUMN IF NOT EXISTS "equipment" TEXT,
  ADD COLUMN IF NOT EXISTS "call_no" TEXT,
  ADD COLUMN IF NOT EXISTS "request_no" TEXT,
  ADD COLUMN IF NOT EXISTS "status" TEXT NOT NULL DEFAULT 'Draft',
  ADD COLUMN IF NOT EXISTS "data" JSONB NOT NULL DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  ADD COLUMN IF NOT EXISTS "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "service_requests_requestNo_key" ON "service_requests"("requestNo");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "system_roles_code_key" ON "system_roles"("code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "master_records_screenCode_idx" ON "master_records"("screenCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "master_records_screenCode_recordKey_key" ON "master_records"("screenCode", "recordKey");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "customers_customerCode_key" ON "customers"("customerCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "contact_persons_customerId_idx" ON "contact_persons"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sites_siteCode_key" ON "sites"("siteCode");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "sites_customerId_idx" ON "sites"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "items_itemCode_key" ON "items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "serials_serialNo_key" ON "serials"("serialNo");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "serials_itemId_idx" ON "serials"("itemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "serials_customerId_idx" ON "serials"("customerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "serials_siteId_idx" ON "serials"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "equipments_equipmentId_key" ON "equipments"("equipmentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "equipments_customerId_idx" ON "equipments"("customerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "equipments_siteId_idx" ON "equipments"("siteId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "equipments_serialId_idx" ON "equipments"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "other_brand_equipments_equipmentId_key" ON "other_brand_equipments"("equipmentId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "other_brand_equipments_customerId_idx" ON "other_brand_equipments"("customerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "other_brand_equipments_siteId_idx" ON "other_brand_equipments"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "equipment_systems_systemId_key" ON "equipment_systems"("systemId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "equipment_systems_customerId_idx" ON "equipment_systems"("customerId");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "equipment_systems_siteId_idx" ON "equipment_systems"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "technicians_employeeId_key" ON "technicians"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "subcontractors_vendorCode_key" ON "subcontractors"("vendorCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "service_roles_roleCode_key" ON "service_roles"("roleCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "service_types_code_key" ON "service_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "hold_reasons_reasonCode_key" ON "hold_reasons"("reasonCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "repeat_reasons_reasonCode_key" ON "repeat_reasons"("reasonCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "sla_rules_ruleCode_key" ON "sla_rules"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "checklist_templates_templateCode_key" ON "checklist_templates"("templateCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "warranty_rules_ruleCode_key" ON "warranty_rules"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "free_service_plans_planCode_key" ON "free_service_plans"("planCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "contract_templates_template_key" ON "contract_templates"("template");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "relationship_stages_code_key" ON "relationship_stages"("code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "reminder_rules_ruleCode_key" ON "reminder_rules"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "notification_templates_templateId_key" ON "notification_templates"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "project_budgets_projectCode_key" ON "project_budgets"("projectCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "cost_element_mappings_costElement_key" ON "cost_element_mappings"("costElement");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "labour_rates_rateCode_key" ON "labour_rates"("rateCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "franchise_warehouses_franchiseBp_key" ON "franchise_warehouses"("franchiseBp");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "deviation_reasons_reasonCode_key" ON "deviation_reasons"("reasonCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "export_permissions_role_reportGrid_key" ON "export_permissions"("role", "reportGrid");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "google_meet_settings_workspaceDomain_key" ON "google_meet_settings"("workspaceDomain");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "equipment_category_attributes_categoryCode_key" ON "equipment_category_attributes"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "tool_vehicle_assets_assetId_key" ON "tool_vehicle_assets"("assetId");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_schemes_scheme_code_key" ON "incentive_schemes"("scheme_code");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_manual_adjustments_adjustment_no_key" ON "incentive_manual_adjustments"("adjustment_no");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_approval_batches_run_no_key" ON "incentive_approval_batches"("run_no");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_gl_posting_batches_posting_ref_key" ON "incentive_gl_posting_batches"("posting_ref");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_participant_statements_statement_no_key" ON "incentive_participant_statements"("statement_no");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_disputes_dispute_no_key" ON "incentive_disputes"("dispute_no");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_clawback_part" ON "incentive_clawback_penalties"("participant_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_clawback_period" ON "incentive_clawback_penalties"("period");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_clawback_type" ON "incentive_clawback_penalties"("record_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_clawback_status" ON "incentive_clawback_penalties"("settlement_status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_entity" ON "incentive_audit_logs"("entity_type", "entity_id");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_action" ON "incentive_audit_logs"("action_type");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_time" ON "incentive_audit_logs"("timestamp");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_audit_status" ON "incentive_audit_logs"("verification_status");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_system_parameters_parameter_key_key" ON "incentive_system_parameters"("parameter_key");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_param_category" ON "incentive_system_parameters"("category");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_param_key" ON "incentive_system_parameters"("parameter_key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "incentive_divisions_division_code_key" ON "incentive_divisions"("division_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_div_code" ON "incentive_divisions"("division_code");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_div_status" ON "incentive_divisions"("status");

-- CreateIndex
CREATE INDEX IF NOT EXISTS "idx_trx_process_key" ON "transaction_records"("process_key");

-- CreateIndex
CREATE UNIQUE INDEX IF NOT EXISTS "transaction_records_process_key_record_no_key" ON "transaction_records"("process_key", "record_no");

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "labour_logs" ADD CONSTRAINT "labour_logs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "parts_used" ADD CONSTRAINT "parts_used_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "inspections" ADD CONSTRAINT "inspections_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "hold_requests" ADD CONSTRAINT "hold_requests_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "contact_persons" ADD CONSTRAINT "contact_persons_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "sites" ADD CONSTRAINT "sites_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "serials" ADD CONSTRAINT "serials_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "serials" ADD CONSTRAINT "serials_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "serials" ADD CONSTRAINT "serials_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "equipments" ADD CONSTRAINT "equipments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "equipments" ADD CONSTRAINT "equipments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "equipments" ADD CONSTRAINT "equipments_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "serials"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "other_brand_equipments" ADD CONSTRAINT "other_brand_equipments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "other_brand_equipments" ADD CONSTRAINT "other_brand_equipments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "equipment_systems" ADD CONSTRAINT "equipment_systems_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "equipment_systems" ADD CONSTRAINT "equipment_systems_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "scheme_rules" ADD CONSTRAINT "scheme_rules_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "incentive_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "scheme_slabs" ADD CONSTRAINT "scheme_slabs_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "incentive_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "scheme_rate_items" ADD CONSTRAINT "scheme_rate_items_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "incentive_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "scheme_versions" ADD CONSTRAINT "scheme_versions_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "incentive_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "scheme_history_logs" ADD CONSTRAINT "scheme_history_logs_scheme_id_fkey" FOREIGN KEY ("scheme_id") REFERENCES "incentive_schemes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "matrix_credit_bands" ADD CONSTRAINT "matrix_credit_bands_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "commission_rate_matrices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "matrix_cells" ADD CONSTRAINT "matrix_cells_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "commission_rate_matrices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "matrix_history_logs" ADD CONSTRAINT "matrix_history_logs_matrix_id_fkey" FOREIGN KEY ("matrix_id") REFERENCES "commission_rate_matrices"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "slab_tiers" ADD CONSTRAINT "slab_tiers_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "target_incentive_slab_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "slab_table_history_logs" ADD CONSTRAINT "slab_table_history_logs_table_id_fkey" FOREIGN KEY ("table_id") REFERENCES "target_incentive_slab_tables"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "monthly_target_entries" ADD CONSTRAINT "monthly_target_entries_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "monthly_target_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "monthly_target_history_logs" ADD CONSTRAINT "monthly_target_history_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "monthly_target_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "participant_scheme_assignments" ADD CONSTRAINT "participant_scheme_assignments_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "incentive_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "participant_history_logs" ADD CONSTRAINT "participant_history_logs_participant_id_fkey" FOREIGN KEY ("participant_id") REFERENCES "incentive_participants"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "attendance_records" ADD CONSTRAINT "attendance_records_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "attendance_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "attendance_batch_history_logs" ADD CONSTRAINT "attendance_batch_history_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "attendance_import_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "service_performance_technician_lines" ADD CONSTRAINT "service_performance_technician_lines_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "service_performance_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "service_performance_job_tickets" ADD CONSTRAINT "service_performance_job_tickets_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "service_performance_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "service_performance_audit_logs" ADD CONSTRAINT "service_performance_audit_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "service_performance_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "calculation_participant_results" ADD CONSTRAINT "calculation_participant_results_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "calculation_result_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "calculation_result_audit_logs" ADD CONSTRAINT "calculation_result_audit_logs_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "calculation_result_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "calculation_run_readiness_checks" ADD CONSTRAINT "calculation_run_readiness_checks_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "incentive_calculation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "calculation_run_scheme_summaries" ADD CONSTRAINT "calculation_run_scheme_summaries_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "incentive_calculation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "calculation_run_warnings" ADD CONSTRAINT "calculation_run_warnings_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "incentive_calculation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "calculation_run_logs" ADD CONSTRAINT "calculation_run_logs_run_id_fkey" FOREIGN KEY ("run_id") REFERENCES "incentive_calculation_runs"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "manual_adjustment_approvals" ADD CONSTRAINT "manual_adjustment_approvals_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "incentive_manual_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "manual_adjustment_history" ADD CONSTRAINT "manual_adjustment_history_adjustment_id_fkey" FOREIGN KEY ("adjustment_id") REFERENCES "incentive_manual_adjustments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "approval_batch_steps" ADD CONSTRAINT "approval_batch_steps_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "incentive_approval_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "approval_posting_lines" ADD CONSTRAINT "approval_posting_lines_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "incentive_approval_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "approval_batch_history" ADD CONSTRAINT "approval_batch_history_batch_id_fkey" FOREIGN KEY ("batch_id") REFERENCES "incentive_approval_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "incentive_gl_posting_lines" ADD CONSTRAINT "incentive_gl_posting_lines_posting_batch_id_fkey" FOREIGN KEY ("posting_batch_id") REFERENCES "incentive_gl_posting_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "incentive_payroll_handover_items" ADD CONSTRAINT "incentive_payroll_handover_items_posting_batch_id_fkey" FOREIGN KEY ("posting_batch_id") REFERENCES "incentive_gl_posting_batches"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- AddForeignKey
DO $$ BEGIN
  ALTER TABLE "incentive_statement_lines" ADD CONSTRAINT "incentive_statement_lines_statement_id_fkey" FOREIGN KEY ("statement_id") REFERENCES "incentive_participant_statements"("id") ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- COMPLETE DATABASE DATA DUMP (ALL EXISTING RECORDS FROM CURRENT DB)
-- Safe to execute multiple times (ON CONFLICT DO NOTHING)
-- ============================================================================

-- Data for table "incentive_approval_batches" (3 rows)
INSERT INTO "incentive_approval_batches" ("id", "run_no", "period", "division", "total_payable", "posting_method", "accrual_je", "payroll_file", "status", "current_step", "total_steps", "notes", "submitted_by", "created_at", "updated_at") VALUES ('APP-2026-04-RLC', 'INC-RUN-2026-04-RLC', 'April 2026', 'All Divisions', 3430670, 'Accrual JE + payroll export', 'JE-2026-05-0412', 'INC_RLC_2026-04.xlsx', 'Posted', 4, 4, 'Official April 2026 incentive settlement approved by CEO and posted to SAP Business One.', 'Lakmal Perera (Incentive Administrator)', '2026-10-23T06:12:42.010Z', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_approval_batches" ("id", "run_no", "period", "division", "total_payable", "posting_method", "accrual_je", "payroll_file", "status", "current_step", "total_steps", "notes", "submitted_by", "created_at", "updated_at") VALUES ('APP-2026-05-PRE', 'RUN-2026-05-PRE-01', 'May 2026', 'All Divisions', 3983000, 'Accrual JE + payroll export', NULL, NULL, 'Submitted', 2, 4, 'May 2026 Preliminary calculation run package forwarded for multi-tier executive sign-offs.', 'Lakmal Perera (Incentive Administrator)', '2026-10-23T06:12:42.010Z', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_approval_batches" ("id", "run_no", "period", "division", "total_payable", "posting_method", "accrual_je", "payroll_file", "status", "current_step", "total_steps", "notes", "submitted_by", "created_at", "updated_at") VALUES ('TST-2026-08-23', 'RUN-2026-06-SIM-01', 'June 2026', 'All Divisions', 100000, ' payroll export', 'JE-2026-05-9388', 'INC_All_Divisions_June_2026.xlsx', 'Locked', 4, 4, 'TESTING', 'Lakmal Perera (Incentive Administrator)', '2026-10-23T06:36:00.400Z', '2026-10-23T06:38:43.670Z') ON CONFLICT DO NOTHING;

-- Data for table "approval_batch_history" (16 rows)
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-04-1', 'APP-2026-04-RLC', 'Package Created & Submitted', 'Lakmal Perera', '05-May-2026 10:00 IST', 'Generated from final calculation run INC-RUN-2026-04-RLC.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-04-2', 'APP-2026-04-RLC', 'HOD Sales Approved', 'HOD Sales - T. Aloka', '06-May-2026 14:15 IST', 'Step 1 complete.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-04-3', 'APP-2026-04-RLC', 'HOD Service Approved', 'Chaminda Warnakula', '07-May-2026 11:30 IST', 'Step 2 complete.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-04-4', 'APP-2026-04-RLC', 'Finance Manager Approved', 'Finance - M. Jayasinghe', '08-May-2026 16:45 IST', 'Step 3 complete.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-04-5', 'APP-2026-04-RLC', 'CEO Final Approval', 'CEO - S. K. Wickramasinghe', '09-May-2026 10:20 IST', 'Step 4 complete. Package status updated to Approved.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-04-6', 'APP-2026-04-RLC', 'Posted Accrual JE to SAP B1', 'Finance - M. Jayasinghe', '09-May-2026 11:45 IST', 'Posted Journal Entry #JE-2026-05-0412. Exported payroll file INC_RLC_2026-04.xlsx.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-05-1', 'APP-2026-05-PRE', 'Package Created & Submitted', 'Lakmal Perera', '12-May-2026 18:00 IST', 'Submitted to approval pipeline after MTD calculation simulation.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-05-2', 'APP-2026-05-PRE', 'HOD Sales Approved', 'HOD Sales - T. Aloka', '13-May-2026 16:20 IST', 'Step 1 complete.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-1', 'TST-2026-08-23', 'Package Created & Submitted', 'Lakmal Perera (Incentive Administrator)', '10/23/2026, 12:06:00 PM', 'Approval package created for RUN-2026-06-SIM-01 (June 2026) totaling LKR 100,000.', '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-70705', 'TST-2026-08-23', 'Step 1 Approved', 'Finance - M. Jayasinghe', '10/23/2026, 12:06:10 PM', 'Step 1 marked Approved. Batch status is now Submitted.', '2026-10-23T06:36:10.702Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-73961', 'TST-2026-08-23', 'Step 2 Approved', 'Finance - M. Jayasinghe', '10/23/2026, 12:06:13 PM', 'Step 2 marked Approved. Batch status is now Submitted.', '2026-10-23T06:36:13.958Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-77050', 'TST-2026-08-23', 'Step 3 Approved', 'Finance - M. Jayasinghe', '10/23/2026, 12:06:17 PM', 'Step 3 marked Approved. Batch status is now Submitted.', '2026-10-23T06:36:17.047Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-80242', 'TST-2026-08-23', 'Step 4 Approved', 'Finance - M. Jayasinghe', '10/23/2026, 12:06:20 PM', 'Step 4 marked Approved. Batch status is now Approved.', '2026-10-23T06:36:20.239Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-03443', 'TST-2026-08-23', 'Posted Accrual JE & Payroll Handover', 'Finance - M. Jayasinghe', '10/23/2026, 12:08:23 PM', 'Posted SAP B1 Journal Voucher #JE-2026-05-9388. Generated payroll handover export INC_All_Divisions_June_2026.xlsx.', '2026-10-23T06:38:23.397Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-21073', 'TST-2026-08-23', 'Posted Accrual JE & Payroll Handover', 'Finance - M. Jayasinghe', '10/23/2026, 12:08:41 PM', 'Posted SAP B1 Journal Voucher #JE-2026-05-9388. Generated payroll handover export INC_All_Divisions_June_2026.xlsx.', '2026-10-23T06:38:41.071Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_history" ("id", "batch_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-08-23-23670', 'TST-2026-08-23', 'Period Locked', 'Finance - M. Jayasinghe', '10/23/2026, 12:08:43 PM', 'Financial period locked. All calculations, postings, and participant statements frozen.', '2026-10-23T06:38:43.670Z') ON CONFLICT DO NOTHING;

-- Data for table "approval_batch_steps" (12 rows)
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-04-1', 'APP-2026-04-RLC', 1, 'HOD Sales (RLC)', 'HOD Sales - T. Aloka', 'Approved', '06-May-2026 14:15 IST', 'Sales volumes and commission schedules verified.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-04-2', 'APP-2026-04-RLC', 2, 'HOD Service', 'Chaminda Warnakula (Service HOD)', 'Approved', '07-May-2026 11:30 IST', 'Scorecard metrics and technician jobs audited.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-04-3', 'APP-2026-04-RLC', 3, 'Head of Finance', 'Finance - M. Jayasinghe', 'Approved', '08-May-2026 16:45 IST', 'GL cost centre accounts and tax provisions audited.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-04-4', 'APP-2026-04-RLC', 4, 'CEO / Executive Director', 'CEO - S. K. Wickramasinghe', 'Approved', '09-May-2026 10:20 IST', 'Final executive authorization granted for payout.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-05-1', 'APP-2026-05-PRE', 1, 'HOD Sales (RLC)', 'HOD Sales - T. Aloka', 'Approved', '13-May-2026 16:20 IST', 'Verified preliminary targets and dealer incentives.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-05-2', 'APP-2026-05-PRE', 2, 'HOD Service', 'Chaminda Warnakula (Service HOD)', 'Pending', NULL, 'Reviewing attendance factors and job sheets.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-05-3', 'APP-2026-05-PRE', 3, 'Head of Finance', 'Finance - M. Jayasinghe', 'Pending', NULL, 'Awaiting division HOD sign-offs.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step-05-4', 'APP-2026-05-PRE', 4, 'CEO / Executive Director', 'CEO - S. K. Wickramasinghe', 'Pending', NULL, 'Final executive authorization tier.', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step--08-23-1', 'TST-2026-08-23', 1, 'HOD Sales (RLC)', 'Finance - M. Jayasinghe', 'Approved', '10/23/2026, 12:06:10 PM', NULL, '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step--08-23-2', 'TST-2026-08-23', 2, 'HOD Service', 'Finance - M. Jayasinghe', 'Approved', '10/23/2026, 12:06:13 PM', NULL, '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step--08-23-3', 'TST-2026-08-23', 3, 'Head of Finance', 'Finance - M. Jayasinghe', 'Approved', '10/23/2026, 12:06:17 PM', NULL, '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_batch_steps" ("id", "batch_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('step--08-23-4', 'TST-2026-08-23', 4, 'CEO / Executive Director', 'Finance - M. Jayasinghe', 'Approved', '10/23/2026, 12:06:20 PM', NULL, '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;

-- Data for table "approval_posting_lines" (9 rows)
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-04-1', 'APP-2026-04-RLC', 1, 'RLC - Dealer Seg. 01', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 1912440, 'RLC / DS01', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-04-2', 'APP-2026-04-RLC', 2, 'RLC - Dealer Seg. 02', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 1328230, 'RLC / DS02', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-04-3', 'APP-2026-04-RLC', 3, 'RLC - Management', '620420', 'Manager Incentive Expense', '240310', 'Incentive Payable', 190000, 'RLC / MGT', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-05-1', 'APP-2026-05-PRE', 1, 'Consumer Electronics Showroom', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 780000, 'CE / SHW01', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-05-2', 'APP-2026-05-PRE', 2, 'Commercial AC Dealer Sales', '620410', 'Sales Incentive Expense', '240310', 'Incentive Payable', 1638000, 'CAC / DLR', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-05-3', 'APP-2026-05-PRE', 3, 'Field Service Engineering', '620430', 'Service Technician Bonus', '240310', 'Incentive Payable', 555000, 'SVC / FLD', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post-05-4', 'APP-2026-05-PRE', 4, 'Renewable Energy Solar Team', '620440', 'Solar Consultant Commission', '240310', 'Incentive Payable', 1010000, 'SOL / ENG', '2026-10-23T06:12:42.010Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post--08-23-1', 'TST-2026-08-23', 1, 'All Divisions - Direct Operations', '620410', 'Sales & Service Incentive Expense', '240310', 'Incentive Payable', 80000, 'CORP / OPS', '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;
INSERT INTO "approval_posting_lines" ("id", "batch_id", "line_no", "division_cost_centre", "gl_expense_account", "gl_expense_name", "gl_payable_account", "gl_payable_name", "amount", "dimension", "created_at") VALUES ('post--08-23-2', 'TST-2026-08-23', 2, 'All Divisions - Management Pool', '620420', 'Manager Incentive Expense', '240310', 'Incentive Payable', 20000, 'CORP / MGT', '2026-10-23T06:36:00.400Z') ON CONFLICT DO NOTHING;

-- Data for table "attendance_import_batches" (2 rows)
INSERT INTO "attendance_import_batches" ("id", "period", "division", "source", "status", "imported_by", "approved_by", "approved_at", "notes", "created_at", "updated_at") VALUES ('BAT-ATT-2026-04F', 'April 2026', 'All Service Divisions', 'HRIS Payroll Export (SAP SuccessFactors)', 'Approved', 'Niluka Senaratne (HR Manager)', 'Niluka Senaratne (HR Manager)', '2026-04-28T16:30:00.000Z', 'Final approved attendance baseline for April incentive distribution.', '2026-10-22T09:31:25.418Z', '2026-10-22T09:31:25.418Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_import_batches" ("id", "period", "division", "source", "status", "imported_by", "approved_by", "approved_at", "notes", "created_at", "updated_at") VALUES ('BAT-ATT-2026-05A', 'May 2026', 'Consumer Electronics', 'Biometric Punch Terminal (ZKTeco BioTime)', 'Draft', 'Kamal Silva (Service Coordinator)', NULL, NULL, 'Initial monthly punch clock import for Western Province technicians.', '2026-10-22T09:31:25.411Z', '2026-10-22T11:20:39.194Z') ON CONFLICT DO NOTHING;

-- Data for table "attendance_batch_history_logs" (9 rows)
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('ABH-01', 'BAT-ATT-2026-05A', 'Batch Created', 'Kamal Silva', 'Service Coordinator', 'Imported 12 rows from ZKTeco biometric terminal.', '2026-10-22T09:31:25.417Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('ABH-02', 'BAT-ATT-2026-05A', 'Validation Executed', 'Kamal Silva', 'Service Coordinator', 'Diagnosed 10 valid records and 2 roster errors.', '2026-10-22T09:31:25.417Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-267152', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 9 attendance records for May 2026.', '2026-10-22T11:07:47.145Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-316882', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 9 attendance records for May 2026.', '2026-10-22T11:08:36.875Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-811688', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 10 attendance records for May 2026.', '2026-10-22T11:16:51.681Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-814417', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 10 attendance records for May 2026.', '2026-10-22T11:16:54.413Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-959515', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 9 attendance records for May 2026.', '2026-10-22T11:19:19.510Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-979407', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 1 attendance records for May 2026.', '2026-10-22T11:19:39.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_batch_history_logs" ("id", "batch_id", "action", "user_name", "user_role", "details", "timestamp") VALUES ('abh-039199', 'BAT-ATT-2026-05A', 'Records Updated', 'Kamal Silva (Service Coordinator)', 'HR Operations', 'Synchronized 2 attendance records for May 2026.', '2026-10-22T11:20:39.194Z') ON CONFLICT DO NOTHING;

-- Data for table "attendance_records" (12 rows)
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-1', 'BAT-ATT-2026-05A', 'EMP-1021', 'Kasun Jayawardena', 'Senior Service Technician', 'Consumer Electronics', 22, 2, 0, 1, 'Valid', '[]'::jsonb, 'Perfect attendance, full factor applied', 1, '2026-10-22T11:28:29.317Z', '2026-10-22T11:28:29.317Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-2', 'BAT-ATT-2026-05A', 'EMP-1022', 'Pradeep Bandara', 'Field Service Technician', 'Consumer Electronics', 21, 2, 1, 1, 'Valid', '[]'::jsonb, '1 unapproved absent day (within 0-1 allowance: 100%)', 2, '2026-10-22T11:28:29.320Z', '2026-10-22T11:28:29.320Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-3', 'BAT-ATT-2026-05A', 'EMP-1023', 'Ruwan Wijesinghe', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 20, 2, 2, 0.5, 'Valid', '[]'::jsonb, '2 absent days (50% factor applied)', 3, '2026-10-22T11:28:29.321Z', '2026-10-22T11:28:29.321Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-4', 'BAT-ATT-2026-05A', 'EMP-1024', 'Dilshan Madusanka', 'Junior Service Tech', 'Consumer Electronics', 18, 3, 3, 0, 'Valid', '[]'::jsonb, '3 absent days (0% factor applied — forfeiture threshold)', 4, '2026-10-22T11:28:29.322Z', '2026-10-22T11:28:29.322Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-5', 'BAT-ATT-2026-05A', 'EMP-1025', 'Nuwan Fernando', 'Solar PV Maintenance Tech', 'Renewable Energy', 23, 1, 0, 1, 'Valid', '[]'::jsonb, 'Full month field deployment', 5, '2026-10-22T11:28:29.324Z', '2026-10-22T11:28:29.324Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-6', 'BAT-ATT-2026-05A', 'EMP-1026', 'Chaminda Warnakula', 'Senior Service Technician', 'Consumer Electronics', 21, 2, 1, 1, 'Valid', '[]'::jsonb, 'Within normal limits', 6, '2026-10-22T11:28:29.325Z', '2026-10-22T11:28:29.325Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-7', 'BAT-ATT-2026-05A', 'EMP-1027', 'Sajith Gunaratne', 'Retail Sales Consultant', 'Consumer Electronics', 22, 1, 1, 1, 'Error', '["Ineligible Role: Retail Sales Consultant. Attendance component applies only to certified field service technicians."]'::jsonb, 'Imported accidentally from showroom sales payroll', 7, '2026-10-22T11:28:29.327Z', '2026-10-22T11:28:29.327Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-8', 'BAT-ATT-2026-05A', 'EMP-9999', 'Gamini Wijetunga', 'Contract Technician', 'Consumer Electronics', 15, 0, 5, 0, 'Error', '["Employee code EMP-9999 not found in Master Technician roster. Verify employee master record."]'::jsonb, 'Contractor code unmapped in ERP', 8, '2026-10-22T11:28:29.328Z', '2026-10-22T11:28:29.328Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-9', 'BAT-ATT-2026-05A', 'EMP-1029', 'Dinesh Priyashantha', 'Field Service Technician', 'Consumer Electronics', 22, 2, 0, 1, 'Valid', '[]'::jsonb, 'Exemplary punctuality', 9, '2026-10-22T11:28:29.330Z', '2026-10-22T11:28:29.330Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-10', 'BAT-ATT-2026-05A', 'EMP-1030', 'Mahesh Gunawardena', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 21, 1, 2, 0.5, 'Valid', '[]'::jsonb, '2 days unexcused absence, 50% factor', 10, '2026-10-22T11:28:29.332Z', '2026-10-22T11:28:29.332Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-11', 'BAT-ATT-2026-05A', 'EMP-1031', 'Niroshan De Silva', 'Diagnostic Specialist', 'Commercial Air Conditioning', 23, 1, 0, 1, 'Valid', '[]'::jsonb, '100% factor', 11, '2026-10-22T11:28:29.333Z', '2026-10-22T11:28:29.333Z') ON CONFLICT DO NOTHING;
INSERT INTO "attendance_records" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "working_days", "leave_days", "absent_days", "attendance_factor", "validation_status", "error_messages", "notes", "sort_order", "created_at", "updated_at") VALUES ('att-12', 'BAT-ATT-2026-05A', 'EMP-1032', 'Sunil Jayasuriya', 'Solar PV Maintenance Tech', 'Renewable Energy', 22, 2, 0, 1, 'Valid', '[]'::jsonb, 'Full attendance', 12, '2026-10-22T11:28:29.334Z', '2026-10-22T11:28:29.334Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_result_batches" (2 rows)
INSERT INTO "calculation_result_batches" ("id", "period", "run_date", "status", "run_type", "total_participants", "gross_commission_lkr", "target_incentive_lkr", "penalty_clawback_lkr", "net_payable_lkr", "notes", "created_at", "updated_at") VALUES ('RUN-2026-04-FINAL', 'April 2026', '29-Apr-2026 17:00 IST', 'Approved', 'Official Payroll Run', 7, 598000, 365000, 42000, 921000, 'April 2026 official signed off incentive payout batch posted to payroll.', '2026-10-22T15:37:33.373Z', '2026-10-22T15:37:33.373Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_batches" ("id", "period", "run_date", "status", "run_type", "total_participants", "gross_commission_lkr", "target_incentive_lkr", "penalty_clawback_lkr", "net_payable_lkr", "notes", "created_at", "updated_at") VALUES ('RUN-2026-05-MTD-04', 'May 2026', '14-May-2026 18:30 IST', 'Verified', 'MTD Simulation', 8, 686000, 403700, 83200, 1006500, 'Telesonic Lanka monthly incentive computation run 04 for May 2026.', '2026-10-22T15:37:33.373Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_participant_results" (8 rows)
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-01', 'RUN-2026-05-MTD-04', 'TECH-101', 'Ruwan Jayasinghe', 'Senior Field Engineer', 'Consumer Electronics', 'SCH-CE-FIELD', 'Consumer AV & Smart Appliances Tiered Incentive', 40, 46, 115, 850000, 969000, 114, 'Tier 3 (110% - 125%)', 1.15, 98000, 50500, 1, 0, 148500, 'Verified', 46, 0, 'Exemplary customer turnaround', 1, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-02', 'RUN-2026-05-MTD-04', 'TECH-102', 'Dinesh Bandara', 'Biomedical Specialist', 'Biomedical Engineering', 'SCH-MED-SPEC', 'Healthcare Diagnostic & Imaging Systems Scheme', 25, 27, 108, 1400000, 1484000, 106, 'Tier 2 (100% - 110%)', 1.05, 135000, 81500, 1, 24500, 192000, 'Verified', 27, 2, '2 overdue invoices (>45 days) docked per policy', 2, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-03', 'RUN-2026-05-MTD-04', 'TECH-103', 'Kasun Wijesinghe', 'Network Technician', 'Telecommunications & Networks', 'SCH-TEL-NET', 'Fiber Optic & Microwave Installation Incentive', 35, 32, 91, 600000, 552000, 92, 'Tier 1 (80% - 99%)', 0.9, 58000, 30000, 1, 0, 88000, 'Calculated', 32, 0, 'Within normal standard parameters', 3, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-04', 'RUN-2026-05-MTD-04', 'TECH-104', 'Anura Senanayake', 'IT Solutions Architect', 'Enterprise IT Solutions', 'SCH-IT-SRV', 'Enterprise Datacenter & Server Maintenance Matrix', 20, 25, 125, 2200000, 2684000, 122, 'Tier 4 (> 120% Super Achievement)', 1.25, 165000, 98000, 1, 18000, 245000, 'Approved', 25, 1, 'Super-accelerator multiplier applied', 4, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-05', 'RUN-2026-05-MTD-04', 'TECH-105', 'Pradeep Kumara', 'Industrial Automation Tech', 'Industrial Automation', 'SCH-IND-AUTO', 'PLC & Robotics Field Commission Structure', 30, 23, 76, 950000, 741000, 78, 'Below Threshold (< 80%)', 0.7, 48000, 35200, 0.9, 31200, 52000, 'Held', 23, 3, 'Held for review: 3 overdue invoices & high penalty clawback', 5, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-06', 'RUN-2026-05-MTD-04', 'TECH-106', 'Nimal Perera', 'Power Systems Technician', 'Power Systems & Generators', 'SCH-PWR-GEN', 'Diesel Generator & UPS Service Commission Scheme', 28, 29, 103, 750000, 765000, 102, 'Tier 2 (100% - 110%)', 1, 72000, 40000, 1, 0, 112000, 'Calculated', 29, 0, 'Regular maintenance target achieved', 6, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-07', 'RUN-2026-05-MTD-04', 'TECH-107', 'Chaminda Silva', 'Consumer AV Technician', 'Consumer Electronics', 'SCH-CE-FIELD', 'Consumer AV & Smart Appliances Tiered Incentive', 32, 28, 87, 700000, 616000, 88, 'Tier 1 (80% - 99%)', 0.85, 45000, 28500, 1, 9500, 64000, 'Verified', 28, 1, '1 penalty clawback processed', 7, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_participant_results" ("id", "batch_id", "technician_code", "technician_name", "role", "division", "scheme_code", "scheme_name", "target_volume", "actual_volume", "volume_pct", "target_turnover", "actual_turnover", "turnover_pct", "slab_tier", "slab_multiplier", "gross_commission", "target_incentive", "attendance_factor", "penalty_clawback", "net_payable", "status", "job_count", "overdue_invoice_count", "notes", "sort_order", "created_at", "updated_at") VALUES ('calc-448385', 'RUN-2026-05-MTD-04', 'TECH-TEST-01', 'chathuni jayathilake', 'Field Technician', 'Consumer Electronics', 'SCH-CE-FIELD', 'Consumer AV & Smart Appliances Tiered Incentive', 30, 32, 107, 750000, 800000, 107, 'Tier 2 (100% - 110%)', 1.05, 65000, 40000, 1, 0, 105000, 'Approved', 32, 0, '', 8, '2026-10-22T15:55:17.353Z', '2026-10-22T15:55:36.931Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_result_audit_logs" (7 rows)
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-01', 'RUN-2026-05-MTD-04', '14-May-2026 18:30 IST', 'Incentive Batch Engine v4.2', 'System Engine', 'Calculation Executed', 'Executed formula engine across 7 participant profiles for May 2026.', '2026-10-22T15:37:33.373Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-02', 'RUN-2026-05-MTD-04', '14-May-2026 19:15 IST', 'Lakmal Perera', 'Incentive Administrator', 'Verification Stamped', 'Verified slab tiers and customer aging deductions against SAP B1 AR aging.', '2026-10-22T15:37:33.373Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-03', 'RUN-2026-05-MTD-04', '14-May-2026 19:40 IST', 'Chaminda Warnakula', 'Service HOD', 'Participant Held', 'Marked TECH-105 on Hold pending resolution of disputed industrial client invoices.', '2026-10-22T15:37:33.373Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-448439', 'RUN-2026-05-MTD-04', '22/10/2026 IST', 'Incentive Administrator', 'Administrator', 'Calculation Results Updated', 'Synchronized 8 participant computation results in PostgreSQL.', '2026-10-22T15:54:08.430Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-461206', 'RUN-2026-05-MTD-04', '22/10/2026 IST', 'Incentive Administrator', 'Administrator', 'Calculation Results Updated', 'Synchronized 8 participant computation results in PostgreSQL.', '2026-10-22T15:54:21.202Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-517358', 'RUN-2026-05-MTD-04', '22/10/2026 IST', 'Incentive Administrator', 'Administrator', 'Calculation Results Updated', 'Synchronized 8 participant computation results in PostgreSQL.', '2026-10-22T15:55:17.353Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_result_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('craud-536931', 'RUN-2026-05-MTD-04', '22/10/2026 IST', 'Incentive Administrator', 'Incentive Administrator', 'Participant Status: Approved', 'Updated chathuni jayathilake (TECH-TEST-01) calculation status to Approved.', '2026-10-22T15:55:36.931Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_calculation_runs" (4 rows)
INSERT INTO "incentive_calculation_runs" ("id", "run_no", "period", "division", "selected_schemes", "run_type", "data_cutoff", "status", "run_by", "started_at", "finished_at", "total_participants", "total_docs_read", "total_gross_commission", "total_target_incentive", "total_penalty", "total_net_payable", "notes", "created_at", "updated_at") VALUES ('RUN-2026-04-FIN-01', 'RUN-2026-04-FIN-01', 'April 2026', 'All Divisions', 'All Active Schemes (4 Schemes)', 'Final Calculation', '30-Apr-2026 23:59:59', 'Posted', 'Lakmal Perera (Incentive Administrator)', '02-May-2026 09:30:15', '02-May-2026 09:31:02', 34, 1735, 2865000, 1240000, 122000, 3983000, 'Status updated manually from table to Simulated', '2026-10-22T16:00:53.654Z', '2026-10-23T05:16:04.756Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_calculation_runs" ("id", "run_no", "period", "division", "selected_schemes", "run_type", "data_cutoff", "status", "run_by", "started_at", "finished_at", "total_participants", "total_docs_read", "total_gross_commission", "total_target_incentive", "total_penalty", "total_net_payable", "notes", "created_at", "updated_at") VALUES ('RUN-TEST-1792734207418', 'RUN-TEST-1792734207418', 'June 2026', 'Consumer Electronics', 'Retail Showroom Sales Incentive', 'Simulation', '2026-06-30 23:59:59', 'Draft', 'Vitest Automated Runner', '2026-06-30 10:00:00', '2026-06-30 10:00:45', 5, 250, 300000, 150000, 10000, 440000, 'Automated engine test run', '2026-10-23T05:43:27.421Z', '2026-10-23T05:43:27.421Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_calculation_runs" ("id", "run_no", "period", "division", "selected_schemes", "run_type", "data_cutoff", "status", "run_by", "started_at", "finished_at", "total_participants", "total_docs_read", "total_gross_commission", "total_target_incentive", "total_penalty", "total_net_payable", "notes", "created_at", "updated_at") VALUES ('RUN-2026-06-SIM-2003', 'RUN-2026-06-SIM-2003', 'June 2026', 'Consumer Electronics', 'non-edited', 'Simulation', '2026-06-30 23:59:59', 'Approved', 'chathuni jayathilake ', '2026-10-23 04:55:56', '2026-10-23 04:55:56', 34, 1735, 2865000, 1240000, 122000, 3983000, 'Status updated manually from table to Approved', '2026-10-23T04:55:56.379Z', '2026-10-23T05:15:55.192Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_calculation_runs" ("id", "run_no", "period", "division", "selected_schemes", "run_type", "data_cutoff", "status", "run_by", "started_at", "finished_at", "total_participants", "total_docs_read", "total_gross_commission", "total_target_incentive", "total_penalty", "total_net_payable", "notes", "created_at", "updated_at") VALUES ('RUN-2026-05-PRE-01', 'RUN-2026-05-PRE-01', 'May 2026', 'All Divisions', 'All Active Schemes (4 Schemes)', 'Simulation', '12-May-2026 23:59:59', 'Simulated', 'Lakmal Perera (Incentive Administrator)', '12-May-2026 10:15:20', '12-May-2026 10:16:04', 34, 1735, 2865000, 1240000, 122000, 3983000, 'Preliminary MTD Simulation run for May 2026 across 4 business divisions.', '2026-10-23T05:43:00.806Z', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_run_logs" (17 rows)
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-1792685718114', 'RUN-2026-04-FIN-01', '9:45:18 PM', 'SUCCESS', 'Simulation calculation finished in 1.4s. 34 participants evaluated across 4 schemes.', '2026-10-22T16:15:22.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-1792731356338-1', 'RUN-2026-06-SIM-2003', '10:25:56 AM', 'INFO', 'Calculation run initialized by chathuni jayathilake  for period June 2026.', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-1792731356338-2', 'RUN-2026-06-SIM-2003', '10:25:56 AM', 'SUCCESS', 'Evaluated 4 active schemes. Total Net Pool: LKR 3,983,000.', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-193039', 'RUN-2026-06-SIM-2003', '10:39:53 AM', 'INFO', 'Run status transitioned to Calculated by Incentive Administrator. Recalculated quotas from latest data', '2026-10-23T05:09:53.039Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-197496', 'RUN-2026-06-SIM-2003', '10:39:57 AM', 'INFO', 'Run status transitioned to Calculated by Incentive Administrator. Recalculated quotas from latest data', '2026-10-23T05:09:57.496Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-555192', 'RUN-2026-06-SIM-2003', '10:45:55 AM', 'INFO', 'Run status transitioned to Approved by Incentive Administrator. Status updated manually from table to Approved', '2026-10-23T05:15:55.192Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-564756', 'RUN-2026-04-FIN-01', '10:46:04 AM', 'INFO', 'Run status transitioned to Simulated by Incentive Administrator. Status updated manually from table to Simulated', '2026-10-23T05:16:04.756Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-1', 'RUN-2026-05-PRE-01', '10:15:20.102', 'INFO', 'Engine initialized. Configuration validated for period May 2026.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-2', 'RUN-2026-05-PRE-01', '10:15:21.430', 'INFO', 'Connecting to SAP Business One Service Layer API... Connected (Latency 14ms).', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-3', 'RUN-2026-05-PRE-01', '10:15:22.015', 'INFO', 'Ingested 1,735 source documents: 1,258 invoices, 363 service tickets, 114 solar contracts.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-4', 'RUN-2026-05-PRE-01', '10:15:25.800', 'DEBUG', 'Evaluating Target Slab Table v2.1 for Retail Showroom Sales (12 participants).', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-5', 'RUN-2026-05-PRE-01', '10:15:32.410', 'WARN', 'WRN-ATT-04: Dilshan Madusanka (EMP-1024) 3 absent days. Calculated 0% factor.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-6', 'RUN-2026-05-PRE-01', '10:15:38.220', 'DEBUG', 'Executing payment-term aging matrix against open receivables ledger.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-7', 'RUN-2026-05-PRE-01', '10:15:45.900', 'WARN', 'WRN-DEBT-12: Applied 15% debtor aging penalty on overdue invoice INV-2026-9042.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-8', 'RUN-2026-05-PRE-01', '10:15:58.100', 'INFO', 'Net payable reconciliation completed across all 4 schemes. Net Pool: LKR 3,983,000.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-2026-05-9', 'RUN-2026-05-PRE-01', '10:16:04.110', 'SUCCESS', 'Run finished successfully in 44.008s. Generated 5 warnings.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_logs" ("id", "run_id", "timestamp", "level", "message", "created_at") VALUES ('log-RUN-TEST-1792734207418-1', 'RUN-TEST-1792734207418', '10:00:00', 'INFO', 'Test run created.', '2026-10-23T05:43:27.421Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_run_readiness_checks" (9 rows)
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-1', 'RUN-2026-06-SIM-2003', 'Monthly Target Quotas', 'Locked & Approved', 'Locked & Approved', TRUE, 'Lakmal Perera (Incentive Administrator)', '12-May-2026 11:20 IST', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-2', 'RUN-2026-06-SIM-2003', 'Attendance & Leave Import', 'Approved by HR', 'Approved by HR', TRUE, 'Niluka Senaratne (HR Manager)', '12-May-2026 15:45 IST', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-3', 'RUN-2026-06-SIM-2003', 'Service Performance Data', 'Locked by HOD', 'Locked by HOD', TRUE, 'Chaminda Warnakula (Service HOD)', '12-May-2026 16:10 IST', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-4', 'RUN-2026-06-SIM-2003', 'SAP B1 Debtor Aging Ledger', 'Synchronized', 'Synchronized (0-120+ Days)', TRUE, 'SAP Integration Engine', '12-May-2026 18:00 IST', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-2026-05-1', 'RUN-2026-05-PRE-01', 'Monthly Target Quotas', 'Locked & Approved', 'Locked & Approved', TRUE, 'Lakmal Perera (Incentive Administrator)', '12-May-2026 11:20 IST', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-2026-05-2', 'RUN-2026-05-PRE-01', 'Attendance & Leave Import', 'Approved by HR', 'Approved by HR', TRUE, 'Niluka Senaratne (HR Manager)', '12-May-2026 15:45 IST', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-2026-05-3', 'RUN-2026-05-PRE-01', 'Service Performance Data', 'Locked by HOD', 'Locked by HOD', TRUE, 'Chaminda Warnakula (Service HOD)', '12-May-2026 16:10 IST', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-2026-05-4', 'RUN-2026-05-PRE-01', 'SAP B1 Debtor Aging Ledger', 'Synchronized', 'Synchronized (0-120+ Days)', TRUE, 'SAP Integration Engine', '12-May-2026 18:00 IST', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_readiness_checks" ("id", "run_id", "module_name", "required_state", "current_state", "is_ready", "signer", "last_updated", "created_at") VALUES ('chk-RUN-TEST-1792734207418-1', 'RUN-TEST-1792734207418', 'Monthly Target Quotas', 'Locked & Approved', 'Locked & Approved', TRUE, 'Tester', '2026-06-30 09:00:00', '2026-10-23T05:43:27.421Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_run_scheme_summaries" (13 rows)
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-FIN-01-1-2478', 'RUN-2026-04-FIN-01', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Consumer Electronics', 12, 842, 485000, 320000, 25000, 780000, 1, '2026-10-22T16:15:22.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-FIN-01-2-2479', 'RUN-2026-04-FIN-01', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Commercial Air Conditioning', 10, 416, 1250000, 450000, 62000, 1638000, 2, '2026-10-22T16:15:22.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-FIN-01-3-2479', 'RUN-2026-04-FIN-01', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Consumer Electronics', 8, 363, 310000, 280000, 35000, 555000, 2, '2026-10-22T16:15:22.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-FIN-01-4-2480', 'RUN-2026-04-FIN-01', 'SCH-SOLAR-2026', 'Renewable Energy Solar Consultant Incentive', 'Renewable Energy', 4, 114, 820000, 190000, 0, 1010000, 0, '2026-10-22T16:15:22.435Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-M-2003-1', 'RUN-2026-06-SIM-2003', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Consumer Electronics', 12, 842, 485000, 320000, 25000, 780000, 1, '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-M-2003-2', 'RUN-2026-06-SIM-2003', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Commercial Air Conditioning', 10, 416, 1250000, 450000, 62000, 1638000, 2, '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-M-2003-3', 'RUN-2026-06-SIM-2003', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Consumer Electronics', 8, 363, 310000, 280000, 35000, 555000, 2, '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-M-2003-4', 'RUN-2026-06-SIM-2003', 'SCH-SOLAR-2026', 'Renewable Energy Solar Consultant Incentive', 'Renewable Energy', 4, 114, 820000, 190000, 0, 1010000, 0, '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-2026-05-1', 'RUN-2026-05-PRE-01', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Consumer Electronics', 12, 842, 485000, 320000, 25000, 780000, 1, '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-2026-05-2', 'RUN-2026-05-PRE-01', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Commercial Air Conditioning', 10, 416, 1250000, 450000, 62000, 1638000, 2, '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-2026-05-3', 'RUN-2026-05-PRE-01', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Consumer Electronics', 8, 363, 310000, 280000, 35000, 555000, 2, '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-2026-05-4', 'RUN-2026-05-PRE-01', 'SCH-SOLAR-2026', 'Renewable Energy Solar Consultant Incentive', 'Renewable Energy', 4, 114, 820000, 190000, 0, 1010000, 0, '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_scheme_summaries" ("id", "run_id", "scheme_code", "scheme_name", "division", "participants", "documents_read", "gross_commission", "target_incentive", "penalty", "net_payable", "warnings_count", "created_at") VALUES ('sum-207418-1', 'RUN-TEST-1792734207418', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Consumer Electronics', 5, 250, 300000, 150000, 10000, 440000, 0, '2026-10-23T05:43:27.421Z') ON CONFLICT DO NOTHING;

-- Data for table "calculation_run_warnings" (6 rows)
INSERT INTO "calculation_run_warnings" ("id", "run_id", "code", "scheme_code", "participant_name", "severity", "message", "remediation", "created_at") VALUES ('wrn-1792731356338-1', 'RUN-2026-06-SIM-2003', 'WRN-ATT-01', 'SCH-SRV-2026', 'Dilshan Madusanka (EMP-1024)', 'High', 'Unapproved leave proration applied (0% factor).', 'Verify with HR before final sign-off.', '2026-10-23T04:55:56.379Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_warnings" ("id", "run_id", "code", "scheme_code", "participant_name", "severity", "message", "remediation", "created_at") VALUES ('wrn-2026-05-1', 'RUN-2026-05-PRE-01', 'WRN-ATT-04', 'SCH-SRV-2026', 'Dilshan Madusanka (EMP-1024)', 'High', 'Technician logged 3 unapproved absent days; 0% attendance factor applied (INC-BCR-10 Proposed Demo Rule).', 'Verify with HR if authorized exemption applies before final payout sign-off.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_warnings" ("id", "run_id", "code", "scheme_code", "participant_name", "severity", "message", "remediation", "created_at") VALUES ('wrn-2026-05-2', 'RUN-2026-05-PRE-01', 'WRN-DEBT-12', 'SCH-CAC-2026', 'Pradeep Bandara (EMP-1022)', 'Medium', 'Invoice INV-2026-9042 overdue by 94 days; 15% debtor aging penalty deducted (LKR 28,500).', 'Recoverable upon customer settlement in upcoming settlement cycles.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_warnings" ("id", "run_id", "code", "scheme_code", "participant_name", "severity", "message", "remediation", "created_at") VALUES ('wrn-2026-05-3', 'RUN-2026-05-PRE-01', 'WRN-REP-02', 'SCH-SRV-2026', 'Mahesh Gunawardena (EMP-1030)', 'High', 'Repeat call #SRV-2026-1015 flagged as Poor Workmanship; job excluded from eligible count.', 'HOD classification confirmed after callback inspection.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_warnings" ("id", "run_id", "code", "scheme_code", "participant_name", "severity", "message", "remediation", "created_at") VALUES ('wrn-2026-05-4', 'RUN-2026-05-PRE-01', 'WRN-TGT-01', 'SCH-SLS-2026', 'Kasun Jayawardena (EMP-1021)', 'Low', 'Turnover achievement reached 164.2%; incentive capped at Tier 5 Super Achiever slab ceiling.', 'Informational only; payout capped as configured in Target Slab Table.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "calculation_run_warnings" ("id", "run_id", "code", "scheme_code", "participant_name", "severity", "message", "remediation", "created_at") VALUES ('wrn-2026-05-5', 'RUN-2026-05-PRE-01', 'WRN-DEBT-18', 'SCH-CAC-2026', 'Ruwan Wijesinghe (EMP-1023)', 'Medium', 'Partial payment receipt detected on invoice INV-2026-8911; pro-rata commission calculated.', 'Remaining balance will calculate upon subsequent collection.', '2026-10-23T05:43:00.806Z') ON CONFLICT DO NOTHING;

-- Data for table "checklist_templates" (3 rows)
INSERT INTO "checklist_templates" ("id", "templateCode", "name", "equipmentCategory", "serviceType", "version", "active", "status", "createdAt", "updatedAt") VALUES (4, 'CHK-PM-VRV-01', 'VRV / VRF Quarterly Preventive Maintenance Checklist', 'Commercial VRF Air Conditioning', 'Preventive Maintenance', 1, 'Yes', 'Active', '2026-10-28T03:14:56.188Z', '2026-10-28T03:14:56.188Z') ON CONFLICT DO NOTHING;
INSERT INTO "checklist_templates" ("id", "templateCode", "name", "equipmentCategory", "serviceType", "version", "active", "status", "createdAt", "updatedAt") VALUES (5, 'CHK-SITE-INSP-01', 'Pre-Installation Site Readiness & Heat Load Audit', 'Commercial VRF Air Conditioning', 'Installation', 1, 'Yes', 'Active', '2026-10-28T03:14:56.190Z', '2026-10-28T03:14:56.190Z') ON CONFLICT DO NOTHING;
INSERT INTO "checklist_templates" ("id", "templateCode", "name", "equipmentCategory", "serviceType", "version", "active", "status", "createdAt", "updatedAt") VALUES (6, 'CHK-CHILLER-COMM', 'Chiller Commissioning & Pressure Test Protocol', 'Industrial Chiller', 'Installation', 1, 'Yes', 'Active', '2026-10-28T03:14:56.192Z', '2026-10-28T03:14:56.192Z') ON CONFLICT DO NOTHING;

-- Data for table "commission_rate_matrices" (1 rows)
INSERT INTO "commission_rate_matrices" ("id", "scheme_code", "matrix_name", "version", "row_dimension", "column_dimension", "rate_unit", "currency", "status", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('mat-solar-q4', 'SCH-MOB-2027', 'Commercial Solar Inverter & ESS Matrix', 'v0.3', 'Capacity Band + Item Type', 'Payment-term / Credit-age Bands', '% of Net Invoiced Value', 'USD ($)', 'Approved', 'Standard commission rate matrix for Commercial Solar Inverters and Storage Modules.', 'Ayesha Asarak', 'Marcus Wong', '2026-10-22T05:41:55.482Z', '2026-10-22T05:53:34.684Z') ON CONFLICT DO NOTHING;

-- Data for table "customers" (4 rows)
INSERT INTO "customers" ("id", "customerCode", "customerName", "customerGroup", "territory", "mobile", "nicBrNo", "customerType", "grade", "firstChannel", "preferredChannel", "customerOrigin", "relationshipStatus", "paymentHold", "balanceLkr", "status", "createdAt", "updatedAt") VALUES (1, 'C-30512', 'Jayasuriya Textiles (Pvt) Ltd', 'Corporate Commercial', 'Western - Colombo Central', '+94 77 123 4567', 'PV-8891042', 'Corporate Enterprise', 'Tier 1 - Platinum VIP', 'Field Sales Rep', 'Dedicated Hotline', 'Telesonic-sold', 'Active', 'No', 1250000, 'Active', '2026-10-21T23:54:37.995Z', '2026-10-21T23:54:37.995Z') ON CONFLICT DO NOTHING;
INSERT INTO "customers" ("id", "customerCode", "customerName", "customerGroup", "territory", "mobile", "nicBrNo", "customerType", "grade", "firstChannel", "preferredChannel", "customerOrigin", "relationshipStatus", "paymentHold", "balanceLkr", "status", "createdAt", "updatedAt") VALUES (2, 'C-30513', 'Perera Holdings (Pvt) Ltd', 'Corporate Commercial', 'Western - Colombo Central', '+94 71 555 8899', 'PV-1290381', 'Corporate Enterprise', 'Tier 2 - Strategic Gold', 'Service Desk Walk-in', 'WhatsApp / SMS', 'Telesonic-sold', 'Active', 'No', 45000, 'Active', '2026-10-21T23:54:38.004Z', '2026-10-21T23:54:38.004Z') ON CONFLICT DO NOTHING;
INSERT INTO "customers" ("id", "customerCode", "customerName", "customerGroup", "territory", "mobile", "nicBrNo", "customerType", "grade", "firstChannel", "preferredChannel", "customerOrigin", "relationshipStatus", "paymentHold", "balanceLkr", "status", "createdAt", "updatedAt") VALUES (3, 'C-30514', 'Kandy Lake Hotel', 'Hospitality & Leisure', 'Central - Kandy Valley', '+94 81 223 4567', 'PV-5544332', 'Corporate Enterprise', 'Tier 1 - Platinum VIP', 'Field Sales Rep', 'Email Dispatch', 'Telesonic-sold', 'Active', 'No', 0, 'Active', '2026-10-21T23:54:38.007Z', '2026-10-21T23:54:38.007Z') ON CONFLICT DO NOTHING;
INSERT INTO "customers" ("id", "customerCode", "customerName", "customerGroup", "territory", "mobile", "nicBrNo", "customerType", "grade", "firstChannel", "preferredChannel", "customerOrigin", "relationshipStatus", "paymentHold", "balanceLkr", "status", "createdAt", "updatedAt") VALUES (5, 'cst01', 'ayesha', 'Retail Franchise', NULL, '011234567', '123456789v', 'Small Business', NULL, NULL, NULL, 'Telesonic-sold', 'Active', 'No', 0, 'Active', '2026-10-22T00:11:44.515Z', '2026-10-22T00:11:44.515Z') ON CONFLICT DO NOTHING;

-- Data for table "contact_persons" (8 rows)
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (1, 1, 'C-30512', 'Ms. Dilani Silva', 'Facilities & Plant Manager', '+94 76 402 1133', 'dilani.s@jayasuriya.lk', 'Site EQ-018834 (Colombo Central)', 'Yes', '2026-01-15', 'Active', '2026-10-22T00:34:28.018Z', '2026-10-22T00:34:28.018Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (2, 1, 'C-30512', 'Mr. Ruwan Perera', 'Chief Electrical Engineer', '+94 71 555 8898', 'ruwan.p@jayasuriya.lk', 'Main Factory Warehouse', 'Yes', '2025-06-01', 'Active', '2026-10-22T00:34:28.022Z', '2026-10-22T00:34:28.022Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (3, 2, 'C-30513', 'Mr. Samantha Bandara', 'Senior Operations Director', '+94 77 999 4433', 'samantha@pereraholdings.lk', 'Headquarters Tower 1', 'Yes', '2026-02-01', 'Active', '2026-10-22T00:34:28.025Z', '2026-10-22T00:34:28.025Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (4, 5, 'cst01 (ayesha)', 'test contact', NULL, '0713840329', NULL, NULL, 'Yes', NULL, 'Active', '2026-10-22T01:28:08.385Z', '2026-10-22T01:28:08.385Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (5, 5, 'cst01 (ayesha)', 'tst2', NULL, '1234567890', NULL, NULL, 'Yes', '2026-10-22', 'Active', '2026-10-22T01:31:42.658Z', '2026-10-22T01:49:27.419Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (6, 5, 'cst01 (ayesha)', 'test 3', NULL, '7894561233', NULL, NULL, 'Yes', NULL, 'Active', '2026-10-22T01:58:41.029Z', '2026-10-22T01:58:41.029Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (7, 5, 'cst01 (ayesha)', 'test 4', NULL, '7894561231', NULL, NULL, 'Yes', NULL, 'Active', '2026-10-22T01:59:21.486Z', '2026-10-22T01:59:21.486Z') ON CONFLICT DO NOTHING;
INSERT INTO "contact_persons" ("id", "customerId", "customerCode", "contactName", "position", "mobile", "email", "site", "active", "validFrom", "status", "createdAt", "updatedAt") VALUES (8, 5, 'cst01 (ayesha)', 'test99', NULL, '6549873212', NULL, NULL, 'Yes', NULL, 'Active', '2026-10-22T02:52:05.097Z', '2026-10-22T02:52:05.097Z') ON CONFLICT DO NOTHING;

-- Data for table "contract_templates" (2 rows)
INSERT INTO "contract_templates" ("id", "template", "contractKind", "visitsPerYear", "coverage", "responseHours", "billingBasis", "status", "createdAt", "updatedAt") VALUES (5, 'AMC-COMP-PREM-2026', 'Comprehensive AMC (Parts + Labour)', 4, '24/7 Priority Coverage', 4, 'Quarterly in Advance', 'Active', '2026-10-28T03:14:56.200Z', '2026-10-28T03:14:56.200Z') ON CONFLICT DO NOTHING;
INSERT INTO "contract_templates" ("id", "template", "contractKind", "visitsPerYear", "coverage", "responseHours", "billingBasis", "status", "createdAt", "updatedAt") VALUES (6, 'AMC-LABOUR-STD-2026', 'Non-Comprehensive Service Contract (Labour Only)', 4, 'Business Hours 8x5', 8, 'Annually in Advance', 'Active', '2026-10-28T03:14:56.202Z', '2026-10-28T03:14:56.202Z') ON CONFLICT DO NOTHING;

-- Data for table "cost_element_mappings" (4 rows)
INSERT INTO "cost_element_mappings" ("id", "costElement", "description", "glAccount", "revenueCost", "requiresCallRef", "status", "createdAt", "updatedAt") VALUES (6, 'CE-SPAREPARTS', 'Spare Parts Consumption Cost', 'GL-510100 - Cost of Spare Parts', 'Expense', 'Yes', 'Active', '2026-10-28T03:14:56.208Z', '2026-10-28T03:14:56.208Z') ON CONFLICT DO NOTHING;
INSERT INTO "cost_element_mappings" ("id", "costElement", "description", "glAccount", "revenueCost", "requiresCallRef", "status", "createdAt", "updatedAt") VALUES (7, 'CE-SUBCON-LABOUR', 'Outsourced Subcontractor Service Fee', 'GL-520400 - Subcontractor Charges', 'Expense', 'Yes', 'Active', '2026-10-28T03:14:56.210Z', '2026-10-28T03:14:56.210Z') ON CONFLICT DO NOTHING;
INSERT INTO "cost_element_mappings" ("id", "costElement", "description", "glAccount", "revenueCost", "requiresCallRef", "status", "createdAt", "updatedAt") VALUES (8, 'CE-TRAVEL-FUEL', 'Field Site Transport & Mileage', 'GL-530200 - Field Travel & Fuel', 'Expense', 'Yes', 'Active', '2026-10-28T03:14:56.212Z', '2026-10-28T03:14:56.212Z') ON CONFLICT DO NOTHING;
INSERT INTO "cost_element_mappings" ("id", "costElement", "description", "glAccount", "revenueCost", "requiresCallRef", "status", "createdAt", "updatedAt") VALUES (9, 'CE-AMC-REV', 'Annual Maintenance Contract Billing', 'GL-410100 - Service Contract Revenue', 'Revenue', 'Yes', 'Active', '2026-10-28T03:14:56.214Z', '2026-10-28T03:14:56.214Z') ON CONFLICT DO NOTHING;

-- Data for table "sites" (5 rows)
INSERT INTO "sites" ("id", "customerId", "customerCode", "customerName", "siteCode", "siteName", "building", "floor", "room", "addressLine1", "cityTown", "district", "province", "landmark", "gpsLatLong", "siteContact", "status", "createdAt", "updatedAt") VALUES (1, 1, 'C-30512', 'Jayasuriya Textiles (Pvt) Ltd', 'SITE-COL-0091', 'Spinning Plant - Block A', 'Industrial Zone Complex', 'Ground Floor & Mezzanine', 'Main Chiller Room 01', 'No 45/B, Temple Road, Ratmalana', 'Colombo', 'Colombo', 'Western', 'Near Airport Roundabout', '6.8227° N, 79.8860° E', 'Mr. K. Samarasinghe (071 555 8899)', 'Active', '2026-10-22T03:06:52.949Z', '2026-10-22T03:06:52.949Z') ON CONFLICT DO NOTHING;
INSERT INTO "sites" ("id", "customerId", "customerCode", "customerName", "siteCode", "siteName", "building", "floor", "room", "addressLine1", "cityTown", "district", "province", "landmark", "gpsLatLong", "siteContact", "status", "createdAt", "updatedAt") VALUES (2, 1, 'C-30512', 'Jayasuriya Textiles (Pvt) Ltd', 'SITE-NEG-0042', 'Negombo Weaving Mill', 'North Wing', '1st Floor', 'Compressor Bay 2', '12 Beach Road, Katunayake', 'Negombo', 'Gampaha', 'Western', 'Opposite Export Processing Zone Gate 2', '7.1725° N, 79.8856° E', 'Ms. Dilani Silva (076 402 1133)', 'Active', '2026-10-22T03:06:52.954Z', '2026-10-22T03:06:52.954Z') ON CONFLICT DO NOTHING;
INSERT INTO "sites" ("id", "customerId", "customerCode", "customerName", "siteCode", "siteName", "building", "floor", "room", "addressLine1", "cityTown", "district", "province", "landmark", "gpsLatLong", "siteContact", "status", "createdAt", "updatedAt") VALUES (3, 2, 'C-30513', 'Perera Holdings (Pvt) Ltd', 'SITE-KAN-0018', 'Perera Central Logistics Hub', 'Warehouse Complex 3', 'Ground Floor', 'Cold Storage Unit 1', '88 Peradeniya Road', 'Kandy', 'Kandy', 'Central', 'Near Botanical Gardens', '7.2683° N, 80.5960° E', 'Mr. Samantha Bandara (077 999 4433)', 'Active', '2026-10-22T03:06:52.956Z', '2026-10-22T03:06:52.956Z') ON CONFLICT DO NOTHING;
INSERT INTO "sites" ("id", "customerId", "customerCode", "customerName", "siteCode", "siteName", "building", "floor", "room", "addressLine1", "cityTown", "district", "province", "landmark", "gpsLatLong", "siteContact", "status", "createdAt", "updatedAt") VALUES (4, 5, 'cst01', 'ayesha', 'test0001', 'PBSS', NULL, NULL, NULL, 'biyagama road', 'kelaniya', 'Gampaha', 'Western', NULL, NULL, NULL, 'Active', '2026-10-22T03:26:41.815Z', '2026-10-22T03:26:41.815Z') ON CONFLICT DO NOTHING;
INSERT INTO "sites" ("id", "customerId", "customerCode", "customerName", "siteCode", "siteName", "building", "floor", "room", "addressLine1", "cityTown", "district", "province", "landmark", "gpsLatLong", "siteContact", "status", "createdAt", "updatedAt") VALUES (5, 5, 'cst01', 'ayesha', 'test 002', 'PBSS 2', NULL, NULL, NULL, 'kottawa', 'pannipitiya', 'Colombo', 'Western', NULL, NULL, NULL, 'Active', '2026-10-22T03:28:15.031Z', '2026-10-22T03:33:09.322Z') ON CONFLICT DO NOTHING;

-- Data for table "equipment_systems" (1 rows)
INSERT INTO "equipment_systems" ("id", "systemId", "customerId", "customerName", "siteId", "siteName", "location", "equipmentCategory", "status", "installedDate", "commissionedDate", "warrantyStart", "warrantyEnd", "contract", "project", "createdAt", "updatedAt") VALUES (3, 'sys00001', 5, 'ayesha', 4, 'PBSS', NULL, 'qwe', 'Active', '2026-10-23', '2026-10-23', '2026-10-23', '2026-10-31', NULL, NULL, '2026-10-22T22:49:20.297Z', '2026-10-22T22:49:20.297Z') ON CONFLICT DO NOTHING;

-- Data for table "items" (5 rows)
INSERT INTO "items" ("id", "itemCode", "itemName", "itemGroup", "brand", "model", "equipmentCategory", "componentRole", "serviceable", "warrantyMonths", "componentWarrantyMonths", "serialManaged", "status", "createdAt", "updatedAt") VALUES (1, 'FLT-0921-FLT', 'High Efficiency Carbon Filter 24x24', 'Service Spare Parts', 'Carrier', 'FLT-CAR-V4', 'Air Conditioning Commercial', 'Consumables', 'Yes', 12, 6, 'Yes', 'Active', '2026-10-22T03:36:37.406Z', '2026-10-22T03:36:37.406Z') ON CONFLICT DO NOTHING;
INSERT INTO "items" ("id", "itemCode", "itemName", "itemGroup", "brand", "model", "equipmentCategory", "componentRole", "serviceable", "warrantyMonths", "componentWarrantyMonths", "serialManaged", "status", "createdAt", "updatedAt") VALUES (2, 'SP-COMP-18K', 'Rotary Inverter Compressor 18000 BTU R410A', 'Service Spare Parts', 'Toshiba', 'TOS-COMP-18', 'Air Conditioning Commercial', 'Compressor', 'Yes', 60, 60, 'Yes', 'Active', '2026-10-22T03:36:37.414Z', '2026-10-22T03:36:37.414Z') ON CONFLICT DO NOTHING;
INSERT INTO "items" ("id", "itemCode", "itemName", "itemGroup", "brand", "model", "equipmentCategory", "componentRole", "serviceable", "warrantyMonths", "componentWarrantyMonths", "serialManaged", "status", "createdAt", "updatedAt") VALUES (3, 'AC-SPLIT-18K-INV', 'Inverter Split Air Conditioner 18000 BTU Complete', 'Finished Equipment', 'Midea', 'MID-18-INV', 'Air Conditioning Commercial', 'Complete Unit', 'Yes', 24, 120, 'Yes', 'Active', '2026-10-22T03:36:37.417Z', '2026-10-22T03:36:37.417Z') ON CONFLICT DO NOTHING;
INSERT INTO "items" ("id", "itemCode", "itemName", "itemGroup", "brand", "model", "equipmentCategory", "componentRole", "serviceable", "warrantyMonths", "componentWarrantyMonths", "serialManaged", "status", "createdAt", "updatedAt") VALUES (4, 'GAS-R410A-CYL', 'Refrigerant Gas R410A 11.3kg Cylinder', 'Consumables', 'Carrier', 'R410A-11KG', 'Air Conditioning Commercial', 'Consumables', 'No', 0, 0, 'No', 'Active', '2026-10-22T03:36:37.419Z', '2026-10-22T03:36:37.419Z') ON CONFLICT DO NOTHING;
INSERT INTO "items" ("id", "itemCode", "itemName", "itemGroup", "brand", "model", "equipmentCategory", "componentRole", "serviceable", "warrantyMonths", "componentWarrantyMonths", "serialManaged", "status", "createdAt", "updatedAt") VALUES (5, 'test ietm', 'item name', 'Accessories', 'Toshiba', NULL, 'ac', NULL, 'Yes', 12, 6, 'Yes', 'Active', '2026-10-22T04:01:37.451Z', '2026-10-22T04:01:37.451Z') ON CONFLICT DO NOTHING;

-- Data for table "serials" (7 rows)
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (1, 'BSH-CTRL-00872', 2, 'SP-COMP-18K', 'Rotary Inverter Compressor 18000 BTU R410A', 'Installed', 'VAN-KSILVA (Field Stock)', 1, 'Jayasuriya Textiles (Pvt) Ltd', NULL, 'Colombo 03 Head Office', 'CNT-2026-07', 'Main Compressor Unit', '2026-10-03', 'BSH-CTRL-00412 (Burned Coil)', '—', '2026-10-22T10:24:24.911Z', '2026-10-22T10:24:24.911Z') ON CONFLICT DO NOTHING;
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (2, 'CAR-VRF-99014', NULL, 'AC-CAR-36K', 'Carrier 36000 BTU Commercial VRF', 'Installed', 'Central Stores', NULL, 'Apex Apparel Lanka (Pvt) Ltd', NULL, 'Biyagama Export Processing Zone', 'VRF-SYS-01', 'Outdoor Unit', '2026-01-15', '—', '—', '2026-10-22T10:24:24.916Z', '2026-10-22T10:24:24.916Z') ON CONFLICT DO NOTHING;
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (3, 'MID-INV-55210', NULL, 'MID-INV-18K', 'Midea 18000 BTU Inverter Split Unit', 'Available', 'Central Stores', NULL, 'Lanka Canneries PLC', NULL, 'Factory Complex Narahenpita', 'SPL-02', 'Complete Unit', '2026-06-10', '—', '—', '2026-10-22T10:24:24.917Z', '2026-10-22T10:24:24.917Z') ON CONFLICT DO NOTHING;
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (5, 'test 2', 4, 'GAS-R410A-CYL', 'Refrigerant Gas R410A 11.3kg Cylinder', 'Delivered', 'Customer Site Installed', 3, 'Kandy Lake Hotel', NULL, NULL, NULL, 'Indoor Evaporator', NULL, NULL, NULL, '2026-10-22T05:20:12.486Z', '2026-10-22T05:20:12.486Z') ON CONFLICT DO NOTHING;
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (4, 'test sn', 5, 'test ietm', 'item name', 'Available', 'Customer Site Installed', 5, 'ayesha', NULL, NULL, NULL, 'Control Panel', '2026-10-22', NULL, NULL, '2026-10-22T05:16:51.581Z', '2026-10-22T05:16:51.581Z') ON CONFLICT DO NOTHING;
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (6, 'test 3', 5, 'test ietm', 'item name', 'Delivered', 'Central Stores', 5, 'ayesha', NULL, NULL, NULL, 'Indoor Evaporator', NULL, NULL, NULL, '2026-10-22T05:22:19.108Z', '2026-10-22T05:22:19.108Z') ON CONFLICT DO NOTHING;
INSERT INTO "serials" ("id", "serialNo", "itemId", "itemCode", "itemName", "status", "warehouse", "customerId", "customerName", "siteId", "siteName", "systemId", "componentRole", "warrantyStart", "replacesSerial", "replacedBy", "createdAt", "updatedAt") VALUES (7, 'test 5', 5, 'test ietm', 'item name', 'Scrapped', 'Central Stores', 5, 'ayesha', NULL, '—', NULL, 'Main Compressor Unit', '2026-10-22', NULL, NULL, '2026-10-22T05:47:08.914Z', '2026-10-22T12:13:12.550Z') ON CONFLICT DO NOTHING;

-- Data for table "equipments" (4 rows)
INSERT INTO "equipments" ("id", "equipmentId", "customerId", "customerName", "siteId", "siteName", "itemCategory", "brand", "model", "serialId", "serialNo", "origin", "serviceProvider", "installedDate", "commissionedDate", "warrantyTo", "relationship", "systemId", "meterReading", "status", "createdAt", "updatedAt") VALUES (1, 'testeq001', 3, 'Kandy Lake Hotel', 3, 'Perera Central Logistics Hub', 'Commercial Refrigeration 400L', 'Carrier', 'REF-400-INV', 3, 'MID-INV-55210', 'Telesonic-originated', 'Telesonic In-House SRE', '2026-09-12', '2026-09-20', '2027-09-20', 'Active Under Warranty', 'SYS-KANDY-01', 1420, 'Installed', '2026-10-22T17:54:39.680Z', '2026-10-22T12:36:59.574Z') ON CONFLICT DO NOTHING;
INSERT INTO "equipments" ("id", "equipmentId", "customerId", "customerName", "siteId", "siteName", "itemCategory", "brand", "model", "serialId", "serialNo", "origin", "serviceProvider", "installedDate", "commissionedDate", "warrantyTo", "relationship", "systemId", "meterReading", "status", "createdAt", "updatedAt") VALUES (4, 'test eq 000001', 5, 'ayesha', 4, 'PBSS', 'fghj', 'Toshiba', 'efdwdf', NULL, 'qsfc', 'Telesonic-originated', 'Telesonic In-House SRE', '2026-10-26', '2026-10-26', NULL, 'Active Under Warranty', NULL, 3, 'Installed', '2026-10-28T02:42:16.453Z', '2026-10-28T02:42:16.453Z') ON CONFLICT DO NOTHING;
INSERT INTO "equipments" ("id", "equipmentId", "customerId", "customerName", "siteId", "siteName", "itemCategory", "brand", "model", "serialId", "serialNo", "origin", "serviceProvider", "installedDate", "commissionedDate", "warrantyTo", "relationship", "systemId", "meterReading", "status", "createdAt", "updatedAt") VALUES (5, 'EQ-C30512-01', 1, 'Jayasuriya Textiles (Pvt) Ltd', 1, 'Spinning Plant - Block A', 'Commercial VRF Air Conditioning', 'Daikin', 'VRV IV-X 18HP', NULL, 'SN-100981', 'Telesonic-originated', 'Telesonic In-House SRE', '2026-01-15', '2026-01-20', '2027-01-20', 'Active Under Warranty', NULL, 0, 'Installed', '2026-10-28T03:14:56.142Z', '2026-10-28T03:14:56.142Z') ON CONFLICT DO NOTHING;
INSERT INTO "equipments" ("id", "equipmentId", "customerId", "customerName", "siteId", "siteName", "itemCategory", "brand", "model", "serialId", "serialNo", "origin", "serviceProvider", "installedDate", "commissionedDate", "warrantyTo", "relationship", "systemId", "meterReading", "status", "createdAt", "updatedAt") VALUES (6, 'EQ-C30513-01', 2, 'Perera Holdings (Pvt) Ltd', 3, 'Perera Central Logistics Hub', 'Commercial VRF Air Conditioning', 'Daikin', 'VRV IV-X 18HP', NULL, 'SN-200981', 'Telesonic-originated', 'Telesonic In-House SRE', '2026-01-15', '2026-01-20', '2027-01-20', 'Active Under Warranty', NULL, 0, 'Installed', '2026-10-28T03:14:56.150Z', '2026-10-28T03:14:56.150Z') ON CONFLICT DO NOTHING;

-- Data for table "franchise_warehouses" (3 rows)
INSERT INTO "franchise_warehouses" ("id", "franchiseBp", "franchiseName", "warehouse", "stockOwnership", "region", "countFrequency", "auditor", "active", "status", "createdAt", "updatedAt") VALUES (6, 'FRAN-KANDY-01', 'Central Region CoolTech Franchise - Kandy', 'WH-KANDY-FRAN-01', 'Telesonic Consignment Stock', 'Central Province', 'Monthly Physical Audit', 'Kasun Perera', 'Yes', 'Active', '2026-10-28T03:14:56.215Z', '2026-10-28T03:14:56.215Z') ON CONFLICT DO NOTHING;
INSERT INTO "franchise_warehouses" ("id", "franchiseBp", "franchiseName", "warehouse", "stockOwnership", "region", "countFrequency", "auditor", "active", "status", "createdAt", "updatedAt") VALUES (7, 'FRAN-GALLE-02', 'Southern HVAC Partner - Galle', 'WH-GALLE-FRAN-02', 'Telesonic Consignment Stock', 'Southern Province', 'Monthly Physical Audit', 'Nuwan Silva', 'Yes', 'Active', '2026-10-28T03:14:56.218Z', '2026-10-28T03:14:56.218Z') ON CONFLICT DO NOTHING;
INSERT INTO "franchise_warehouses" ("id", "franchiseBp", "franchiseName", "warehouse", "stockOwnership", "region", "countFrequency", "auditor", "active", "status", "createdAt", "updatedAt") VALUES (8, 'WH-CENTRAL-COL', 'Telesonic Central Stores - Colombo', 'WH-COL-MAIN-01', 'Telesonic Consignment Stock', 'Western Province', 'Monthly Physical Audit', 'Kasun Perera', 'Yes', 'Active', '2026-10-28T03:14:56.220Z', '2026-10-28T03:14:56.220Z') ON CONFLICT DO NOTHING;

-- Data for table "google_meet_settings" (1 rows)
INSERT INTO "google_meet_settings" ("id", "workspaceDomain", "organiserAccount", "authMethod", "defaultDuration", "inviteCustomer", "inviteFranchise", "retryCount", "enabled", "status", "createdAt", "updatedAt") VALUES (3, 'wthyhrrtt', 'grrf', 'Google Cloud Service Account JWT', 45, 'Yes', 'Yes', 2, 'Yes', 'Active', '2026-10-23T04:12:16.556Z', '2026-10-23T04:12:16.556Z') ON CONFLICT DO NOTHING;

-- Data for table "hold_reasons" (5 rows)
INSERT INTO "hold_reasons" ("id", "reasonCode", "description", "customerWording", "excludeFromSla", "maxHoldDays", "active", "status", "createdAt", "updatedAt") VALUES (2, 'hr0001', 'powercut', 'qwer', 'Yes (Clock Paused)', 3, 'No', 'Inactive', '2026-10-23T00:31:47.780Z', '2026-10-23T00:59:02.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "hold_reasons" ("id", "reasonCode", "description", "customerWording", "excludeFromSla", "maxHoldDays", "active", "status", "createdAt", "updatedAt") VALUES (6, 'HLD-PARTS-AWAITED', 'Awaiting Spare Parts from Central Store', 'Waiting for replacement component', 'Yes (Clock Paused)', 14, 'Yes', 'Active', '2026-10-28T03:14:56.173Z', '2026-10-28T03:14:56.173Z') ON CONFLICT DO NOTHING;
INSERT INTO "hold_reasons" ("id", "reasonCode", "description", "customerWording", "excludeFromSla", "maxHoldDays", "active", "status", "createdAt", "updatedAt") VALUES (7, 'HLD-CUST-ACCESS', 'Customer Site Access Unavailable', 'Awaiting site access confirmation', 'Yes (Clock Paused)', 14, 'Yes', 'Active', '2026-10-28T03:14:56.175Z', '2026-10-28T03:14:56.175Z') ON CONFLICT DO NOTHING;
INSERT INTO "hold_reasons" ("id", "reasonCode", "description", "customerWording", "excludeFromSla", "maxHoldDays", "active", "status", "createdAt", "updatedAt") VALUES (8, 'HLD-QUOTE-APPROVAL', 'Awaiting Customer Quotation Approval', 'Pending estimate approval', 'Yes (Clock Paused)', 14, 'Yes', 'Active', '2026-10-28T03:14:56.177Z', '2026-10-28T03:14:56.177Z') ON CONFLICT DO NOTHING;
INSERT INTO "hold_reasons" ("id", "reasonCode", "description", "customerWording", "excludeFromSla", "maxHoldDays", "active", "status", "createdAt", "updatedAt") VALUES (9, 'HLD-WORKSHOP-REPAIR', 'Unit Pulled to Central Workshop', 'Under workshop bench repair', 'Yes (Clock Paused)', 14, 'Yes', 'Active', '2026-10-28T03:14:56.179Z', '2026-10-28T03:14:56.179Z') ON CONFLICT DO NOTHING;

-- Data for table "jobs" (11 rows)
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20513', 'Jayasuriya Textiles', '+94 31 228 1122 (Mr. Jayasuriya)', 'Negombo', 'Tomorrow, 10:00 - 12:00', 'Normal', 'Assistant Technician', 'Accepted', 'Packing Machine (Main Unit + Controller)', 'Factory Floor - Bay 3', '88 Main Street, Negombo', 'Nimal Perera', '2026-10-22', 'synced', '2026-10-20T23:34:07.244Z', 1, '2026-10-20T23:34:07.246Z', '2026-10-20T23:34:07.246Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20510', 'Galle Fort Residences', '+94 91 224 5511 (Villa Manager)', 'Galle', 'Yesterday, 11:00 - 13:00', 'Normal', 'Lead Technician', 'Completed', 'Washing Machine 8kg (Main Unit)', 'Villa 04 Utility Room', '14 Rampart Street, Galle Fort', 'Nimal Perera', '2026-10-20', 'synced', '2026-10-20T23:34:07.250Z', 1, '2026-10-20T23:34:07.251Z', '2026-10-20T23:34:07.251Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-SYNC-01', 'Sync Enterprise Lanka', NULL, 'Colombo 03', '10:00 - 12:00', 'Normal', 'Technician', 'Completed', 'Chiller', NULL, 'Galle Road, Colombo', 'Nimal Perera', '2026-10-20', 'synced', '2026-10-27T22:20:18.694Z', 1, '2026-10-27T22:20:18.668Z', '2026-10-27T22:20:18.694Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20521', 'ayesha (cst01)', 'test 3 (7894561233)', 'Biyagama', 'Today, 09:00 - 11:30', 'Critical', 'Lead Technician', 'Assigned', 'Toshiba efdwdf (SN: qsfc)', 'PBSS Biyagama Facility', 'PBSS, biyagama road', 'Nalin Chathuranga', '2026-10-28', 'synced', NULL, 1, '2026-10-28T04:51:24.069Z', '2026-10-28T04:51:24.069Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20512', 'Perera Holdings (Pvt) Ltd', '+94 11 257 8900 (Ms. Fernando - IT Manager)', 'Colombo 03', 'Today, 14:00 - 16:00', 'Critical', 'Lead Technician', 'Accepted', 'Refrigerator 400L (Cabinet + Compressor)', 'Main Server Room - B1 Level', '45 Galle Road, Colombo 03', 'Nimal Perera', '2026-10-26', 'synced', '2026-10-26T05:38:31.229Z', 1, '2026-10-20T23:34:07.243Z', '2026-10-26T05:38:31.229Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20511', 'Kandy Lake Hotel', '+94 81 223 4567 (Mr. Silva - Chief Engineer)', 'Kandy', 'Today, 09:00 - 11:00', 'High', 'Lead Technician', 'On Hold', 'VRF System (Outdoor + 6 Indoor)', 'Lake Wing Executive Lounge', 'No. 12, Sangamitta Mawatha, Kandy', 'Nimal Perera', '2026-10-26', 'synced', '2026-10-26T05:41:46.980Z', 1, '2026-10-20T23:34:07.238Z', '2026-10-26T05:41:46.980Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20514', 'Wijesinghe Motors', '+94 91 223 9988 (Mr. Wijesinghe)', 'Galle', 'Tomorrow, 13:30 - 15:30', 'High', 'Lead Technician', 'On Hold', 'Crew Cab Vehicle (Chassis + Engine)', 'Service Bay 02', '22 Matara Road, Galle', 'Nimal Perera', '2026-10-24', 'synced', '2026-10-23T10:28:05.637Z', 1, '2026-10-20T23:34:07.248Z', '2026-10-23T10:28:05.637Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20522', 'Ceylon Agro Machinery PLC (C-20014)', 'Mr. Bandara (011-2445566)', 'Colombo 02', 'Today, 13:30 - 16:00', 'High', 'Lead Technician', 'Assigned', 'Carrier AquaForce 30XW Chiller', 'Nawam Mawatha Plant Room', 'No. 45/A, Nawam Mawatha, Colombo 02', 'Nalin Chathuranga', '2026-10-28', 'synced', NULL, 1, '2026-10-28T04:51:24.075Z', '2026-10-28T04:51:24.075Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20520', 'Rajapaksha Clinic & Diagnostic Labs (C-30512)', 'Dr. Nimal Rajapaksha', 'Kandy', 'Yesterday, 10:00 - 12:30', 'Normal', 'Lead Technician', 'Completed', 'Daikin VRV IV-X System', 'Diagnostic Lab Wing A', 'No. 142/B, Peradeniya Road, Kandy', 'Nalin Chathuranga', '2026-10-28', 'synced', NULL, 1, '2026-10-28T04:51:24.077Z', '2026-10-28T04:51:24.077Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20531', 'ayesha (cst01)', 'test 3 (7894561233)', 'Biyagama', 'Today, 10:00 - 12:00', 'High', 'Lead Technician', 'Assigned', 'Daikin VRV IV-X Outdoor Unit', 'PBSS Main Building', 'PBSS, biyagama road', 'vihasna', '2026-10-28', 'synced', NULL, 1, '2026-10-28T04:51:24.080Z', '2026-10-28T04:51:24.080Z') ON CONFLICT DO NOTHING;
INSERT INTO "jobs" ("id", "customerName", "customerContact", "town", "window", "priority", "role", "status", "category", "siteName", "siteAddress", "technicianName", "scheduledDate", "syncStatus", "syncedAt", "version", "createdAt", "updatedAt") VALUES ('SC-2026-20541', 'Kandy Lake Hotel (C-30514)', 'Mr. Silva (Chief Engineer)', 'Kandy', 'Today, 11:00 - 14:00', 'Normal', 'Lead Technician', 'Assigned', 'Split AC 24000 BTU', 'Banquet Hall', 'No. 12, Sangamitta Mawatha, Kandy', 'saman kumara', '2026-10-28', 'synced', NULL, 1, '2026-10-28T04:51:24.082Z', '2026-10-28T04:51:24.082Z') ON CONFLICT DO NOTHING;

-- Data for table "hold_requests" (2 rows)
INSERT INTO "hold_requests" ("id", "jobId", "reason", "notes", "estimatedDelayHours", "requestedAt", "status") VALUES ('HR-101', 'SC-2026-20514', 'Awaiting Spare Parts', 'Compressor capacitor 45uF not available in van stock. Ordered from Colombo central store.', 24, '2026-10-12T09:00:00.000Z', 'Approved') ON CONFLICT DO NOTHING;
INSERT INTO "hold_requests" ("id", "jobId", "reason", "notes", "estimatedDelayHours", "requestedAt", "status") VALUES ('HR-6940', 'SC-2026-20511', 'Awaiting Spare Parts', 'Compressor capacitor 45uF not available in van stock. Ordered from central warehouse.', 24, '2026-10-26T05:41:00.000Z', 'Submitted') ON CONFLICT DO NOTHING;

-- Data for table "incentive_audit_logs" (9 rows)
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-001', '2026-04-01T03:45:22.000Z', 'Scheme Master', 'SCH-RLC-001', 'VERSION_BUMP', 'Bandhan Senaratne (HOD Sales)', 'HOD Sales', '172.16.0.45', 'HIGH', '{"version":"v1.0","effectiveTo":"2026-03-31","status":"Active"}', '{"version":"v1.1","effectiveFrom":"2026-04-01","status":"Active"}', 'Scheme revision v1.1 activated. Split ratio revised for multi-technician pool from 60/40 to 50/50 per HR circular.', 'v1.0 → v1.1', 'Verified', 'Authorized under Executive Committee approval ref: EXC-2026-03-29.', 'SHA256:8f41e0b9c23178ea819f0', '2026-10-23T11:21:42.919Z', '2026-10-23T11:21:42.919Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-002', '2026-04-02T06:00:10.000Z', 'Rate Matrix', 'MAT-RLC-2026', 'UPDATE', 'Nimal Perera (Finance Manager)', 'Finance Manager', '172.16.0.201', 'MEDIUM', '{"bracket_46_60":2.5}', '{"bracket_46_60":2.96}', 'Adjusted payment collection commission rate for Solar capacity band > 10kW to 2.96% for 46-60d debtor age.', 'v2.0', 'Verified', 'Verified against pricing committee circular 2026/04.', 'SHA256:3a91f4d0c11547ea819f0', '2026-10-23T11:21:42.921Z', '2026-10-23T11:21:42.921Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-003', '2026-04-05T08:50:00.000Z', 'Target & Quota', 'TGT-2026-04-RLC', 'APPROVE', 'Nihal Fernando (HOD Sales)', 'HOD Sales', '172.16.0.82', 'MEDIUM', '{"status":"Draft","targetPool":24000000}', '{"status":"Approved","targetPool":24500000}', 'Approved April 2026 monthly sales target entry for 42 sales executives across 4 regions.', 'v1.0', 'Verified', 'Approved target figures match annual operating plan (AOP) quotas.', 'SHA256:c221e9b8f04123ea819f0', '2026-10-23T11:21:42.923Z', '2026-10-23T11:21:42.923Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-004', '2026-04-15T11:15:00.000Z', 'Calculation Run', 'INC-RUN-2026-04-RLC', 'CALCULATE', 'System Automation (Batch Engine)', 'Incentive Administrator', '127.0.0.1', 'INFO', NULL, '{"participants":34,"grossIncentive":3745200,"netPayable":3438670}', 'Official batch calculation executed for April 2026. Realised receipt commissions computed with 3-month lag.', 'Batch-01', 'Verified', 'Automated batch run completed with 0 exceptions.', 'SHA256:4d88e1a2f30999ea819f0', '2026-10-23T11:21:42.925Z', '2026-10-23T11:21:42.925Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-005', '2026-04-18T04:35:40.000Z', 'Manual Adjustment', 'ADJ-2026-04-001', 'APPROVE', 'Kamal Wijeratne (HOD Service)', 'HOD Service', '172.16.0.60', 'HIGH', '{"status":"Pending","amount":15000}', '{"status":"Approved","amount":15000,"approver":"Kamal Wijeratne"}', 'Manual bonus claim approved for Senior Technician Chathura (EMP-018) for exceptional offshore installation.', 'ADJ-001', 'Verified', 'Dual sign-off confirmed by HOD Service and Finance.', 'SHA256:7b61a9d0e51244ea819f0', '2026-10-23T11:21:42.926Z', '2026-10-23T11:21:42.926Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-006', '2026-04-20T11:45:30.000Z', 'Multi-Level Approval', 'APP-2026-04-RLC', 'APPROVE', 'Dr. J. Silva (CEO)', 'CEO', '172.16.0.10', 'CRITICAL', '{"step":3,"approver":"Finance Manager","status":"Under Review"}', '{"step":4,"approver":"CEO","status":"Approved"}', 'Four-eyes approval pipeline completed. Final Stage 4 CEO authorization granted for LKR 3,438,670 payout.', 'SignOff-Final', 'Verified', 'All four required signatories present: HOD Sales, HOD Service, Finance Manager, CEO.', 'SHA256:9e01f2b3c45678ea819f0', '2026-10-23T11:21:42.927Z', '2026-10-23T11:21:42.927Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-007', '2026-04-21T04:00:00.000Z', 'GL Posting', 'POST-2026-04-RLC', 'LOCK_PERIOD', 'Nimal Perera (Finance Manager)', 'Finance Manager', '172.16.0.201', 'CRITICAL', '{"accrualJE":"Pending","periodLocked":false}', '{"accrualJE":"JE-2026-05-8412","periodLocked":true}', 'SAP Business One Accrual Journal Entry JE-2026-05-8412 posted. April 2026 locked as Immutable Ledger.', 'JE-Locked', 'Verified', 'Period lock successfully prevents further edits to calculation batch per INC-SCR-11.', 'SHA256:2f11d4e5a67890ea819f0', '2026-10-23T11:21:42.928Z', '2026-10-23T11:21:42.928Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-008', '2026-04-22T08:15:12.000Z', 'Penalty & Clawback', 'PEN-2026-04-001', 'CREATE', 'System Automation (Debtor Aging)', 'Incentive Administrator', '127.0.0.1', 'HIGH', NULL, '{"invoice":"INV-2026-08819","customer":"Lanka Solar Traders Ltd","ageDays":58,"penalty":7258}', 'Debtor penalty enforced for invoice INV-2026-08819 overdue past 45 days. Monthly repeat flag set.', 'PEN-2026-04', 'Verified', 'Enforced automatically per Page 38 validation rule.', 'SHA256:1a88c7d9e03321ea819f0', '2026-10-23T11:21:42.930Z', '2026-10-23T11:21:42.930Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_audit_logs" ("id", "timestamp", "entity_type", "entity_id", "action_type", "performed_by", "role", "terminal_ip", "severity", "old_value", "new_value", "diff_summary", "version_tag", "verification_status", "auditor_notes", "hash_checksum", "created_at", "updated_at") VALUES ('AUD-2026-04-009', '2026-04-23T09:40:45.000Z', 'Dispute Resolution', 'DSP-2026-04-001', 'UPDATE', 'M. Jayasinghe (Senior Accountant)', 'Finance', '172.16.0.205', 'MEDIUM', '{"status":"Under Investigation","approvedAmount":0}', '{"status":"Resolved","approvedAmount":12500}', 'Dispute resolved in favor of Thisara Tharanga (025). Receipt realisation timing confirmed within cutoff.', 'DSP-001', 'Verified', 'Credit adjustment scheduled for next payroll run.', 'SHA256:5e33b2a1c99877ea819f0', '2026-10-23T11:21:42.931Z', '2026-10-23T11:21:42.931Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_clawback_penalties" (7 rows)
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('PEN-2026-04-001', '044', 'Ishara Fernando', 'Retail & Dealer', '2026-04', 'Debtor Penalty', 'Penalty', 'INV-2026-08819', 'Lanka Solar Traders Ltd', 245000, 58, '46 - 60 days', 2.96, 7258, 'INC-RUN-2026-04-RLC', TRUE, 'Pending', NULL, NULL, 'Overdue debtor balance beyond 45-day credit terms. Repeats monthly until 100% settled.', '2026-10-23T10:20:01.179Z', '2026-10-23T10:20:01.179Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('PEN-2026-04-002', 'CAC-088', 'Ruwan Jayasinghe', 'Air Conditioning', '2026-04', 'Debtor Penalty', 'Penalty', 'INV-2026-09142', 'Central Hospital AC Project', 500000, 51, '46 - 60 days', 3, 15000, 'INC-RUN-2026-04-CAC', TRUE, 'Pending', NULL, NULL, 'Retention payment pending verification. Monthly 3.0% debtor penalty applied.', '2026-10-23T10:20:01.181Z', '2026-10-23T10:20:01.181Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('PEN-2026-04-003', '028', 'Suneth Alwis', 'Retail & Dealer', '2026-04', 'Debtor Penalty', 'Penalty', 'INV-2026-07412', 'Colombo Electronics Hub', 180000, 72, '61 - 90 days', 3.5, 6300, 'INC-RUN-2026-04-RLC', TRUE, 'Pending', NULL, NULL, 'Secondary aging bracket reached (>60 days). Escalated to regional sales manager.', '2026-10-23T10:20:01.183Z', '2026-10-23T10:20:01.183Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('CLW-2026-04-004', '031', 'Nuwan Dias', 'Modern Trade', '2026-04', 'Cheque Dishonour', 'Clawback', 'CHQ-SL3370', 'Apex Supermarket Superstore', 180000, 0, 'Dishonoured Cheque', 3.61, 6500, 'INC-RUN-2026-04-MTR', FALSE, 'Pending', NULL, NULL, 'Cheque returned unpaid with reason: Refer to Drawer. Immediate commission clawback.', '2026-10-23T10:20:01.184Z', '2026-10-23T10:20:01.184Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('CLW-2026-04-005', 'MHA-012', 'Kamal Perera', 'Retail & Dealer', '2026-04', 'Sales Return / Cancellation', 'Clawback', 'CM-2026-0104', 'Kandy Tech Plaza Ltd', 95000, 0, 'Credit Memo Reversal', 5, 4750, 'INC-RUN-2026-04-RLC', FALSE, 'Pending', NULL, NULL, 'Merchandise returned under warranty credit memo. Commission clawed back in full.', '2026-10-23T10:20:01.186Z', '2026-10-23T10:20:01.186Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('PEN-2026-03-006', 'CAC-045', 'Nalin Senanayake', 'Air Conditioning', '2026-03', 'Debtor Penalty', 'History', 'INV-2026-05118', 'Southern Resort & Spa', 320000, 65, '61 - 90 days', 2.5, 8000, 'INC-RUN-2026-03-CAC', FALSE, 'Settled', '2026-04-05T05:00:00.000Z', 'Finance Manager (Nimal Perera)', 'Fully deducted in March 2026 payroll run. Customer settled arrears in April.', '2026-10-23T10:20:01.187Z', '2026-10-23T10:20:01.187Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_clawback_penalties" ("id", "participant_code", "participant_name", "division", "period", "record_type", "tab_category", "invoice_no", "customer_name", "net_value", "due_age_days", "bracket", "rate_percent", "penalty_amount", "run_no", "is_recurring", "settlement_status", "settled_at", "settled_by", "resolution_remarks", "created_at", "updated_at") VALUES ('CLW-2026-03-007', '019', 'Priyantha Bandara', 'Retail & Dealer', '2026-03', 'Sales Return / Cancellation', 'History', 'CM-2026-0082', 'Galle Electricals Co', 64000, 0, 'Credit Memo Reversal', 4.5, 2880, 'INC-RUN-2026-03-RLC', FALSE, 'Waived', '2026-04-02T08:45:00.000Z', 'CEO Approval', 'Waived by executive exception: Goods exchanged rather than refunded.', '2026-10-23T10:20:01.188Z', '2026-10-23T10:20:01.188Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_dashboard_records" (5 rows)
INSERT INTO "incentive_dashboard_records" ("id", "participant_code", "display_name", "role", "division", "period", "volume_pct", "turnover_pct", "projected_commission", "invoices_over_45_days", "penalty_exposure", "base_target", "actual_achievement", "attendance_factor", "status", "notes", "created_at", "updated_at") VALUES ('DSH-2026-04-025', '025', 'Thisara Tharanga', 'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026', 192.5, 127.17, 187100, 0, 0, 18400000, 23399855, 1, 'Active', 'Top performer specimen from Page 34. 192.5% volume achievement with zero overdue penalties.', '2026-10-23T10:05:12.150Z', '2026-10-23T10:05:12.150Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_dashboard_records" ("id", "participant_code", "display_name", "role", "division", "period", "volume_pct", "turnover_pct", "projected_commission", "invoices_over_45_days", "penalty_exposure", "base_target", "actual_achievement", "attendance_factor", "status", "notes", "created_at", "updated_at") VALUES ('DSH-2026-04-031', '031', 'Nuwan Dias', 'Sales Executive - Dealer Seg 02', 'RLC Sales', 'April 2026', 160, 118, 214300, 0, 0, 16000000, 18880000, 1, 'Active', 'Dealer Segment 02 sales executive. Includes manual adjustment voucher for cheque SL3370.', '2026-10-23T10:05:12.150Z', '2026-10-23T10:05:12.150Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_dashboard_records" ("id", "participant_code", "display_name", "role", "division", "period", "volume_pct", "turnover_pct", "projected_commission", "invoices_over_45_days", "penalty_exposure", "base_target", "actual_achievement", "attendance_factor", "status", "notes", "created_at", "updated_at") VALUES ('DSH-2026-04-044', '044', 'Ishara Fernando', 'Sales Executive', 'RLC Sales', 'April 2026', 92, 88, 96200, 1, 7258, 12000000, 10560000, 0.95, 'Active', 'Has 1 overdue dealer invoice > 45 days resulting in LKR 7,258 debtor clawback penalty.', '2026-10-23T10:05:12.150Z', '2026-10-23T10:05:12.150Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_dashboard_records" ("id", "participant_code", "display_name", "role", "division", "period", "volume_pct", "turnover_pct", "projected_commission", "invoices_over_45_days", "penalty_exposure", "base_target", "actual_achievement", "attendance_factor", "status", "notes", "created_at", "updated_at") VALUES ('DSH-2026-05-012', 'MHA-012', 'Kamal Perera', 'Area Sales Manager', 'MHA Major Appliances', 'May 2026', 122, 115, 175000, 0, 0, 22000000, 25300000, 1, 'Active', 'MHA Western Province dealer network achievement.', '2026-10-23T10:05:12.150Z', '2026-10-23T10:05:12.150Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_dashboard_records" ("id", "participant_code", "display_name", "role", "division", "period", "volume_pct", "turnover_pct", "projected_commission", "invoices_over_45_days", "penalty_exposure", "base_target", "actual_achievement", "attendance_factor", "status", "notes", "created_at", "updated_at") VALUES ('DSH-2026-05-088', 'CAC-088', 'Ruwan Jayasinghe', 'Senior Project Engineer', 'CAC Project Engineering', 'May 2026', 105, 108, 195000, 1, 15000, 15000000, 16200000, 1, 'Active', 'Commercial AC mega project milestone completion bonus.', '2026-10-23T10:05:12.150Z', '2026-10-23T10:05:12.150Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_disputes" (5 rows)
INSERT INTO "incentive_disputes" ("id", "dispute_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "statement_ref", "category", "priority", "claimed_amount", "approved_amount", "status", "description", "investigation_notes", "resolution_action", "assigned_to", "resolved_by", "resolved_at", "created_at", "updated_at") VALUES ('DSP-2026-04-001', 'DSP-2026-04-001', 'EMP-1025', '025', 'Thisara Tharanga', 'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026', 'SLIP-2026-04-025', 'Receipt Realisation Timing', 'High', 12500, 12500, 'Resolved', 'Invoice INV-8821 realised on April 28 (within 45-day credit window) but flagged as overdue debtors penalty.', 'Finance ledger audit confirmed bank slip verified on 28-Apr-2026. Realisation within 45 days.', 'Credit adjustment ADJ-2026-0048 generated for LKR 12,500.00; will be paid with May 2026 payout run.', 'Dilani Silva (Finance)', 'Finance - M. Jayasinghe', '02-May-2026 14:15', '2026-10-23T09:27:47.988Z', '2026-10-23T09:27:47.988Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_disputes" ("id", "dispute_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "statement_ref", "category", "priority", "claimed_amount", "approved_amount", "status", "description", "investigation_notes", "resolution_action", "assigned_to", "resolved_by", "resolved_at", "created_at", "updated_at") VALUES ('DSP-2026-04-002', 'DSP-2026-04-002', 'EMP-1024', 'SVC-102', 'Dilshan Madusanka', 'Service Technician', 'RLC Service', 'May 2026', 'SLIP-2026-05-102', 'Attendance Penalty Waiver', 'Medium', 8000, 8000, 'Approved', 'Attendance penalty of LKR 8,000 deducted for 24-Apr. Technician was dispatched on emergency off-site hospital repair in Kandy.', 'Service head confirmed emergency work order SR-KND-091 completed on site with client sign-off.', 'Waiver approved by HR and Service HOD. To be credited in next disbursement.', 'Kavindu Perera (Operations)', 'Chaminda Warnakula (Service HOD)', '05-May-2026 10:30', '2026-10-23T09:27:47.988Z', '2026-10-23T09:27:47.988Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_disputes" ("id", "dispute_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "statement_ref", "category", "priority", "claimed_amount", "approved_amount", "status", "description", "investigation_notes", "resolution_action", "assigned_to", "resolved_by", "resolved_at", "created_at", "updated_at") VALUES ('DSP-2026-04-003', 'DSP-2026-04-003', 'EMP-1044', '044', 'Ishara Fernando', 'Sales Executive', 'RLC Sales', 'April 2026', 'SLIP-2026-04-044', 'Debtor Clawback Discrepancy', 'High', 7258, 0, 'Under Investigation', 'LKR 7,258 penalty clawback applied for customer dealer cheque dishonour. Client replaced with cash receipt within 48 hours.', 'Cross-verifying bank slip deposit date and receipt voucher RV-7719 with Commercial Bank branch statement.', 'Pending confirmation of final cash receipt timestamp from Accounts.', 'Dilani Silva (Finance)', NULL, NULL, '2026-10-23T09:27:47.988Z', '2026-10-23T09:27:47.988Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_disputes" ("id", "dispute_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "statement_ref", "category", "priority", "claimed_amount", "approved_amount", "status", "description", "investigation_notes", "resolution_action", "assigned_to", "resolved_by", "resolved_at", "created_at", "updated_at") VALUES ('DSP-2026-05-004', 'DSP-2026-05-004', 'EMP-1031', '031', 'Nuwan Dias', 'Sales Executive - Dealer Seg 02', 'RLC Sales', 'May 2026', 'SLIP-2026-04-031', 'Slab Tier Threshold Query', 'Medium', 4000, 0, 'New', 'Incentive calculation applied Tier 6 Volume slab instead of Tier 7 slab. Total volume achieved was 152 units.', NULL, NULL, 'Unassigned', NULL, NULL, '2026-10-23T09:27:47.988Z', '2026-10-23T09:27:47.988Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_disputes" ("id", "dispute_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "statement_ref", "category", "priority", "claimed_amount", "approved_amount", "status", "description", "investigation_notes", "resolution_action", "assigned_to", "resolved_by", "resolved_at", "created_at", "updated_at") VALUES ('DSP-2026-05-5840', 'DSP-2026-05-5840', 'EMP-1025', '001', 'chathuni jayathilake ', 'Sales Executive - Dealer Seg 01', 'RLC Sales', 'May 2026', 'SLIP-2026-04-025', 'Receipt Realisation Timing', 'High', 7500, 0, 'New', 'testing ', NULL, NULL, 'Dilani Silva (Finance)', NULL, NULL, '2026-10-23T09:33:20.347Z', '2026-10-23T09:33:20.347Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_division_budgets" (4 rows)
INSERT INTO "incentive_division_budgets" ("id", "period", "division", "target_sales", "actual_sales", "target_collections", "actual_collections", "budget_allocation", "actual_incentive_cost", "cost_ratio_pct", "variance_amount", "participant_count", "status", "notes", "created_at", "updated_at") VALUES ('BDG-2026-04-RLC', 'April 2026', 'RLC Sales', 50000000, 56240000, 45000000, 48150000, 3500000, 3430670, 6.1, 69330, 28, 'Under Budget', 'Official specimen run April 2026. Sales exceeded target by 12.5% with healthy 6.10% incentive cost ratio.', '2026-10-23T09:46:07.844Z', '2026-10-23T09:46:07.844Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_division_budgets" ("id", "period", "division", "target_sales", "actual_sales", "target_collections", "actual_collections", "budget_allocation", "actual_incentive_cost", "cost_ratio_pct", "variance_amount", "participant_count", "status", "notes", "created_at", "updated_at") VALUES ('BDG-2026-04-SVC', 'April 2026', 'RLC Service', 16000000, 18500000, 15000000, 17200000, 1200000, 1080000, 5.84, 120000, 16, 'Under Budget', 'Service revenue generated from closed warranty and post-warranty repairs. Incentive cost within 6% benchmark.', '2026-10-23T09:46:07.844Z', '2026-10-23T09:46:07.844Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_division_budgets" ("id", "period", "division", "target_sales", "actual_sales", "target_collections", "actual_collections", "budget_allocation", "actual_incentive_cost", "cost_ratio_pct", "variance_amount", "participant_count", "status", "notes", "created_at", "updated_at") VALUES ('BDG-2026-04-MHA', 'April 2026', 'MHA Major Appliances', 40000000, 42000000, 38000000, 39800000, 2800000, 2650000, 6.31, 150000, 22, 'On Track', 'Major Home Appliances dealer network sell-through. Product commission and volume slabs.', '2026-10-23T09:46:07.844Z', '2026-10-23T09:46:07.844Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_division_budgets" ("id", "period", "division", "target_sales", "actual_sales", "target_collections", "actual_collections", "budget_allocation", "actual_incentive_cost", "cost_ratio_pct", "variance_amount", "participant_count", "status", "notes", "created_at", "updated_at") VALUES ('BDG-2026-04-CAC', 'April 2026', 'CAC Project Engineering', 32000000, 35000000, 30000000, 32500000, 2200000, 2250000, 6.43, -50000, 12, 'Budget Exceeded', 'Commercial AC mega installation project pool distribution. Milestone completion bonus accelerated.', '2026-10-23T09:46:07.844Z', '2026-10-23T09:46:07.844Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_divisions" (6 rows)
INSERT INTO "incentive_divisions" ("id", "division_code", "division_name", "description", "hod_name", "hod_email", "cost_center_code", "status", "created_at", "updated_at") VALUES ('DIV-RLC', 'RLC', 'Retail & Consumer Electronics', 'Retail sales network, solar inverter capacity distribution, dealer sales executives, and area sales management.', 'Bandhan Senaratne', 'bandhan.s@telesonic.lk', 'CC-RLC-01', 'Active', '2026-10-23T15:34:01.827Z', '2026-10-23T15:34:01.827Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_divisions" ("id", "division_code", "division_name", "description", "hod_name", "hod_email", "cost_center_code", "status", "created_at", "updated_at") VALUES ('DIV-MHA', 'MHA', 'Major Home Appliances', 'Refrigerators, washing machines, kitchen ovens, showroom promoters, and dealer sell-out incentive schemes.', 'Kamal Perera', 'kamal.p@telesonic.lk', 'CC-MHA-03', 'Active', '2026-10-23T15:34:01.830Z', '2026-10-23T15:34:01.830Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_divisions" ("id", "division_code", "division_name", "description", "hod_name", "hod_email", "cost_center_code", "status", "created_at", "updated_at") VALUES ('DIV-SRV', 'SRV', 'Service & Technical Department', 'Field technical service, bench workshop repairs, coordinator performance, first-time-fix evaluation, and scorecard tiers.', 'Kamal Wijeratne', 'kamal.w@telesonic.lk', 'CC-SRV-04', 'Active', '2026-10-23T15:34:01.831Z', '2026-10-23T15:34:01.831Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_divisions" ("id", "division_code", "division_name", "description", "hod_name", "hod_email", "cost_center_code", "status", "created_at", "updated_at") VALUES ('DIV-MTR', 'MTR', 'Modern Trade & Key Accounts', 'Supermarket chains, institutional bulk supplies, key corporate clients, and promoter commission structures.', 'Nuwan Dias', 'nuwan.d@telesonic.lk', 'CC-MTR-05', 'Active', '2026-10-23T15:34:01.832Z', '2026-10-23T15:34:01.832Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_divisions" ("id", "division_code", "division_name", "description", "hod_name", "hod_email", "cost_center_code", "status", "created_at", "updated_at") VALUES ('DIV-CE', 'CE', 'Commercial Air Conditioning', '', 'chathuni jayathilake ', 'ruwan.j@telesonic.lk', 'CC-CAC-02', 'Active', '2026-10-23T16:15:54.952Z', '2026-10-23T16:15:54.952Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_divisions" ("id", "division_code", "division_name", "description", "hod_name", "hod_email", "cost_center_code", "status", "created_at", "updated_at") VALUES ('DIV-R&D', 'R&D', 'R&D DEVISION', '', 'Srinath perara', 'srinath@perfectbss.com', 'R&D-2026-10-26', 'Active', '2026-10-26T09:12:07.340Z', '2026-10-26T09:14:18.090Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_gl_posting_batches" (3 rows)
INSERT INTO "incentive_gl_posting_batches" ("id", "posting_ref", "run_no", "period", "division", "posting_date", "journal_entry_no", "total_debit", "total_credit", "payroll_batch_no", "payroll_file_name", "bank_format", "bank_file_name", "status", "payment_lag_months", "disbursement_month", "notes", "posted_by", "created_by", "created_at", "updated_at") VALUES ('GLP-2026-04-001', 'GLP-2026-04-001', 'INC-RUN-2026-04-RLC', 'April 2026', 'RLC Sales', '2026-05-09', 'JE-2026-05-0412', 3430670, 3430670, 'PAY-BATCH-2026-04-01', 'INC_RLC_2026-04.xlsx', 'SLIPS / CEFT Bank File', 'CEFT_TELESONIC_RLC_202605.txt', 'Posted', 3, 'July 2026', 'Official Accrual JE posted to SAP Business One. Handed over to HR Payroll for July 2026 salary cycle (3-month lag rule INC-BCR-01).', 'Finance - M. Jayasinghe', 'Lakmal Perera (Incentive Administrator)', '2026-10-23T06:52:23.072Z', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_batches" ("id", "posting_ref", "run_no", "period", "division", "posting_date", "journal_entry_no", "total_debit", "total_credit", "payroll_batch_no", "payroll_file_name", "bank_format", "bank_file_name", "status", "payment_lag_months", "disbursement_month", "notes", "posted_by", "created_by", "created_at", "updated_at") VALUES ('GLP-2026-05-002', 'GLP-2026-05-002', 'RUN-2026-05-PRE-01', 'May 2026', 'All Divisions', '2026-06-02', NULL, 3983000, 3983000, 'PAY-BATCH-2026-05-01', 'INC_ALL_2026-05_PRE.xlsx', 'SLIPS / CEFT Bank File', 'CEFT_TELESONIC_MAY2026.txt', 'Ready to Post', 3, 'August 2026', 'May 2026 GL allocation preview. Balanced double-entries prepared for SAP B1 posting.', NULL, 'Lakmal Perera (Incentive Administrator)', '2026-10-23T06:52:23.072Z', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_batches" ("id", "posting_ref", "run_no", "period", "division", "posting_date", "journal_entry_no", "total_debit", "total_credit", "payroll_batch_no", "payroll_file_name", "bank_format", "bank_file_name", "status", "payment_lag_months", "disbursement_month", "notes", "posted_by", "created_by", "created_at", "updated_at") VALUES ('GLP-2026-06-003', 'TST-2026-08-23', 'RUN-2026-08-TST-0023', 'June 2026', 'Consumer Electronics', '2026-10-23', NULL, 2300000, 2300000, 'PAY-BATCH-June_2026', 'INC_PAYROLL_June_2026.xlsx', 'SLIPS / CEFT', 'CEFT_TELESONIC_June_2026.txt', 'Handed Over', 3, 'September 2026', 'testing-editing ', NULL, 'Lakmal Perera (Incentive Administrator)', '2026-10-23T08:48:24.574Z', '2026-10-23T08:50:04.729Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_gl_posting_lines" (11 rows)
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-04-1', 'GLP-2026-04-001', 1, 'Debit', '620410', 'Sales Incentive Expense - Seg 01', 'RLC/DS01', 1912440, 'Dealer Segment 01 Commission', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-04-2', 'GLP-2026-04-001', 2, 'Debit', '620410', 'Sales Incentive Expense - Seg 02', 'RLC/DS02', 1328230, 'Dealer Segment 02 Commission', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-04-3', 'GLP-2026-04-001', 3, 'Debit', '620420', 'Sales Manager Target Incentive', 'RLC/MGT', 190000, 'Manager Target Incentive Accrual', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-04-4', 'GLP-2026-04-001', 4, 'Credit', '240310', 'Accrued Incentive Payable', 'CORP/FIN', 3430670, 'Total Month Accrued Liability', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-05-1', 'GLP-2026-05-002', 1, 'Debit', '620410', 'Retail Showroom Commission', 'CE/SHW01', 780000, 'Consumer Electronics Showroom', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-05-2', 'GLP-2026-05-002', 2, 'Debit', '620410', 'Commercial HVAC Commission', 'CAC/DLR', 1638000, 'Commercial AC Dealer Sales', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-05-3', 'GLP-2026-05-002', 3, 'Debit', '620430', 'Service Technician Scorecard', 'SVC/FLD', 555000, 'Field Technician Incentive', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-05-4', 'GLP-2026-05-002', 4, 'Debit', '620440', 'Renewable Energy Consultant', 'SOL/ENG', 1010000, 'Solar Consultant Commission', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('line-05-5', 'GLP-2026-05-002', 5, 'Credit', '240310', 'Accrued Incentive Payable', 'CORP/FIN', 3983000, 'Total Month Net Pool Liability', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('gl-line-06-003-1', 'GLP-2026-06-003', 1, 'Debit', '620410', 'Incentive & Commission Expense', 'OPS/CORP', 2300000, 'Monthly incentive accrual for June 2026', '2026-10-23T08:48:24.574Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_gl_posting_lines" ("id", "posting_batch_id", "line_no", "account_type", "gl_account_code", "gl_account_name", "cost_centre", "amount", "memo", "created_at") VALUES ('gl-line-06-003-2', 'GLP-2026-06-003', 2, 'Credit', '240310', 'Accrued Incentive Payable', 'FIN/CORP', 2300000, 'Accrued incentive liability payable in September 2026', '2026-10-23T08:48:24.574Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_manual_adjustments" (5 rows)
INSERT INTO "incentive_manual_adjustments" ("id", "adjustment_no", "run_no", "participant_id", "participant_name", "division", "scheme_code", "scheme_name", "adjustment_type", "amount", "reason", "remarks", "attachment", "status", "requires_ceo", "created_by", "created_at", "updated_at") VALUES ('ADJ-2026-0041', 'ADJ-2026-0041', 'INC-RUN-2026-04-RLC', 'EMP-1025', 'Nuwan Dias', 'RLC Sales', 'RLC-REP-PAY', 'Dealer Sales Staff Payment Commission', 'Addition', 6500, 'Receipt realised after cut-off', 'Cheque SL3370 realised 01-May, verified with bank reconciliation.', 'cheque_slip_sl3370.pdf', 'Submitted', FALSE, 'Lakmal Perera (Incentive Administrator)', '2026-10-23T05:41:05.470Z', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_manual_adjustments" ("id", "adjustment_no", "run_no", "participant_id", "participant_name", "division", "scheme_code", "scheme_name", "adjustment_type", "amount", "reason", "remarks", "attachment", "status", "requires_ceo", "created_by", "created_at", "updated_at") VALUES ('ADJ-2026-0042', 'ADJ-2026-0042', 'RUN-2026-05-PRE-01', 'EMP-1024', 'Dilshan Madusanka', 'RLC Service', 'RLC-SVC', 'Service Technician Scorecard Incentive', 'Addition', 8000, 'Penalty Waiver (Approved Attendance/Delay)', 'Medical leave approved retrospectively by HR. Unfreezing 40% attendance allowance.', 'medical_certificate_hr_approval.pdf', 'Approved', FALSE, 'Chaminda Warnakula (Service HOD)', '2026-10-23T05:41:05.470Z', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_manual_adjustments" ("id", "adjustment_no", "run_no", "participant_id", "participant_name", "division", "scheme_code", "scheme_name", "adjustment_type", "amount", "reason", "remarks", "attachment", "status", "requires_ceo", "created_by", "created_at", "updated_at") VALUES ('ADJ-2026-0043', 'ADJ-2026-0043', 'RUN-2026-05-PRE-01', 'EMP-1021', 'Kasun Jayawardena', 'Consumer Electronics', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Addition', 75000, 'Special Performance Bonus', 'Exceeded national quarterly showroom target by 180%. Management discretionary award.', 'board_performance_approval.pdf', 'Submitted', TRUE, 'Lakmal Perera (Incentive Administrator)', '2026-10-23T05:41:05.470Z', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_manual_adjustments" ("id", "adjustment_no", "run_no", "participant_id", "participant_name", "division", "scheme_code", "scheme_name", "adjustment_type", "amount", "reason", "remarks", "attachment", "status", "requires_ceo", "created_by", "created_at", "updated_at") VALUES ('ADJ-2026-0044', 'ADJ-2026-0044', 'RUN-2026-05-PRE-01', 'EMP-1022', 'Pradeep Bandara', 'Commercial Air Conditioning', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Deduction', 12500, 'Customer Satisfaction Recognition', 'HVAC ducting rework penalty agreed per customer complaint #TKT-CAC-8041.', 'rework_charge_memo.pdf', 'Draft', FALSE, 'Chaminda Warnakula (Service HOD)', '2026-10-23T05:41:05.470Z', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_manual_adjustments" ("id", "adjustment_no", "run_no", "participant_id", "participant_name", "division", "scheme_code", "scheme_name", "adjustment_type", "amount", "reason", "remarks", "attachment", "status", "requires_ceo", "created_by", "created_at", "updated_at") VALUES ('TST-2026-0001', 'TST-2026-0001', 'RUN-2026-05-PRE-01', 'EMP-1021', 'Kasun Jayawardena', 'Consumer Electronics', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Addition', 5000, 'Special Performance Bonus', 'testing-edited', 'bank_deposit_slip.pdf', 'Draft', FALSE, 'Lakmal Perera (Incentive Administrator)', '2026-10-23T06:04:08.548Z', '2026-10-23T06:06:06.392Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_participant_statements" (4 rows)
INSERT INTO "incentive_participant_statements" ("id", "statement_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "run_no", "payable_commission", "target_incentive", "service_allowance", "adjustments_amount", "penalties_clawback", "net_payable", "payment_lag_months", "disbursement_month", "bank_name", "bank_account_no", "status", "issued_at", "prepared_by", "verified_by", "approved_by", "notes", "created_at", "updated_at") VALUES ('SLIP-2026-04-025', 'SLIP-2026-04-025', 'EMP-1025', '025', 'Thisara Tharanga', 'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC', 187100, 11000, 0, 0, 0, 198100, 3, 'July 2026', 'Commercial Bank', '8004128912', 'Issued', '09-May-2026 15:30 IST', 'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka', 'Official specimen statement matching Page 34 of development specifications.', '2026-10-23T08:56:39.176Z', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participant_statements" ("id", "statement_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "run_no", "payable_commission", "target_incentive", "service_allowance", "adjustments_amount", "penalties_clawback", "net_payable", "payment_lag_months", "disbursement_month", "bank_name", "bank_account_no", "status", "issued_at", "prepared_by", "verified_by", "approved_by", "notes", "created_at", "updated_at") VALUES ('SLIP-2026-04-031', 'SLIP-2026-04-031', 'EMP-1025', '031', 'Nuwan Dias', 'Sales Executive - Dealer Seg 02', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC', 214300, 9000, 0, 6500, 0, 229800, 3, 'July 2026', 'Sampath Bank', '1004581290', 'Issued', '09-May-2026 15:30 IST', 'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka', 'Includes LKR 6,500 approved manual adjustment for cheque SL3370 realised post cut-off.', '2026-10-23T08:56:39.176Z', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participant_statements" ("id", "statement_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "run_no", "payable_commission", "target_incentive", "service_allowance", "adjustments_amount", "penalties_clawback", "net_payable", "payment_lag_months", "disbursement_month", "bank_name", "bank_account_no", "status", "issued_at", "prepared_by", "verified_by", "approved_by", "notes", "created_at", "updated_at") VALUES ('SLIP-2026-04-044', 'SLIP-2026-04-044', 'EMP-1044', '044', 'Ishara Fernando', 'Sales Executive', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC', 96200, 0, 0, 0, 7258, 88942, 3, 'July 2026', 'Bank of Ceylon', '710049281', 'Issued', '09-May-2026 15:30 IST', 'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka', 'Includes LKR 7,258 penalty deduction for overdue debtors > 45 days.', '2026-10-23T08:56:39.176Z', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participant_statements" ("id", "statement_no", "participant_id", "sales_code", "participant_name", "designation", "division", "period", "run_no", "payable_commission", "target_incentive", "service_allowance", "adjustments_amount", "penalties_clawback", "net_payable", "payment_lag_months", "disbursement_month", "bank_name", "bank_account_no", "status", "issued_at", "prepared_by", "verified_by", "approved_by", "notes", "created_at", "updated_at") VALUES ('SLIP-2026-04-534', 'SLIP-2026-04-001', 'EMP-534', '001', 'chathuni jayathilake ', 'Sales Executive - Dealer Seg 01', 'RLC Sales', 'April 2026', 'INC-RUN-2026-04-RLC', 150000, 10000, 0, 0, 0, 160000, 3, 'July 2026', 'Commercial Bank', '8001928374', 'Issued', '10/23/2026, 2:44:32 PM', 'Lakmal Perera (Incentive Administrator)', 'Finance - M. Jayasinghe', 'HOD Sales - T. Aloka', 'Participant incentive statement for April 2026.', '2026-10-23T09:11:48.652Z', '2026-10-23T09:14:32.022Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_participants" (8 rows)
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1021', 'Nimal Perera', 'SL-204', 'Consumer Electronics', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Senior Service Engineer', 'PAY-88342', TRUE, '+94 77 123 4567', 'nimal.p@telesonic.lk', '15-Mar-2021', '2026-10-22T08:55:28.752Z', '2026-10-22T08:55:28.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1022', 'Kasun Jayasuriya', 'SL-108', 'Enterprise Solutions', 'Corporate Key Accounts & B2B', 'Harsha Jayawardena (Enterprise Key Accounts)', 'Key Account Manager', 'PAY-88410', TRUE, '+94 71 882 3311', 'kasun.j@telesonic.lk', '01-Aug-2020', '2026-10-22T08:55:28.752Z', '2026-10-22T08:55:28.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1023', 'Dilshan Silva', 'SL-312', 'Consumer Electronics', 'Field Engineering & Repairs', 'Chathura Wijesinghe (Central & Hills)', 'Field Support Specialist', 'PAY-88519', TRUE, '+94 76 555 9012', 'dilshan.s@telesonic.lk', '10-Jan-2022', '2026-10-22T08:55:28.752Z', '2026-10-22T08:55:28.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1024', 'Tharindu Fernando', 'SL-405', 'Mobile & Accessories', 'Modern Retail & Brand Stores', 'Mahesh Rathnayake (Western Province South)', 'Senior Channel Account Exec', 'PAY-88602', TRUE, '+94 77 999 1234', 'tharindu.f@telesonic.lk', '05-Jun-2023', '2026-10-22T08:55:28.752Z', '2026-10-22T08:55:28.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1025', 'Kavinda Bandara', 'SL-490', 'Consumer Electronics', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Junior Service Technician', 'PAY-88730', FALSE, '+94 70 333 4455', 'kavinda.b@telesonic.lk', '01-Apr-2026', '2026-10-22T08:55:28.752Z', '2026-10-22T08:55:28.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1026', 'Chaminda Wickramasinghe', 'SL-102', 'Consumer Electronics', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Head of Department (HOD) - Field Support', 'PAY-88001', TRUE, '+94 77 777 8899', 'chaminda.w@telesonic.lk', '01-Jan-2018', '2026-10-22T08:55:28.752Z', '2026-10-22T08:55:28.752Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('EMP-1027', 'chathuni jayathilake', 'SL-001', 'Enterprise Solutions', 'Corporate Key Accounts & B2B', 'Sunil Warnakulasuriya (Western Province North)', 'Junior Service Engineer', 'PAY-200314', TRUE, '', '', '2026-10-22', '2026-10-22T09:23:38.545Z', '2026-10-22T09:23:38.545Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_participants" ("id", "name", "sales_employee_code", "division", "segment_channel", "area_manager", "designation", "payroll_id", "active", "phone", "email", "join_date", "created_at", "updated_at") VALUES ('TST-0001', 'chathuni jayathilake', 'TST-001', 'Enterprise Solutions', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Senior Service Engineer', 'PAY-200314', TRUE, '', '', '2026-10-22', '2026-10-22T11:11:45.394Z', '2026-10-22T11:12:31.462Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_payroll_handover_items" (6 rows)
INSERT INTO "incentive_payroll_handover_items" ("id", "posting_batch_id", "employee_id", "employee_name", "designation", "division", "epf_no", "bank_name", "bank_account_no", "gross_amount", "tax_deduction", "net_disbursement", "payment_status", "created_at") VALUES ('pay-04-1', 'GLP-2026-04-001', 'EMP-1025', 'Nuwan Dias', 'Sales Executive', 'RLC Sales', 'EPF-8041', 'Commercial Bank', '8004128912', 198100, 0, 198100, 'Handed Over to HR', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_payroll_handover_items" ("id", "posting_batch_id", "employee_id", "employee_name", "designation", "division", "epf_no", "bank_name", "bank_account_no", "gross_amount", "tax_deduction", "net_disbursement", "payment_status", "created_at") VALUES ('pay-04-2', 'GLP-2026-04-001', 'EMP-1021', 'Kasun Jayawardena', 'Showroom Sales Rep', 'Consumer Electronics', 'EPF-7915', 'Sampath Bank', '1004581290', 214300, 0, 214300, 'Handed Over to HR', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_payroll_handover_items" ("id", "posting_batch_id", "employee_id", "employee_name", "designation", "division", "epf_no", "bank_name", "bank_account_no", "gross_amount", "tax_deduction", "net_disbursement", "payment_status", "created_at") VALUES ('pay-04-3', 'GLP-2026-04-001', 'EMP-1024', 'Dilshan Madusanka', 'Service Technician', 'RLC Service', 'EPF-8204', 'Bank of Ceylon', '710049281', 88942, 0, 88942, 'Handed Over to HR', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_payroll_handover_items" ("id", "posting_batch_id", "employee_id", "employee_name", "designation", "division", "epf_no", "bank_name", "bank_account_no", "gross_amount", "tax_deduction", "net_disbursement", "payment_status", "created_at") VALUES ('pay-04-4', 'GLP-2026-04-001', 'EMP-1010', 'K. Ranasinghe', 'Sales Area Manager', 'RLC Sales', 'EPF-6500', 'Hatton National Bank', '0410029412', 60000, 0, 60000, 'Handed Over to HR', '2026-10-23T06:52:23.072Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_payroll_handover_items" ("id", "posting_batch_id", "employee_id", "employee_name", "designation", "division", "epf_no", "bank_name", "bank_account_no", "gross_amount", "tax_deduction", "net_disbursement", "payment_status", "created_at") VALUES ('pay-item-06-003-1', 'GLP-2026-06-003', 'EMP-1025', 'Nuwan Dias', 'Sales Executive', 'Consumer Electronics', 'EPF-8041', 'Commercial Bank', '8004128912', 1150000, 0, 1150000, 'Transmitted to HR', '2026-10-23T08:48:24.574Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_payroll_handover_items" ("id", "posting_batch_id", "employee_id", "employee_name", "designation", "division", "epf_no", "bank_name", "bank_account_no", "gross_amount", "tax_deduction", "net_disbursement", "payment_status", "created_at") VALUES ('pay-item-06-003-2', 'GLP-2026-06-003', 'EMP-1021', 'Kasun Jayawardena', 'Showroom Rep', 'Consumer Electronics', 'EPF-7915', 'Sampath Bank', '1004581290', 1150000, 0, 1150000, 'Transmitted to HR', '2026-10-23T08:48:24.574Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_schemes" (9 rows)
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-2', 'SCH-SRV-2026', 'Field Service Technician First-Time-Fix Incentive', 'Consumer Electronics', 'FTF Multiplier + Job Count', 'Field Service Technician', 'Job Completion Count', 'Job Close Date', 1, '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Active', 'v1.4', 'Incentivizes field repair turnaround, first-time-fix rates (FTF > 92%), and zero repeat complaint within 30-day warranty.', '{"jobCodes":["JOB-INSPECTION-ONLY","JOB-ESTIMATE-REJECTED"],"customerGroups":["Internal Company Showroom Repairs","Factory Warranty DOA Claims"],"itemCategories":["Consumables (Tape, Screws, Solder)"],"clawbackWindowDays":30}'::jsonb, '{"costCenter":"CC-SRV-CONSUMER","debitGlName":"Technician Field Service Incentive Expense","projectCode":"PRJ-TECH-2026","creditGlName":"Accrued Service Incentive Payable","debitGlAccount":"632000","creditGlAccount":"214060","postingDayOfMonth":28,"journalRemarksTemplate":"INC/{Period}/SCH-SRV-2026/{EmpNo} - FTF Technician Incentive"}'::jsonb, '2026-10-21T11:01:38.675Z', '2026-10-21T11:01:38.675Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-3', 'SCH-DLR-2026', 'Tier-1 Authorised Dealer Quarterly Volume Rebate', 'Enterprise Solutions', 'Volume Achievement Matrix', 'Dealer Principal', 'Collected Cash Amount', 'Realization Date', 2, '2026-03-31T18:30:00.000Z', '2026-06-29T18:30:00.000Z', 'Approved', 'v3.0', 'Quarterly volume rebate for platinum and gold dealers, contingent on debtor aging realization under 45 days.', '{"jobCodes":[],"customerGroups":["Direct Government Tenders where dealer acted as agent only"],"itemCategories":["Software Subscription Renewals (separate commission)"],"clawbackWindowDays":90}'::jsonb, '{"costCenter":"CC-ENT-DEALER","debitGlName":"Dealer Rebate & Settlement Expense","projectCode":"PRJ-DLR-Q2-2026","creditGlName":"Trade Creditors — Dealer Commission Balance","debitGlAccount":"612400","creditGlAccount":"212100","postingDayOfMonth":15,"journalRemarksTemplate":"INC/{Period}/SCH-DLR-2026/{DealerCode} - Q2 Rebate"}'::jsonb, '2026-10-21T11:01:38.682Z', '2026-10-21T11:01:38.682Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-5', 'SCH-ACC-2025', 'Accessories Inventory Clearance Drive (Archived)', 'Mobile & Accessories', 'Gross Margin %', 'Retail Sales Executive', 'Gross Margin', 'Invoice Date', 1, '2025-09-30T18:30:00.000Z', '2025-12-30T18:30:00.000Z', 'Inactive', 'v1.2', 'Historical scheme for 2025 year-end accessories clearance. Superseded and marked inactive.', '{"jobCodes":[],"customerGroups":["Inter-company transfers"],"itemCategories":[],"clawbackWindowDays":30}'::jsonb, '{"costCenter":"CC-MOB-ACC","debitGlName":"Sales Staff Incentive Expense","projectCode":"PRJ-ACC-2025","creditGlName":"Accrued Incentive Payable","debitGlAccount":"621000","creditGlAccount":"214050","postingDayOfMonth":25,"journalRemarksTemplate":"INC/{Period}/SCH-ACC-2025/{EmpNo}"}'::jsonb, '2026-10-21T11:01:38.693Z', '2026-10-21T11:01:38.693Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-621328', 'SCH-MOB-2027', 'chathuni', 'Mobile & Accessories', 'Turnover Tier + Slabs', 'Retail Sales Executive', 'Billed Revenue (Excl. Tax)', 'Invoice Date', 1, '2026-12-31T18:30:00.000Z', '2027-12-30T18:30:00.000Z', 'Draft', 'v1.0', '', '{"jobCodes":[],"customerGroups":[],"itemCategories":[],"clawbackWindowDays":30}'::jsonb, '{"costCenter":"CC-GEN","debitGlName":"Incentive Expense","projectCode":"PRJ-GEN","creditGlName":"Accrued Incentive Payable","debitGlAccount":"621000","creditGlAccount":"214050","postingDayOfMonth":25,"journalRemarksTemplate":"INC/{Period}/SCH-MOB-2027/{EmpNo}"}'::jsonb, '2026-10-22T05:23:41.328Z', '2026-10-22T05:23:41.328Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-1792647132943', 'SCH-MOB-2003', 'sales test01', 'Mobile & Accessories', 'Turnover Tier + Slabs', 'Retail Sales Executive', 'Billed Revenue (Excl. Tax)', 'Invoice Date', 1, '2026-06-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Draft', 'v1.0', 'Incentive scheme configured by Incentive Administrator.', '{"jobCodes":[],"customerGroups":["Inter-company transfers"],"itemCategories":["FOC Samples"],"clawbackWindowDays":30}'::jsonb, '{"costCenter":"CC-DEF-01","debitGlName":"Sales Staff Incentive Expense","projectCode":"PRJ-2026","creditGlName":"Accrued Incentive Payable","debitGlAccount":"621000","creditGlAccount":"214050","postingDayOfMonth":25,"journalRemarksTemplate":"INC/{Period}/SCH-MOB-2003/{EmpNo}"}'::jsonb, '2026-10-22T05:32:12.985Z', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-1', 'SCH-SLS-2026', 'Retail Smartphone & Devices Sales Incentive', 'Mobile & Accessories', 'Turnover Tier + Slabs', 'Retail Sales Executive', 'Billed Revenue (Excl. Tax)', 'Invoice Date', 1, '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Active', 'v2.1', 'Updated description via PostgreSQL API test', '{"jobCodes":["Internal Transfer Freight","Warranty Replacement Delivery"],"customerGroups":["Inter-company Branch Transfers","Executive Staff Personal Orders","Institutional Special Government Tenders"],"itemCategories":["Free-of-Charge (FOC) Promotional Units","Marketing Demonstration Samples","Damaged / B-Stock Clearance"],"clawbackWindowDays":60}'::jsonb, '{"costCenter":"CC-MOB-RETAIL","debitGlName":"Sales Staff Incentive & Commission Expense","projectCode":"PRJ-SLS-2026","creditGlName":"Accrued Incentive Payable — Retail Mobile","debitGlAccount":"621000","creditGlAccount":"214050","postingDayOfMonth":25,"journalRemarksTemplate":"INC/{Period}/SCH-SLS-2026/{EmpNo} - Retail Commission"}'::jsonb, '2026-10-21T11:01:38.662Z', '2026-10-21T11:31:26.277Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-4', 'SCH-PRM-2026', 'Showroom Promoter Fast Sell-Out Bounty', 'Mobile & Accessories', 'Flat Bounty Per Unit', 'Showroom Promoter', 'Sell-Out Unit Count', 'Invoice Date', 1, '2026-04-30T18:30:00.000Z', '2026-05-30T18:30:00.000Z', 'Approved', 'v1.0', 'Special seasonal promotion incentive for in-store brand promoters selling high-margin flagship phone SKUs.', '{"jobCodes":[],"customerGroups":["Wholesale bulk buyers (>3 units)"],"itemCategories":["Accessories"],"clawbackWindowDays":14}'::jsonb, '{"costCenter":"CC-MOB-PROMOTER","debitGlName":"Promoter Seasonal Bounty Expense","projectCode":"PRJ-PRM-MAY-2026","creditGlName":"Accrued Incentive Payable — Promoters","debitGlAccount":"621080","creditGlAccount":"214050","postingDayOfMonth":20,"journalRemarksTemplate":"INC/{Period}/SCH-PRM-2026/{EmpNo} - Promoter Bounty"}'::jsonb, '2026-10-21T11:01:38.687Z', '2026-10-28T03:50:18.804Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-1792643004134', 'SCH-MOB-2026', 'sales scheama', 'Mobile & Accessories', 'Turnover Tier + Slabs', 'Retail Sales Executive', 'Billed Revenue (Excl. Tax)', 'Invoice Date', 1, '2026-06-28T18:30:00.000Z', '2026-12-28T18:30:00.000Z', 'Draft', 'v1.0', 'Incentive scheme configured by Incentive Administrator.', '{"jobCodes":[],"customerGroups":["Inter-company transfers"],"itemCategories":["FOC Samples"],"clawbackWindowDays":30}'::jsonb, '{"costCenter":"CC-DEF-01","debitGlName":"Sales Staff Incentive Expense","projectCode":"PRJ-2026","creditGlName":"Accrued Incentive Payable","debitGlAccount":"621000","creditGlAccount":"214050","postingDayOfMonth":25,"journalRemarksTemplate":"INC/{Period}/SCH-MOB-2026/{EmpNo}"}'::jsonb, '2026-10-22T04:23:24.185Z', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_schemes" ("id", "scheme_code", "scheme_name", "division", "scheme_type", "participant_role", "calculation_basis", "age_basis", "payable_lag_months", "effective_from", "effective_to", "status", "version", "description", "exclusions", "posting", "created_at", "updated_at") VALUES ('sch-1792990343061', 'SCH-COM-2026-26', 'test-sc name', 'Major Home Appliances', 'Turnover Tier + Slabs', 'Retail Sales Executive', 'Billed Revenue (Excl. Tax)', 'Invoice Date', 1, '2026-06-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Draft', 'v1.0', 'Incentive scheme configured by Incentive Administrator.', '{"jobCodes":[],"customerGroups":["Inter-company transfers"],"itemCategories":["FOC Samples"],"clawbackWindowDays":30}'::jsonb, '{"costCenter":"CC-DEF-01","debitGlName":"Sales Staff Incentive Expense","projectCode":"PRJ-2026","creditGlName":"Accrued Incentive Payable","debitGlAccount":"621000","creditGlAccount":"214050","postingDayOfMonth":25,"journalRemarksTemplate":"INC/{Period}/SCH-COM-2026-26/{EmpNo}"}'::jsonb, '2026-10-26T04:52:23.102Z', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_statement_lines" (9 rows)
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('line-025-1', 'SLIP-2026-04-025', 1, 'Volume Target', 'Monthly Sales Unit Target', 80, 154, 192.5, 8000, 'Tier 7 Slab (150%+ achievement reached)', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('line-025-2', 'SLIP-2026-04-025', 2, 'Turnover Target', 'Monthly Sales Turnover Target', 18400000, 23399855, 127.17, 3000, 'Tier 3 Turnover Slab reached', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('line-025-3', 'SLIP-2026-04-025', 3, 'Commission', 'Payable Commission on Invoiced Realised Receipts', NULL, NULL, NULL, 187100, 'Cash immediate & credit up to 45 days receipts', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('line-031-1', 'SLIP-2026-04-031', 1, 'Volume Target', 'Monthly Sales Unit Target', 75, 120, 160, 7500, 'Tier 6 Volume reached', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('line-031-2', 'SLIP-2026-04-031', 2, 'Commission', 'Payable Product Commission', NULL, NULL, NULL, 214300, 'Realised invoices', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('line-031-3', 'SLIP-2026-04-031', 3, 'Adjustment', 'Manual Addition: Cheque SL3370 post cut-off', NULL, NULL, NULL, 6500, 'Approved via ADJ-2026-0041', '2026-10-23T08:56:39.176Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('stmt-line-04-534-1', 'SLIP-2026-04-534', 1, 'Volume Target', 'Monthly Sales Unit Target', 80, 120, 150, 7000, 'Tier 6 Slab reached', '2026-10-23T09:11:48.652Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('stmt-line-04-534-2', 'SLIP-2026-04-534', 2, 'Turnover Target', 'Monthly Sales Turnover Target', 15000000, 18500000, 123.33, 3000, 'Tier 3 Turnover Slab reached', '2026-10-23T09:11:48.652Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_statement_lines" ("id", "statement_id", "line_no", "component_type", "description", "target_value", "achievement_value", "achievement_pct", "earned_amount", "remarks", "created_at") VALUES ('stmt-line-04-534-3', 'SLIP-2026-04-534', 3, 'Commission', 'Payable Commission on Invoiced Realised Receipts', NULL, NULL, NULL, 150000, 'Realised receipts up to 45 days', '2026-10-23T09:11:48.652Z') ON CONFLICT DO NOTHING;

-- Data for table "incentive_system_parameters" (16 rows)
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CUTOFF-01', 'DATA_CUTOFF_DAY', 'Monthly Data Cut-off Day', 'Cut-off & Scheduling', '25', 'Day of Month', '25', 'Monthly transaction cut-off date. All sales invoices, receipts, and closed service tickets up to 23:59:59 on this day are captured.', TRUE, '2026-01-01', 'Finance Director (S. Alwis)', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.305Z', '2026-10-23T13:48:10.305Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CUTOFF-02', 'CALCULATION_RUN_DAY', 'Monthly Batch Calculation Day', 'Cut-off & Scheduling', '28', 'Day of Month', '28', 'Automated engine execution date for monthly batch calculation run across all divisions (RLC, CAC, MHA, Service).', TRUE, '2026-01-01', 'System Administrator', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.307Z', '2026-10-23T13:48:10.307Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CUTOFF-03', 'APPROVAL_DEADLINE_DAY', 'Four-Eyes Sign-Off Deadline', 'Cut-off & Scheduling', '3', 'Day of Next Month', '3', 'Final deadline for HOD Sales, HOD Service, Finance Manager, and CEO to sign off the calculation package.', TRUE, '2026-01-01', 'Executive Committee', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.308Z', '2026-10-23T13:48:10.308Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CUTOFF-04', 'PAYROLL_HANDOVER_DAY', 'Payroll Handover Export Deadline', 'Cut-off & Scheduling', '15', 'Day of Payout Month', '15', 'Deadline to transmit final approved net payout schedule to HR Microimage Payroll system for direct salary disbursement.', TRUE, '2026-01-01', 'HR Director', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.309Z', '2026-10-23T13:48:10.309Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CUTOFF-05', 'DISPUTE_WINDOW_DAYS', 'Dispute Window Duration', 'Cut-off & Scheduling', '10', 'Days after Statement', '10', 'Formal employee dispute inquiry window following individual payslip issuance (Section 15 / INC-BCR-19).', TRUE, '2026-01-01', 'HR Manager', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.310Z', '2026-10-23T13:48:10.310Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-AGING-01', 'CREDIT_TERM_DAYS', 'Standard Customer Credit Period', 'Aging & Credit Policy', '30', 'Days', '30', 'Default customer payment credit duration before an invoice is flagged as past due.', TRUE, '2026-01-01', 'Credit Controller', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.311Z', '2026-10-23T13:48:10.311Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-AGING-02', 'PENALTY_OVERDUE_THRESHOLD', 'Debtor Penalty Overdue Grace Threshold', 'Aging & Credit Policy', '45', 'Days past Invoice', '45', 'Invoice age threshold beyond which sales payment commission is put on hold and monthly penalty is deducted (Page 38: > 45 days).', TRUE, '2026-01-01', 'Finance Manager (Nimal Perera)', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.312Z', '2026-10-23T13:48:10.312Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-AGING-03', 'PENALTY_RECURRING_POLICY', 'Debtor Penalty Recurring Policy', 'Aging & Credit Policy', 'Repeats Monthly Until 100% Settled', 'Rule Policy', 'Repeats Monthly Until 100% Settled', 'Page 38 validation rule: Debtor penalty repeats every monthly calculation cycle until overdue balance is settled.', FALSE, '2026-01-01', 'Executive Committee (Fixed Policy)', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.313Z', '2026-10-23T13:48:10.313Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-AGING-04', 'TIER1_PENALTY_RATE', 'Debtor Penalty Rate: 46 - 60 Days', 'Aging & Credit Policy', '2.50', 'Percent (%)', '2.50', 'Monthly penalty deduction rate applied to overdue invoice balance aged 46 to 60 days.', TRUE, '2026-01-01', 'Finance Manager', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.315Z', '2026-10-23T13:48:10.315Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-AGING-05', 'TIER2_PENALTY_RATE', 'Debtor Penalty Rate: 61 - 90 Days', 'Aging & Credit Policy', '3.50', 'Percent (%)', '3.50', 'Monthly penalty deduction rate applied to overdue invoice balance aged 61 to 90 days.', TRUE, '2026-01-01', 'Finance Manager', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.316Z', '2026-10-23T13:48:10.316Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CALC-01', 'PAYMENT_COMMISSION_LAG', 'Payment Commission Realisation Lag', 'Calculation & Lag', '3', 'Months', '3', 'Section 3.1 & 11 Rule: 3-month realization lag for payment collection commissions (e.g., April collection paid in July).', TRUE, '2026-01-01', 'Finance Committee', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.317Z', '2026-10-23T13:48:10.317Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CALC-02', 'RATE_MATCHING_RULE', 'Commission Rate Version Matching Basis', 'Calculation & Lag', 'Invoice Date', 'Matching Field', 'Invoice Date', 'Section 15 / INC-BCR-18: Commission rate version matched by Invoice Date rather than Receipt Date.', TRUE, '2026-01-01', 'Finance Manager', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.318Z', '2026-10-23T13:48:10.318Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-CALC-03', 'TARGET_ACHIEVEMENT_CAP', 'Incentive Payout Maximum Cap', 'Calculation & Lag', 'No Cap (Unlimited)', 'Policy Setting', 'No Cap (Unlimited)', 'Section 15 / INC-BCR-20: Telesonic executive policy specifies uncapped earning potential for top sales performers.', TRUE, '2026-01-01', 'CEO Office', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.319Z', '2026-10-23T13:48:10.319Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-GOV-01', 'CEO_APPROVAL_THRESHOLD', 'CEO Sign-Off Adjustment Threshold', 'Governance & Security', '50000', 'LKR', '50000', 'Section 10 Maker-Checker Rule: Manual incentive claims exceeding LKR 50,000 mandate CEO executive approval.', TRUE, '2026-01-01', 'Internal Audit Head', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.320Z', '2026-10-23T13:48:10.320Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-GOV-02', 'AUTO_LOCK_PERIOD', 'Automatic Period Lock on GL Post', 'Governance & Security', 'Enabled (Immutable Ledger)', 'Security Toggle', 'Enabled (Immutable Ledger)', 'Section 10: Upon SAP B1 Accrual JE posting, period is automatically locked into a read-only immutable state.', TRUE, '2026-01-01', 'Chief Financial Officer', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.321Z', '2026-10-23T13:48:10.321Z') ON CONFLICT DO NOTHING;
INSERT INTO "incentive_system_parameters" ("id", "parameter_key", "parameter_name", "category", "parameter_value", "unit", "default_value", "description", "is_editable", "effective_from", "last_updated_by", "last_updated_at", "created_at", "updated_at") VALUES ('PAR-GOV-03', 'TAMPER_CHECK_SHA256', 'Cryptographic SHA-256 Audit Verification', 'Governance & Security', 'Active Enforced', 'Crypto Hashing', 'Active Enforced', 'Auto-generates SHA-256 checksums for all scheme revisions, calculations, and approvals to prevent tampering.', FALSE, '2026-01-01', 'Security Administrator', '2026-04-01T03:30:00.000Z', '2026-10-23T13:48:10.322Z', '2026-10-23T13:48:10.322Z') ON CONFLICT DO NOTHING;

-- Data for table "labour_logs" (1 rows)
INSERT INTO "labour_logs" ("id", "jobId", "technicianName", "date", "hours", "rateType", "activityDescription", "createdAt") VALUES ('L-1', 'SC-2026-20511', 'Nimal Perera', '2026-10-26', 1.5, 'Regular', 'Initial system diagnostic and electrical wiring check.', '2026-10-22T08:30:33.632Z') ON CONFLICT DO NOTHING;

-- Data for table "manual_adjustment_approvals" (11 rows)
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-041-1', 'ADJ-2026-0041', 1, 'HOD Sales', 'HOD Sales - T. Aloka', 'Approved', '06-May-2026 14:20 IST', 'Verified cheque realization receipt from bank.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-041-2', 'ADJ-2026-0041', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Pending', NULL, NULL, '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-042-1', 'ADJ-2026-0042', 1, 'Service HOD', 'Chaminda Warnakula (Service HOD)', 'Approved', '13-May-2026 10:00 IST', 'Medical documentation valid.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-042-2', 'ADJ-2026-0042', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Approved', '14-May-2026 11:30 IST', 'Signed off for inclusion in final run.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-043-1', 'ADJ-2026-0043', 1, 'HOD Sales', 'HOD Sales - T. Aloka', 'Approved', '14-May-2026 09:15 IST', 'Recommended for high achiever bonus.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-043-2', 'ADJ-2026-0043', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Approved', '14-May-2026 14:00 IST', 'Budget verified.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-043-3', 'ADJ-2026-0043', 3, 'CEO', 'CEO - S. K. Wickramasinghe', 'Pending', NULL, 'Mandatory for adjustments exceeding LKR 50,000.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-044-1', 'ADJ-2026-0044', 1, 'Department HOD', 'Chaminda Warnakula (Service HOD)', 'Pending', NULL, NULL, '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-044-2', 'ADJ-2026-0044', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Pending', NULL, NULL, '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-TST-2026-0001-1', 'TST-2026-0001', 1, 'Department HOD', 'HOD Sales - T. Aloka', 'Pending', NULL, NULL, '2026-10-23T06:04:08.548Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_approvals" ("id", "adjustment_id", "step_number", "role_name", "approver_name", "decision", "decided_at", "comments", "created_at") VALUES ('appr-TST-2026-0001-2', 'TST-2026-0001', 2, 'Finance Manager', 'Finance - M. Jayasinghe', 'Pending', NULL, NULL, '2026-10-23T06:04:08.548Z') ON CONFLICT DO NOTHING;

-- Data for table "manual_adjustment_history" (8 rows)
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-041-1', 'ADJ-2026-0041', 'Created Draft', 'Lakmal Perera (Incentive Administrator)', '05-May-2026 10:15 IST', 'Initial draft prepared.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-041-2', 'ADJ-2026-0041', 'Submitted for Approval', 'Lakmal Perera (Incentive Administrator)', '05-May-2026 11:30 IST', 'Routed to HOD Sales.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-041-3', 'ADJ-2026-0041', 'Approved Step 1', 'HOD Sales - T. Aloka', '06-May-2026 14:20 IST', 'Verified cheque realization receipt from bank.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-042-1', 'ADJ-2026-0042', 'Created & Submitted', 'Chaminda Warnakula', '13-May-2026 09:30 IST', 'HR medical slip attached.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-042-2', 'ADJ-2026-0042', 'Approved Final', 'Finance - M. Jayasinghe', '14-May-2026 11:30 IST', 'Fully approved.', '2026-10-23T05:41:05.470Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-0001-1', 'TST-2026-0001', 'Created Draft', 'Lakmal Perera (Incentive Administrator)', '10/23/2026, 11:34:08 AM', 'Adjustment TST-2026-0001 of LKR 5,000 created for Kasun Jayawardena. Reason: Special Performance Bonus.', '2026-10-23T06:04:08.548Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-0001-28548', 'TST-2026-0001', 'Record Updated', 'Incentive Administrator', '10/23/2026, 11:35:28 AM', 'Updated parameters: Amount LKR 5,000, Reason: Special Performance Bonus. Status: Draft.', '2026-10-23T06:05:28.507Z') ON CONFLICT DO NOTHING;
INSERT INTO "manual_adjustment_history" ("id", "adjustment_id", "action", "performed_by", "performed_at", "notes", "created_at") VALUES ('hist-TST-2026-0001-66435', 'TST-2026-0001', 'Record Updated', 'Incentive Administrator', '10/23/2026, 11:36:06 AM', 'Updated parameters: Amount LKR 5,000, Reason: Special Performance Bonus. Status: Draft.', '2026-10-23T06:06:06.392Z') ON CONFLICT DO NOTHING;

-- Data for table "master_records" (31 rows)
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (1, 'MST-01', 'C-30512', '{"grade":"Tier 1 - Platinum VIP","mobile":"+94 77 123 4567","status":"Active","nicBrNo":"PV-8891042","territory":"Western - Colombo Central","balanceLkr":"1,250,000.00","paymentHold":"No","customerCode":"C-30512","customerName":"Jayasuriya Textiles (Pvt) Ltd","customerType":"Corporate Enterprise","firstChannel":"Field Sales Rep","customerGroup":"Corporate Commercial","customerOrigin":"Telesonic Direct Partner","preferredChannel":"Dedicated Hotline","relationshipStatus":"Active Maintenance Partner (In Progress)"}'::jsonb, 'Active', '2026-10-21T23:32:13.773Z', '2026-10-21T23:32:13.773Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (2, 'MST-02', 'C-30512 (Jayasuriya Textiles)', '{"site":"Site EQ-018834 (Kandy Lake Hotel)","email":"dilani.s@jayasuriya.lk","active":"Yes","mobile":"+94 76 402 1133","status":"Active","position":"Facilities & Plant Manager","validFrom":"2026-01-15","contactName":"Ms. Dilani Silva","customerCode":"C-30512 (Jayasuriya Textiles)"}'::jsonb, 'Active', '2026-10-21T23:32:13.783Z', '2026-10-21T23:32:13.783Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (3, 'MST-03', 'SITE-COL-0091', '{"room":"Main Chiller Room 01","floor":"Ground Floor & Mezzanine","siteId":"SITE-COL-0091","status":"Active","building":"Industrial Zone Complex","cityTown":"Colombo","customer":"C-30512 · Jayasuriya Textiles","district":"Colombo","landmark":"Near Airport Roundabout","province":"Western","siteName":"Spinning Plant - Block A","gpsLatLong":"6.8227° N, 79.8860° E","siteContact":"Mr. K. Samarasinghe (071 555 8899)","addressLine1":"No 45/B, Temple Road, Ratmalana"}'::jsonb, 'Active', '2026-10-21T23:32:13.786Z', '2026-10-21T23:32:13.786Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (4, 'MST-04', 'FLT-0921-FLT', '{"brand":"Carrier Commercial","model":"FLT-CAR-V4","status":"Active","itemCode":"FLT-0921-FLT","itemName":"High Efficiency Carbon Filter 24x24","itemGroup":"Service Spare Parts","serviceable":"Yes","componentRole":"Consumable Filter","serialManaged":"Yes","warrantyMonths":12,"equipmentCategory":"Air Conditioning Commercial","componentWarrantyMonths":6}'::jsonb, 'Active', '2026-10-21T23:32:13.788Z', '2026-10-21T23:32:13.788Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (5, 'MST-05', 'BSH-CTRL-00872', '{"item":"SP-COMP-18K Compressor Scroll","status":"Installed","customer":"Jayasuriya Textiles (Pvt) Ltd","serialNo":"BSH-CTRL-00872","systemId":"CNT-2026-07","warehouse":"VAN-KSILVA (Field Stock)","replacedBy":"—","componentRole":"Main Compressor Unit","warrantyStart":"2026-10-03","replacesSerial":"BSH-CTRL-00412 (Burned Coil)"}'::jsonb, 'Installed', '2026-10-21T23:32:13.790Z', '2026-10-21T23:32:13.790Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (6, 'MST-06', 'EQ-018834', '{"site":"Kandy Lake Hotel · Central Kitchen","brand":"Carrier Commercial","model":"REF-400-INV","origin":"Telesonic-originated","serial":"BSH-CTRL-00872","status":"Installed","customer":"Kandy Lake Hotel Complex","systemId":"SYS-KANDY-01","warrantyTo":"2027-09-20","equipmentId":"EQ-018834","itemCategory":"Commercial Refrigeration 400L","meterReading":1420,"relationship":"Active Under Warranty","installedDate":"2026-09-12","serviceProvider":"Telesonic In-House SRE","commissionedDate":"2026-09-20"}'::jsonb, 'Installed', '2026-10-21T23:32:13.792Z', '2026-10-21T23:32:13.792Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (7, 'MST-07', 'EQ-OTH-99104', '{"site":"Villa 14 · Main Suite","brand":"Daikin Overseas","model":"FTKC35TVMV Inverter","serial":"DKN-66102-SL","status":"Active","customer":"Galle Fort Residencies","equipmentId":"EQ-OTH-99104","takeoverDate":"2026-09-01","serialUnknown":"No","previousSupplier":"Southern Cool Tech (Third Party)","equipmentCategory":"Air Conditioning Residential","takeoverCondition":"Poor airflow; requires coil chemical washing and gas top-up"}'::jsonb, 'Active', '2026-10-21T23:32:13.794Z', '2026-10-21T23:32:13.794Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (8, 'MST-08', 'SYS-VRF-COL-009', '{"site":"Spinning Mill - Block A","status":"Active","project":"PRJ-CAC-2026-014","contract":"AMC-2026-0192","customer":"Jayasuriya Textiles (Pvt) Ltd","location":"Rooftop Plant & 3rd Floor Admin","systemId":"SYS-VRF-COL-009","warrantyEnd":"2028-09-15","installedDate":"2026-09-10","warrantyStart":"2026-09-15","commissionedDate":"2026-09-15","equipmentCategory":"VRF Commercial Multi-Zone System"}'::jsonb, 'Active', '2026-10-21T23:32:13.796Z', '2026-10-21T23:32:13.796Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (9, 'MST-09', 'EMP-9021', '{"name":"Kasun Silva","team":"Commercial VRF Alpha","active":"Yes","branch":"Colombo Head Office","mobile":"+94 77 411 9021","status":"Active","position":"Lead HVAC Technician","department":"Field Operations - Colombo","employeeId":"EMP-9021","normalRate":"2,500.00","overtimeRate":"3,750.00","certifications":"Carrier Level III Certified","technicianType":"Direct In-House Staff"}'::jsonb, 'Active', '2026-10-21T23:32:13.798Z', '2026-10-21T23:32:13.798Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (10, 'MST-10', 'V-4410', '{"rating":9.2,"status":"Active","territory":"Southern Coastal Region","vendorCode":"V-4410","vendorName":"Lanka Cool Services & Engineering","paymentTerms":"Net 30 Days","subcontractorType":"HVAC Installation Contractor"}'::jsonb, 'Active', '2026-10-21T23:32:13.800Z', '2026-10-21T23:32:13.800Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (11, 'MST-11', 'ROLE-LEAD-TECH', '{"active":"Yes","status":"Active","roleCode":"ROLE-LEAD-TECH","roleName":"Lead Field Technician","multiplePerCall":"No","incentiveBasisRef":"Resolution SLA Bonus Scale A","incentiveEligible":"Yes","internalSubcontractor":"Both Internal and Subcontractor"}'::jsonb, 'Active', '2026-10-21T23:32:13.802Z', '2026-10-21T23:32:13.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (12, 'MST-12', 'SVC-PREV-MAINT', '{"code":"SVC-PREV-MAINT","active":"Yes","status":"Active","slaRule":"SLA-STD-COMMERCIAL","listType":"Service Type","description":"Quarterly Preventive Maintenance Routine","defaultPriority":"P2 - Normal Schedule","chargeableDefault":"No (Under Contract / Warranty)","checklistTemplate":"CHK-PM-AC-SPLIT"}'::jsonb, 'Active', '2026-10-21T23:32:13.804Z', '2026-10-21T23:32:13.804Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (13, 'MST-13', 'HLD-PARTS-AWAITED', '{"active":"Yes","status":"Active","reasonCode":"HLD-PARTS-AWAITED","description":"Awaiting specialized import spare parts from central warehouse","maxHoldDays":14,"excludeFromSla":"Yes (Clock Paused)","customerWording":"Your service call is temporarily on hold pending arrival of genuine replacement components."}'::jsonb, 'Active', '2026-10-21T23:32:13.806Z', '2026-10-21T23:32:13.806Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (14, 'MST-14', 'RPT-INCORRECT-DIAG', '{"active":"Yes","status":"Active","reasonCode":"RPT-INCORRECT-DIAG","description":"Recurring symptom caused by faulty initial diagnosis","appliesToCategory":"Air Conditioning Commercial","countsAsPoorService":"Yes","detectionPeriodDays":30}'::jsonb, 'Active', '2026-10-21T23:32:13.808Z', '2026-10-21T23:32:13.808Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (15, 'MST-15', 'SLA-P0-METRO', '{"area":"Western Metro Zone","status":"Active","calendar":"CAL-24X7-EMERGENCY","priority":"P0 - Emergency Blocker","ruleCode":"SLA-P0-METRO","warningPct":75,"serviceType":"Emergency Breakdown","resourceType":"In-House Lead SRE","responseHours":2,"resolutionHours":8}'::jsonb, 'Active', '2026-10-21T23:32:13.810Z', '2026-10-21T23:32:13.810Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (16, 'MST-16', 'CHK-PM-AC-COMM', '{"name":"Commercial Air Conditioning 50-Point Preventive Service","active":"Yes","status":"Active","version":2,"serviceType":"Preventive Maintenance","templateCode":"CHK-PM-AC-COMM","equipmentCategory":"Air Conditioning Commercial"}'::jsonb, 'Active', '2026-10-21T23:32:13.812Z', '2026-10-21T23:32:13.812Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (17, 'MST-17', 'WAR-CARRIER-COMM-01', '{"months":60,"status":"Active","channel":"Direct Corporate Sale","ruleCode":"WAR-CARRIER-COMM-01","startBasis":"Commissioning Date","componentRole":"Compressor Unit Only","labourCovered":"Yes (First 24 Months)","equipmentCategory":"Air Conditioning Commercial","replacementTreatment":"Swap with New Serial"}'::jsonb, 'Active', '2026-10-21T23:32:13.814Z', '2026-10-21T23:32:13.814Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (18, 'MST-18', 'FSP-AC-COMM-3V', '{"active":"Yes","status":"Active","visits":3,"division":"Air Conditioning & HVAC","planCode":"FSP-AC-COMM-3V","startBasis":"Commissioning Date","intervalBasis":"Fixed Months","intervalValue":4,"equipmentCategory":"Air Conditioning Commercial"}'::jsonb, 'Active', '2026-10-21T23:32:13.816Z', '2026-10-21T23:32:13.816Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (19, 'MST-19', 'AMC-COMP-2026-PREM', '{"status":"Active","coverage":"24/7 Priority Emergency Coverage","template":"AMC-COMP-2026-PREM","billingBasis":"Quarterly in Advance","contractKind":"Comprehensive (Parts + Labour)","responseHours":4,"visitsPerYear":4}'::jsonb, 'Active', '2026-10-21T23:32:13.818Z', '2026-10-21T23:32:13.818Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (20, 'MST-20', 'STG-ACTIVE-AMC', '{"code":"STG-ACTIVE-AMC","active":"Yes","status":"Active","listType":"Relationship Stage","appliesTo":"All Customer Accounts","description":"Active contract client under preventive agreement"}'::jsonb, 'Active', '2026-10-21T23:32:13.821Z', '2026-10-21T23:32:13.821Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (21, 'MST-21', 'REM-AMC-RENEW-30', '{"status":"Active","channel":"SMS + WhatsApp","leadDays":30,"ruleCode":"REM-AMC-RENEW-30","intervalDays":7,"maxReminders":3,"reminderType":"AMC Renewal Notice","consentRequired":"Yes","customerCategory":"All Customers"}'::jsonb, 'Active', '2026-10-21T23:32:13.823Z', '2026-10-21T23:32:13.823Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (22, 'MST-22', 'NTF-SMS-APPT-CONFIRM', '{"body":"Telesonic Lanka: Service visit {CallNo} is confirmed for {Customer} on {Date} between {Window}. Lead Tech: {TechName}. Call 011 2345678 for updates.","name":"Service Appointment Booking Confirmation","active":"Yes","status":"Active","channel":"SMS (160 Chars)","subject":"","language":"English","templateId":"NTF-SMS-APPT-CONFIRM"}'::jsonb, 'Active', '2026-10-21T23:32:13.825Z', '2026-10-21T23:32:13.825Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (23, 'MST-23', 'PRJ-CAC-2026-014', '{"status":"Active","endDate":"2026-12-15","customer":"Jayasuriya Textiles (Pvt) Ltd","startDate":"2026-09-01","projectCode":"PRJ-CAC-2026-014","projectName":"Ratmalana Industrial Weaving Mill Chiller Retrofit","budgetVersion":2,"versionStatus":"Approved & Active in SAP","projectManager":"Eng. M. Nazeer (Lead PM)"}'::jsonb, 'Active', '2026-10-21T23:32:13.827Z', '2026-10-21T23:32:13.827Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (24, 'MST-24', 'Subcontractor Labor', '{"status":"Active","glAccount":"410300 · Subcontractor Service Materials & Labor","costElement":"Subcontractor Labor","description":"Third party specialist technician labour expenses","revenueCost":"Expense","requiresCallRef":"Yes"}'::jsonb, 'Active', '2026-10-21T23:32:13.828Z', '2026-10-21T23:32:13.828Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (25, 'MST-25', 'RATE-2026-TECH-LEAD', '{"status":"Active","rateCode":"RATE-2026-TECH-LEAD","validFrom":"2026-01-01","normalRate":"3,200.00","overtimeRate":"4,800.00","technicianType":"Lead SRE Engineer","subcontractRate":"4,000.00"}'::jsonb, 'Active', '2026-10-21T23:32:13.830Z', '2026-10-21T23:32:13.830Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (26, 'MST-26', 'BP-FRAN-021 · Negombo Electronics', '{"active":"Yes","region":"Galle & Southern Coast","status":"Active","auditor":"EMP-301 · S. Weerasinghe (Audit Dept)","warehouse":"FR-NEG-021 (Negombo Franchise Hub)","franchiseBp":"BP-FRAN-021 · Negombo Electronics","franchiseName":"Negombo Electronics & Cooling Center","countFrequency":"Monthly Physical Audit","stockOwnership":"Telesonic Consignment Stock"}'::jsonb, 'Active', '2026-10-21T23:32:13.832Z', '2026-10-21T23:32:13.832Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (27, 'MST-27', 'VAR-DAMAGED-IN-TRANSIT', '{"status":"Active","reasonCode":"VAR-DAMAGED-IN-TRANSIT","description":"Physical transport damage during regional trunk delivery","qtyThreshold":2,"valueThresholdLkr":"50,000.00","escalationRecipients":"audit.mgr@telesonic.lk, stores.head@telesonic.lk","recoverableFromFranchise":"No (Telesonic Absorption)"}'::jsonb, 'Active', '2026-10-21T23:32:13.834Z', '2026-10-21T23:32:13.834Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (28, 'MST-28', 'Service Coordinator', '{"pdf":"Yes","role":"Service Coordinator","excel":"Yes","status":"Active","rowLimit":5000,"reportGrid":"O1-RPT-01 All Service Calls & Profitability","restrictedColumns":"Cost LKR, Margin %, Hourly Wage Rate"}'::jsonb, 'Active', '2026-10-21T23:32:13.836Z', '2026-10-21T23:32:13.836Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (29, 'MST-29', 'telesonic.lk', '{"status":"Active","enabled":"Yes","authMethod":"Google Cloud Service Account JWT","retryCount":3,"inviteCustomer":"Yes","defaultDuration":45,"inviteFranchise":"Yes","workspaceDomain":"telesonic.lk","organiserAccount":"service.desk@telesonic.lk"}'::jsonb, 'Active', '2026-10-21T23:32:13.837Z', '2026-10-21T23:32:13.837Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (30, 'MST-30', 'CAT-AC-SPLIT-COMM', '{"status":"Active","meterType":"Run Hours Counter","categoryCode":"CAT-AC-SPLIT-COMM","categoryName":"Air Conditioning Commercial Multi-Split","checklistSet":"CHK-PM-AC-SPLIT","warrantyRule":"WAR-CARRIER-COMM-01","industryGroup":"HVAC & Climate Control","multiComponent":"Yes (Indoor/Outdoor Pair)","defaultInterval":3,"defaultIntervalBasis":"Months (Calendar)"}'::jsonb, 'Active', '2026-10-21T23:32:13.839Z', '2026-10-21T23:32:13.839Z') ON CONFLICT DO NOTHING;
INSERT INTO "master_records" ("id", "screenCode", "recordKey", "data", "status", "createdAt", "updatedAt") VALUES (31, 'MST-31', 'SYS-TOOL-00412', '{"type":"Service Van / Transport","holder":"K. Silva (Lead Technician) · Team Alpha","status":"Issued to Technician","assetId":"SYS-TOOL-00412","meterKm":48210,"description":"Toyota HiAce SRE Mobile Workshop Van #04","vehicleRegNo":"WP-CAS-8812","licenceExpiry":"2026-12-31","insuranceExpiry":"2026-11-15"}'::jsonb, 'Issued to Technician', '2026-10-21T23:32:13.841Z', '2026-10-21T23:32:13.841Z') ON CONFLICT DO NOTHING;

-- Data for table "matrix_cells" (24 rows)
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408686-0', 'mat-solar-q4', '< 5 kW', 'String Inverter', 3.5, 3.2, 2.75, 2, 0.75, 1, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408686-1', 'mat-solar-q4', '< 5 kW', 'Microinverter', 4, 3.75, 3.25, 2.5, 1, 2, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408686-2', 'mat-solar-q4', '5 - 10 kW', 'String Inverter', 3.75, 3.4, 2.9, 2.1, 0.8, 3, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408687-3', 'mat-solar-q4', '5 - 10 kW', 'Hybrid ESS Inverter', 4.25, 4, 3.5, 2.75, 1.25, 4, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408687-4', 'mat-solar-q4', '10 - 20 kW', 'String Inverter', 4, 3.6, 3, 2.2, 0.9, 5, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408687-5', 'mat-solar-q4', '10 - 20 kW', 'Hybrid ESS Inverter', 4.5, 4.2, 3.7, 3, 1.5, 6, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408687-6', 'mat-solar-q4', '20 - 50 kW', 'Commercial Hybrid', 4.8, 4.5, 3.9, 3.1, 1.6, 7, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408688-7', 'mat-solar-q4', '20 - 50 kW', 'Lithium Battery Module', 3.2, 3, 2.5, 1.8, 0.5, 8, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408688-8', 'mat-solar-q4', '50 - 100 kW', 'Commercial Hybrid', 5, 4.7, 4.1, 3.3, 1.75, 9, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408688-9', 'mat-solar-q4', '50 - 100 kW', 'Central Inverter', 4.5, 4.1, 3.6, 2.8, 1.2, 10, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408688-10', 'mat-solar-q4', '> 100 kW', 'Central Inverter', 5.5, 5.1, 4.5, 3.6, 2, 11, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-1792648408689-11', 'mat-solar-q4', '> 100 kW', 'High-Voltage ESS Block', 4, 3.75, 3.2, 2.4, 0, 12, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-01', 'mat-solar-q4', '< 5 kW', 'String Inverter', 3.5, 3.2, 2.75, 2, 0.75, 1, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-02', 'mat-solar-q4', '< 5 kW', 'Microinverter', 4, 3.75, 3.25, 2.5, 1, 2, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-03', 'mat-solar-q4', '5 - 10 kW', 'String Inverter', 3.75, 3.4, 2.9, 2.1, 0.8, 3, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-04', 'mat-solar-q4', '5 - 10 kW', 'Hybrid ESS Inverter', 4.25, 4, 3.5, 2.75, 1.25, 4, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-05', 'mat-solar-q4', '10 - 20 kW', 'String Inverter', 4, 3.6, 3, 2.2, 0.9, 5, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-06', 'mat-solar-q4', '10 - 20 kW', 'Hybrid ESS Inverter', 4.5, 4.2, 3.7, 3, 1.5, 6, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-07', 'mat-solar-q4', '20 - 50 kW', 'Commercial Hybrid', 4.8, 4.5, 3.9, 3.1, 1.6, 7, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-08', 'mat-solar-q4', '20 - 50 kW', 'Lithium Battery Module', 3.2, 3, 2.5, 1.8, 0.5, 8, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-09', 'mat-solar-q4', '50 - 100 kW', 'Commercial Hybrid', 5, 4.7, 4.1, 3.3, 1.75, 9, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-10', 'mat-solar-q4', '50 - 100 kW', 'Central Inverter', 4.5, 4.1, 3.6, 2.8, 1.2, 10, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-11', 'mat-solar-q4', '> 100 kW', 'Central Inverter', 5.5, 5.1, 4.5, 3.6, 2, 11, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_cells" ("id", "matrix_id", "capacity_band", "item_type", "cash_immediate", "credit_lt15", "credit_lt30", "credit_lte45", "credit_gt45", "sort_order", "created_at") VALUES ('mc-12', 'mat-solar-q4', '> 100 kW', 'High-Voltage ESS Block', 4, 3.75, 3.2, 2.4, 0, 12, '2026-10-22T06:03:51.064Z') ON CONFLICT DO NOTHING;

-- Data for table "matrix_credit_bands" (5 rows)
INSERT INTO "matrix_credit_bands" ("id", "matrix_id", "name", "column_key", "min_days", "max_days", "description", "default_factor", "sort_order", "created_at") VALUES ('b-cash', 'mat-solar-q4', 'Cash / Immediate Cheque', 'cashImmediate', 0, 0, 'Paid immediately upon delivery or within 0 business days.', 1, 1, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_credit_bands" ("id", "matrix_id", "name", "column_key", "min_days", "max_days", "description", "default_factor", "sort_order", "created_at") VALUES ('b-lt15', 'mat-solar-q4', 'Credit < 15 days', 'creditLt15', 1, 14, 'Invoiced payment settled between day 1 and 14 from dispatch.', 0.95, 2, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_credit_bands" ("id", "matrix_id", "name", "column_key", "min_days", "max_days", "description", "default_factor", "sort_order", "created_at") VALUES ('b-lt30', 'mat-solar-q4', 'Credit < 30 days', 'creditLt30', 15, 29, 'Standard net commercial terms (settlement between day 15 and 29).', 0.85, 3, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_credit_bands" ("id", "matrix_id", "name", "column_key", "min_days", "max_days", "description", "default_factor", "sort_order", "created_at") VALUES ('b-lte45', 'mat-solar-q4', 'Credit ≤ 45 days', 'creditLte45', 30, 45, 'Extended customer credit band; settled between 30 and 45 days.', 0.7, 4, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_credit_bands" ("id", "matrix_id", "name", "column_key", "min_days", "max_days", "description", "default_factor", "sort_order", "created_at") VALUES ('b-gt45', 'mat-solar-q4', 'Credit > 45 days', 'creditGt45', 46, 999, 'Overdue tier beyond 45 days; eligible for degraded rate or clawback.', 0.35, 5, '2026-10-22T05:53:28.680Z') ON CONFLICT DO NOTHING;

-- Data for table "matrix_history_logs" (6 rows)
INSERT INTO "matrix_history_logs" ("id", "matrix_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('mhl-04', 'mat-solar-q4', 'v3.2', 'Draft', '2026-10-13T18:45:12.000Z', 'Ayesha Asarak', 'Incentive Administrator', 'Initiated v3.2 Draft for Q4 2026 solar equipment lines', 'Adjusted commercial storage capacity bands and updated Credit > 45 days retention policy. Zero allowed on HV ESS Block.') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_history_logs" ("id", "matrix_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('mhl-03', 'mat-solar-q4', 'v3.1', 'Approved', '2026-07-01T09:15:00.000Z', 'Marcus Wong', 'Finance Director', 'Approved Q3 2026 Commission Rate Matrix', 'All 12 matrix band intersections certified. No band overlaps detected across payment terms.') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_history_logs" ("id", "matrix_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('mhl-02', 'mat-solar-q4', 'v3.0', 'Approved', '2026-04-02T11:30:20.000Z', 'Marcus Wong', 'Finance Director', 'Promoted draft to approved state after executive committee signoff', 'Aligned product types with updated SAP Business One Item Group classifications.') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_history_logs" ("id", "matrix_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('mhl-01', 'mat-solar-q4', 'v2.4', 'Approved', '2026-01-10T14:22:00.000Z', 'David Chen', 'Commercial Operations Lead', 'Initial 2026 baseline commission matrix established', 'Imported baseline rates via Excel for 5 kW - 100 kW capacity ranges.') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_history_logs" ("id", "matrix_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('mhl-1792648408689', 'mat-solar-q4', 'v0.3', 'Draft', '2026-10-22T05:53:28.680Z', 'Incentive Administrator', 'Incentive Administrator', 'Manual save for rate matrix (v0.3) with 12 rows.', 'Updated rate cells and configuration for Commercial Solar Inverter & ESS Matrix.') ON CONFLICT DO NOTHING;
INSERT INTO "matrix_history_logs" ("id", "matrix_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('mhl-1792648414684', 'mat-solar-q4', 'v0.3', 'Approved', '2026-10-22T05:53:34.684Z', 'Marcus Wong', 'Finance Director', 'Matrix status changed to Approved', 'Formally certified and approved Commission Rate Matrix v0.3.') ON CONFLICT DO NOTHING;

-- Data for table "monthly_target_batches" (2 rows)
INSERT INTO "monthly_target_batches" ("id", "period", "scheme_code", "division", "target_type", "version", "currency", "status", "is_locked", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('mtb-2026-04', 'April 2026 (Closed)', 'SCH-SLS-2026', 'All Divisions', 'Turnover Target (LKR)', 'v1.0', 'LKR', 'Locked', TRUE, 'April 2026 Monthly Target Allocations (Finalized and Reconciled).', 'Lakmal Perera', 'D. Fernando', '2026-10-22T07:20:55.816Z', '2026-10-22T07:20:55.816Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_batches" ("id", "period", "scheme_code", "division", "target_type", "version", "currency", "status", "is_locked", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('mtb-2026-05', 'May 2026 (Current)', 'SCH-SLS-2026', 'Enterprise Solutions', 'Product Category Target', 'v1.2 Draft', 'LKR', 'Approved', FALSE, 'May 2026 Monthly Target Allocations for Retail Sales, Field Service, and Enterprise teams.', 'Lakmal Perera', 'Lakmal Perera', '2026-10-22T07:20:55.808Z', '2026-10-22T07:50:52.710Z') ON CONFLICT DO NOTHING;

-- Data for table "monthly_target_entries" (11 rows)
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202604-001', 'mtb-2026-04', 'EMP-1021', 'Nimal Perera', 'Senior Service Engineer', 'Consumer Electronics', 'Western Province - Colombo Metro', 'SCH-SRV-2026', 2400000, 3000000, 2880000, 'Final approved actuals. Paid in April payroll.', 1, '2026-04-30 18:00', '2026-10-22T07:20:55.817Z', '2026-10-22T07:20:55.817Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202604-002', 'mtb-2026-04', 'EMP-1045', 'Kasun Jayasuriya', 'Enterprise Key Account Manager', 'Enterprise Solutions', 'Southern & Central Hub', 'SCH-DLR-2026', 3800000, 4800000, 4560000, '120% achievement tier paid.', 2, '2026-04-30 18:00', '2026-10-22T07:20:55.817Z', '2026-10-22T07:20:55.817Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-349686', 'mtb-2026-05', 'EMP-2003', 'chathuni jayathilake', 'Retail Sales Executive', 'Enterprise Solutions', 'gampaha ', 'SCH-SLS-2026', 20000, 26000, 0, 'test01', 1, '2026-10-22 07:49', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-001', 'mtb-2026-05', 'EMP-1021', 'Nimal Perera', 'Senior Service Engineer', 'Consumer Electronics', 'Western Province - Colombo Metro', 'SCH-SRV-2026', 2500000, 3200000, 2680000, 'Met base threshold on 18th May; on track for stretch tier.', 2, '2026-05-18 14:30', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-002', 'mtb-2026-05', 'EMP-1045', 'Kasun Jayasuriya', 'Enterprise Key Account Manager', 'Enterprise Solutions', 'Southern & Central Hub', 'SCH-DLR-2026', 4000000, 5000000, 4680000, 'Large commercial institutional contract invoiced in SAP B1.', 3, '2026-05-17 11:20', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-003', 'mtb-2026-05', 'EMP-1088', 'Dilshan Silva', 'Field Support Specialist', 'Consumer Electronics', 'Western Province - Gampaha', 'SCH-SRV-2026', 1800000, 2200000, 1656000, '92% achieved; 3 service jobs pending customer signoff.', 4, '2026-05-18 09:15', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-004', 'mtb-2026-05', 'EMP-1092', 'Tharindu Fernando', 'Channel Account Executive', 'Mobile & Accessories', 'North Western & Sabaragamuwa', 'SCH-SLS-2026', 3200000, 4000000, 2496000, 'Mid-month dealer restocking order pending credit approval.', 5, '2026-05-16 16:40', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-005', 'mtb-2026-05', 'EMP-1104', 'Anura Wickramasinghe', 'Retail Sales Executive', 'Mobile & Accessories', 'Colombo Flagship Showroom', 'SCH-SLS-2026', 2800000, 3500000, 3150000, 'Exceeded base target (112.5%); qualified for Tier-2 bonus.', 6, '2026-05-18 10:05', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-006', 'mtb-2026-05', 'EMP-1115', 'Saman Kumara', 'Solar Solutions Specialist', 'Renewable Energy', 'Islandwide Commercial Projects', 'SCH-SOLAR-2026', 6500000, 8500000, 7200000, 'Factory rooftop hybrid installation commission confirmed.', 7, '2026-05-15 15:55', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-007', 'mtb-2026-05', 'EMP-1128', 'Chamara Bandara', 'Showroom Promoter', 'Mobile & Accessories', 'Kandy City Center Showroom', 'SCH-PRM-2026', 1200000, 1600000, 980000, 'Weekend promotional push planned for month-end close.', 8, '2026-05-17 17:10', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_entries" ("id", "batch_id", "participant_id", "employee_name", "role", "division", "territory", "scheme_code", "base_target_lkr", "stretch_target_lkr", "mtd_actual_lkr", "notes", "sort_order", "last_updated", "created_at", "updated_at") VALUES ('TGT-202605-008', 'mtb-2026-05', 'EMP-1142', 'Pradeep Mendis', 'Senior Technician - HVAC', 'Consumer Electronics', 'Southern Province - Galle Hub', 'SCH-SRV-2026', 2200000, 2800000, 2050000, '93.2% completed; warranty maintenance jobs logged.', 9, '2026-05-18 13:45', '2026-10-22T07:50:40.196Z', '2026-10-22T07:50:40.196Z') ON CONFLICT DO NOTHING;

-- Data for table "monthly_target_history_logs" (8 rows)
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('REV-202605-03', 'mtb-2026-05', 'v1.2', 'Draft', '2026-05-18T10:15:00.000Z', 'Lakmal Perera', 'Incentive Administrator', 'Updated stretch target quota for Consumer Electronics team', 'Adjusted Nimal Perera & Dilshan Silva stretch targets based on mid-month territory reallocation.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('REV-202605-02', 'mtb-2026-05', 'v1.1', 'Draft', '2026-05-02T09:30:00.000Z', 'Lakmal Perera', 'Incentive Administrator', 'Bulk Excel upload of initial May 2026 quotas', 'Imported 8 participant targets from Sales Operations Master Allocation sheet.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('REV-202605-01', 'mtb-2026-05', 'v1.0', 'Draft', '2026-04-28T16:45:00.000Z', 'Sunil Jayawardena', 'Head of Sales Operations', 'Initialized May 2026 target period cycle', 'Base target templates cloned from April baseline with +5% growth index.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('rev-status-135565', 'mtb-2026-05', 'v1.2 Draft', 'Locked', '2026-10-22T07:45:35.564Z', 'Lakmal Perera', 'Incentive Administrator', 'Status transitioned to Locked', 'Batch May 2026 (Current) (mtb-2026-05) status changed to Locked. Period locked against revisions in PostgreSQL.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('rev-status-143635', 'mtb-2026-05', 'v1.2 Draft', 'Draft', '2026-10-22T07:45:43.634Z', 'Lakmal Perera', 'Incentive Administrator', 'Status transitioned to Draft', 'Batch May 2026 (Current) (mtb-2026-05) status changed to Draft. Period unlocked for adjustments.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('rev-026-05-4692', 'mtb-2026-05', 'v1.2 Draft', 'Draft', '2026-10-22T07:49:24.686Z', 'Lakmal Perera', 'Incentive Administrator', 'Target batch updated and synchronized with PostgreSQL', 'Updated monthly targets for period May 2026 (Current). Total entries: 9.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('rev-026-05-0202', 'mtb-2026-05', 'v1.2 Draft', 'Draft', '2026-10-22T07:50:40.196Z', 'Lakmal Perera', 'Incentive Administrator', 'Target batch updated and synchronized with PostgreSQL', 'Updated monthly targets for period May 2026 (Current). Total entries: 9.') ON CONFLICT DO NOTHING;
INSERT INTO "monthly_target_history_logs" ("id", "batch_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('rev-status-452710', 'mtb-2026-05', 'v1.2 Draft', 'Approved', '2026-10-22T07:50:52.710Z', 'Lakmal Perera', 'Incentive Administrator', 'Status transitioned to Approved', 'Batch May 2026 (Current) (mtb-2026-05) status changed to Approved. Approved total portfolio quota of LKR 24,220,000 across 9 participants.') ON CONFLICT DO NOTHING;

-- Data for table "other_brand_equipments" (2 rows)
INSERT INTO "other_brand_equipments" ("id", "equipmentId", "customerId", "customerName", "siteId", "siteName", "equipmentCategory", "brand", "model", "serial", "serialUnknown", "previousSupplier", "takeoverDate", "takeoverCondition", "status", "createdAt", "updatedAt") VALUES (1, 'test 000000001otherbrand', 1, 'Jayasuriya Textiles (Pvt) Ltd', NULL, 'Colombo 03 Head Office', 'Air Conditioning Residential', 'Daikin Overseas', 'FTKC35TVMV Inverter', 'DKN-66102-SL', 'No', 'Southern Cool Tech (Third Party)', '2026-09-01', 'Poor airflow; requires coil chemical washing and gas top-up', 'Active', '2026-10-22T18:23:57.573Z', '2026-10-22T22:44:45.716Z') ON CONFLICT DO NOTHING;
INSERT INTO "other_brand_equipments" ("id", "equipmentId", "customerId", "customerName", "siteId", "siteName", "equipmentCategory", "brand", "model", "serial", "serialUnknown", "previousSupplier", "takeoverDate", "takeoverCondition", "status", "createdAt", "updatedAt") VALUES (6, 'test0000002otherbrand', 5, 'ayesha', 4, 'PBSS', 'ac', 'panasonic', 'qwe', NULL, 'No', NULL, NULL, NULL, 'Active', '2026-10-22T22:45:30.090Z', '2026-10-22T22:45:30.090Z') ON CONFLICT DO NOTHING;

-- Data for table "participant_history_logs" (11 rows)
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('HIST-01', 'EMP-1021', '2026-01-05T09:30:12.000Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SRV-2026', 'None', 'Primary Technician (100% Allocation)', 'Annual 2026 Field Service Incentive kickoff enrollment') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('HIST-02', 'EMP-1021', '2026-02-01T14:15:45.000Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SLS-2026', 'None', 'Secondary Contributor (20% Allocation)', 'Approved cross-selling scheme bonus for authorized repairs') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('HIST-10', 'EMP-1022', '2026-03-28T11:20:00.000Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-DLR-2026', 'None', 'Key Account Manager (100% Allocation)', 'Assigned as primary relationship manager for Top 10 B2B dealers') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('HIST-20', 'EMP-1023', '2026-01-05T10:00:00.000Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SRV-2026', 'None', 'Primary Technician (100% Allocation)', '2026 Field Engineer enrollment') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('HIST-30', 'EMP-1024', '2026-01-10T15:40:00.000Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SLS-2026', 'None', 'Senior Channel Account Exec (100% Allocation)', 'Promotion to Senior Channel Rep with retail target tier') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('HIST-40', 'EMP-1025', '2026-04-02T08:30:00.000Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Status Changed', 'SCH-SRV-2026', 'Active', 'Inactive / Probation Hold', 'Under probation evaluation per HR guidelines') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('hist-018547', 'EMP-1027', '2026-10-22T09:23:38.545Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Profile Created', NULL, 'None', 'Junior Service Engineer (Enterprise Solutions)', 'Participant profile enrolled into Incentive System') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('hist-074097', 'EMP-1027', '2026-10-22T09:24:34.094Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-MOB-2027', 'None', 'Sales Executive (100% Allocation)', 'test01') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('hist-505396', 'TST-0001', '2026-10-22T11:11:45.394Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Profile Created', NULL, 'None', 'Senior Service Engineer (Enterprise Solutions)', 'Participant profile enrolled into Incentive System') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('hist-544994', 'TST-0001', '2026-10-22T11:12:24.991Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-MOB-2027', 'None', 'Lead Supervisor (100% Allocation)', 'Assigned in May 2026 incentive cycle') ON CONFLICT DO NOTHING;
INSERT INTO "participant_history_logs" ("id", "participant_id", "timestamp", "author", "role", "event_type", "scheme_code", "previous_value", "new_value", "change_reason") VALUES ('hist-551464', 'TST-0001', '2026-10-22T11:12:31.462Z', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Role Reassigned', NULL, 'Senior Service Engineer (Enterprise Solutions)', 'Senior Service Engineer (Enterprise Solutions)', 'Participant profile details synchronized with PostgreSQL') ON CONFLICT DO NOTHING;

-- Data for table "participant_scheme_assignments" (9 rows)
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-101', 'EMP-1021', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Primary Technician', TRUE, '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 100, 'Active', 'Assigned lead role for Colombo Metro customer tickets', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-102', 'EMP-1021', 'SCH-SLS-2026', 'Retail Smartphone & Devices Sales Incentive', 'Secondary Contributor', FALSE, '2026-01-31T18:30:00.000Z', '2026-06-29T18:30:00.000Z', 20, 'Active', 'Warranty extension accessory cross-sell contribution', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-201', 'EMP-1022', 'SCH-DLR-2026', 'Tier-1 Authorised Dealer Quarterly Rebate', 'Key Account Manager', TRUE, '2026-03-31T18:30:00.000Z', '2026-06-29T18:30:00.000Z', 100, 'Active', 'Q2 Enterprise volume target keeper', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-301', 'EMP-1023', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Primary Technician', TRUE, '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 100, 'Active', 'Kandy and Central Region service coverage', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-401', 'EMP-1024', 'SCH-SLS-2026', 'Retail Smartphone & Devices Sales Incentive', 'Senior Channel Account Exec', TRUE, '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 100, 'Active', 'Galle Road and Liberty Plaza flagship retail stores', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-501', 'EMP-1025', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Secondary Contributor', FALSE, '2026-03-31T18:30:00.000Z', '2026-06-29T18:30:00.000Z', 50, 'Inactive', 'Probationary period evaluation (currently inactive on live runs)', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('ASG-601', 'EMP-1026', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Head of Department (HOD)', TRUE, '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 100, 'Active', 'Departmental target oversight', '2026-10-22T08:55:28.755Z', '2026-10-22T08:55:28.755Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('asg-1027-4094', 'EMP-1027', 'SCH-MOB-2027', 'chathuni', 'Sales Executive', TRUE, '2026-04-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 100, 'Active', 'test01', '2026-10-22T09:24:34.094Z', '2026-10-22T09:24:34.094Z') ON CONFLICT DO NOTHING;
INSERT INTO "participant_scheme_assignments" ("id", "participant_id", "scheme_code", "scheme_name", "calculation_role", "is_primary_role", "effective_from", "effective_to", "target_allocation_percent", "status", "notes", "created_at", "updated_at") VALUES ('asg-0001-4991', 'TST-0001', 'SCH-MOB-2027', 'chathuni', 'Lead Supervisor', TRUE, '2026-04-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 100, 'Active', 'Assigned in May 2026 incentive cycle', '2026-10-22T11:12:24.991Z', '2026-10-22T11:12:24.991Z') ON CONFLICT DO NOTHING;

-- Data for table "parts_used" (6 rows)
INSERT INTO "parts_used" ("id", "jobId", "partCode", "name", "qtyUsed", "unitPrice", "createdAt") VALUES ('P-107', 'SC-2026-20512', 'SEN-TEMP-NTC10', 'NTC 10K Temperature Probe Sensor', 3, 2100, '2026-10-22T08:46:22.302Z') ON CONFLICT DO NOTHING;
INSERT INTO "parts_used" ("id", "jobId", "partCode", "name", "qtyUsed", "unitPrice", "createdAt") VALUES ('P-106', 'SC-2026-20512', 'BRG-6204-2RS', 'Deep Groove Ball Bearing 6204-2RS', 12, 1200, '2026-10-22T08:49:52.001Z') ON CONFLICT DO NOTHING;
INSERT INTO "parts_used" ("id", "jobId", "partCode", "name", "qtyUsed", "unitPrice", "createdAt") VALUES ('P-102', 'SC-2026-20514', 'RLY-DTC-24V', 'Thermostat Relay Switch 24V DC', 1, 4200, '2026-10-22T08:23:34.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "parts_used" ("id", "jobId", "partCode", "name", "qtyUsed", "unitPrice", "createdAt") VALUES ('P-104', 'SC-2026-20514', 'R410A-CAN-1KG', 'Refrigerant R410a Canister 1kg', 14, 8500, '2026-10-23T10:15:33.743Z') ON CONFLICT DO NOTHING;
INSERT INTO "parts_used" ("id", "jobId", "partCode", "name", "qtyUsed", "unitPrice", "createdAt") VALUES ('P-101', 'SC-2026-20512', 'CAP-45UF-450V', 'AC Compressor Capacitor 45uF 450V', 15, 3500, '2026-10-22T08:23:34.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "parts_used" ("id", "jobId", "partCode", "name", "qtyUsed", "unitPrice", "createdAt") VALUES ('P-103', 'SC-2026-20511', 'FLT-VRF-CAS60', 'VRF Cassette Dust Filter 600x600', 2, 2800, '2026-10-22T08:30:33.632Z') ON CONFLICT DO NOTHING;

-- Data for table "project_budgets" (2 rows)
INSERT INTO "project_budgets" ("id", "projectCode", "projectName", "customer", "projectManager", "startDate", "endDate", "budgetVersion", "versionStatus", "status", "createdAt", "updatedAt") VALUES (6, 'PRJ-KANDY-HVAC-2026', 'Kandy Lake Hotel Central VRV Upgrade', 'Kandy Lake Hotel (C-30514)', 'Kasun Perera', NULL, NULL, 1, 'Approved', 'Active', '2026-10-28T03:14:56.204Z', '2026-10-28T03:14:56.204Z') ON CONFLICT DO NOTHING;
INSERT INTO "project_budgets" ("id", "projectCode", "projectName", "customer", "projectManager", "startDate", "endDate", "budgetVersion", "versionStatus", "status", "createdAt", "updatedAt") VALUES (7, 'PRJ-PERERA-COLD-2026', 'Perera Logistics Cold Room Installation', 'Perera Holdings (Pvt) Ltd (C-30513)', 'Nuwan Silva', NULL, NULL, 1, 'Approved', 'Active', '2026-10-28T03:14:56.206Z', '2026-10-28T03:14:56.206Z') ON CONFLICT DO NOTHING;

-- Data for table "repeat_reasons" (5 rows)
INSERT INTO "repeat_reasons" ("id", "reasonCode", "description", "countsAsPoorService", "detectionPeriodDays", "appliesToCategory", "active", "status", "createdAt", "updatedAt") VALUES (2, 'rr0001', 'fghj', 'Yes', 4, 'hndivndv', 'Yes', 'Active', '2026-10-23T01:21:45.102Z', '2026-10-23T01:21:45.102Z') ON CONFLICT DO NOTHING;
INSERT INTO "repeat_reasons" ("id", "reasonCode", "description", "countsAsPoorService", "detectionPeriodDays", "appliesToCategory", "active", "status", "createdAt", "updatedAt") VALUES (5, 'RPT-INCORRECT-DIAG', 'Incorrect Initial Fault Diagnosis', 'Yes', 30, NULL, 'Yes', 'Active', '2026-10-28T03:14:56.180Z', '2026-10-28T03:14:56.180Z') ON CONFLICT DO NOTHING;
INSERT INTO "repeat_reasons" ("id", "reasonCode", "description", "countsAsPoorService", "detectionPeriodDays", "appliesToCategory", "active", "status", "createdAt", "updatedAt") VALUES (6, 'RPT-PART-DEFECT', 'Replaced Spare Part Premature Failure', 'No', 30, NULL, 'Yes', 'Active', '2026-10-28T03:14:56.183Z', '2026-10-28T03:14:56.183Z') ON CONFLICT DO NOTHING;
INSERT INTO "repeat_reasons" ("id", "reasonCode", "description", "countsAsPoorService", "detectionPeriodDays", "appliesToCategory", "active", "status", "createdAt", "updatedAt") VALUES (7, 'RPT-INCOMPLETE-TEST', 'Incomplete Post-Repair Commissioning Test', 'Yes', 14, NULL, 'Yes', 'Active', '2026-10-28T03:14:56.184Z', '2026-10-28T03:14:56.184Z') ON CONFLICT DO NOTHING;
INSERT INTO "repeat_reasons" ("id", "reasonCode", "description", "countsAsPoorService", "detectionPeriodDays", "appliesToCategory", "active", "status", "createdAt", "updatedAt") VALUES (8, 'RPT-POWER-SURGE', 'External Site Power / Voltage Fluctuation', 'No', 30, NULL, 'Yes', 'Active', '2026-10-28T03:14:56.186Z', '2026-10-28T03:14:56.186Z') ON CONFLICT DO NOTHING;

-- Data for table "scheme_history_logs" (93 rows)
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1', 'sch-1', '2026-01-01T09:00:00.000Z', 'System Daemon', 'ERP Automation', 'Version Activated', 'Version v2.1 marked Active upon reaching Effective Date 2026-01-01.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-2', 'sch-1', '2025-12-28T16:30:00.000Z', 'D. Fernando', 'Head of Finance', 'Scheme Approved', 'Approved with Finance Committee authorization Ref #FIN-2025-894.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-3', 'sch-1', '2025-12-15T11:20:00.000Z', 'S. Perera', 'Incentive Administrator', 'New Version Created', 'Copied from v2.0 to introduce modified accessory commission rates.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-201', 'sch-2', '2026-01-01T09:00:00.000Z', 'System Daemon', 'ERP Automation', 'Version Activated', 'Version v1.4 activated on new fiscal calendar.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-301', 'sch-3', '2026-03-24T15:45:00.000Z', 'P. Wickramasinghe', 'Chief Executive Officer', 'CEO Approval Granted', 'Authorized scheme terms for Q2 dealer volume agreements Ref #CEO-2026-112.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-302', 'sch-3', '2026-03-10T10:15:00.000Z', 'S. Perera', 'Incentive Administrator', 'Draft Submitted for Approval', 'Submitted draft v3.0 to Finance & CEO for Q2 launch.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-401', 'sch-4', '2026-04-02T14:10:00.000Z', 'S. Perera', 'Incentive Administrator', 'Draft Scheme Initialized', 'Created draft v1.0 for May seasonal sales campaign.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-501', 'sch-5', '2026-01-01T00:00:00.000Z', 'System Daemon', 'ERP Automation', 'Status Changed to Inactive', 'Scheme validity expired. Closed and deactivated.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792580962014', 'sch-1', '2026-10-21T11:09:22.012Z', 'Test Suite', 'Incentive Administrator', 'Scheme Updated', 'Verified PostgreSQL update capability') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792580962067', 'sch-4', '2026-10-21T11:09:22.065Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Draft to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792581175179', 'sch-1', '2026-10-21T11:12:55.177Z', 'Test Suite', 'Incentive Administrator', 'Scheme Updated', 'Verified PostgreSQL update capability') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792581175235', 'sch-4', '2026-10-21T11:12:55.233Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792581860397', 'sch-1', '2026-10-21T11:24:20.395Z', 'Test Suite', 'Incentive Administrator', 'Scheme Updated', 'Verified PostgreSQL update capability') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792581860448', 'sch-4', '2026-10-21T11:24:20.447Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792582286279', 'sch-1', '2026-10-21T11:31:26.277Z', 'Test Suite', 'Incentive Administrator', 'Scheme Updated', 'Verified PostgreSQL update capability') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792582286329', 'sch-4', '2026-10-21T11:31:26.327Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792643004193', 'sch-1792643004134', '2026-10-22T04:23:24.185Z', 'Administrator', 'Incentive Manager', 'Scheme Created', 'Created new scheme SCH-MOB-2026 (sales scheama).') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792643037888', 'sch-1792643004134', '2026-10-22T04:23:57.879Z', 'Incentive Administrator', 'Incentive Administrator', 'Scheme Updated', 'Manual save for SCH-MOB-2026 (v1.0).') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792731974971', 'sch-4', '2026-10-23T05:06:14.970Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792643285590', 'sch-4', '2026-10-22T04:28:05.590Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792643405509', 'sch-4', '2026-10-22T04:30:05.508Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792643523823', 'sch-1792643004134', '2026-10-22T04:32:03.802Z', 'Incentive Administrator', 'Incentive Administrator', 'Scheme Updated', 'Manual save for SCH-MOB-2026 (v1.0).') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792643632012', 'sch-4', '2026-10-22T04:33:52.012Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792646621332', 'sch-621328', '2026-10-22T05:23:41.328Z', 'Administrator', 'Incentive Manager', 'Scheme Created', 'Created new scheme SCH-MOB-2027 (chathuni).') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792646908655', 'sch-4', '2026-10-22T05:28:28.653Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792647132992', 'sch-1792647132943', '2026-10-22T05:32:12.985Z', 'Administrator', 'Incentive Manager', 'Scheme Created', 'Created new scheme SCH-MOB-2003 (sales test01).') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792648086150', 'sch-4', '2026-10-22T05:48:06.149Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792649284668', 'sch-4', '2026-10-22T06:08:04.667Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792649300108', 'sch-4', '2026-10-22T06:08:20.107Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792649314657', 'sch-4', '2026-10-22T06:08:34.655Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792649334359', 'sch-4', '2026-10-22T06:08:54.358Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792651190758', 'sch-4', '2026-10-22T06:39:50.757Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792653920192', 'sch-4', '2026-10-22T07:25:20.191Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792654297826', 'sch-4', '2026-10-22T07:31:37.826Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792659802613', 'sch-4', '2026-10-22T09:03:22.612Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792659845977', 'sch-4', '2026-10-22T09:04:05.975Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792662026817', 'sch-4', '2026-10-22T09:40:26.816Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792668429009', 'sch-4', '2026-10-22T11:27:09.009Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792668515382', 'sch-4', '2026-10-22T11:28:35.380Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792682474506', 'sch-4', '2026-10-22T15:21:14.505Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792682814680', 'sch-4', '2026-10-22T15:26:54.678Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792683806426', 'sch-4', '2026-10-22T15:43:26.425Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792684020845', 'sch-4', '2026-10-22T15:47:00.844Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792734073691', 'sch-4', '2026-10-23T05:41:13.690Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792684155013', 'sch-4', '2026-10-22T15:49:15.011Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792734180949', 'sch-4', '2026-10-23T05:43:00.948Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792684236572', 'sch-4', '2026-10-22T15:50:36.571Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792685274601', 'sch-4', '2026-10-22T16:07:54.600Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792734207551', 'sch-4', '2026-10-23T05:43:27.549Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792685351716', 'sch-4', '2026-10-22T16:09:11.715Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792734228275', 'sch-4', '2026-10-23T05:43:48.274Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792685385220', 'sch-4', '2026-10-22T16:09:45.219Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792730760910', 'sch-4', '2026-10-23T04:46:00.909Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792734610091', 'sch-4', '2026-10-23T05:50:10.090Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792730781526', 'sch-4', '2026-10-23T04:46:21.525Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792734684437', 'sch-4', '2026-10-23T05:51:24.435Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792730798949', 'sch-4', '2026-10-23T04:46:38.946Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792736126230', 'sch-4', '2026-10-23T06:15:26.228Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792738541952', 'sch-4', '2026-10-23T06:55:41.950Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792745831433', 'sch-4', '2026-10-23T08:57:11.431Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792746153489', 'sch-4', '2026-10-23T09:02:33.488Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792747066983', 'sch-4', '2026-10-23T09:17:46.983Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792747778784', 'sch-4', '2026-10-23T09:29:38.781Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792748890325', 'sch-4', '2026-10-23T09:48:10.321Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792750079880', 'sch-4', '2026-10-23T10:07:59.875Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792750810117', 'sch-4', '2026-10-23T10:20:10.115Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792751184205', 'sch-4', '2026-10-23T10:26:24.205Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792754530470', 'sch-4', '2026-10-23T11:22:10.469Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792754677117', 'sch-4', '2026-10-23T11:24:37.115Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792763525768', 'sch-4', '2026-10-23T13:52:05.767Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792766571258', 'sch-4', '2026-10-23T14:42:51.256Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792769892589', 'sch-4', '2026-10-23T15:38:12.588Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792770704829', 'sch-4', '2026-10-23T15:51:44.828Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792771574043', 'sch-4', '2026-10-23T16:06:14.041Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792771990360', 'sch-4', '2026-10-23T16:13:10.358Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792772013275', 'sch-4', '2026-10-23T16:13:33.274Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792772826054', 'sch-4', '2026-10-23T16:27:06.053Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792989664787', 'sch-4', '2026-10-26T04:41:04.786Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793013863213', 'sch-4', '2026-10-26T11:24:23.211Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792989694589', 'sch-4', '2026-10-26T04:41:34.588Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793013911209', 'sch-4', '2026-10-26T11:25:11.208Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792989925289', 'sch-4', '2026-10-26T04:45:25.288Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792990343109', 'sch-1792990343061', '2026-10-26T04:52:23.102Z', 'Administrator', 'Incentive Manager', 'Scheme Created', 'Created new scheme SCH-COM-2026-26 (test-sc name).') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1792992348918', 'sch-4', '2026-10-26T05:25:48.918Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793073640116', 'sch-4', '2026-10-27T04:00:40.115Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793008451491', 'sch-4', '2026-10-26T09:54:11.491Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793083590849', 'sch-4', '2026-10-27T06:46:30.847Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793012474862', 'sch-4', '2026-10-26T11:01:14.861Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793085157306', 'sch-4', '2026-10-27T07:12:37.304Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793092397253', 'sch-4', '2026-10-27T09:13:17.251Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793092427088', 'sch-4', '2026-10-27T09:13:47.087Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793093937859', 'sch-4', '2026-10-27T09:38:57.856Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_history_logs" ("id", "scheme_id", "timestamp", "user", "role", "action", "details") VALUES ('h-1793159418806', 'sch-4', '2026-10-28T03:50:18.804Z', 'Director Kamal', 'Approver', 'Status Changed to Approved', 'Transitioned status from Approved to Approved. Note: Approved by director during unit testing') ON CONFLICT DO NOTHING;

-- Data for table "scheme_rate_items" (16 rows)
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-1', 'sch-1', 'Smartphones', 'Flagship 5G Series', '2.50%', '0-30 Days', 'Net Billed Value', '2026-10-21T11:01:38.669Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-2', 'sch-1', 'Smartphones', 'Mid-tier A Series', '3.00%', '0-30 Days', 'Net Billed Value', '2026-10-21T11:01:38.669Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-3', 'sch-1', 'Accessories', 'Audio & Wearables', '5.00%', '0-45 Days', 'Gross Margin %', '2026-10-21T11:01:38.669Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-4', 'sch-1', 'Smartphones', 'Entry Level 4G', '1.75%', '0-30 Days', 'Net Billed Value', '2026-10-21T11:01:38.669Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-201', 'sch-2', 'LED TV Repair', 'Panel Replacement', 'LKR 1,200 / job', 'N/A', 'Completed Job', '2026-10-21T11:01:38.679Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-202', 'sch-2', 'Refrigerator Repair', 'Inverter Compressor', 'LKR 1,800 / job', 'N/A', 'Completed Job', '2026-10-21T11:01:38.679Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-203', 'sch-2', 'Washing Machine', 'Motor & PCB Overhaul', 'LKR 1,400 / job', 'N/A', 'Completed Job', '2026-10-21T11:01:38.679Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-204', 'sch-2', 'Air Conditioner', 'Gas Charging & Service', 'LKR 1,600 / job', 'N/A', 'Completed Job', '2026-10-21T11:01:38.679Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-301', 'sch-3', 'Enterprise Servers', 'Blade Server Series', '3.50%', '0-45 Days', 'Collected Cash', '2026-10-21T11:01:38.684Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-302', 'sch-3', 'Networking', 'Switch & Firewall Packages', '4.00%', '0-45 Days', 'Collected Cash', '2026-10-21T11:01:38.684Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-401', 'sch-4', 'Flagship 5G', 'Titanium Pro 256GB', 'LKR 1,500 / unit', 'N/A', 'Verified Sell-out', '2026-10-21T11:01:38.690Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-402', 'sch-4', 'Flagship 5G', 'Ultra Fold 512GB', 'LKR 2,500 / unit', 'N/A', 'Verified Sell-out', '2026-10-21T11:01:38.690Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-501', 'sch-5', 'Accessories', 'Power Banks & Cables', '6.00%', '0-30 Days', 'Gross Margin', '2026-10-21T11:01:38.696Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-1792643523821-0', 'sch-1792643004134', 'General Portfolio', 'Standard Line', '2.50%', '0-30 Days', 'Billed Revenue (Excl. Tax)', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-1792647132990-0', 'sch-1792647132943', 'General Portfolio', 'Standard Line', '2.50%', '0-30 Days', 'Billed Revenue (Excl. Tax)', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rate_items" ("id", "scheme_id", "category", "product_line", "commission_rate", "payment_term_band", "basis", "created_at") VALUES ('rt-1792990343107-0', 'sch-1792990343061', 'General Portfolio', 'Standard Line', '2.50%', '0-30 Days', 'Billed Revenue (Excl. Tax)', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;

-- Data for table "scheme_rules" (21 rows)
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1', 'sch-1', 'Minimum Turnover Achievement Floor', 'Min Target %', '80.00%', 'Monthly Target Entry', '2026-10-21T11:01:38.664Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-2', 'sch-1', 'Debtor Overdue Penalty Clawback', 'Max Allowed Overdue', '60 Days', 'SAP AR Invoice Aging', '2026-10-21T11:01:38.664Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-3', 'sch-1', 'Minimum Attendance Requirement', 'Min Present Days %', '90.00%', 'HR Bio-Metric Portal', '2026-10-21T11:01:38.664Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-4', 'sch-1', 'Top Performer Accelerator Cap', 'Max Payout Limit', 'LKR 350,000', 'Executive Committee Policy', '2026-10-21T11:01:38.664Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-5', 'sch-1', 'Payment Realization Compliance', 'Cash Collection Days', 'Within 45 Days', 'SAP Bank Reconciliation', '2026-10-21T11:01:38.664Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-201', 'sch-2', 'Minimum First-Time-Fix (FTF) Rate', 'Min FTF %', '92.00%', 'Service Manager Evaluation', '2026-10-21T11:01:38.676Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-202', 'sch-2', 'Repeat Service Call Penalty', '30-Day Re-work Deduction', 'LKR 1,500 / job', 'ITSM Ticket Ledger', '2026-10-21T11:01:38.676Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-203', 'sch-2', 'Customer CSAT Score Multiplier', 'Min Average Rating', '4.50 / 5.0', 'Customer Feedback Module', '2026-10-21T11:01:38.676Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-204', 'sch-2', 'Spare Parts Variance Allowance', 'Max Stock Discrepancy', '0.50%', 'SAP Warehouse Goods Issue', '2026-10-21T11:01:38.676Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-301', 'sch-3', 'Quarterly Minimum Volume Threshold', 'Min Volume Target', 'LKR 15,000,000', 'Dealer Contract Appendix B', '2026-10-21T11:01:38.682Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-302', 'sch-3', 'Debtor Invoice Aging Window', 'Max Realization Lag', '45 Days', 'SAP AR Bank Payment Posting', '2026-10-21T11:01:38.682Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-303', 'sch-3', 'Sell-Out Verification Requirement', 'Dealer Sell-Out Proof', '100% IMEI Scanned', 'Dealer Portal Sell-out Log', '2026-10-21T11:01:38.682Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-401', 'sch-4', 'IMEI Customer Registration Verification', 'Warranty Activation %', '100.00%', 'Promoter App Warranty Scan', '2026-10-21T11:01:38.688Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-402', 'sch-4', 'Minimum Monthly Sold Units Qualifier', 'Min Flagship Units', '15 Units', 'Promoter Sell-out Matrix', '2026-10-21T11:01:38.688Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-501', 'sch-5', 'Minimum Gross Margin Floor', 'Min GM %', '22.00%', 'SAP Sales Analysis', '2026-10-21T11:01:38.694Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1792643004134-1', 'sch-1792643004134', 'Minimum Target Threshold', 'Min Target %', '80.00%', 'Monthly Target Entry', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1792643004134-2', 'sch-1792643004134', 'Debtor Penalty Compliance', 'Max Aging', '60 Days', 'SAP AR Invoice Aging', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1792647132943-1', 'sch-1792647132943', 'Minimum Target Threshold', 'Min Target %', '80.00%', 'Monthly Target Entry', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1792647132943-2', 'sch-1792647132943', 'Debtor Penalty Compliance', 'Max Aging', '60 Days', 'SAP AR Invoice Aging', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1792990343061-1', 'sch-1792990343061', 'Minimum Target Threshold', 'Min Target %', '80.00%', 'Monthly Target Entry', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_rules" ("id", "scheme_id", "rule", "parameter", "value", "source", "created_at") VALUES ('r-1792990343061-2', 'sch-1792990343061', 'Debtor Penalty Compliance', 'Max Aging', '60 Days', 'SAP AR Invoice Aging', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;

-- Data for table "scheme_slabs" (26 rows)
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1', 'sch-1', 'S-01', 0, 79.99, 0, 0, 'Below floor threshold - No incentive', '2026-10-21T11:01:38.666Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-2', 'sch-1', 'S-02', 80, 99.99, 75, 0.75, 'Baseline qualifier band', '2026-10-21T11:01:38.666Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-3', 'sch-1', 'S-03', 100, 119.99, 100, 1, 'Target achieved - Full payout', '2026-10-21T11:01:38.666Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-4', 'sch-1', 'S-04', 120, 139.99, 125, 1.25, 'High performance bonus tier', '2026-10-21T11:01:38.666Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-5', 'sch-1', 'S-05', 140, 200, 150, 1.5, 'Super-achiever capped bracket', '2026-10-21T11:01:38.666Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-201', 'sch-2', 'S-11', 0, 84.99, 0, 0, 'FTF below 85% — disqualified', '2026-10-21T11:01:38.677Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-202', 'sch-2', 'S-12', 85, 91.99, 50, 0.5, 'FTF 85-91% — 50% incentive payout', '2026-10-21T11:01:38.677Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-203', 'sch-2', 'S-13', 92, 95.99, 100, 1, 'Standard FTF target benchmark', '2026-10-21T11:01:38.677Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-204', 'sch-2', 'S-14', 96, 100, 130, 1.3, 'Excellence rating FTF > 96%', '2026-10-21T11:01:38.677Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-301', 'sch-3', 'S-21', 0, 89.99, 0, 0, 'Below quarterly threshold', '2026-10-21T11:01:38.683Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-302', 'sch-3', 'S-22', 90, 99.99, 80, 0.8, '90-100% Achievement rebate', '2026-10-21T11:01:38.683Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-303', 'sch-3', 'S-23', 100, 124.99, 100, 1, 'Target reached — 3.0% flat rebate', '2026-10-21T11:01:38.683Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-304', 'sch-3', 'S-24', 125, 200, 135, 1.35, 'Super tier dealer accelerator', '2026-10-21T11:01:38.683Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-401', 'sch-4', 'S-31', 0, 99.99, 0, 0, 'Under 15 units — standard pay only', '2026-10-21T11:01:38.689Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-402', 'sch-4', 'S-32', 100, 149.99, 100, 1, '15-25 units — LKR 1,500/unit', '2026-10-21T11:01:38.689Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-403', 'sch-4', 'S-33', 150, 200, 140, 1.4, '>25 units — LKR 2,100/unit accelerator', '2026-10-21T11:01:38.689Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-501', 'sch-5', 'S-41', 100, 200, 100, 1, 'Full payout upon achieving clearance target', '2026-10-21T11:01:38.695Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792643523816-0', 'sch-1792643004134', 'S-01', 0, 79.99, 0, 0, 'Below qualifier', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792643523817-1', 'sch-1792643004134', 'S-02', 80, 99.99, 75, 0.75, 'Baseline qualifier', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792643523819-2', 'sch-1792643004134', 'S-03', 100, 120, 100, 1, 'Target achieved', '2026-10-22T04:32:03.802Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792647132989-0', 'sch-1792647132943', 'S-01', 0, 79.99, 0, 0, 'Below qualifier', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792647132990-1', 'sch-1792647132943', 'S-02', 80, 99.99, 75, 0.75, 'Baseline qualifier', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792647132990-2', 'sch-1792647132943', 'S-03', 100, 120, 100, 1, 'Target achieved', '2026-10-22T05:32:12.985Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792990343106-0', 'sch-1792990343061', 'S-01', 0, 79.99, 0, 0, 'Below qualifier', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792990343106-1', 'sch-1792990343061', 'S-02', 80, 99.99, 75, 0.75, 'Baseline qualifier', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_slabs" ("id", "scheme_id", "slab_id", "min_percent", "max_percent", "payout_percent", "multiplier", "description", "created_at") VALUES ('sl-1792990343107-2', 'sch-1792990343061', 'S-03', 100, 120, 100, 1, 'Target achieved', '2026-10-26T04:52:23.102Z') ON CONFLICT DO NOTHING;

-- Data for table "scheme_versions" (10 rows)
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-1', 'sch-1', 'v2.1', '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Active', 'S. Perera (Incentive Admin)', '2026-10-21T11:01:38.671Z', 'D. Fernando (Head of Finance)', NULL, 'Updated Audio & Wearables commission from 4.5% to 5.0% and adjusted floor threshold.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-2', 'sch-1', 'v2.0', '2025-05-31T18:30:00.000Z', '2025-12-30T18:30:00.000Z', 'Superseded', 'S. Perera (Incentive Admin)', '2026-10-21T11:01:38.671Z', 'P. Wickramasinghe (CEO)', NULL, 'Introduced 5-slab achievement curve and 60-day clawback window.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-201', 'sch-2', 'v1.4', '2025-12-31T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Active', 'S. Perera (Incentive Admin)', '2026-10-21T11:01:38.680Z', 'M. Jayawardena (Service Director)', NULL, 'Added CSAT 4.5 multiplier threshold and updated inverter compressor job bounty.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-301', 'sch-3', 'v3.0', '2026-03-31T18:30:00.000Z', '2026-06-29T18:30:00.000Z', 'Approved', 'S. Perera (Incentive Admin)', '2026-10-21T11:01:38.685Z', 'P. Wickramasinghe (CEO)', NULL, 'Approved by CEO for Q2 rollout. Awaiting Finance activation.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-501', 'sch-5', 'v1.2', '2025-09-30T18:30:00.000Z', '2025-12-30T18:30:00.000Z', 'Inactive', 'S. Perera (Incentive Admin)', '2026-10-21T11:01:38.696Z', 'D. Fernando', NULL, 'Completed and expired on 31-Dec-2025. Marked Inactive.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-401', 'sch-4', 'v1.0', '2026-04-30T18:30:00.000Z', '2026-05-30T18:30:00.000Z', 'Approved', 'S. Perera (Incentive Admin)', '2026-10-21T11:01:38.691Z', 'Director Kamal', '2026-10-21T11:09:22.065Z', 'Initial draft configured for May 2026 promotional campaign.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-1792643004192', 'sch-1792643004134', 'v1.0', '2026-06-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Draft', 'Administrator', '2026-10-22T04:23:24.185Z', NULL, NULL, 'Initial scheme creation.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-1792646621330', 'sch-621328', 'v1.0', '2026-12-31T18:30:00.000Z', '2027-12-30T18:30:00.000Z', 'Draft', 'Administrator', '2026-10-22T05:23:41.328Z', NULL, NULL, 'Initial scheme creation.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-1792647132991', 'sch-1792647132943', 'v1.0', '2026-06-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Draft', 'Administrator', '2026-10-22T05:32:12.985Z', NULL, NULL, 'Initial scheme creation.') ON CONFLICT DO NOTHING;
INSERT INTO "scheme_versions" ("id", "scheme_id", "version", "effective_from", "effective_to", "status", "created_by", "created_date", "approved_by", "approval_date", "change_summary") VALUES ('v-1792990343108', 'sch-1792990343061', 'v1.0', '2026-06-30T18:30:00.000Z', '2026-12-30T18:30:00.000Z', 'Draft', 'Administrator', '2026-10-26T04:52:23.102Z', NULL, NULL, 'Initial scheme creation.') ON CONFLICT DO NOTHING;

-- Data for table "service_performance_batches" (2 rows)
INSERT INTO "service_performance_batches" ("id", "period", "division", "source_system", "received_on", "status", "locked_by", "locked_at", "notes", "created_at", "updated_at") VALUES ('BAT-SRV-2026-05A', 'May 2026', 'Consumer Electronics', 'Servio Service Desk / SAP B1 Service Module', '12-May-2026 14:35 IST', 'Draft', NULL, NULL, 'Live May 2026 closed service orders awaiting final HOD review.', '2026-10-22T15:07:50.289Z', '2026-10-22T15:07:50.289Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_batches" ("id", "period", "division", "source_system", "received_on", "status", "locked_by", "locked_at", "notes", "created_at", "updated_at") VALUES ('BAT-SRV-2026-04F', 'April 2026', 'All Service Divisions', 'Servio Service Desk / SAP B1 Service Module', '28-Apr-2026 16:45 IST', 'Locked', 'Chaminda Warnakula (Service HOD)', '2026-04-28T17:30:00.000Z', 'Final HOD locked service performance baseline for April incentive distribution.', '2026-10-22T15:09:44.865Z', '2026-10-22T15:09:44.865Z') ON CONFLICT DO NOTHING;

-- Data for table "service_performance_audit_logs" (3 rows)
INSERT INTO "service_performance_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('spaud-01', 'BAT-SRV-2026-05A', '12-May-2026 14:35 IST', 'Automated Data Pipeline', 'System Integration', 'Source Sync Completed', 'Synchronized 363 closed calls from Servio Service Desk / SAP B1 Service Module.', '2026-10-22T15:10:46.924Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('spaud-02', 'BAT-SRV-2026-05A', '12-May-2026 16:10 IST', 'Chaminda Warnakula', 'Service HOD', 'Poor Repeat Review', 'Classified 4 repeat calls as Poor Workmanship after customer callback inspection.', '2026-10-22T15:10:46.926Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_audit_logs" ("id", "batch_id", "timestamp", "user_name", "user_role", "action", "details", "created_at") VALUES ('spaud-03', 'BAT-SRV-2026-05A', '12-May-2026 17:00 IST', 'Lakmal Perera', 'Incentive Administrator', 'Draft Validation', 'Verified call closing dates fall strictly within 01-May-2026 to 31-May-2026 period boundary.', '2026-10-22T15:10:46.927Z') ON CONFLICT DO NOTHING;

-- Data for table "service_performance_job_tickets" (10 rows)
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-101', 'BAT-SRV-2026-05A', 'SRV-2026-0891', 'EMP-1021', 'Kasun Jayawardena', 'Aitken Spence Hotel PLC', 'Daikin VRV-IV 12HP Heat Recovery', '04-May-2026', 'Inverter Compressor PCB Error Code U4', TRUE, 9.8, 10, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Verified by HOD. Flawless first-time fix with OEM thermistor replacement.', 1, '2026-10-22T15:09:44.873Z', '2026-10-22T15:09:44.873Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-102', 'BAT-SRV-2026-05A', 'SRV-2026-0904', 'EMP-1022', 'Pradeep Bandara', 'Singer Mega Showroom - Kandy', 'Panasonic 4-Way Cassette 36,000 BTU', '07-May-2026', 'Condensate Drain Pump Overflow / Float Sensor', FALSE, 6.2, 8.5, 'Not Eligible', TRUE, 'SRV-2026-0742 (Closed 22-Apr)', TRUE, 'Closed', 'Flagged as Poor Service: Drain clamp improperly secured causing return flood visit within 15 days.', 2, '2026-10-22T15:09:44.877Z', '2026-10-22T15:09:44.877Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-103', 'BAT-SRV-2026-05A', 'SRV-2026-0922', 'EMP-1023', 'Ruwan Wijesinghe', 'Hemas Hospitals Thalawathugoda', 'Trane Air-Cooled Scroll Chiller 50TR', '09-May-2026', 'Low Suction Pressure / Expansion Valve Calibration', TRUE, 9.4, 9.5, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Critical ICU unit restored within 2-hour SLA.', 3, '2026-10-22T15:09:44.878Z', '2026-10-22T15:09:44.878Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-104', 'BAT-SRV-2026-05A', 'SRV-2026-0951', 'EMP-1024', 'Dilshan Madusanka', 'Dialog Axiata Cell Tower #44', 'Huawei Solar Inverter 20kW', '10-May-2026', 'DC Ground Fault / Array Isolation Alarm', FALSE, 5.8, 7.9, 'Not Eligible', TRUE, 'SRV-2026-0810 (Closed 28-Apr)', TRUE, 'Closed', 'Flagged as Poor Repeat: MC4 connector crimp failed after 12 days, resulting in downtime call.', 4, '2026-10-22T15:09:44.881Z', '2026-10-22T15:09:44.881Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-105', 'BAT-SRV-2026-05A', 'SRV-2026-0978', 'EMP-1025', 'Nuwan Fernando', 'Brandix Apparel Logistics Hub', 'SMA Sunny Tripower 50kW', '11-May-2026', 'Grid Parameter Drift / Firmware Update', TRUE, 9.7, 10, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Full system telemetry re-established.', 5, '2026-10-22T15:10:46.913Z', '2026-10-22T15:10:46.913Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-106', 'BAT-SRV-2026-05A', 'SRV-2026-1002', 'EMP-1022', 'Pradeep Bandara', 'Keells Super - Moratuwa', 'Carrier Multi-Deck Commercial Freezer', '11-May-2026', 'Evaporator Fan Motor Bearing Seizure', TRUE, 8.9, 9, 'Partial', FALSE, NULL, TRUE, 'Closed', 'Partial incentive credit: Shared call with apprentice technician.', 6, '2026-10-22T15:10:46.918Z', '2026-10-22T15:10:46.918Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-107', 'BAT-SRV-2026-05A', 'SRV-2026-1015', 'EMP-1030', 'Mahesh Gunawardena', 'Cinnamon Grand Colombo', 'Mitsubishi Electric City Multi 16HP', '12-May-2026', 'Refrigerant R410A Leak at Flare Nut', FALSE, 6.5, 8, 'Not Eligible', TRUE, 'SRV-2026-0865 (Closed 02-May)', TRUE, 'Closed', 'Flagged as Poor Repeat: Leak test was rushed on first call - joint required re-brazing on callback.', 7, '2026-10-22T15:10:46.920Z', '2026-10-22T15:10:46.920Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-108', 'BAT-SRV-2026-05A', 'SRV-2026-1033', 'EMP-1021', 'Kasun Jayawardena', 'National Development Bank HQ', 'Liebert Emerson Precision Data Center AC', '12-May-2026', 'Microprocessor Controller Board Replacement', TRUE, 9.9, 10, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Server room temperature kept within 21°C SLA throughout swap.', 8, '2026-10-22T15:10:46.921Z', '2026-10-22T15:10:46.921Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-109', 'BAT-SRV-2026-05A', 'SRV-2026-1055', 'EMP-1024', 'Dilshan Madusanka', 'Softlogic Retail - Nugegoda', 'Samsung 24,000 BTU Inverter Split', '13-May-2026', 'Indoor Cross-Flow Fan Noise', FALSE, 5.5, 7.5, 'Not Eligible', TRUE, 'SRV-2026-0920 (Closed 05-May)', TRUE, 'Closed', 'Customer complained of repeat vibrating noise after incomplete bushing replacement.', 9, '2026-10-22T15:10:46.922Z', '2026-10-22T15:10:46.922Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_job_tickets" ("id", "batch_id", "job_ticket_no", "employee_code", "employee_name", "customer_name", "equipment_model", "completion_date", "fault_category", "first_time_fix", "quality_score", "discipline_score", "eligibility", "is_poor_repeat", "repeat_reference_job", "hod_reviewed", "closure_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spjt-110', 'BAT-SRV-2026-05A', 'SRV-2026-1070', 'EMP-1031', 'Niroshan De Silva', 'Lanka Hospitals Blood Bank', 'Ultra-Low Temp Cold Chain Unit -80°C', '13-May-2026', 'Cascade Compressor Stage 2 Interstage Pressure', TRUE, 10, 10, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Zero temperature excursion. High-complexity repair validated by HOD.', 10, '2026-10-22T15:10:46.923Z', '2026-10-22T15:10:46.923Z') ON CONFLICT DO NOTHING;

-- Data for table "service_performance_technician_lines" (10 rows)
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-1', 'BAT-SRV-2026-05A', 'EMP-1021', 'Kasun Jayawardena', 'Senior Service Technician', 'Consumer Electronics', 48, 44, 3, 1, 0, 9.4, 9.7, 0, 'Reviewed', 'High FTF rate, zero poor repeats', 1, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-2', 'BAT-SRV-2026-05A', 'EMP-1022', 'Pradeep Bandara', 'Field Service Technician', 'Consumer Electronics', 42, 36, 4, 1, 1, 8.8, 9.1, 1, 'Exceptions Found', '1 poor repeat flagged on inverter board rework', 2, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-3', 'BAT-SRV-2026-05A', 'EMP-1023', 'Ruwan Wijesinghe', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 38, 34, 2, 2, 0, 9.1, 9.3, 0, 'Reviewed', 'Chiller maintenance project complete', 3, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-4', 'BAT-SRV-2026-05A', 'EMP-1024', 'Dilshan Madusanka', 'Junior Service Tech', 'Consumer Electronics', 30, 22, 5, 2, 1, 7.9, 8.4, 2, 'Exceptions Found', '2 poor repeats under senior review', 4, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-5', 'BAT-SRV-2026-05A', 'Nuwan Fernando', 'EMP-1025', 'Solar PV Maintenance Tech', 'Renewable Energy', 35, 33, 2, 0, 0, 9.6, 9.8, 0, 'Reviewed', 'Top customer satisfaction on commercial inverters', 5, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-6', 'BAT-SRV-2026-05A', 'EMP-1026', 'Chaminda Warnakula', 'Senior Service Technician', 'Consumer Electronics', 26, 24, 2, 0, 0, 9.5, 9.6, 0, 'Reviewed', 'Advanced diagnostic support calls', 6, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-7', 'BAT-SRV-2026-05A', 'EMP-1029', 'Dinesh Priyashantha', 'Field Service Technician', 'Consumer Electronics', 40, 37, 2, 1, 0, 9, 9.2, 0, 'Reviewed', 'Consistent completion velocity', 7, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-8', 'BAT-SRV-2026-05A', 'EMP-1030', 'Mahesh Gunawardena', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 36, 30, 3, 2, 1, 8.4, 8.9, 1, 'Exceptions Found', '1 poor repeat on duct leak sealing', 8, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-9', 'BAT-SRV-2026-05A', 'EMP-1031', 'Niroshan De Silva', 'Diagnostic Specialist', 'Commercial Air Conditioning', 32, 30, 2, 0, 0, 9.7, 9.8, 0, 'Reviewed', 'Expert escalation calls', 9, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_performance_technician_lines" ("id", "batch_id", "employee_code", "employee_name", "role", "division", "closed_jobs", "hod_eligible", "partial", "not_eligible", "excluded", "avg_quality", "avg_discipline", "poor_repeats", "review_status", "notes", "sort_order", "created_at", "updated_at") VALUES ('spt-10', 'BAT-SRV-2026-05A', 'EMP-1032', 'Sunil Jayasuriya', 'Solar PV Maintenance Tech', 'Renewable Energy', 34, 31, 2, 1, 0, 9.2, 9.4, 0, 'Reviewed', 'High grid synchronisation efficiency', 10, '2026-10-22T15:07:50.291Z', '2026-10-22T15:07:50.291Z') ON CONFLICT DO NOTHING;

-- Data for table "service_requests" (4 rows)
INSERT INTO "service_requests" ("id", "title", "callType", "customerName", "status", "priority", "assignedTo", "scheduledDate", "createdAt", "updatedAt", "requestNo", "requestDate", "channel", "receivedBy", "customer", "contact", "site", "requestType", "equipmentSystem", "customerOrigin", "equipmentOrigin", "entitlement", "description", "data") VALUES ('SR-2026-81126', 'Request SR-2026-81126', 'RPT-INCORRECT-DIAG', 'ayesha (cst01)', 'Draft', 'P1 - Critical', NULL, NULL, '2026-10-28T00:56:59.261Z', '2026-10-28T00:56:59.261Z', 'SR-2026-81126', '2026-10-28', 'Customer Portal', 'vihasna (test00003)', 'ayesha (cst01)', 'tst2 (1234567890)', 'PBSS, biyagama road', 'RPT-INCORRECT-DIAG', 'Daikin VRV IV-X System', 'Telesonic Sold', 'Telesonic Sold', 'Under Warranty', '', '{"formData":{"site":"PBSS, biyagama road","status":"Draft","channel":"Customer Portal","contact":"tst2 (1234567890)","customer":"ayesha (cst01)","priority":"P1 - Critical","requestNo":"SR-2026-81126","receivedBy":"vihasna (test00003)","description":"","entitlement":"","requestDate":"2026-10-28","requestType":"RPT-INCORRECT-DIAG","customerOrigin":"","equipmentOrigin":"","equipmentSystem":""},"tabDatasets":{"lines":[{"line":"1","issue":"Inverter compressor tripping with code E4","serial":"BSH-CTRL-00872","status":"Pending Call Generation","equipment":"Outdoor Condenser Unit 16HP"},{"line":"2","issue":"Air flow restricted, louvre error","serial":"MD18IN-778812","status":"Pending Call Generation","equipment":"Ceiling Cassette Indoor Unit 04"}],"commercial":[{"date":"2026-10-02","docNo":"INV-77124","amount":"1,250,000.00","status":"Paid in Full","balance":"0.00","docType":"A/R Invoice","salesRep":"N. Dias"},{"date":"2026-09-15","docNo":"DPI-77125","amount":"450,000.00","status":"Overdue (14 Days)","balance":"45,500.00","docType":"A/R Down Payment","salesRep":"T. Aloka"},{"date":"2026-08-28","docNo":"RCT-77126","amount":"128,750.00","status":"Reconciled","balance":"0.00","docType":"Incoming Payment","salesRep":"N. Dias"}],"duplicates":[{"date":"2026-09-18","callNo":"SC-2026-19877","repeatFlag":"Repeat Candidate (<30 Days)","resolution":"Capacitor replaced & refrigerant topped up","technician":"K. Silva (Lead Tech)"}],"linkedCalls":[{"callNo":"SC-2026-20513","status":"Assigned","technician":"K. Silva (Lead)","scheduledDate":"2026-10-15 09:30"}]}}'::jsonb) ON CONFLICT DO NOTHING;
INSERT INTO "service_requests" ("id", "title", "callType", "customerName", "status", "priority", "assignedTo", "scheduledDate", "createdAt", "updatedAt", "requestNo", "requestDate", "channel", "receivedBy", "customer", "contact", "site", "requestType", "equipmentSystem", "customerOrigin", "equipmentOrigin", "entitlement", "description", "data") VALUES ('SR-2026-38143', 'xyz', 'RPT-INCORRECT-DIAG', 'Jayasuriya Textiles (Pvt) Ltd (C-30512)', 'Draft', 'P4 - Low', NULL, NULL, '2026-10-28T00:58:44.633Z', '2026-10-28T00:58:44.633Z', 'SR-2026-38143', '2026-10-28', 'Email', 'saman kumara (emp0001)', 'Jayasuriya Textiles (Pvt) Ltd (C-30512)', 'test 4 (7894561231)', 'Perera Central Logistics Hub, 88 Peradeniya Road', 'RPT-INCORRECT-DIAG', 'Daikin VRV IV-X System', 'Telesonic Sold', 'Telesonic Sold', 'Under Warranty', 'xyz', '{"formData":{"site":"Perera Central Logistics Hub, 88 Peradeniya Road","status":"Draft","channel":"Email","contact":"test 4 (7894561231)","customer":"Jayasuriya Textiles (Pvt) Ltd (C-30512)","priority":"P4 - Low","requestNo":"SR-2026-38143","receivedBy":"saman kumara (emp0001)","description":"xyz","entitlement":"","requestDate":"2026-10-28","requestType":"RPT-INCORRECT-DIAG","customerOrigin":"","equipmentOrigin":"","equipmentSystem":""},"tabDatasets":{"lines":[{"line":"1","issue":"Inverter compressor tripping with code E4","serial":"BSH-CTRL-00872","status":"Pending Call Generation","equipment":"Outdoor Condenser Unit 16HP"},{"line":"2","issue":"Air flow restricted, louvre error","serial":"MD18IN-778812","status":"Pending Call Generation","equipment":"Ceiling Cassette Indoor Unit 04"}],"commercial":[{"date":"2026-10-02","docNo":"INV-77124","amount":"1,250,000.00","status":"Paid in Full","balance":"0.00","docType":"A/R Invoice","salesRep":"N. Dias"},{"date":"2026-09-15","docNo":"DPI-77125","amount":"450,000.00","status":"Overdue (14 Days)","balance":"45,500.00","docType":"A/R Down Payment","salesRep":"T. Aloka"},{"date":"2026-08-28","docNo":"RCT-77126","amount":"128,750.00","status":"Reconciled","balance":"0.00","docType":"Incoming Payment","salesRep":"N. Dias"}],"duplicates":[{"date":"2026-09-18","callNo":"SC-2026-19877","repeatFlag":"Repeat Candidate (<30 Days)","resolution":"Capacitor replaced & refrigerant topped up","technician":"K. Silva (Lead Tech)"}],"linkedCalls":[{"callNo":"SC-2026-20513","status":"Assigned","technician":"K. Silva (Lead)","scheduledDate":"2026-10-15 09:30"}]}}'::jsonb) ON CONFLICT DO NOTHING;
INSERT INTO "service_requests" ("id", "title", "callType", "customerName", "status", "priority", "assignedTo", "scheduledDate", "createdAt", "updatedAt", "requestNo", "requestDate", "channel", "receivedBy", "customer", "contact", "site", "requestType", "equipmentSystem", "customerOrigin", "equipmentOrigin", "entitlement", "description", "data") VALUES ('SR-2026-13567', 'Request SR-2026-13567', 'RPT-INCORRECT-DIAG', 'Kandy Lake Hotel (C-30514)', 'Cancelled', 'P4 - Low', NULL, NULL, '2026-10-28T02:57:41.091Z', '2026-10-28T03:01:55.638Z', 'SR-2026-13567', '2026-10-28', 'Email', 'saman kumara (emp0001)', 'Kandy Lake Hotel (C-30514)', 'test 4 (7894561231)', 'PBSS 2, kottawa', 'RPT-INCORRECT-DIAG', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'Telesonic Sold', 'Telesonic Sold', 'Under Warranty', 'test 0000000000000000000000000001', '{"formData":{"id":"SR-2026-13567","data":{"formData":{"site":"PBSS 2, kottawa","status":"Draft","channel":"Email","contact":"test 4 (7894561231)","customer":"Kandy Lake Hotel (C-30514)","priority":"P4 - Low","requestNo":"SR-2026-13567","receivedBy":"saman kumara (emp0001)","description":"","entitlement":"","requestDate":"2026-10-28","requestType":"RPT-INCORRECT-DIAG","customerOrigin":"","equipmentOrigin":"","equipmentSystem":"Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)"},"tabDatasets":{"lines":[{"line":"1","issue":"Inverter compressor tripping with code E4","serial":"BSH-CTRL-00872","status":"Pending Call Generation","equipment":"Outdoor Condenser Unit 16HP"},{"line":"2","issue":"Air flow restricted, louvre error","serial":"MD18IN-778812","status":"Pending Call Generation","equipment":"Ceiling Cassette Indoor Unit 04"}],"commercial":[{"date":"2026-10-02","docNo":"INV-77124","amount":"1,250,000.00","status":"Paid in Full","balance":"0.00","docType":"A/R Invoice","salesRep":"N. Dias"},{"date":"2026-09-15","docNo":"DPI-77125","amount":"450,000.00","status":"Overdue (14 Days)","balance":"45,500.00","docType":"A/R Down Payment","salesRep":"T. Aloka"},{"date":"2026-08-28","docNo":"RCT-77126","amount":"128,750.00","status":"Reconciled","balance":"0.00","docType":"Incoming Payment","salesRep":"N. Dias"}],"duplicates":[{"date":"2026-09-18","callNo":"SC-2026-19877","repeatFlag":"Repeat Candidate (<30 Days)","resolution":"Capacitor replaced & refrigerant topped up","technician":"K. Silva (Lead Tech)"}],"linkedCalls":[{"callNo":"SC-2026-20513","status":"Assigned","technician":"K. Silva (Lead)","scheduledDate":"2026-10-15 09:30"}]}},"site":"PBSS 2, kottawa","title":"Request SR-2026-13567","status":"Cancelled","channel":"Email","contact":"test 4 (7894561231)","callType":"RPT-INCORRECT-DIAG","customer":"Kandy Lake Hotel (C-30514)","priority":"P4 - Low","createdAt":"2026-10-28T08:27:41.091Z","requestNo":"SR-2026-13567","updatedAt":"2026-10-28T08:27:41.091Z","assignedTo":null,"receivedBy":"saman kumara (emp0001)","description":"test 0000000000000000000000000001","entitlement":"","requestDate":"2026-10-28","requestType":"RPT-INCORRECT-DIAG","customerName":"Kandy Lake Hotel (C-30514)","scheduledDate":null,"customerOrigin":"","equipmentOrigin":"","equipmentSystem":"Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)"},"tabDatasets":{"lines":[{"line":"1","issue":"Inverter compressor tripping with code E4","serial":"BSH-CTRL-00872","status":"Pending Call Generation","equipment":"Outdoor Condenser Unit 16HP"},{"line":"2","issue":"Air flow restricted, louvre error","serial":"MD18IN-778812","status":"Pending Call Generation","equipment":"Ceiling Cassette Indoor Unit 04"}],"commercial":[{"date":"2026-10-02","docNo":"INV-77124","amount":"1,250,000.00","status":"Paid in Full","balance":"0.00","docType":"A/R Invoice","salesRep":"N. Dias"},{"date":"2026-09-15","docNo":"DPI-77125","amount":"450,000.00","status":"Overdue (14 Days)","balance":"45,500.00","docType":"A/R Down Payment","salesRep":"T. Aloka"},{"date":"2026-08-28","docNo":"RCT-77126","amount":"128,750.00","status":"Reconciled","balance":"0.00","docType":"Incoming Payment","salesRep":"N. Dias"}],"duplicates":[{"date":"2026-09-18","callNo":"SC-2026-19877","repeatFlag":"Repeat Candidate (<30 Days)","resolution":"Capacitor replaced & refrigerant topped up","technician":"K. Silva (Lead Tech)"}],"linkedCalls":[{"callNo":"SC-2026-20513","status":"Assigned","technician":"K. Silva (Lead)","scheduledDate":"2026-10-15 09:30"}]}}'::jsonb) ON CONFLICT DO NOTHING;
INSERT INTO "service_requests" ("id", "title", "callType", "customerName", "status", "priority", "assignedTo", "scheduledDate", "createdAt", "updatedAt", "requestNo", "requestDate", "channel", "receivedBy", "customer", "contact", "site", "requestType", "equipmentSystem", "customerOrigin", "equipmentOrigin", "entitlement", "description", "data") VALUES ('SR-2026-84039', 'test ststmt00001', 'RPT-INCORRECT-DIAG', 'ayesha (cst01)', 'Converted', 'P2 - High', NULL, NULL, '2026-10-28T02:51:28.617Z', '2026-10-28T02:56:47.684Z', 'SR-2026-84039', '2026-10-28', 'Dedicated Hotline / Phone Inbound', 'vihasna (test00003)', 'ayesha (cst01)', 'test 3 (7894561233)', 'PBSS, biyagama road', 'RPT-INCORRECT-DIAG', 'Toshiba efdwdf (test eq 000001 / SN: qsfc)', 'Telesonic Sold', 'Telesonic Sold', 'Under Warranty', 'test ststmt00001', '{"formData":{"id":"SR-2026-84039","data":{"formData":{"site":"PBSS, biyagama road","status":"Draft","channel":"Dedicated Hotline / Phone Inbound","contact":"test 3 (7894561233)","customer":"ayesha (cst01)","priority":"P2 - High","requestNo":"SR-2026-84039","receivedBy":"vihasna (test00003)","description":"test ststmt00001","entitlement":"","requestDate":"2026-10-28","requestType":"RPT-INCORRECT-DIAG","customerOrigin":"","equipmentOrigin":"","equipmentSystem":"Toshiba efdwdf (test eq 000001 / SN: qsfc)"},"tabDatasets":{"lines":[{"line":"1","issue":"Inverter compressor tripping with code E4","serial":"BSH-CTRL-00872","status":"Pending Call Generation","equipment":"Outdoor Condenser Unit 16HP"},{"line":"2","issue":"Air flow restricted, louvre error","serial":"MD18IN-778812","status":"Pending Call Generation","equipment":"Ceiling Cassette Indoor Unit 04"}],"commercial":[{"date":"2026-10-02","docNo":"INV-77124","amount":"1,250,000.00","status":"Paid in Full","balance":"0.00","docType":"A/R Invoice","salesRep":"N. Dias"},{"date":"2026-09-15","docNo":"DPI-77125","amount":"450,000.00","status":"Overdue (14 Days)","balance":"45,500.00","docType":"A/R Down Payment","salesRep":"T. Aloka"},{"date":"2026-08-28","docNo":"RCT-77126","amount":"128,750.00","status":"Reconciled","balance":"0.00","docType":"Incoming Payment","salesRep":"N. Dias"}],"duplicates":[{"date":"2026-09-18","callNo":"SC-2026-19877","repeatFlag":"Repeat Candidate (<30 Days)","resolution":"Capacitor replaced & refrigerant topped up","technician":"K. Silva (Lead Tech)"}],"linkedCalls":[{"callNo":"SC-2026-20513","status":"Assigned","technician":"K. Silva (Lead)","scheduledDate":"2026-10-15 09:30"}]}},"site":"PBSS, biyagama road","title":"test ststmt00001","status":"Converted","channel":"Dedicated Hotline / Phone Inbound","contact":"test 3 (7894561233)","callType":"RPT-INCORRECT-DIAG","customer":"ayesha (cst01)","priority":"P2 - High","createdAt":"2026-10-28T08:21:28.617Z","requestNo":"SR-2026-84039","updatedAt":"2026-10-28T08:21:28.617Z","assignedTo":null,"receivedBy":"vihasna (test00003)","description":"test ststmt00001","entitlement":"","requestDate":"2026-10-28","requestType":"RPT-INCORRECT-DIAG","customerName":"ayesha (cst01)","scheduledDate":null,"customerOrigin":"","equipmentOrigin":"","equipmentSystem":"Toshiba efdwdf (test eq 000001 / SN: qsfc)"},"tabDatasets":{"lines":[{"line":"1","issue":"Inverter compressor tripping with code E4","serial":"BSH-CTRL-00872","status":"Pending Call Generation","equipment":"Outdoor Condenser Unit 16HP"},{"line":"2","issue":"Air flow restricted, louvre error","serial":"MD18IN-778812","status":"Pending Call Generation","equipment":"Ceiling Cassette Indoor Unit 04"}],"commercial":[{"date":"2026-10-02","docNo":"INV-77124","amount":"1,250,000.00","status":"Paid in Full","balance":"0.00","docType":"A/R Invoice","salesRep":"N. Dias"},{"date":"2026-09-15","docNo":"DPI-77125","amount":"450,000.00","status":"Overdue (14 Days)","balance":"45,500.00","docType":"A/R Down Payment","salesRep":"T. Aloka"},{"date":"2026-08-28","docNo":"RCT-77126","amount":"128,750.00","status":"Reconciled","balance":"0.00","docType":"Incoming Payment","salesRep":"N. Dias"}],"duplicates":[{"date":"2026-09-18","callNo":"SC-2026-19877","repeatFlag":"Repeat Candidate (<30 Days)","resolution":"Capacitor replaced & refrigerant topped up","technician":"K. Silva (Lead Tech)"}],"linkedCalls":[{"callNo":"SC-2026-20513","status":"Assigned","technician":"K. Silva (Lead)","scheduledDate":"2026-10-15 09:30"}]}}'::jsonb) ON CONFLICT DO NOTHING;

-- Data for table "service_roles" (5 rows)
INSERT INTO "service_roles" ("id", "roleCode", "roleName", "internalSubcontractor", "incentiveEligible", "incentiveBasisRef", "multiplePerCall", "active", "status", "createdAt", "updatedAt") VALUES (4, 'r0001', 'role number 1', 'Internal Staff Only', 'Yes', 'test 1', 'Yes', 'Yes', 'Active', '2026-10-23T00:14:35.371Z', '2026-10-23T00:14:35.371Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_roles" ("id", "roleCode", "roleName", "internalSubcontractor", "incentiveEligible", "incentiveBasisRef", "multiplePerCall", "active", "status", "createdAt", "updatedAt") VALUES (7, 'ROLE-LEAD-TECH', 'Lead Field Technician', 'Both Internal and Subcontractor', 'Yes', NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.165Z', '2026-10-28T03:14:56.165Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_roles" ("id", "roleCode", "roleName", "internalSubcontractor", "incentiveEligible", "incentiveBasisRef", "multiplePerCall", "active", "status", "createdAt", "updatedAt") VALUES (8, 'ROLE-SUPPORT-TECH', 'Assistant / Support Technician', 'Both Internal and Subcontractor', 'Yes', NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.167Z', '2026-10-28T03:14:56.167Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_roles" ("id", "roleCode", "roleName", "internalSubcontractor", "incentiveEligible", "incentiveBasisRef", "multiplePerCall", "active", "status", "createdAt", "updatedAt") VALUES (9, 'ROLE-COMMISSION-ENG', 'Commissioning Engineer', 'Both Internal and Subcontractor', 'Yes', NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.169Z', '2026-10-28T03:14:56.169Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_roles" ("id", "roleCode", "roleName", "internalSubcontractor", "incentiveEligible", "incentiveBasisRef", "multiplePerCall", "active", "status", "createdAt", "updatedAt") VALUES (10, 'ROLE-INSPECTOR', 'Site Inspector / Auditor', 'Both Internal and Subcontractor', 'No', NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.171Z', '2026-10-28T03:14:56.171Z') ON CONFLICT DO NOTHING;

-- Data for table "service_types" (6 rows)
INSERT INTO "service_types" ("id", "code", "description", "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", "active", "status", "createdAt", "updatedAt") VALUES (2, 'type0002', 'Quarterly Preventive Maintenance Routine', 'Service Type', 'P2 - Normal Schedule', 'CHK-PM-AC-SPLIT', 'SLA-STD-COMMERCIAL', 'No', 'Yes', 'Active', '2026-10-22T19:04:24.857Z', '2026-10-23T00:24:39.823Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_types" ("id", "code", "description", "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", "active", "status", "createdAt", "updatedAt") VALUES (7, 'SVC-BREAKDOWN', 'Breakdown Repair', 'Service Request Type', 'P1 - Critical', NULL, NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.155Z', '2026-10-28T03:14:56.155Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_types" ("id", "code", "description", "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", "active", "status", "createdAt", "updatedAt") VALUES (8, 'SVC-PREV-MAINT', 'Preventive Maintenance', 'Service Request Type', 'P2 - High', NULL, NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.158Z', '2026-10-28T03:14:56.158Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_types" ("id", "code", "description", "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", "active", "status", "createdAt", "updatedAt") VALUES (9, 'SVC-INSTALL', 'Installation & Commissioning', 'Service Request Type', 'P2 - High', NULL, NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.160Z', '2026-10-28T03:14:56.160Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_types" ("id", "code", "description", "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", "active", "status", "createdAt", "updatedAt") VALUES (10, 'SVC-INSPECT', 'Site Visit / Inspection Audit', 'Service Request Type', 'P3 - Medium', NULL, NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.161Z', '2026-10-28T03:14:56.161Z') ON CONFLICT DO NOTHING;
INSERT INTO "service_types" ("id", "code", "description", "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", "active", "status", "createdAt", "updatedAt") VALUES (11, 'SVC-WARRANTY', 'Warranty Claim Inspection', 'Service Request Type', 'P1 - Critical', NULL, NULL, 'No', 'Yes', 'Active', '2026-10-28T03:14:56.163Z', '2026-10-28T03:14:56.163Z') ON CONFLICT DO NOTHING;

-- Data for table "target_incentive_slab_tables" (4 rows)
INSERT INTO "target_incentive_slab_tables" ("id", "scheme_code", "table_name", "target_type", "slab_method", "version", "status", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('slt-sls-2026', 'SCH-SLS-2026', 'Retail Smartphone & Devices Sales Target Slabs', 'Turnover Target', 'Highest Slab Reached (Non-Cumulative)', 'v2.1', 'Approved', 'Standard tiered slab structure with non-cumulative payout logic for retail smartphone sales.', 'S. Perera', 'D. Fernando', '2026-10-22T06:03:51.092Z', '2026-10-22T06:03:51.092Z') ON CONFLICT DO NOTHING;
INSERT INTO "target_incentive_slab_tables" ("id", "scheme_code", "table_name", "target_type", "slab_method", "version", "status", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('slt-srv-2026', 'SCH-SRV-2026', 'Field Service Technician First-Time-Fix Incentive Slabs', 'Turnover Target', 'Highest Slab Reached (Non-Cumulative)', 'v1.0', 'Approved', 'FTF achievement threshold tiers for consumer electronics field service staff.', 'A. Silva', 'D. Fernando', '2026-10-22T06:03:51.098Z', '2026-10-22T06:03:51.098Z') ON CONFLICT DO NOTHING;
INSERT INTO "target_incentive_slab_tables" ("id", "scheme_code", "table_name", "target_type", "slab_method", "version", "status", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('slt-sch-mob-2027', 'SCH-MOB-2027', 'Retail Smartphone & Devices Sales Target Slabs', 'Volume Target', 'Accelerated Milestone Multiplier', 'v2.2', 'Draft', '', 'Incentive Administrator', NULL, '2026-10-22T06:36:48.425Z', '2026-10-22T07:12:27.041Z') ON CONFLICT DO NOTHING;
INSERT INTO "target_incentive_slab_tables" ("id", "scheme_code", "table_name", "target_type", "slab_method", "version", "status", "description", "created_by", "approved_by", "created_at", "updated_at") VALUES ('slt-sch-mob-2003', 'SCH-MOB-2003', 'Retail Smartphone & Devices Sales Target Slabs', 'Turnover Target', 'Highest Slab Reached (Non-Cumulative)', 'v2.2', 'Approved', '', 'Incentive Administrator', 'D. Fernando', '2026-10-22T07:12:17.632Z', '2026-10-22T07:12:44.915Z') ON CONFLICT DO NOTHING;

-- Data for table "slab_table_history_logs" (11 rows)
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-04', 'slt-sls-2026', 'v2.2', 'Draft', '2026-10-13T19:15:30.000Z', 'S. Perera', 'Incentive Administrator', 'Initiated v2.2 draft for Q4 slab optimization', 'Adjusted 125% and 150% turnover incentive values to reflect updated FY2026 revenue growth targets. Non-cumulative rule preserved.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-03', 'slt-sls-2026', 'v2.1', 'Approved', '2026-07-01T10:45:00.000Z', 'D. Fernando', 'Head of Finance', 'Approved Q3 slab table revision', 'Ratified 6 achievement tiers. Certified that slabs operate on highest-slab-reached payout logic.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-02', 'slt-sls-2026', 'v2.0', 'Approved', '2026-03-28T14:20:10.000Z', 'P. Wickramasinghe', 'Chief Executive Officer', 'Executive sign-off for mid-year incentive scaling', 'Added 150% Super Achiever tier with LKR 120,000 volume and LKR 220,000 turnover payout.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-01', 'slt-sls-2026', 'v1.0', 'Approved', '2026-01-02T09:00:00.000Z', 'S. Perera', 'Incentive Administrator', 'Initial baseline slab table established', 'Baseline 4-tier slab structure mapped directly from SAP Business One budget matrix.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792651008426', 'slt-sch-mob-2027', 'v2.2', 'Draft', '2026-10-22T06:36:48.425Z', 'Incentive Administrator', 'Incentive Administrator', 'Initial slab table creation', 'Created slab table Retail Smartphone & Devices Sales Target Slabs (v2.2) for scheme SCH-MOB-2027.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792651124099', 'slt-sch-mob-2027', 'v2.2', 'Draft', '2026-10-22T06:38:44.096Z', 'Incentive Administrator', 'Incentive Administrator', 'Saved slab configuration and tiers', 'Updated 2 achievement tiers under version v2.2.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792651492355', 'slt-sch-mob-2027', 'v2.2', 'Draft', '2026-10-22T06:44:52.351Z', 'Incentive Administrator', 'Incentive Administrator', 'Manual save for slab table (v2.2) with 2 tiers.', 'Updated 2 achievement tiers under version v2.2.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792651515686', 'slt-sch-mob-2027', 'v2.2', 'Draft', '2026-10-22T06:45:15.684Z', 'Incentive Administrator', 'Incentive Administrator', 'Manual save for slab table (v2.2) with 2 tiers.', 'Updated 2 achievement tiers under version v2.2.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792653137635', 'slt-sch-mob-2003', 'v2.2', 'Draft', '2026-10-22T07:12:17.632Z', 'Incentive Administrator', 'Incentive Administrator', 'Initial slab table creation', 'Created slab table Retail Smartphone & Devices Sales Target Slabs (v2.2) for scheme SCH-MOB-2003.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792653147043', 'slt-sch-mob-2027', 'v2.2', 'Draft', '2026-10-22T07:12:27.041Z', 'Incentive Administrator', 'Incentive Administrator', 'Manual save for slab table (v2.2) with 2 tiers.', 'Updated 2 achievement tiers under version v2.2.') ON CONFLICT DO NOTHING;
INSERT INTO "slab_table_history_logs" ("id", "table_id", "version", "status", "timestamp", "author", "role", "change_summary", "details") VALUES ('hist-slb-1792653164915', 'slt-sch-mob-2003', 'v2.2', 'Approved', '2026-10-22T07:12:44.915Z', 'D. Fernando', 'Head of Finance', 'Slab table status changed to Approved', 'Finance audit verification complete. Certified non-cumulative slab payout logic.') ON CONFLICT DO NOTHING;

-- Data for table "slab_tiers" (17 rows)
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-01', 'slt-sls-2026', 'Floor / Minimum Entry', 80, 15000, 25000, 'Baseline qualifying threshold; minimum required for any incentive payout.', 1, '2026-10-22T06:03:51.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-02', 'slt-sls-2026', 'Intermediate Tier', 90, 25000, 45000, 'Satisfactory achievement tier prior to 100% quota benchmark.', 2, '2026-10-22T06:03:51.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-03', 'slt-sls-2026', 'Target Parity Benchmark', 100, 40000, 75000, 'Full quota fulfillment benchmark. Standard scheduled payout.', 3, '2026-10-22T06:03:51.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-04', 'slt-sls-2026', 'High Performer Band', 110, 60000, 110000, 'Above target accelerator; awarded as single non-cumulative amount.', 4, '2026-10-22T06:03:51.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-05', 'slt-sls-2026', 'Excellence Accelerator', 125, 85000, 150000, 'Premier bracket for top quartile territory executives.', 5, '2026-10-22T06:03:51.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-06', 'slt-sls-2026', 'Super Achiever Ceiling', 150, 120000, 220000, 'Maximum capped payout slab for extraordinary over-quota performance.', 6, '2026-10-22T06:03:51.093Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-srv-01', 'slt-srv-2026', 'FTF Standard Floor', 85, 12000, 18000, 'Technician qualifying repair threshold.', 1, '2026-10-22T06:03:51.098Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-srv-02', 'slt-srv-2026', 'FTF Benchmark', 92, 28000, 42000, 'Contractual SLA baseline attainment.', 2, '2026-10-22T06:03:51.098Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-srv-03', 'slt-srv-2026', 'FTF Excellence', 96, 50000, 75000, 'Master technician zero-rework tier.', 3, '2026-10-22T06:03:51.098Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2003-1-7632', 'slt-sch-mob-2003', 'Floor / Minimum Entry', 80, 15000, 25000, 'Baseline qualifying threshold; minimum required for any incentive payout.', 1, '2026-10-22T07:12:17.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2003-2-7633', 'slt-sch-mob-2003', 'Intermediate Tier', 90, 25000, 45000, 'Satisfactory achievement tier prior to 100% quota benchmark.', 2, '2026-10-22T07:12:17.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2003-3-7633', 'slt-sch-mob-2003', 'Target Parity Benchmark', 100, 40000, 75000, 'Full quota fulfillment benchmark. Standard scheduled payout.', 3, '2026-10-22T07:12:17.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2003-4-7634', 'slt-sch-mob-2003', 'High Performer Band', 110, 60000, 110000, 'Above target accelerator; awarded as single non-cumulative amount.', 4, '2026-10-22T07:12:17.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2003-5-7634', 'slt-sch-mob-2003', 'Excellence Accelerator', 125, 85000, 150000, 'Premier bracket for top quartile territory executives.', 5, '2026-10-22T07:12:17.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2003-6-7635', 'slt-sch-mob-2003', 'Super Achiever Ceiling', 150, 120000, 220000, 'Maximum capped payout slab for extraordinary over-quota performance.', 6, '2026-10-22T07:12:17.632Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2027-1-7042', 'slt-sch-mob-2027', 'Floor / Minimum Entry', 80, 15000, 25000, 'Baseline threshold', 1, '2026-10-22T07:12:27.041Z') ON CONFLICT DO NOTHING;
INSERT INTO "slab_tiers" ("id", "table_id", "slab_tier_name", "min_achievement_percent", "volume_incentive_lkr", "turnover_incentive_lkr", "notes", "sort_order", "created_at") VALUES ('slb-b-2027-2-7043', 'slt-sch-mob-2027', 'Target Parity', 100, 40000, 75000, 'Full quota benchmark', 2, '2026-10-22T07:12:27.041Z') ON CONFLICT DO NOTHING;

-- Data for table "subcontractors" (2 rows)
INSERT INTO "subcontractors" ("id", "vendorCode", "vendorName", "subcontractorType", "territory", "paymentTerms", "rating", "status", "createdAt", "updatedAt") VALUES (4, 'vc0001', 'ajiya', 'HVAC Installation Contractor', 'Southern Coastal Region', 'Net 30 Days', 8, 'Active', '2026-10-22T23:56:52.278Z', '2026-10-22T23:56:52.278Z') ON CONFLICT DO NOTHING;
INSERT INTO "subcontractors" ("id", "vendorCode", "vendorName", "subcontractorType", "territory", "paymentTerms", "rating", "status", "createdAt", "updatedAt") VALUES (2, 'vc0002', 'Lanka Cool Services & Engineering', 'HVAC Installation Contractor', 'Southern Coastal Region', 'Net 30 Days', 9.1, 'Active', '2026-10-22T19:04:24.853Z', '2026-10-23T00:13:34.403Z') ON CONFLICT DO NOTHING;

-- Data for table "sync_logs" (35 rows)
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJ9XQSM', 'SYNC-BATCH-MVJ9XQSM', 'technician', 'dev-test', 0, 'SUCCESS', 'Mobile sync wrote 0 field updates from the on-device database', '2026-10-22T08:23:30.790Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJ9XTRA', 'SYNC-BATCH-MVJ9XTRA', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 3, 'SUCCESS', 'Mobile sync wrote 3 field updates from the on-device database', '2026-10-22T08:23:34.630Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJA6T0Y', 'SYNC-BATCH-MVJA6T0Y', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:30:33.586Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJADL4O', 'SYNC-BATCH-MVJADL4O', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:35:49.944Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJAN4L3', 'SYNC-BATCH-MVJAN4L3', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:43:15.063Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJAPE29', 'SYNC-BATCH-MVJAPE29', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:45:00.657Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJAR50V', 'SYNC-BATCH-MVJAR50V', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:46:22.255Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJAVMU3', 'SYNC-BATCH-MVJAVMU3', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:49:51.963Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJB0NW7', 'SYNC-BATCH-MVJB0NW7', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T08:53:46.615Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJBH1TM', 'SYNC-BATCH-MVJBH1TM', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T09:06:31.162Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJBID80', 'SYNC-BATCH-MVJBID80', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 3, 'SUCCESS', 'Mobile sync wrote 3 field updates from the on-device database', '2026-10-22T09:07:32.592Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVJBLZBV', 'SYNC-BATCH-MVJBLZBV', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-22T09:10:21.211Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVKHWL8M', 'SYNC-BATCH-MVKHWL8M', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-23T04:54:20.038Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVKT0C10', 'SYNC-BATCH-MVKT0C10', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-23T10:05:10.500Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVKT1Z8Z', 'SYNC-BATCH-MVKT1Z8Z', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-23T10:06:27.251Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVKT339E', 'SYNC-BATCH-MVKT339E', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-23T10:07:19.106Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVKTDOW4', 'SYNC-BATCH-MVKTDOW4', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-23T10:15:33.700Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVKTTT39', 'SYNC-BATCH-MVKTTT39', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-23T10:28:05.637Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvorwogf0000hao4g0l878l9', 'SYNC-BATCH-MVORWOG3', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-25T23:15:25.071Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvotcmkm0000ha3olhu6w0k9', 'SYNC-BATCH-MVOTCMK5', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-25T23:55:48.742Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVOTOQ6L', 'SYNC-BATCH-MVOTOQ6L', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-26T05:35:13.293Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVOTSYWT', 'SYNC-BATCH-MVOTSYWT', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-26T05:38:31.229Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVOTVZ37', 'SYNC-BATCH-MVOTVZ37', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-26T05:40:51.427Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('SYNC-BATCH-MVOTX5YC', 'SYNC-BATCH-MVOTX5YC', 'TECHNICIAN', 'TECH-MOBILE-PWA-01', 2, 'SUCCESS', 'Mobile sync wrote 2 field updates from the on-device database', '2026-10-26T05:41:46.980Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvp5bzvj0000halcrlxewvf4', 'SYNC-BATCH-MVP5BZV5', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-26T05:31:14.720Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvp65r6d0000ha7o4oz2duhq', 'SYNC-BATCH-MVP65R61', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-26T05:54:23.125Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvp66s6s0000hac4z3aq5ykj', 'SYNC-BATCH-MVP66S6G', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-26T05:55:11.092Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvq5qza40000haykcvb0zv7s', 'SYNC-BATCH-MVQ5QZ9P', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-26T22:30:39.964Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvq6xxrb0000hai8xhjlm1j0', 'SYNC-BATCH-MVQ6XXR3', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-26T23:04:04.199Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvqbo9b10000hamkjkw5ypu5', 'SYNC-BATCH-MVQBO9AR', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-27T01:16:30.685Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvqclu1e0000ha3o4hdsx8ef', 'SYNC-BATCH-MVQCLU12', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-27T01:42:37.202Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvqgx0fh0000had43un6v3hn', 'SYNC-BATCH-MVQGX0F5', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-27T03:43:17.165Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvqgxnfc0000hatou70xe77p', 'SYNC-BATCH-MVQGXNF0', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-27T03:43:46.968Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvqhu14q0000hao05evqy093', 'SYNC-BATCH-MVQHU14E', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-27T04:08:57.723Z') ON CONFLICT DO NOTHING;
INSERT INTO "sync_logs" ("id", "batchId", "role", "deviceId", "itemCount", "status", "details", "syncedAt") VALUES ('cmvrktikw0000hazwm0e47vvr', 'SYNC-BATCH-MVRKTIKM', 'TECHNICIAN', 'TECH-TEST-DEVICE', 1, 'SUCCESS', 'Processed 1 mutations and synced 1 job records to PostgreSQL.', '2026-10-27T22:20:18.705Z') ON CONFLICT DO NOTHING;

-- Data for table "system_roles" (3 rows)
INSERT INTO "system_roles" ("id", "code", "name", "description", "permissions", "status", "createdAt", "updatedAt") VALUES (40, 'REGISTRAR', 'User registrar', NULL, 'MASTERS', 'Active', '2026-10-21T11:41:38.246Z', '2026-10-21T11:41:38.246Z') ON CONFLICT DO NOTHING;
INSERT INTO "system_roles" ("id", "code", "name", "description", "permissions", "status", "createdAt", "updatedAt") VALUES (2, 'TECHNICIAN', 'Field Lead Technician', 'Access to assigned field jobs, part consumption, labor tracking and offline PWA', 'JOBS_ASSIGNED,LABOR_LOG,PARTS_CONSUME,PWA_OFFLINE', 'Active', '2026-10-21T01:13:03.800Z', '2026-10-21T05:31:03.870Z') ON CONFLICT DO NOTHING;
INSERT INTO "system_roles" ("id", "code", "name", "description", "permissions", "status", "createdAt", "updatedAt") VALUES (1, 'ADMIN', 'System Administrator', 'Full administrative access', 'ALL', 'Active', '2026-10-21T01:13:03.794Z', '2026-10-21T11:16:25.756Z') ON CONFLICT DO NOTHING;

-- Data for table "technicians" (3 rows)
INSERT INTO "technicians" ("id", "employeeId", "name", "position", "department", "branch", "mobile", "technicianType", "team", "certifications", "status", "createdAt", "updatedAt", "normalRate", "overtimeRate") VALUES (6, 'test00003', 'vihasna', 'Electro-Mechanical Specialist', 'Franchise Support - Southern', 'Colombo Head Office', '0112345678', 'Direct In-House Staff', 'Domestic Express Beta', 'Carrier Level III Certified', 'Active', '2026-10-22T23:46:44.207Z', '2026-10-22T23:46:44.207Z', 1000, 500) ON CONFLICT DO NOTHING;
INSERT INTO "technicians" ("id", "employeeId", "name", "position", "department", "branch", "mobile", "technicianType", "team", "certifications", "status", "createdAt", "updatedAt", "normalRate", "overtimeRate") VALUES (4, 'emp0001', 'saman kumara', 'Lead HVAC Technician', 'Field Operations - Colombo', 'Colombo Head Office', '0112365478', 'Contract Specialist', 'Commercial VRF Alpha', 'Refrigerant Recovery Licensed', 'Active', '2026-10-22T23:22:18.279Z', '2026-10-22T23:50:21.339Z', 100, 50) ON CONFLICT DO NOTHING;
INSERT INTO "technicians" ("id", "employeeId", "name", "position", "department", "branch", "mobile", "technicianType", "team", "certifications", "status", "createdAt", "updatedAt", "normalRate", "overtimeRate") VALUES (9, 'EMP-NALIN', 'Nalin Chathuranga', 'Senior Field Service Technician', 'Field Operations - Colombo', 'Colombo Head Office', '0771234567', 'Direct In-House Staff', 'Commercial VRF Alpha', 'Daikin VRV IV-X & Carrier Certified', 'Active', '2026-10-28T04:50:14.841Z', '2026-10-28T04:50:14.841Z', 1200, 600) ON CONFLICT DO NOTHING;

-- Data for table "transaction_records" (34 rows)
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (1, 'service-calls', 'SC-2026-20513', 'Ceylon Agro Machinery PLC (C-20014)', 'No. 45/A, Nawam Mawatha, Colombo 02', 'Crew Cab Vehicle AC System (Chassis + Engine)', 'SC-2026-20513', 'SR-2026-10432', 'In Progress', '{"formData":{"site":"No. 45/A, Nawam Mawatha, Colombo 02","callNo":"SC-2026-20513","slaDue":"2026-10-15 15:30 (4h remaining)","status":"In Progress","project":"PRJ-CAC-2026-014","callType":"Breakdown Repair","contract":"AMC-2026-0192","customer":"Ceylon Agro Machinery PLC (C-20014)","priority":"P1 - Critical","recordNo":"SC-2026-20513","repeatOf":"SC-2026-19877","requestNo":"SR-2026-10432","entitlement":"Under AMC Comprehensive","plannedDate":"2026-10-15 09:30","poorService":"No","repeatReason":"Compressor noise returned within 28 days","equipmentSystem":"Crew Cab Vehicle AC System (Chassis + Engine)"},"tabDatasets":{"costs":[{"actual":"518,400.00","margin":"—","sapDoc":"GI-2026-9041","element":"Materials Issued (Goods Issue)"},{"actual":"28,500.00","margin":"—","sapDoc":"AP-2026-0442","element":"Subcontractor Invoice (Lanka Cool)"},{"actual":"42,000.00","margin":"—","sapDoc":"JE-2026-8812","element":"Labour Absorbed (Standard Rate)"},{"actual":"780,000.00","margin":"+32.1% Gross","sapDoc":"INV-77124","element":"Billed to Customer (A/R Invoice)"}],"parts":[{"qty":"1","total":"485,000.00","itemCode":"SP-COMP-18K","unitPrice":"485,000.00","warehouse":"AC-SP (Colombo Central)","description":"Hermetic Inverter Scroll Compressor 18HP"},{"qty":"1","total":"14,500.00","itemCode":"FLT-0921","unitPrice":"14,500.00","warehouse":"VAN-KSILVA","description":"Liquid Line Filter Drier 5/8 Flare"},{"qty":"4.5","total":"18,900.00","itemCode":"GAS-R410A","unitPrice":"4,200.00","warehouse":"VAN-KSILVA","description":"R410A Eco Refrigerant Gas (kg)"}],"checklist":[{"seq":"1","item":"Verify Power Supply Voltage (L-N)","status":"OK","reading":"232 V AC","standard":"220V - 240V ± 5%"},{"seq":"2","item":"Measure Running Amperage (Phase 1)","status":"OK","reading":"28.4 A","standard":"Max 32.0 A"},{"seq":"3","item":"Measure Suction Pressure (R410A)","status":"OK","reading":"118 PSI","standard":"115 - 125 PSI"},{"seq":"4","item":"Inspect Condenser Fan Motor Bearing","status":"Needs Replacement","reading":"Excessive Axial Play","standard":"Zero Free Play"}],"assignment":[{"to":"2026-10-15 13:30","from":"2026-10-15 09:30","role":"Lead Technician","type":"In-house","scope":"Primary diagnosis & compressor overhaul","person":"K. Silva (Lead)","incentive":"Yes","evaluation":"Applicable"},{"to":"2026-10-15 13:30","from":"2026-10-15 09:30","role":"Assistant Technician","type":"In-house","scope":"Refrigerant recovery & pipe brazing","person":"R. Kumar (Assistant)","incentive":"Yes","evaluation":"Applicable"},{"to":"2026-10-15 13:30","from":"2026-10-15 09:30","role":"Helper","type":"In-house","scope":"Site safety, scaffolding & cleanup","person":"S. Bandara (Helper)","incentive":"No","evaluation":"Not Required"},{"to":"2026-10-15 13:00","from":"2026-10-15 11:00","role":"Subcontractor Technician","type":"Subcontractor","scope":"Specialized vibration spectral testing","person":"Lanka Cool Services","incentive":"No","evaluation":"Applicable"}]}}'::jsonb, '2026-10-28T08:48:20.457Z', '2026-10-28T08:48:20.457Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (2, 'dispatch-schedules', 'DSP-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"team":"Commercial VRV Rapid Response","branch":"Colombo Head Office","dateTo":"2026-10-16","status":"Saved","dateFrom":"2026-10-15","priority":"P1 - Critical First","recordNo":"DSP-2026-10001","serviceType":"All Service Types","showUnassigned":"Yes"},"tabDatasets":{"board":[{"t08":"SC-2026-20513 · Ceylon Agro (Colombo)","t10":"SC-2026-20513 (Overhaul)","t12":"Lunch / Transit","t14":"SC-2026-20515 · Kandy Lake Hotel","t16":"Available","technician":"K. Silva (Lead VRV)"},{"t08":"SC-2026-20513 · Ceylon Agro","t10":"SC-2026-20513 (Overhaul)","t12":"Lunch / Transit","t14":"SC-2026-20515 · Kandy Lake Hotel","t16":"Available","technician":"R. Kumar (Assistant)"},{"t08":"Available","t10":"SC-2026-20511 · Jayasuriya Textiles","t12":"SC-2026-20511","t14":"Available","t16":"SC-2026-20519 · Negombo Cold Storage","technician":"M. Nazeer (Lanka Cool)"},{"t08":"Shop Floor Triage","t10":"Audit Visit · Colombo 03","t12":"Inspection · Fort","t14":"Quality Review Queue","t16":"HOD Sync","technician":"A. Perera (Supervisor)"}],"unassigned":[{"callNo":"SC-2026-20520","customer":"Wijesinghe Motors (Pvt) Ltd","priority":"P1 - Critical","slaRemaining":"1h 45m left","requiredSkills":"Automotive Chiller, DC Inverter"},{"callNo":"SC-2026-20521","customer":"Galle Fort Residencies","priority":"P2 - High","slaRemaining":"4h 10m left","requiredSkills":"Multi-Split Indoor Units"},{"callNo":"SC-2026-20524","customer":"Perera Holdings (Pvt) Ltd","priority":"P3 - Medium","slaRemaining":"8h 00m left","requiredSkills":"Preventive Maintenance Filter"}]}}'::jsonb, '2026-10-28T08:48:20.462Z', '2026-10-28T08:48:20.462Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (3, 'appointments', 'APT-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20513', 'SR-2026-10432', 'Saved', '{"formData":{"callNo":"SC-2026-20513","reason":"Customer site manager requested morning arrival instead of afternoon","status":"Saved","meetLink":"https://meet.google.com/xyz-servio-tel","recordNo":"APT-2026-10001","windowTo":"12:00","windowFrom":"09:30","originalDate":"2026-10-14","participants":"chanuthmahagamage@gmail.com, nimal@rajapakshalab.lk","appointmentDate":"2026-10-15","rescheduleCount":1,"googleMeetLinkRequired":"Yes"},"tabDatasets":{"history":[{"date":"2026-10-13 14:10","user":"Kasun Perera (Coordinator)","reason":"Customer site manager requested morning arrival","newWindow":"15-Oct 09:30 - 12:00","previousWindow":"14-Oct 14:00 - 16:30"},{"date":"2026-10-12 11:00","user":"Auto System Schedule","reason":"Initial appointment proposed upon ticket creation","newWindow":"14-Oct 14:00 - 16:30","previousWindow":"None"}]}}'::jsonb, '2026-10-28T08:48:20.463Z', '2026-10-28T08:48:20.463Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (4, 'call-assignments', 'ASG-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20512', 'SR-2026-10432', 'Saved', '{"formData":{"roles":"Helper / Site Safety","scope":"Subcontractor technician assistance & pressure testing safety perimeter","callNo":"SC-2026-20512","person":"S. Bandara (Helper) · EMP-0091","reason":"Additional safety assistance needed for high-pressure R410A brazing","status":"Saved","recordNo":"ASG-2026-10001","validFrom":"2026-10-15 09:30"},"tabDatasets":{"assignedRoster":[{"by":"Kasun Perera","to":"15-Oct-2026 13:30","from":"15-Oct-2026 09:30","role":"Lead Technician","person":"K. Silva (Lead)","status":"Active"},{"by":"Kasun Perera","to":"15-Oct-2026 13:30","from":"15-Oct-2026 09:30","role":"Helper","person":"S. Bandara (Helper)","status":"Active"},{"by":"Kasun Perera","to":"13-Oct-2026 17:00","from":"12-Oct-2026 08:00","role":"Assistant Tech","person":"R. Kumar (Assistant)","status":"Ended (Scope Complete)"}]}}'::jsonb, '2026-10-28T08:48:20.465Z', '2026-10-28T08:48:20.465Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (5, 'call-holds', 'HLD-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20514', 'SR-2026-10432', 'Saved', '{"formData":{"callNo":"SC-2026-20514","status":"Saved","remarks":"PCB Inverter Board model DAI-9021 currently being cleared through customs at Colombo Port.","recordNo":"HLD-2026-10001","holdReason":"Parts Awaited - Special Order from Principal","resumeDate":"2026-10-22","notifyCustomer":"Yes","expectedResumeDate":"2026-10-22"},"tabDatasets":{"holdHistory":[{"by":"Kasun Perera","days":"4","heldOn":"2026-10-10 14:00","reason":"Parts Awaited","resumed":"2026-10-14 10:00","expected":"2026-10-15"},{"by":"Kasun Perera","days":"4","heldOn":"2026-09-02 09:15","reason":"Customer Site Shutdown","resumed":"2026-09-06 08:30","expected":"2026-09-06"}]}}'::jsonb, '2026-10-28T08:48:20.466Z', '2026-10-28T08:48:20.466Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (6, 'site-inspections', 'INSP-2026-10001', 'Jayasuriya Textiles Ltd (C-30512)', 'Jaffna Branch Factory & Warehousing', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20513', 'SR-2026-10432', 'In Progress', '{"formData":{"site":"Jaffna Branch Factory & Warehousing","callNo":"SC-2026-20513","status":"In Progress","customer":"Jayasuriya Textiles Ltd (C-30512)","recordNo":"INSP-2026-10001","inspector":"K. Silva (Lead Inspection Engineer)","proposals":2,"plannedDate":"2026-10-16","checklistTemplate":"VRV Commercial Site Pre-Commissioning Audit (CKL-VRV-01)","engineerAuthorised":"Yes"},"tabDatasets":{"proposals":[{"scope":"Anti-corrosion marine coil coating & spring mounts","propNo":"PRP-01","estCost":"185,000.00","equipment":"VRV Outdoor System","quotationNo":"QT-2026-0044"},{"scope":"Full pipe re-insulation & cladding","propNo":"PRP-02","estCost":"72,500.00","equipment":"Chilled Water Line","quotationNo":"QT-2026-0045"}],"checklistResults":[{"item":"Roof Mount Vibration Isolators","status":"Fail","observation":"Rubber pads severely degraded from UV exposure","recommendation":"Replace with heavy-duty spring isolators"},{"item":"Refrigerant Piping Insulation","status":"Attention Required","observation":"Armaflex insulation torn at elbow joints, sweating visible","recommendation":"Re-wrap with UV-shielded Armaflex"},{"item":"Main Electrical Breaker Rating","status":"Pass","observation":"63A 3-Pole MCB in good condition, thermal imaging nominal","recommendation":"None required"}]}}'::jsonb, '2026-10-28T08:48:20.468Z', '2026-10-28T08:48:20.468Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (7, 'installations', 'INS-2026-0412', 'Galle Fort Residencies (C-30514)', 'Plot 12, Light House Street, Galle Fort', 'SYS-VRV-GALLE-01', 'SC-2026-20514', 'SR-2026-10432', 'Started', '{"formData":{"site":"Plot 12, Light House Street, Galle Fort","callNo":"SC-2026-20514","status":"Started","customer":"Galle Fort Residencies (C-30514)","recordNo":"INS-2026-0412","systemId":"SYS-VRV-GALLE-01","startDate":"2026-10-15","installerType":"Internal Service Crew","installationNo":"INS-2026-0412","invoiceDelivery":"DEL-B1-99214 (SAP B1 Delivery Note)","commissionedDate":"2026-10-17","toleranceVariance":1.2},"tabDatasets":{"testing":[{"stage":"Nitrogen Pressure Test Stage 1","actual":"5.0 Bar stable","result":"Passed","target":"5.0 Bar (Initial seal check)","holdingPeriod":"30 Minutes"},{"stage":"Nitrogen Pressure Test Stage 2","actual":"15.0 Bar stable","result":"Passed","target":"15.0 Bar (Medium pressure)","holdingPeriod":"2 Hours"},{"stage":"Nitrogen Pressure Test Stage 3","actual":"37.9 Bar (temp compensated)","result":"Passed (1.2% Var)","target":"38.0 Bar (Design pressure)","holdingPeriod":"24 Hours"},{"stage":"Vacuum Dehydration","actual":"380 Microns","result":"Passed","target":"Under 500 Microns","holdingPeriod":"4 Hours"}],"components":[{"item":"Daikin VRV-IV 16HP","role":"Outdoor Master Unit","serial":"ENG-4JI-99231","location":"Rooftop Plant Deck","installed":"Mounted & Bolted","validation":"Passed 40 Bar Test"},{"item":"FXFQ50AVEB 2.0HP","role":"Indoor Cassette 01","serial":"BSH-CTRL-00872","location":"Level 1 Living Area","installed":"Hung & Levelled","validation":"Drain Flow OK"},{"item":"FXFQ71AVEB 2.8HP","role":"Indoor Cassette 02","serial":"MD18IN-778812","location":"Level 2 Master Bed","installed":"Hung & Levelled","validation":"Drain Flow OK"},{"item":"DCM601A51 Touch Controller","role":"Central Controller","serial":"MD18OUT-554201","location":"Server / Security Room","installed":"Wired RS-485","validation":"Addressing Verified"}]}}'::jsonb, '2026-10-28T08:48:20.469Z', '2026-10-28T08:48:20.469Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (8, 'warranty-activations', 'ACT-2026-0812', 'Dr. Asoka Bandara', 'Perera Central Logistics Hub', 'MD18IN-778812 (Toshiba Carrier Inverter)', 'SC-2026-8821', 'SR-2026-10432', 'Activated', '{"formData":{"nic":"197824501234","item":"BRG-6204 Carrier Inverter 1.5 Ton","dealer":"Kandy Home Centre (Franchise F-044)","mobile":"071 555 8899","serial":"MD18IN-778812 (Toshiba Carrier Inverter)","status":"Activated","recordNo":"ACT-2026-0812","saleDate":"2026-10-15","warrantyEnd":"2027-10-14 (12 Months Standard)","activationNo":"ACT-2026-0812","warrantyStart":"2026-10-15","endCustomerName":"Dr. Asoka Bandara"},"tabDatasets":{"verification":[{"check":"Dealer Delivery Verification","status":"Verified in SAP B1","requirement":"Serial delivered to dealer under SAP Delivery Note"},{"check":"Prior Activation Check","status":"Clean - First Activation","requirement":"Serial number must not have been activated previously"},{"check":"Customer Mobile Validation","status":"Verified (071-555-8899)","requirement":"Valid Sri Lankan format 10 digits"},{"check":"Warranty Certificate Dispatch","status":"Sent (O1-NTF-43)","requirement":"SMS with warranty link sent to customer"}]}}'::jsonb, '2026-10-28T08:48:20.471Z', '2026-10-28T08:48:20.471Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (9, 'warranty-claims', 'CLM-2026-0089', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'MD18OUT-554201 (Daikin Condenser)', 'SC-2026-20515', 'SR-2026-10432', 'Submitted', '{"formData":{"callNo":"SC-2026-20515","serial":"MD18OUT-554201 (Daikin Condenser)","status":"Submitted","claimNo":"CLM-2026-0089","recordNo":"CLM-2026-0089","supplier":"Daikin Singapore Pte Ltd (V-8801)","defectReason":"Compressor internal mechanical seizure within warranty period","warrantyRule":"WR-DAIKIN-12M (100% Parts & Labour Covered)"},"tabDatasets":{"approvals":[{"by":"M. Gamage (Stores Keeper)","date":"2026-10-14","step":"Stores Defective Unit Inspection","notes":"Serial confirmed matching claim, no external physical impact damage","decision":"Verified Defect"},{"by":"N. Perera (Service Manager)","date":"2026-10-15","step":"Technical Specialist Audit","notes":"Internal winding burnt out, eligible for 100% manufacturer warranty","decision":"Approved for Claim"}]}}'::jsonb, '2026-10-28T08:48:20.473Z', '2026-10-28T08:48:20.473Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (10, 'serial-replacements', 'REP-2026-0045', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'SYS-VRV-GALLE-01', 'SC-2026-8821', 'SR-2026-10432', 'Approved', '{"formData":{"claim":"CLM-2026-0089","reason":"Warranty Claim Approved - Complete Compressor Replacement","status":"Approved","recordNo":"REP-2026-0045","systemId":"SYS-VRV-GALLE-01","newSerial":"BSH-CTRL-00872 (Replacement from Stores)","oldSerial":"ENG-4JI-99231 (Defective)","replacementNo":"REP-2026-0045","newWarrantyEnd":"2027-04-15","contractTransfer":"Yes","warrantyTreatment":"Inherit Remaining Warranty + 90 Days Extension","oldUnitDisposition":"Return to Principal / OEM for Credit"},"tabDatasets":{"continuity":[{"newValue":"Galle Fort Residencies (Maintained)","oldValue":"Galle Fort Residencies","attribute":"Customer / Installed Site"},{"newValue":"Transferred to AMC-2026-0192","oldValue":"AMC-2026-0192 (Active)","attribute":"AMC Contract Coverage"},{"newValue":"Updated to Installed / Active","oldValue":"Updated to Replaced / Defective","attribute":"SAP B1 Serial Status"}]}}'::jsonb, '2026-10-28T08:48:20.474Z', '2026-10-28T08:48:20.474Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (11, 'service-contracts', 'AMC-2026-0192', 'Ceylon Agro Machinery PLC (C-20014)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Active', '{"formData":{"status":"Active","endDate":"2027-09-30","customer":"Ceylon Agro Machinery PLC (C-20014)","recordNo":"AMC-2026-0192","valueLkr":"1,250,000.00","startDate":"2026-10-01","contractNo":"AMC-2026-0192","billingBasis":"Quarterly in Advance","contractKind":"AMC Comprehensive (Parts + Labour + 24/7 Breakdown)","visitsPerYear":4,"previousContract":"AMC-2025-0155","specialConditions":"Guaranteed 2-hour response time for server room chillers"},"tabDatasets":{"visitPlan":[{"due":"2026-11-15","call":"SC-2026-21001","visit":"Visit 1","status":"Scheduled"},{"due":"2027-02-15","call":"Pending Generation","visit":"Visit 2","status":"Pending (T-30 Days Auto)"},{"due":"2027-05-15","call":"Pending Generation","visit":"Visit 3","status":"Pending"},{"due":"2027-08-15","call":"Pending Generation","visit":"Visit 4","status":"Pending"}],"equipmentCovered":[{"model":"Daikin VRV-IV 16HP","serial":"BSH-CTRL-00872","system":"Server Room Chiller 01","coverage":"Full Comprehensive (P+L)"},{"model":"Daikin VRV-IV 16HP","serial":"MD18IN-778812","system":"Server Room Chiller 02","coverage":"Full Comprehensive (P+L)"}]}}'::jsonb, '2026-10-28T08:48:20.477Z', '2026-10-28T08:48:20.477Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (12, 'relationship-events', 'EVT-2026-0314', 'Nimal Fernando Engineering (C-30515)', 'Perera Central Logistics Hub', 'Toshiba Commercial Split AC (EQ-018834)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"stage":"Active In Care","reason":"Promotional Inspection Campaign Response","status":"Saved","channel":"Customer Service Portal","eventNo":"EVT-2026-0314","customer":"Nimal Fernando Engineering (C-30515)","raisedBy":"Kasun Perera (Service Coordinator)","recordNo":"EVT-2026-0314","equipment":"Toshiba Commercial Split AC (EQ-018834)","eventType":"Customer Care Rejoining","effectiveDate":"2026-10-15","relationshipType":"Lapsed Customer Rejoining","originatingDocument":"QT-2026-0038","priorDiscontinuation":"EVT-2025-0102"},"tabDatasets":{"auditSteps":[{"date":"2026-10-12","stage":"Rejoining Request Drafted","status":"Completed","officer":"Kasun Perera"},{"date":"2026-10-14","stage":"Re-inspection Site Audit","status":"Approved (Audit OK)","officer":"K. Silva (Inspector)"},{"date":"2026-10-15","stage":"HOD Approval (BCR-38)","status":"Approved","officer":"N. Perera (HOD)"}]}}'::jsonb, '2026-10-28T08:48:20.479Z', '2026-10-28T08:48:20.479Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (13, 'relationship-timelines', 'RTL-2026-10001', 'Perera Holdings (Pvt) Ltd (C-30510)', 'Perera Central Logistics Hub', 'Washing Machine 8kg Industrial (EQ-018831)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"status":"Saved","asAtDate":"2026-10-15","customer":"Perera Holdings (Pvt) Ltd (C-30510)","recordNo":"RTL-2026-10001","equipment":"Washing Machine 8kg Industrial (EQ-018831)"},"tabDatasets":{"events":[{"to":"Service Call Assigned","date":"2026-10-15","from":"Active In Care","event":"Breakdown Repair Logged","reason":"Drain pump blockage reported","document":"SC-2026-20511"},{"to":"Verified OK","date":"2026-08-10","from":"Scheduled","event":"Quarterly AMC Completed","reason":"Quarterly PM routine visit","document":"SC-2026-18920"},{"to":"Active (Year 2)","date":"2026-05-15","from":"Expiring","event":"Annual Contract Renewed","reason":"Contract Renewal AMC-2026-0180","document":"INV-75210"},{"to":"Under Warranty","date":"2025-05-10","from":"Installed","event":"Commissioning & Warranty","reason":"Primary purchase from Telesonic","document":"DEL-8921"}]}}'::jsonb, '2026-10-28T08:48:20.481Z', '2026-10-28T08:48:20.481Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (14, 'reminder-queues', 'REM-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Queued for Dispatch', '{"formData":{"dueTo":"2026-10-31","status":"Queued for Dispatch","channel":"SMS & Customer Portal","dueFrom":"2026-10-15","recordNo":"REM-2026-10001","reminderType":"Upcoming AMC Preventive Service"},"tabDatasets":{"queue":[{"due":"2026-10-18","type":"AMC 3-Month Service Due","status":"Sent","attempt":"1 of 3","channel":"SMS","outcome":"Customer Clicked Booking Link","customer":"Wijesinghe Motors Ltd","equipment":"Chassis Vehicle AC Fleet"},{"due":"2026-10-20","type":"Filter Cleaning Cycle","status":"Delivered","attempt":"1 of 3","channel":"Email","outcome":"Appointment Proposed (15-Oct)","customer":"Kandy Lake Hotel","equipment":"VRV Central System"},{"due":"2026-10-25","type":"Warranty Expiry (30 Days)","status":"Queued","attempt":"2 of 3","channel":"Portal","outcome":"Pending","customer":"Jayasuriya Textiles Ltd","equipment":"Industrial Refrigerator 400L"}]}}'::jsonb, '2026-10-28T08:48:20.482Z', '2026-10-28T08:48:20.482Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (15, 'communication-consents', 'CNS-2026-10001', 'Nimal Fernando (C-30515)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"scope":"Service Reminders & Emergency Outage Notices Only","status":"Saved","channel":"SMS Notifications","consent":"Yes","customer":"Nimal Fernando (C-30515)","evidence":"Digital Terms Acceptance Checkbox Logged","recordNo":"CNS-2026-10001","capturedOn":"2026-10-15","capturedVia":"Customer Portal Registration"},"tabDatasets":{"channelConsentGrid":[{"via":"Customer Portal (UID-8812)","date":"2026-10-15","channel":"SMS Notifications","consent":"Granted (Opt-in)"},{"via":"Customer Portal","date":"2026-10-15","channel":"WhatsApp Chat","consent":"Granted (Opt-in)"},{"via":"Signed AMC Agreement","date":"2026-09-01","channel":"Email Digest","consent":"Granted (Opt-in)"},{"via":"Customer Profile Setting","date":"2026-10-15","channel":"Marketing Calls","consent":"Declined (Opt-out)"}]}}'::jsonb, '2026-10-28T08:48:20.484Z', '2026-10-28T08:48:20.484Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (16, 'parts-requests', 'PIR-2026-0912', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20514', 'PIR-2026-0912', 'Approved', '{"formData":{"type":"Parts Issue for Service Call","callNo":"SC-2026-20514","status":"Approved","recordNo":"PIR-2026-0912","requestNo":"PIR-2026-0912","sapDocument":"ITR-2026-88124 (Inventory Transfer Request)","toWarehouse":"VAN-KSILVA (K. Silva Mobile Van)","fromWarehouse":"AC-SP (Colombo Central Stores)"},"tabDatasets":{"items":[{"qty":"1","uom":"EA","item":"SP-COMP-18K","serial":"BSH-CTRL-00872","returnType":"—","description":"Inverter Scroll Compressor 18HP"},{"qty":"2","uom":"EA","item":"FLT-0921","serial":"—","returnType":"—","description":"Filter Drier 5/8 Flare"},{"qty":"2","uom":"EA","item":"BRG-6204","serial":"—","returnType":"Unused Return","description":"Deep Groove Ball Bearing"}]}}'::jsonb, '2026-10-28T08:48:20.485Z', '2026-10-28T08:48:20.485Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (17, 'subcontractor-confirmations', 'SWC-2026-0044', 'Lanka Cool Services (Pvt) Ltd (V-4410)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Confirmed', '{"formData":{"po":"PO-B1-88412 (SAP Purchase Order)","calls":"SC-2026-20513 (Ceylon Agro Machinery)","period":"2026-10-15","status":"Confirmed","vendor":"Lanka Cool Services (Pvt) Ltd (V-4410)","recordNo":"SWC-2026-0044","confirmationNo":"SWC-2026-0044","materialBalanceOk":"Yes"},"tabDatasets":{"measuredWork":[{"call":"SC-2026-20513","rate":"11,400.00","amount":"28,500.00","service":"Vibration Spectral Analysis & Dynamic Balancing","measuredQty":"2.5 Hours"},{"call":"SC-2026-20513","rate":"17,000.00","amount":"17,000.00","service":"Specialized Nitrogen Leak Testing (40 Bar)","measuredQty":"1 Job"}]}}'::jsonb, '2026-10-28T08:48:20.489Z', '2026-10-28T08:48:20.489Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (18, 'supplier-cost-links', 'SCL-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"gl":"510120 Service Materials Clearing Account","status":"Saved","document":"CM-77123 (Carrier Principal Spare Parts Invoice)","recordNo":"SCL-2026-10001","amountLkr":"128,750.00","costElement":"Specialized Spare Parts"},"tabDatasets":{"splits":[{"call":"SC-2026-20513","date":"2026-10-15","amount":"77,250.00","project":"PRJ-CAC-2026-014","linkedBy":"Dilani Silva (Finance)","percentage":"60.0%"},{"call":"SC-2026-20514","date":"2026-10-15","amount":"51,500.00","project":"PRJ-CAC-2026-014","linkedBy":"Dilani Silva (Finance)","percentage":"40.0%"}]}}'::jsonb, '2026-10-28T08:48:20.491Z', '2026-10-28T08:48:20.491Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (19, 'service-reports', 'RPT-2026-10001', 'Wijesinghe Motors Ltd (C-10231)', 'Perera Central Logistics Hub', 'Crew Cab Vehicle (Chassis + Engine Cooling System)', 'SC-2026-20511', 'SR-2026-10432', 'Saved', '{"formData":{"parts":"1x Expansion Valve (SP-VAL-201), 1x Drier Bottle (FLT-0921), 850g R134a Refrigerant.","callNo":"SC-2026-20511","status":"Saved","customer":"Wijesinghe Motors Ltd (C-10231)","findings":"High pressure refrigerant cutoff triggered due to condenser blockage. Evaporator expansion valve jammed shut.","recordNo":"RPT-2026-10001","workDone":"Recovered refrigerant R134a. Flushed condenser coils with alkaline cleaner. Replaced expansion valve. Re-evacuated to 350 microns and charged 850g pure gas.","equipment":"Crew Cab Vehicle (Chassis + Engine Cooling System)","signature":"M. Wijesinghe (Managing Director) - Captured on Mobile 15-Oct-2026 12:45","technicians":"K. Silva (Lead), R. Kumar (Assistant)"},"tabDatasets":{"partsList":[{"qty":"1","partCode":"SP-VAL-201","warranty":"12 Months Free Replacement","description":"Thermal Expansion Valve 1.5T Flare"},{"qty":"1","partCode":"FLT-0921","warranty":"12 Months","description":"Liquid Receiver Filter Drier"},{"qty":"850g","partCode":"GAS-R134A","warranty":"Consumable","description":"R134a Automotive Grade Refrigerant"}]}}'::jsonb, '2026-10-28T08:48:20.492Z', '2026-10-28T08:48:20.492Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (20, 'supervisor-reviews', 'SRV-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"branch":"Colombo Head Office","status":"Saved","recordNo":"SRV-2026-10001","serviceType":"Breakdown Repair","completedFrom":"2026-10-12"},"tabDatasets":{"pendingReview":[{"age":"4 Hours","call":"SC-2026-20511","type":"Breakdown Repair","customer":"Wijesinghe Motors Ltd","evidence":"Sign + 4 Photos + Checklist OK","technicians":"K. Silva (Lead), R. Kumar"},{"age":"8 Hours","call":"SC-2026-20514","type":"Preventive Maintenance","customer":"Kandy Lake Hotel","evidence":"Checklist OK + Sign Pending","technicians":"A. Perera (Supervisor)"},{"age":"1 Day","call":"SC-2026-20516","type":"Free 1st Service","customer":"Perera Holdings (Pvt) Ltd","evidence":"Sign + Checklist Complete","technicians":"R. Kumar (Assistant)"}]}}'::jsonb, '2026-10-28T08:48:20.493Z', '2026-10-28T08:48:20.493Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (21, 'hod-recommendations', 'HOD-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Reviewed', '{"formData":{"period":"2026-10-01","status":"Reviewed","division":"Air Conditioning & Commercial Refrigeration","recordNo":"HOD-2026-10001"},"tabDatasets":{"evaluations":[{"call":"SC-2026-20511","role":"Lead Technician","score":"96 / 100","amount":"12,500.00","person":"K. Silva (Lead)","repeatFlag":"Clean (Zero Repeat)","eligibility":"Eligible 100%"},{"call":"SC-2026-20511","role":"Assistant Tech","score":"92 / 100","amount":"6,250.00","person":"R. Kumar (Assistant)","repeatFlag":"Clean","eligibility":"Eligible 100%"},{"call":"SC-2026-20513","role":"Helper","score":"—","amount":"0.00","person":"S. Bandara (Helper)","repeatFlag":"—","eligibility":"Not Eligible (Role Excluded)"},{"call":"SC-2026-19877","role":"Lead Technician","score":"68 / 100","amount":"0.00","person":"K. Silva (Lead)","repeatFlag":"Repeat Job (<30 Days)","eligibility":"Disqualified (Repeat Penalty)"}]}}'::jsonb, '2026-10-28T08:48:20.495Z', '2026-10-28T08:48:20.495Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (22, 'technician-evaluations', 'EVL-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20512', 'SR-2026-10432', 'Evaluated', '{"formData":{"role":"Lead Technician","callNo":"SC-2026-20512","person":"K. Silva (Lead Technician)","status":"Evaluated","recordNo":"EVL-2026-10001","totalScore":94,"criteriaSet":"Standard Field Breakdown Repair Rubric (RUB-BRK-01)","notRequired":"No","notRequiredReason":"—"},"tabDatasets":{"rubric":[{"scale":"30","score":"29","remarks":"Pinpointed inverter compressor short within 15 minutes","criterion":"Diagnostic Accuracy & Root Cause Identification"},{"scale":"25","score":"24","remarks":"Proper nitrogen purge during copper brazing, clean welds","criterion":"Workmanship & Soldering / Brazing Quality"},{"scale":"25","score":"23","remarks":"Site manager gave 5-star verbal compliment","criterion":"Customer Communication & Professionalism"},{"scale":"20","score":"18","remarks":"Goggles and insulated boots worn throughout","criterion":"Safety & PPE Compliance"}]}}'::jsonb, '2026-10-28T08:48:20.496Z', '2026-10-28T08:48:20.496Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (23, 'document-corrections', 'COR-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"action":"Field Value Correction (Post-Approval)","reason":"Technician mistakenly logged regular hours instead of Sunday overtime rate","status":"Saved","approver":"N. Perera (Service Manager)","document":"SC-2026-20511 (Wijesinghe Motors)","recordNo":"COR-2026-10001","impactAssessment":"Requires adjusting absorbed labour cost in SAP B1 from LKR 8,200 to LKR 12,300 (+LKR 4,100)."},"tabDatasets":{"changes":[{"field":"Labour Type","newValue":"Sunday Emergency Overtime (1.5x)","oldValue":"Standard Weekday Normal Hours"},{"field":"Absorbed Labour Cost","newValue":"LKR 12,300.00","oldValue":"LKR 8,200.00"}]}}'::jsonb, '2026-10-28T08:48:20.497Z', '2026-10-28T08:48:20.497Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (24, 'audit-inquiries', 'AUD-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"object":"Service Call (O1-SCR-TRX-02)","record":"SC-2026-20513","status":"Saved","dateFrom":"2026-10-01","recordNo":"AUD-2026-10001"},"tabDatasets":{"auditLogs":[{"user":"Kasun Perera (Coordinator)","field":"Status","action":"Status Change","newVal":"In Progress","oldVal":"Assigned","reason":"Technician checked in at customer site via mobile","dateTime":"2026-10-15 14:22:10"},{"user":"Kasun Perera (Coordinator)","field":"Lead Tech","action":"Assignment","newVal":"K. Silva (EMP-0042)","oldVal":"Unassigned","reason":"Skill matrix match for 18HP VRV","dateTime":"2026-10-15 09:30:05"},{"user":"Portal_Inbound","field":"All Fields","action":"Created","newVal":"Ticket Initialized","oldVal":"—","reason":"Customer submitted breakdown via portal","dateTime":"2026-10-12 10:15:00"}]}}'::jsonb, '2026-10-28T08:48:20.499Z', '2026-10-28T08:48:20.499Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (25, 'call-profitability', 'PRF-2026-10001', 'Wijesinghe Motors Ltd (C-10231)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20511', 'SR-2026-10432', 'Saved', '{"formData":{"callNo":"SC-2026-20511","status":"Saved","customer":"Wijesinghe Motors Ltd (C-10231)","recordNo":"PRF-2026-10001","marginLkr":"600,000.00","marginPct":48,"costStatus":"Cost Final","netCostLkr":"650,000.00","entitlement":"Chargeable Post-Warranty Repair","netRevenueLkr":"1,250,000.00"},"tabDatasets":{"costElements":[{"date":"2026-10-12","amount":"518,400.00","jeLine":"Line 1","element":"Materials Issued (Compressor & Drier)","document":"GI-2026-9041"},{"date":"2026-10-13","amount":"42,000.00","jeLine":"Line 4","element":"Absorbed In-House Technician Labour","document":"JE-2026-8812"},{"date":"2026-10-14","amount":"45,500.00","jeLine":"Line 2","element":"Subcontractor Testing Specialist","document":"AP-2026-0442"},{"date":"2026-10-14","amount":"8,200.00","jeLine":"Line 1","element":"Van Fuel & Mileage Allocation","document":"JE-2026-8815"}]}}'::jsonb, '2026-10-28T08:48:20.500Z', '2026-10-28T08:48:20.500Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (26, 'project-workspaces', 'PRJ-2026-10001', 'Ceylon Agro Machinery PLC (C-20014)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Active', '{"formData":{"name":"Ceylon Agro VRV Central Cooling Overhaul","status":"Active","customer":"Ceylon Agro Machinery PLC (C-20014)","recordNo":"PRJ-2026-10001","actualLkr":"2,145,500.00","budgetLkr":"4,500,000.00","projectCode":"PRJ-CAC-2026-014","committedLkr":"850,000.00"},"tabDatasets":{"calls":[{"call":"SC-2026-20513","cost":"518,400.00","type":"Compressor Replacement","margin":"+33.5%","status":"In Progress","revenue":"780,000.00"},{"call":"SC-2026-20514","cost":"142,000.00","type":"Piping Pressure Flush","margin":"+43.2%","status":"Completed","revenue":"250,000.00"},{"call":"SC-2026-20518","cost":"210,000.00","type":"Indoor Unit Commissioning","margin":"+53.3%","status":"Scheduled","revenue":"450,000.00"}]}}'::jsonb, '2026-10-28T08:48:20.501Z', '2026-10-28T08:48:20.501Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (27, 'project-budget-inquiries', 'PBI-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"period":"2026-10-15","status":"Saved","project":"PRJ-CAC-2026-014","version":2,"recordNo":"PBI-2026-10001","cumulative":"Yes"},"tabDatasets":{"varianceLines":[{"gl":"510120 Service Materials","actual":"1,250,000.00","varPct":"-53.7%","current":"2,700,000.00","original":"2,500,000.00","variance":"+1,450,000.00","committed":"450,000.00"},{"gl":"510140 Subcontractor Labour","actual":"450,000.00","varPct":"-50.0%","current":"900,000.00","original":"800,000.00","variance":"+450,000.00","committed":"200,000.00"},{"gl":"510150 Travel & Mileage","actual":"128,750.00","varPct":"-35.6%","current":"200,000.00","original":"200,000.00","variance":"+71,250.00","committed":"0.00"},{"gl":"410100 Service Revenue","actual":"2,850,000.00","varPct":"-45.2%","current":"5,200,000.00","original":"4,800,000.00","variance":"-2,350,000.00","committed":"0.00"}]}}'::jsonb, '2026-10-28T08:48:20.502Z', '2026-10-28T08:48:20.502Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (28, 'franchise-stock-dashboards', 'FSD-2026-10001', 'Negombo Electronics (Franchise F-021)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"item":"All Franchise Stock Items","status":"Saved","asAtDate":"2026-10-15","recordNo":"FSD-2026-10001","franchise":"Negombo Electronics (Franchise F-021)","itemGroup":"Air Conditioner Spares & Consumables"},"tabDatasets":{"stockSummary":[{"item":"Filter Drier 5/8 (FLT-0921)","sold":"18","value":"72,500.00","balance":"5","received":"25","returned":"2","franchise":"Negombo Electronics (F-021)"},{"item":"Carrier Inverter 1.5T (BRG-6204)","sold":"8","value":"320,000.00","balance":"2","received":"10","returned":"0","franchise":"Negombo Electronics (F-021)"},{"item":"Scroll Compressor 18HP (SP-COMP)","sold":"2","value":"970,000.00","balance":"2","received":"4","returned":"0","franchise":"Kandy Home Centre (F-044)"}]}}'::jsonb, '2026-10-28T08:48:20.504Z', '2026-10-28T08:48:20.504Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (29, 'stock-counts', 'SCN-2026-0096', 'Negombo Electronics (F-021)', 'FR-NEG-021 (Negombo Franchise Warehouse)', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Open', '{"formData":{"status":"Open","countNo":"SCN-2026-0096","counter":"A. Perera (Head Office Audit Officer)","recordNo":"SCN-2026-0096","countType":"Quarterly Comprehensive Physical Count","franchise":"Negombo Electronics (F-021)","warehouse":"FR-NEG-021 (Negombo Franchise Warehouse)","blindCount":"Yes","scheduledDate":"2026-10-18"},"tabDatasets":{"itemsToCount":[{"item":"SP-COMP-18K (Scroll Compressor 18HP)","counted":"Pending Input","systemQty":"2 (Hidden on Mobile)","serialManaged":"Yes (Individual Serials)"},{"item":"FLT-0921 (Filter Drier 5/8)","counted":"Pending Input","systemQty":"5 (Hidden on Mobile)","serialManaged":"No (Batch Managed)"},{"item":"BRG-6204 (Bearing 6204)","counted":"Pending Input","systemQty":"14 (Hidden on Mobile)","serialManaged":"No"}]}}'::jsonb, '2026-10-28T08:48:20.505Z', '2026-10-28T08:48:20.505Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (30, 'stock-variance-reviews', 'SVR-2026-10001', 'Negombo Electronics (F-021)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Submitted', '{"formData":{"status":"Submitted","countNo":"SCN-2026-0096","recordNo":"SVR-2026-10001","franchise":"Negombo Electronics (F-021)","totalVarianceValue":"18,450.00"},"tabDatasets":{"varianceLines":[{"item":"FLT-0921 (Filter Drier)","value":"-14,500.00","reason":"Damaged in store rack, scrapped without logging","serial":"—","system":"5","counted":"4","decision":"Approved to Adjust","variance":"-1"},{"item":"BRG-6204 (Bearing)","value":"+3,950.00","reason":"Unrecorded customer return from job SC-2026-1920","serial":"—","system":"14","counted":"15","decision":"Approved to Adjust","variance":"+1"},{"item":"SP-COMP-18K (Compressor)","value":"0.00","reason":"Exact match","serial":"BSH-CTRL-00872","system":"2","counted":"2","decision":"Approved","variance":"0"}]}}'::jsonb, '2026-10-28T08:48:20.506Z', '2026-10-28T08:48:20.506Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (31, 'stock-adjustments', 'ADJ-2026-0044', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"status":"Saved","countNo":"SCN-2026-0096","recordNo":"ADJ-2026-0044","postingDate":"2026-10-18","sapDocument":"GI-B1-99812 (SAP Goods Issue)","adjustmentNo":"ADJ-2026-0044","recoveryMethod":"Debit Franchise Monthly Commission Account"},"tabDatasets":{"postings":[{"qty":"-1","item":"FLT-0921 Filter Drier 5/8","value":"14,500.00","postingType":"Goods Issue (Stock Shortage)"},{"qty":"+1","item":"BRG-6204 Bearing Deep Groove","value":"3,950.00","postingType":"Goods Receipt (Stock Surplus)"}]}}'::jsonb, '2026-10-28T08:48:20.507Z', '2026-10-28T08:48:20.507Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (32, 'communication-logs', 'CML-2026-10001', 'Wijesinghe Motors Ltd (C-10231)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-8821', 'SR-2026-10432', 'Saved', '{"formData":{"status":"Saved","channel":"All Communication Channels","customer":"Wijesinghe Motors Ltd (C-10231)","dateFrom":"2026-10-01","recordNo":"CML-2026-10001"},"tabDatasets":{"messages":[{"date":"2026-10-15 09:35","status":"Delivered (Handset ACK)","channel":"SMS","retries":"0","recipient":"077 123 4567","notification":"Technician Arrival Alert (O1-NTF-12)"},{"date":"2026-10-14 14:15","status":"Delivered","channel":"Email","retries":"0","recipient":"manager@wijesinghemotors.lk","notification":"Appointment Rescheduled Notice (O1-NTF-05)"},{"date":"2026-10-12 11:02","status":"Delivered","channel":"SMS","retries":"0","recipient":"077 123 4567","notification":"Ticket Registration Confirmation (O1-NTF-01)"},{"date":"2026-10-10 16:20","status":"Failed (Mailbox Full)","channel":"Email","retries":"3","recipient":"accounts@wijesinghe.lk","notification":"Parts Hold Delay Notice (O1-NTF-08)"}]}}'::jsonb, '2026-10-28T08:48:20.509Z', '2026-10-28T08:48:20.509Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (33, 'workshop-jobs', 'WJB-2026-10001', 'Kandy Lake Hotel (C-30514)', 'Perera Central Logistics Hub', 'BSH-CTRL-00872 (Daikin Electronic Expansion PCB)', 'SC-2026-20511', 'SR-2026-10432', 'Saved', '{"formData":{"callNo":"SC-2026-20511","inDate":"2026-10-14","source":"Field Technician Van Recovery (K. Silva)","status":"Saved","outDate":"2026-10-16","daysHeld":2,"recordNo":"WJB-2026-10001","unitSerial":"BSH-CTRL-00872 (Daikin Electronic Expansion PCB)"},"tabDatasets":{"benchWork":[{"by":"N. Gamage (Bench Tech)","date":"2026-10-14 11:30","action":"Visual Inspection & Board De-soldering","remarks":"Blown diode D14 on inverter trigger line"},{"by":"N. Gamage (Bench Tech)","date":"2026-10-15 14:00","action":"Component Replacement & Conformal Coat","remarks":"Replaced diode with high-current Vishay 400V part, heat sink cleaned"},{"by":"M. Perera (Bench Lead)","date":"2026-10-16 09:15","action":"Bench Simulation Run Test (4 Hours)","remarks":"Passed full-load current test at 48°C ambient chamber"}]}}'::jsonb, '2026-10-28T08:48:20.510Z', '2026-10-28T08:48:20.510Z') ON CONFLICT DO NOTHING;
INSERT INTO "transaction_records" ("id", "process_key", "record_no", "customer", "site", "equipment", "call_no", "request_no", "status", "data", "created_at", "updated_at") VALUES (34, 'service-quotations', 'QT-2026-0045', 'Ceylon Agro Machinery PLC (C-20014)', 'Perera Central Logistics Hub', 'Carrier REF-400-INV (testeq001 / SN: MID-INV-55210)', 'SC-2026-20513', 'SR-2026-10432', 'Approved', '{"formData":{"callNo":"SC-2026-20513","status":"Approved","version":1,"customer":"Ceylon Agro Machinery PLC (C-20014)","recordNo":"QT-2026-0045","totalLkr":"586,900.00","validUntil":"2026-11-15","quotationNo":"QT-2026-0045"},"tabDatasets":{"lines":[{"qty":"1","item":"Inverter Scroll Compressor 18HP (SP-COMP-18K)","price":"485,000.00","total":"460,750.00","discount":"5.0%"},{"qty":"1","item":"Liquid Line Filter Drier (FLT-0921)","price":"14,500.00","total":"14,500.00","discount":"0.0%"},{"qty":"4.5","item":"R410A Refrigerant Charge (kg)","price":"4,200.00","total":"18,900.00","discount":"0.0%"},{"qty":"6.0 Hrs","item":"Specialist Overhaul & Pressure Testing Labour","price":"16,500.00","total":"91,575.00","discount":"7.5%"}],"versions":[{"ver":"v1","date":"2026-10-13","total":"615,000.00","status":"Superseded","changeNotes":"Initial quote without AMC partner discount"},{"ver":"v2 (Current)","date":"2026-10-15","total":"586,900.00","status":"Approved","changeNotes":"Applied 5% corporate client discount per HOD approval"}]}}'::jsonb, '2026-10-28T08:48:20.511Z', '2026-10-28T08:48:20.511Z') ON CONFLICT DO NOTHING;

-- Data for table "users" (3 rows)
INSERT INTO "users" ("email", "name", "password", "role", "phone", "createdAt", "updatedAt", "status", "id") VALUES ('admin@gmail.com', 'Super Admin', '$2b$10$3vSxKJCQIxw2hhDp2gTGWumt57Yr3ntZ9pYHNPwARan.FijEyIBM6', 'ADMIN', '0112899796', '2026-10-21T05:46:51.643Z', '2026-10-21T11:13:59.333Z', 'Active', 6) ON CONFLICT DO NOTHING;
INSERT INTO "users" ("email", "name", "password", "role", "phone", "createdAt", "updatedAt", "status", "id") VALUES ('kamal@gmail.com', 'Kamal Gamage', '$2b$10$LzINlLkH5yKOd3xq6te1qO2Ynyj49p2gU7.lxxKzRcSIfnko4R7b.', 'REGISTRAR', '+94 11 234 5678', '2026-10-21T05:31:04.065Z', '2026-10-21T11:42:22.639Z', 'Active', 1) ON CONFLICT DO NOTHING;
INSERT INTO "users" ("email", "name", "password", "role", "phone", "createdAt", "updatedAt", "status", "id") VALUES ('nalin@gmail.com', 'Nalin Chathuranga', '$2b$10$Ue6xQRuib0gSFFqLviibaO7XAFBskIuIwjp4GISo5WpL7BYIv12DC', 'TECHNICIAN', '+94 77 123 4567', '2026-10-21T05:31:04.068Z', '2026-10-21T11:43:32.016Z', 'Active', 2) ON CONFLICT DO NOTHING;

-- Data for table "warranty_rules" (3 rows)
INSERT INTO "warranty_rules" ("id", "ruleCode", "equipmentCategory", "componentRole", "channel", "startBasis", "months", "labourCovered", "replacementTreatment", "status", "createdAt", "updatedAt") VALUES (4, 'WAR-DAIKIN-VRV-12M', 'Commercial VRF Air Conditioning', NULL, NULL, 'Commissioning Date', 12, 'Yes', 'Free Part & Labour', 'Active', '2026-10-28T03:14:56.194Z', '2026-10-28T03:14:56.194Z') ON CONFLICT DO NOTHING;
INSERT INTO "warranty_rules" ("id", "ruleCode", "equipmentCategory", "componentRole", "channel", "startBasis", "months", "labourCovered", "replacementTreatment", "status", "createdAt", "updatedAt") VALUES (5, 'WAR-COMP-5YR', 'Inverter Compressor Unit', NULL, NULL, 'Installation Date', 60, 'No', 'Component Replacement Only', 'Active', '2026-10-28T03:14:56.196Z', '2026-10-28T03:14:56.196Z') ON CONFLICT DO NOTHING;
INSERT INTO "warranty_rules" ("id", "ruleCode", "equipmentCategory", "componentRole", "channel", "startBasis", "months", "labourCovered", "replacementTreatment", "status", "createdAt", "updatedAt") VALUES (6, 'WAR-STD-RETAIL-12M', 'Split Air Conditioner', NULL, NULL, 'Invoice Date', 12, 'Yes', 'Repair in Workshop', 'Active', '2026-10-28T03:14:56.198Z', '2026-10-28T03:14:56.198Z') ON CONFLICT DO NOTHING;

-- ============================================================================
-- RESET AUTO-INCREMENT SEQUENCES TO MAX(ID)
-- ============================================================================
SELECT setval(pg_get_serial_sequence('"checklist_templates"', 'id'), COALESCE((SELECT MAX("id") FROM "checklist_templates"), 1), true);
SELECT setval(pg_get_serial_sequence('"customers"', 'id'), COALESCE((SELECT MAX("id") FROM "customers"), 1), true);
SELECT setval(pg_get_serial_sequence('"contact_persons"', 'id'), COALESCE((SELECT MAX("id") FROM "contact_persons"), 1), true);
SELECT setval(pg_get_serial_sequence('"contract_templates"', 'id'), COALESCE((SELECT MAX("id") FROM "contract_templates"), 1), true);
SELECT setval(pg_get_serial_sequence('"cost_element_mappings"', 'id'), COALESCE((SELECT MAX("id") FROM "cost_element_mappings"), 1), true);
SELECT setval(pg_get_serial_sequence('"sites"', 'id'), COALESCE((SELECT MAX("id") FROM "sites"), 1), true);
SELECT setval(pg_get_serial_sequence('"equipment_systems"', 'id'), COALESCE((SELECT MAX("id") FROM "equipment_systems"), 1), true);
SELECT setval(pg_get_serial_sequence('"items"', 'id'), COALESCE((SELECT MAX("id") FROM "items"), 1), true);
SELECT setval(pg_get_serial_sequence('"serials"', 'id'), COALESCE((SELECT MAX("id") FROM "serials"), 1), true);
SELECT setval(pg_get_serial_sequence('"equipments"', 'id'), COALESCE((SELECT MAX("id") FROM "equipments"), 1), true);
SELECT setval(pg_get_serial_sequence('"franchise_warehouses"', 'id'), COALESCE((SELECT MAX("id") FROM "franchise_warehouses"), 1), true);
SELECT setval(pg_get_serial_sequence('"google_meet_settings"', 'id'), COALESCE((SELECT MAX("id") FROM "google_meet_settings"), 1), true);
SELECT setval(pg_get_serial_sequence('"hold_reasons"', 'id'), COALESCE((SELECT MAX("id") FROM "hold_reasons"), 1), true);
SELECT setval(pg_get_serial_sequence('"master_records"', 'id'), COALESCE((SELECT MAX("id") FROM "master_records"), 1), true);
SELECT setval(pg_get_serial_sequence('"other_brand_equipments"', 'id'), COALESCE((SELECT MAX("id") FROM "other_brand_equipments"), 1), true);
SELECT setval(pg_get_serial_sequence('"project_budgets"', 'id'), COALESCE((SELECT MAX("id") FROM "project_budgets"), 1), true);
SELECT setval(pg_get_serial_sequence('"repeat_reasons"', 'id'), COALESCE((SELECT MAX("id") FROM "repeat_reasons"), 1), true);
SELECT setval(pg_get_serial_sequence('"service_roles"', 'id'), COALESCE((SELECT MAX("id") FROM "service_roles"), 1), true);
SELECT setval(pg_get_serial_sequence('"service_types"', 'id'), COALESCE((SELECT MAX("id") FROM "service_types"), 1), true);
SELECT setval(pg_get_serial_sequence('"subcontractors"', 'id'), COALESCE((SELECT MAX("id") FROM "subcontractors"), 1), true);
SELECT setval(pg_get_serial_sequence('"system_roles"', 'id'), COALESCE((SELECT MAX("id") FROM "system_roles"), 1), true);
SELECT setval(pg_get_serial_sequence('"technicians"', 'id'), COALESCE((SELECT MAX("id") FROM "technicians"), 1), true);
SELECT setval(pg_get_serial_sequence('"transaction_records"', 'id'), COALESCE((SELECT MAX("id") FROM "transaction_records"), 1), true);
SELECT setval(pg_get_serial_sequence('"users"', 'id'), COALESCE((SELECT MAX("id") FROM "users"), 1), true);
SELECT setval(pg_get_serial_sequence('"warranty_rules"', 'id'), COALESCE((SELECT MAX("id") FROM "warranty_rules"), 1), true);
