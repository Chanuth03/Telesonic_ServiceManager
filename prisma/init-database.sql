-- ==============================================================================
-- Telesonic Service Manager - Complete PostgreSQL Database Initialization Script
-- Comprehensive Schema: Core System + All Master Screens (MST-01 to MST-33)
-- Generated authoritative SQL directly from prisma/schema.prisma
-- ==============================================================================

-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateTable
CREATE TABLE "jobs" (
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

-- CreateTable
CREATE TABLE "service_requests" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "callType" TEXT NOT NULL,
    "customerName" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "assignedTo" TEXT,
    "scheduledDate" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "service_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sync_logs" (
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

-- CreateTable
CREATE TABLE "labour_logs" (
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

-- CreateTable
CREATE TABLE "parts_used" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "partCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "qtyUsed" INTEGER NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "parts_used_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "inspections" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "inspectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "technicianName" TEXT NOT NULL,
    "overallStatus" TEXT NOT NULL,
    "generalNotes" TEXT,

    CONSTRAINT "inspections_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "hold_requests" (
    "id" TEXT NOT NULL,
    "jobId" TEXT NOT NULL,
    "reason" TEXT NOT NULL,
    "notes" TEXT NOT NULL,
    "estimatedDelayHours" DOUBLE PRECISION NOT NULL,
    "requestedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "status" TEXT NOT NULL,

    CONSTRAINT "hold_requests_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "users" (
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

-- CreateTable
CREATE TABLE "system_roles" (
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

-- CreateTable
CREATE TABLE "master_records" (
    "id" SERIAL NOT NULL,
    "screenCode" TEXT NOT NULL,
    "recordKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "master_records_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "customers" (
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

-- CreateTable
CREATE TABLE "contact_persons" (
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

-- CreateTable
CREATE TABLE "sites" (
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

-- CreateTable
CREATE TABLE "items" (
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

-- CreateTable
CREATE TABLE "serials" (
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

-- CreateTable
CREATE TABLE "equipments" (
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

-- CreateTable
CREATE TABLE "other_brand_equipments" (
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

-- CreateTable
CREATE TABLE "equipment_systems" (
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

-- CreateTable
CREATE TABLE "technicians" (
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

-- CreateTable
CREATE TABLE "subcontractors" (
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

-- CreateTable
CREATE TABLE "service_roles" (
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

-- CreateTable
CREATE TABLE "service_types" (
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

-- CreateTable
CREATE TABLE "hold_reasons" (
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

-- CreateTable
CREATE TABLE "repeat_reasons" (
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

-- CreateTable
CREATE TABLE "sla_rules" (
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

-- CreateTable
CREATE TABLE "checklist_templates" (
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

-- CreateTable
CREATE TABLE "warranty_rules" (
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

-- CreateTable
CREATE TABLE "free_service_plans" (
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

-- CreateTable
CREATE TABLE "contract_templates" (
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

-- CreateTable
CREATE TABLE "relationship_stages" (
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

-- CreateTable
CREATE TABLE "reminder_rules" (
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

-- CreateTable
CREATE TABLE "notification_templates" (
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

-- CreateTable
CREATE TABLE "project_budgets" (
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

-- CreateTable
CREATE TABLE "cost_element_mappings" (
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

-- CreateTable
CREATE TABLE "labour_rates" (
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

-- CreateTable
CREATE TABLE "franchise_warehouses" (
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

-- CreateTable
CREATE TABLE "deviation_reasons" (
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

-- CreateTable
CREATE TABLE "export_permissions" (
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

-- CreateTable
CREATE TABLE "google_meet_settings" (
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

-- CreateTable
CREATE TABLE "equipment_category_attributes" (
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

-- CreateTable
CREATE TABLE "tool_vehicle_assets" (
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

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "system_roles_code_key" ON "system_roles"("code");

-- CreateIndex
CREATE INDEX "master_records_screenCode_idx" ON "master_records"("screenCode");

-- CreateIndex
CREATE UNIQUE INDEX "master_records_screenCode_recordKey_key" ON "master_records"("screenCode", "recordKey");

-- CreateIndex
CREATE UNIQUE INDEX "customers_customerCode_key" ON "customers"("customerCode");

-- CreateIndex
CREATE INDEX "contact_persons_customerId_idx" ON "contact_persons"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "sites_siteCode_key" ON "sites"("siteCode");

-- CreateIndex
CREATE INDEX "sites_customerId_idx" ON "sites"("customerId");

-- CreateIndex
CREATE UNIQUE INDEX "items_itemCode_key" ON "items"("itemCode");

-- CreateIndex
CREATE UNIQUE INDEX "serials_serialNo_key" ON "serials"("serialNo");

-- CreateIndex
CREATE INDEX "serials_itemId_idx" ON "serials"("itemId");

-- CreateIndex
CREATE INDEX "serials_customerId_idx" ON "serials"("customerId");

-- CreateIndex
CREATE INDEX "serials_siteId_idx" ON "serials"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "equipments_equipmentId_key" ON "equipments"("equipmentId");

-- CreateIndex
CREATE INDEX "equipments_customerId_idx" ON "equipments"("customerId");

-- CreateIndex
CREATE INDEX "equipments_siteId_idx" ON "equipments"("siteId");

-- CreateIndex
CREATE INDEX "equipments_serialId_idx" ON "equipments"("serialId");

-- CreateIndex
CREATE UNIQUE INDEX "other_brand_equipments_equipmentId_key" ON "other_brand_equipments"("equipmentId");

-- CreateIndex
CREATE INDEX "other_brand_equipments_customerId_idx" ON "other_brand_equipments"("customerId");

-- CreateIndex
CREATE INDEX "other_brand_equipments_siteId_idx" ON "other_brand_equipments"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_systems_systemId_key" ON "equipment_systems"("systemId");

-- CreateIndex
CREATE INDEX "equipment_systems_customerId_idx" ON "equipment_systems"("customerId");

-- CreateIndex
CREATE INDEX "equipment_systems_siteId_idx" ON "equipment_systems"("siteId");

-- CreateIndex
CREATE UNIQUE INDEX "technicians_employeeId_key" ON "technicians"("employeeId");

-- CreateIndex
CREATE UNIQUE INDEX "subcontractors_vendorCode_key" ON "subcontractors"("vendorCode");

-- CreateIndex
CREATE UNIQUE INDEX "service_roles_roleCode_key" ON "service_roles"("roleCode");

-- CreateIndex
CREATE UNIQUE INDEX "service_types_code_key" ON "service_types"("code");

-- CreateIndex
CREATE UNIQUE INDEX "hold_reasons_reasonCode_key" ON "hold_reasons"("reasonCode");

-- CreateIndex
CREATE UNIQUE INDEX "repeat_reasons_reasonCode_key" ON "repeat_reasons"("reasonCode");

-- CreateIndex
CREATE UNIQUE INDEX "sla_rules_ruleCode_key" ON "sla_rules"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "checklist_templates_templateCode_key" ON "checklist_templates"("templateCode");

-- CreateIndex
CREATE UNIQUE INDEX "warranty_rules_ruleCode_key" ON "warranty_rules"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "free_service_plans_planCode_key" ON "free_service_plans"("planCode");

-- CreateIndex
CREATE UNIQUE INDEX "contract_templates_template_key" ON "contract_templates"("template");

-- CreateIndex
CREATE UNIQUE INDEX "relationship_stages_code_key" ON "relationship_stages"("code");

-- CreateIndex
CREATE UNIQUE INDEX "reminder_rules_ruleCode_key" ON "reminder_rules"("ruleCode");

-- CreateIndex
CREATE UNIQUE INDEX "notification_templates_templateId_key" ON "notification_templates"("templateId");

-- CreateIndex
CREATE UNIQUE INDEX "project_budgets_projectCode_key" ON "project_budgets"("projectCode");

-- CreateIndex
CREATE UNIQUE INDEX "cost_element_mappings_costElement_key" ON "cost_element_mappings"("costElement");

-- CreateIndex
CREATE UNIQUE INDEX "labour_rates_rateCode_key" ON "labour_rates"("rateCode");

-- CreateIndex
CREATE UNIQUE INDEX "franchise_warehouses_franchiseBp_key" ON "franchise_warehouses"("franchiseBp");

-- CreateIndex
CREATE UNIQUE INDEX "deviation_reasons_reasonCode_key" ON "deviation_reasons"("reasonCode");

-- CreateIndex
CREATE UNIQUE INDEX "export_permissions_role_reportGrid_key" ON "export_permissions"("role", "reportGrid");

-- CreateIndex
CREATE UNIQUE INDEX "google_meet_settings_workspaceDomain_key" ON "google_meet_settings"("workspaceDomain");

-- CreateIndex
CREATE UNIQUE INDEX "equipment_category_attributes_categoryCode_key" ON "equipment_category_attributes"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "tool_vehicle_assets_assetId_key" ON "tool_vehicle_assets"("assetId");

-- AddForeignKey
ALTER TABLE "labour_logs" ADD CONSTRAINT "labour_logs_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "parts_used" ADD CONSTRAINT "parts_used_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "inspections" ADD CONSTRAINT "inspections_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "hold_requests" ADD CONSTRAINT "hold_requests_jobId_fkey" FOREIGN KEY ("jobId") REFERENCES "jobs"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "contact_persons" ADD CONSTRAINT "contact_persons_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sites" ADD CONSTRAINT "sites_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serials" ADD CONSTRAINT "serials_itemId_fkey" FOREIGN KEY ("itemId") REFERENCES "items"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serials" ADD CONSTRAINT "serials_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "serials" ADD CONSTRAINT "serials_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipments" ADD CONSTRAINT "equipments_serialId_fkey" FOREIGN KEY ("serialId") REFERENCES "serials"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_brand_equipments" ADD CONSTRAINT "other_brand_equipments_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "other_brand_equipments" ADD CONSTRAINT "other_brand_equipments_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_systems" ADD CONSTRAINT "equipment_systems_customerId_fkey" FOREIGN KEY ("customerId") REFERENCES "customers"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "equipment_systems" ADD CONSTRAINT "equipment_systems_siteId_fkey" FOREIGN KEY ("siteId") REFERENCES "sites"("id") ON DELETE SET NULL ON UPDATE CASCADE;

