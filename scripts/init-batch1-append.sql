
-- ============================================================================
-- BATCH 1 MASTER TABLES (MST-08 to MST-12)
-- ============================================================================

-- MST-08: Multi-Component Equipment Systems
CREATE TABLE IF NOT EXISTS equipment_systems (
  id SERIAL PRIMARY KEY,
  "systemId" VARCHAR(100) UNIQUE NOT NULL,
  "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  "customerName" VARCHAR(255),
  "siteId" INTEGER REFERENCES sites(id) ON DELETE SET NULL,
  "siteName" VARCHAR(255),
  location VARCHAR(255),
  "equipmentCategory" VARCHAR(150) NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'Active',
  "installedDate" VARCHAR(50),
  "commissionedDate" VARCHAR(50),
  "warrantyStart" VARCHAR(50),
  "warrantyEnd" VARCHAR(50),
  contract VARCHAR(150),
  project VARCHAR(150),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);
CREATE INDEX IF NOT EXISTS idx_equipment_systems_customerId ON equipment_systems("customerId");
CREATE INDEX IF NOT EXISTS idx_equipment_systems_siteId ON equipment_systems("siteId");

-- MST-09: Employee / Technician
CREATE TABLE IF NOT EXISTS technicians (
  id SERIAL PRIMARY KEY,
  "employeeId" VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  position VARCHAR(100),
  department VARCHAR(100),
  branch VARCHAR(100),
  mobile VARCHAR(50),
  "technicianType" VARCHAR(100) DEFAULT 'Direct In-House Staff',
  team VARCHAR(100),
  certifications VARCHAR(255),
  status VARCHAR(50) DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MST-10: Subcontractors
CREATE TABLE IF NOT EXISTS subcontractors (
  id SERIAL PRIMARY KEY,
  "vendorCode" VARCHAR(100) UNIQUE NOT NULL,
  "vendorName" VARCHAR(255) NOT NULL,
  "subcontractorType" VARCHAR(100) NOT NULL,
  territory VARCHAR(100) NOT NULL,
  "paymentTerms" VARCHAR(100),
  rating DOUBLE PRECISION DEFAULT 8.0,
  status VARCHAR(50) DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MST-11: Service Role Master
CREATE TABLE IF NOT EXISTS service_roles (
  id SERIAL PRIMARY KEY,
  "roleCode" VARCHAR(100) UNIQUE NOT NULL,
  "roleName" VARCHAR(255) NOT NULL,
  "internalSubcontractor" VARCHAR(100) DEFAULT 'Both Internal and Subcontractor',
  "incentiveEligible" VARCHAR(10) DEFAULT 'Yes',
  "incentiveBasisRef" VARCHAR(255),
  "multiplePerCall" VARCHAR(10) DEFAULT 'No',
  active VARCHAR(10) DEFAULT 'Yes',
  status VARCHAR(50) DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- MST-12: Service Type / Reason / Priority / Status
CREATE TABLE IF NOT EXISTS service_types (
  id SERIAL PRIMARY KEY,
  code VARCHAR(100) UNIQUE NOT NULL,
  description VARCHAR(255) NOT NULL,
  "listType" VARCHAR(100) NOT NULL,
  "defaultPriority" VARCHAR(100) DEFAULT 'P2 - Normal Schedule',
  "checklistTemplate" VARCHAR(100),
  "slaRule" VARCHAR(100),
  "chargeableDefault" VARCHAR(100) DEFAULT 'No',
  active VARCHAR(10) DEFAULT 'Yes',
  status VARCHAR(50) DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

