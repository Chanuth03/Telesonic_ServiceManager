
-- ============================================================================
-- 13. OTHER-BRAND EQUIPMENT REGISTRATION (MST-07 / O1-SCR-MST-07)
-- ============================================================================
CREATE TABLE IF NOT EXISTS other_brand_equipments (
  id SERIAL PRIMARY KEY,
  "equipmentId" VARCHAR(100) UNIQUE NOT NULL,
  "customerId" INTEGER REFERENCES customers(id) ON DELETE SET NULL,
  "customerName" VARCHAR(255),
  "siteId" INTEGER REFERENCES sites(id) ON DELETE SET NULL,
  "siteName" VARCHAR(255),
  "equipmentCategory" VARCHAR(150) NOT NULL,
  brand VARCHAR(100) NOT NULL,
  model VARCHAR(150) NOT NULL,
  serial VARCHAR(100),
  "serialUnknown" VARCHAR(10) DEFAULT 'No',
  "previousSupplier" VARCHAR(255),
  "takeoverDate" VARCHAR(50),
  "takeoverCondition" TEXT,
  status VARCHAR(50) DEFAULT 'Active',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_other_brand_customerId ON other_brand_equipments("customerId");
CREATE INDEX IF NOT EXISTS idx_other_brand_siteId ON other_brand_equipments("siteId");

