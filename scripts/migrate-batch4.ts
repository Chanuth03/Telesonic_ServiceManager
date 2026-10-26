import { prisma } from '../src/lib/prisma';

async function main() {
  // MST-23: project_budgets
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS project_budgets (
      id SERIAL PRIMARY KEY,
      "projectCode" VARCHAR(100) UNIQUE NOT NULL,
      "projectName" VARCHAR(255) NOT NULL,
      customer VARCHAR(255) NOT NULL,
      "projectManager" VARCHAR(255) NOT NULL,
      "startDate" TIMESTAMP(3),
      "endDate" TIMESTAMP(3),
      "budgetVersion" INTEGER DEFAULT 1,
      "versionStatus" VARCHAR(100) DEFAULT 'Draft',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-24: cost_element_mappings
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS cost_element_mappings (
      id SERIAL PRIMARY KEY,
      "costElement" VARCHAR(150) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      "glAccount" VARCHAR(255) NOT NULL,
      "revenueCost" VARCHAR(50) DEFAULT 'Expense',
      "requiresCallRef" VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-25: labour_rates
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS labour_rates (
      id SERIAL PRIMARY KEY,
      "rateCode" VARCHAR(100) UNIQUE NOT NULL,
      "technicianType" VARCHAR(150) NOT NULL,
      "normalRate" DOUBLE PRECISION NOT NULL,
      "overtimeRate" DOUBLE PRECISION DEFAULT 0.0,
      "subcontractRate" DOUBLE PRECISION DEFAULT 0.0,
      "validFrom" TIMESTAMP(3),
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-26: franchise_warehouses
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS franchise_warehouses (
      id SERIAL PRIMARY KEY,
      "franchiseBp" VARCHAR(100) UNIQUE NOT NULL,
      "franchiseName" VARCHAR(255) NOT NULL,
      warehouse VARCHAR(255) NOT NULL,
      "stockOwnership" VARCHAR(100) DEFAULT 'Telesonic Consignment Stock',
      region VARCHAR(100),
      "countFrequency" VARCHAR(100) DEFAULT 'Monthly Physical Audit',
      auditor VARCHAR(150),
      active VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-27: deviation_reasons
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS deviation_reasons (
      id SERIAL PRIMARY KEY,
      "reasonCode" VARCHAR(100) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      "recoverableFromFranchise" VARCHAR(100) DEFAULT 'No (Telesonic Absorption)',
      "qtyThreshold" INTEGER DEFAULT 1,
      "valueThresholdLkr" DOUBLE PRECISION DEFAULT 0.0,
      "escalationRecipients" TEXT,
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-28: export_permissions
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS export_permissions (
      id SERIAL PRIMARY KEY,
      role VARCHAR(100) NOT NULL,
      "reportGrid" VARCHAR(150) NOT NULL,
      excel VARCHAR(10) DEFAULT 'Yes',
      pdf VARCHAR(10) DEFAULT 'Yes',
      "restrictedColumns" TEXT,
      "rowLimit" INTEGER DEFAULT 5000,
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      CONSTRAINT unique_role_report UNIQUE (role, "reportGrid")
    );
  `);

  // MST-29: google_meet_settings
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS google_meet_settings (
      id SERIAL PRIMARY KEY,
      "workspaceDomain" VARCHAR(150) UNIQUE NOT NULL,
      "organiserAccount" VARCHAR(255) NOT NULL,
      "authMethod" VARCHAR(150) DEFAULT 'Google Cloud Service Account JWT',
      "defaultDuration" INTEGER DEFAULT 45,
      "inviteCustomer" VARCHAR(10) DEFAULT 'Yes',
      "inviteFranchise" VARCHAR(10) DEFAULT 'Yes',
      "retryCount" INTEGER DEFAULT 3,
      enabled VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-30: equipment_category_attributes
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS equipment_category_attributes (
      id SERIAL PRIMARY KEY,
      "categoryCode" VARCHAR(100) UNIQUE NOT NULL,
      "categoryName" VARCHAR(255) NOT NULL,
      "industryGroup" VARCHAR(150),
      "multiComponent" VARCHAR(10) DEFAULT 'No',
      "meterType" VARCHAR(100) DEFAULT 'None',
      "defaultIntervalBasis" VARCHAR(100) DEFAULT 'Months (Calendar)',
      "defaultInterval" INTEGER DEFAULT 3,
      "checklistSet" VARCHAR(150),
      "warrantyRule" VARCHAR(150),
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-31: tool_vehicle_assets
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS tool_vehicle_assets (
      id SERIAL PRIMARY KEY,
      "assetId" VARCHAR(100) UNIQUE NOT NULL,
      type VARCHAR(100) NOT NULL,
      description TEXT NOT NULL,
      holder VARCHAR(150),
      "vehicleRegNo" VARCHAR(100),
      "meterKm" INTEGER,
      "licenceExpiry" TIMESTAMP(3),
      "insuranceExpiry" TIMESTAMP(3),
      status VARCHAR(50) DEFAULT 'Available in Stores',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('All remaining tables (MST-23 to MST-31) created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

