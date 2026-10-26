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

-- ====================================================================
-- Telesonic Lanka Service Manager - PostgreSQL Database Initialization
-- ====================================================================
-- This SQL script initializes the entire Telesonic Service Manager
-- database schema and seeds initial data (Admin & Tech users, Jobs,
-- Incentive Schemes, Slabs, Qualification Rules, etc.).
--
-- How to run:
--   psql -U postgres -d telesonic -f prisma/init-database.sql
--   or execute directly in pgAdmin Query Tool, Supabase, Neon, or Docker.
-- ====================================================================

-- Enable UUID extension if available
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ====================================================================
-- 1. USERS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(64) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL DEFAULT 'TECHNICIAN',
    phone VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 2. JOBS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS jobs (
    id VARCHAR(64) PRIMARY KEY,
    "customerName" VARCHAR(255) NOT NULL,
    "customerContact" VARCHAR(100),
    town VARCHAR(100) NOT NULL,
    "window" VARCHAR(100) NOT NULL,
    priority VARCHAR(50) NOT NULL DEFAULT 'Normal',
    role VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Assigned',
    category VARCHAR(100) NOT NULL,
    "siteName" VARCHAR(255),
    "siteAddress" TEXT NOT NULL,
    "technicianName" VARCHAR(255) NOT NULL,
    "scheduledDate" VARCHAR(50) NOT NULL,
    "syncStatus" VARCHAR(50) NOT NULL DEFAULT 'synced',
    "syncedAt" TIMESTAMP WITH TIME ZONE,
    version INT NOT NULL DEFAULT 1,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 3. SERVICE REQUESTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS service_requests (
    id VARCHAR(64) PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    "callType" VARCHAR(100) NOT NULL,
    "customerName" VARCHAR(255) NOT NULL,
    status VARCHAR(50) NOT NULL,
    priority VARCHAR(50) NOT NULL,
    "assignedTo" VARCHAR(255),
    "scheduledDate" VARCHAR(50),
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 4. SYNC LOGS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS sync_logs (
    id VARCHAR(64) PRIMARY KEY,
    "batchId" VARCHAR(100) NOT NULL,
    role VARCHAR(50) NOT NULL,
    "deviceId" VARCHAR(100) NOT NULL,
    "itemCount" INT NOT NULL,
    status VARCHAR(50) NOT NULL,
    details TEXT,
    "syncedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 5. LABOUR LOGS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS labour_logs (
    id VARCHAR(64) PRIMARY KEY,
    "jobId" VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "technicianName" VARCHAR(255) NOT NULL,
    date VARCHAR(50) NOT NULL,
    hours DOUBLE PRECISION NOT NULL,
    "rateType" VARCHAR(100) NOT NULL,
    "activityDescription" TEXT NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 6. PARTS USED TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS parts_used (
    id VARCHAR(64) PRIMARY KEY,
    "jobId" VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "partCode" VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    "qtyUsed" INT NOT NULL,
    "unitPrice" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 7. INSPECTIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS inspections (
    id VARCHAR(64) PRIMARY KEY,
    "jobId" VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    "inspectedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "technicianName" VARCHAR(255) NOT NULL,
    "overallStatus" VARCHAR(50) NOT NULL,
    "generalNotes" TEXT
);

-- ====================================================================
-- 8. HOLD REQUESTS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS hold_requests (
    id VARCHAR(64) PRIMARY KEY,
    "jobId" VARCHAR(64) NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
    reason VARCHAR(255) NOT NULL,
    notes TEXT NOT NULL,
    "estimatedDelayHours" DOUBLE PRECISION NOT NULL,
    "requestedAt" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(50) NOT NULL
);

-- ====================================================================
-- 9. INCENTIVE SCHEMES MASTER TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS incentive_schemes (
    id VARCHAR(64) PRIMARY KEY,
    scheme_code VARCHAR(100) UNIQUE NOT NULL,
    scheme_name VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    scheme_type VARCHAR(100) NOT NULL,
    participant_role VARCHAR(100) NOT NULL,
    calculation_basis VARCHAR(100) NOT NULL,
    age_basis VARCHAR(100) NOT NULL,
    payable_lag_months INT NOT NULL DEFAULT 1,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Draft',
    version VARCHAR(20) NOT NULL DEFAULT 'v1.0',
    description TEXT,
    exclusions JSONB,
    posting JSONB,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 10. SCHEME RULES TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS scheme_rules (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL REFERENCES incentive_schemes(id) ON DELETE CASCADE,
    rule VARCHAR(255) NOT NULL,
    parameter VARCHAR(100) NOT NULL,
    value VARCHAR(100) NOT NULL,
    source VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 11. SCHEME SLABS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS scheme_slabs (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL REFERENCES incentive_schemes(id) ON DELETE CASCADE,
    slab_id VARCHAR(50) NOT NULL,
    min_percent DOUBLE PRECISION NOT NULL,
    max_percent DOUBLE PRECISION NOT NULL,
    payout_percent DOUBLE PRECISION NOT NULL,
    multiplier DOUBLE PRECISION NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 12. SCHEME RATE ITEMS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS scheme_rate_items (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL REFERENCES incentive_schemes(id) ON DELETE CASCADE,
    category VARCHAR(100) NOT NULL,
    product_line VARCHAR(100) NOT NULL,
    commission_rate VARCHAR(100) NOT NULL,
    payment_term_band VARCHAR(100) NOT NULL,
    basis VARCHAR(100) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- ====================================================================
-- 13. SCHEME VERSIONS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS scheme_versions (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL REFERENCES incentive_schemes(id) ON DELETE CASCADE,
    version VARCHAR(20) NOT NULL,
    effective_from DATE NOT NULL,
    effective_to DATE NOT NULL,
    status VARCHAR(50) NOT NULL,
    created_by VARCHAR(255) NOT NULL,
    created_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    approved_by VARCHAR(255),
    approval_date TIMESTAMP WITH TIME ZONE,
    change_summary TEXT NOT NULL
);

-- ====================================================================
-- 14. SCHEME HISTORY LOGS TABLE
-- ====================================================================
CREATE TABLE IF NOT EXISTS scheme_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    scheme_id VARCHAR(64) NOT NULL REFERENCES incentive_schemes(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    "user" VARCHAR(255) NOT NULL,
    role VARCHAR(100) NOT NULL,
    action VARCHAR(100) NOT NULL,
    details TEXT NOT NULL
);

-- ====================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ====================================================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON jobs(status);
CREATE INDEX IF NOT EXISTS idx_schemes_code ON incentive_schemes(scheme_code);
CREATE INDEX IF NOT EXISTS idx_schemes_status ON incentive_schemes(status);
CREATE INDEX IF NOT EXISTS idx_schemes_division ON incentive_schemes(division);
CREATE INDEX IF NOT EXISTS idx_scheme_rules_scheme_id ON scheme_rules(scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_slabs_scheme_id ON scheme_slabs(scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_rates_scheme_id ON scheme_rate_items(scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_versions_scheme_id ON scheme_versions(scheme_id);
CREATE INDEX IF NOT EXISTS idx_scheme_history_scheme_id ON scheme_history_logs(scheme_id);

-- ====================================================================
-- SEED DATA: DEFAULT USERS
-- ====================================================================
INSERT INTO users (email, name, password, role, phone, "updatedAt")
VALUES 
  ('admin@telesonic.lk', 'Nimal Perera (Administrator)', '$2b$10$4IiLC4USA5AsATEaeDPe4upN43XboVpyBDYCzdOaSwQ6VDL2z3FtW', 'ADMIN', '+94 11 234 5678', CURRENT_TIMESTAMP),
  ('tech@telesonic.lk', 'Kamal Silva (Field Lead Technician)', '$2b$10$ZbuQOBuKsWKeKWOVluPq4ufvU.CLs14arJGhRAXpTfDpI8tlY9zrS', 'TECHNICIAN', '+94 77 123 4567', CURRENT_TIMESTAMP)
ON CONFLICT (email) DO NOTHING;

-- ====================================================================
-- SEED DATA: INCENTIVE SCHEMES
-- ====================================================================

-- 1. Retail Smartphone & Devices Sales Incentive (Active)
INSERT INTO incentive_schemes (
    id, scheme_code, scheme_name, division, scheme_type, participant_role,
    calculation_basis, age_basis, payable_lag_months, effective_from, effective_to,
    status, version, description, exclusions, posting
) VALUES (
    'sch-1',
    'SCH-SLS-2026',
    'Retail Smartphone & Devices Sales Incentive',
    'Mobile & Accessories',
    'Turnover Tier + Slabs',
    'Retail Sales Executive',
    'Billed Revenue (Excl. Tax)',
    'Invoice Date',
    1,
    '2026-01-01',
    '2026-12-31',
    'Active',
    'v2.1',
    'Primary incentive scheme for retail shop sales personnel based on monthly invoice turnover, subject to collection realization.',
    '{"customerGroups": ["Inter-company Branch Transfers", "Executive Staff Personal Orders", "Institutional Special Government Tenders"], "itemCategories": ["Free-of-Charge (FOC) Promotional Units", "Marketing Demonstration Samples", "Damaged / B-Stock Clearance"], "jobCodes": ["Internal Transfer Freight", "Warranty Replacement Delivery"], "clawbackWindowDays": 60}'::jsonb,
    '{"debitGlAccount": "621000", "debitGlName": "Sales Staff Incentive & Commission Expense", "creditGlAccount": "214050", "creditGlName": "Accrued Incentive Payable — Retail Mobile", "costCenter": "CC-MOB-RETAIL", "projectCode": "PRJ-SLS-2026", "postingDayOfMonth": 25, "journalRemarksTemplate": "INC/{Period}/SCH-SLS-2026/{EmpNo} - Retail Commission"}'::jsonb
) ON CONFLICT (scheme_code) DO NOTHING;

-- Rules for sch-1
INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source) VALUES
  ('r-1', 'sch-1', 'Minimum Turnover Achievement Floor', 'Min Target %', '80.00%', 'Monthly Target Entry'),
  ('r-2', 'sch-1', 'Debtor Overdue Penalty Clawback', 'Max Allowed Overdue', '60 Days', 'SAP AR Invoice Aging'),
  ('r-3', 'sch-1', 'Minimum Attendance Requirement', 'Min Present Days %', '90.00%', 'HR Bio-Metric Portal'),
  ('r-4', 'sch-1', 'Top Performer Accelerator Cap', 'Max Payout Limit', 'LKR 350,000', 'Executive Committee Policy'),
  ('r-5', 'sch-1', 'Payment Realization Compliance', 'Cash Collection Days', 'Within 45 Days', 'SAP Bank Reconciliation')
ON CONFLICT (id) DO NOTHING;

-- Slabs for sch-1
INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description) VALUES
  ('sl-1', 'sch-1', 'S-01', 0, 79.99, 0, 0.0, 'Below floor threshold - No incentive'),
  ('sl-2', 'sch-1', 'S-02', 80, 99.99, 75, 0.75, 'Baseline qualifier band'),
  ('sl-3', 'sch-1', 'S-03', 100, 119.99, 100, 1.0, 'Target achieved - Full payout'),
  ('sl-4', 'sch-1', 'S-04', 120, 139.99, 125, 1.25, 'High performance bonus tier'),
  ('sl-5', 'sch-1', 'S-05', 140, 200.0, 150, 1.5, 'Super-achiever capped bracket')
ON CONFLICT (id) DO NOTHING;

-- Rate items for sch-1
INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis) VALUES
  ('rt-1', 'sch-1', 'Smartphones', 'Flagship 5G Series', '2.50%', '0-30 Days', 'Net Billed Value'),
  ('rt-2', 'sch-1', 'Smartphones', 'Mid-tier A Series', '3.00%', '0-30 Days', 'Net Billed Value'),
  ('rt-3', 'sch-1', 'Accessories', 'Audio & Wearables', '5.00%', '0-45 Days', 'Gross Margin %'),
  ('rt-4', 'sch-1', 'Smartphones', 'Entry Level 4G', '1.75%', '0-30 Days', 'Net Billed Value')
ON CONFLICT (id) DO NOTHING;

-- Versions for sch-1
INSERT INTO scheme_versions (id, scheme_id, version, effective_from, effective_to, status, created_by, approved_by, change_summary) VALUES
  ('v-1', 'sch-1', 'v2.1', '2026-01-01', '2026-12-31', 'Active', 'S. Perera (Incentive Admin)', 'D. Fernando (Head of Finance)', 'Updated Audio & Wearables commission from 4.5% to 5.0% and adjusted floor threshold.'),
  ('v-2', 'sch-1', 'v2.0', '2025-06-01', '2025-12-31', 'Superseded', 'S. Perera (Incentive Admin)', 'P. Wickramasinghe (CEO)', 'Introduced 5-slab achievement curve and 60-day clawback window.')
ON CONFLICT (id) DO NOTHING;

-- History for sch-1
INSERT INTO scheme_history_logs (id, scheme_id, timestamp, "user", role, action, details) VALUES
  ('h-1', 'sch-1', '2026-01-01 09:00:00+00', 'System Daemon', 'ERP Automation', 'Version Activated', 'Version v2.1 marked Active upon reaching Effective Date 2026-01-01.'),
  ('h-2', 'sch-1', '2025-12-28 16:30:00+00', 'D. Fernando', 'Head of Finance', 'Scheme Approved', 'Approved with Finance Committee authorization Ref #FIN-2025-894.'),
  ('h-3', 'sch-1', '2025-12-15 11:20:00+00', 'S. Perera', 'Incentive Administrator', 'New Version Created', 'Copied from v2.0 to introduce modified accessory commission rates.')
ON CONFLICT (id) DO NOTHING;

-- 2. Field Service Technician First-Time-Fix Incentive (Active)
INSERT INTO incentive_schemes (
    id, scheme_code, scheme_name, division, scheme_type, participant_role,
    calculation_basis, age_basis, payable_lag_months, effective_from, effective_to,
    status, version, description, exclusions, posting
) VALUES (
    'sch-2',
    'SCH-SRV-2026',
    'Field Service Technician First-Time-Fix Incentive',
    'Consumer Electronics',
    'FTF Multiplier + Job Count',
    'Field Service Technician',
    'Job Completion Count',
    'Job Close Date',
    1,
    '2026-01-01',
    '2026-12-31',
    'Active',
    'v1.4',
    'Incentivizes field repair turnaround, first-time-fix rates (FTF > 92%), and zero repeat complaint within 30-day warranty.',
    '{"customerGroups": ["Internal Company Showroom Repairs", "Factory Warranty DOA Claims"], "itemCategories": ["Consumables (Tape, Screws, Solder)"], "jobCodes": ["JOB-INSPECTION-ONLY", "JOB-ESTIMATE-REJECTED"], "clawbackWindowDays": 30}'::jsonb,
    '{"debitGlAccount": "632000", "debitGlName": "Technician Field Service Incentive Expense", "creditGlAccount": "214060", "creditGlName": "Accrued Service Incentive Payable", "costCenter": "CC-SRV-CONSUMER", "projectCode": "PRJ-TECH-2026", "postingDayOfMonth": 28, "journalRemarksTemplate": "INC/{Period}/SCH-SRV-2026/{EmpNo} - FTF Technician Incentive"}'::jsonb
) ON CONFLICT (scheme_code) DO NOTHING;

-- Rules for sch-2
INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source) VALUES
  ('r-201', 'sch-2', 'Minimum First-Time-Fix (FTF) Rate', 'Min FTF %', '92.00%', 'Service Manager Evaluation'),
  ('r-202', 'sch-2', 'Repeat Service Call Penalty', '30-Day Re-work Deduction', 'LKR 1,500 / job', 'ITSM Ticket Ledger'),
  ('r-203', 'sch-2', 'Customer CSAT Score Multiplier', 'Min Average Rating', '4.50 / 5.0', 'Customer Feedback Module'),
  ('r-204', 'sch-2', 'Spare Parts Variance Allowance', 'Max Stock Discrepancy', '0.50%', 'SAP Warehouse Goods Issue')
ON CONFLICT (id) DO NOTHING;

-- Slabs for sch-2
INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description) VALUES
  ('sl-201', 'sch-2', 'S-11', 0, 84.99, 0, 0, 'FTF below 85% — disqualified'),
  ('sl-202', 'sch-2', 'S-12', 85, 91.99, 50, 0.5, 'FTF 85-91% — 50% incentive payout'),
  ('sl-203', 'sch-2', 'S-13', 92, 95.99, 100, 1.0, 'Standard FTF target benchmark'),
  ('sl-204', 'sch-2', 'S-14', 96, 100.0, 130, 1.3, 'Excellence rating FTF > 96%')
ON CONFLICT (id) DO NOTHING;

-- Rate items for sch-2
INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis) VALUES
  ('rt-201', 'sch-2', 'LED TV Repair', 'Panel Replacement', 'LKR 1,200 / job', 'N/A', 'Completed Job'),
  ('rt-202', 'sch-2', 'Refrigerator Repair', 'Inverter Compressor', 'LKR 1,800 / job', 'N/A', 'Completed Job'),
  ('rt-203', 'sch-2', 'Washing Machine', 'Motor & PCB Overhaul', 'LKR 1,400 / job', 'N/A', 'Completed Job'),
  ('rt-204', 'sch-2', 'Air Conditioner', 'Gas Charging & Service', 'LKR 1,600 / job', 'N/A', 'Completed Job')
ON CONFLICT (id) DO NOTHING;

-- Versions for sch-2
INSERT INTO scheme_versions (id, scheme_id, version, effective_from, effective_to, status, created_by, approved_by, change_summary) VALUES
  ('v-201', 'sch-2', 'v1.4', '2026-01-01', '2026-12-31', 'Active', 'S. Perera (Incentive Admin)', 'M. Jayawardena (Service Director)', 'Added CSAT 4.5 multiplier threshold and updated inverter compressor job bounty.')
ON CONFLICT (id) DO NOTHING;

-- History for sch-2
INSERT INTO scheme_history_logs (id, scheme_id, timestamp, "user", role, action, details) VALUES
  ('h-201', 'sch-2', '2026-01-01 09:00:00+00', 'System Daemon', 'ERP Automation', 'Version Activated', 'Version v1.4 activated on new fiscal calendar.')
ON CONFLICT (id) DO NOTHING;

-- 3. Tier-1 Authorised Dealer Quarterly Volume Rebate (Approved)
INSERT INTO incentive_schemes (
    id, scheme_code, scheme_name, division, scheme_type, participant_role,
    calculation_basis, age_basis, payable_lag_months, effective_from, effective_to,
    status, version, description, exclusions, posting
) VALUES (
    'sch-3',
    'SCH-DLR-2026',
    'Tier-1 Authorised Dealer Quarterly Volume Rebate',
    'Enterprise Solutions',
    'Volume Achievement Matrix',
    'Dealer Principal',
    'Collected Cash Amount',
    'Realization Date',
    2,
    '2026-04-01',
    '2026-06-30',
    'Approved',
    'v3.0',
    'Quarterly volume rebate for platinum and gold dealers, contingent on debtor aging realization under 45 days.',
    '{"customerGroups": ["Direct Government Tenders where dealer acted as agent only"], "itemCategories": ["Software Subscription Renewals (separate commission)"], "jobCodes": [], "clawbackWindowDays": 90}'::jsonb,
    '{"debitGlAccount": "612400", "debitGlName": "Dealer Rebate & Settlement Expense", "creditGlAccount": "212100", "creditGlName": "Trade Creditors — Dealer Commission Balance", "costCenter": "CC-ENT-DEALER", "projectCode": "PRJ-DLR-Q2-2026", "postingDayOfMonth": 15, "journalRemarksTemplate": "INC/{Period}/SCH-DLR-2026/{DealerCode} - Q2 Rebate"}'::jsonb
) ON CONFLICT (scheme_code) DO NOTHING;

-- Rules for sch-3
INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source) VALUES
  ('r-301', 'sch-3', 'Quarterly Minimum Volume Threshold', 'Min Volume Target', 'LKR 15,000,000', 'Dealer Contract Appendix B'),
  ('r-302', 'sch-3', 'Debtor Invoice Aging Window', 'Max Realization Lag', '45 Days', 'SAP AR Bank Payment Posting'),
  ('r-303', 'sch-3', 'Sell-Out Verification Requirement', 'Dealer Sell-Out Proof', '100% IMEI Scanned', 'Dealer Portal Sell-out Log')
ON CONFLICT (id) DO NOTHING;

-- Slabs for sch-3
INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description) VALUES
  ('sl-301', 'sch-3', 'S-21', 0, 89.99, 0, 0, 'Below quarterly threshold'),
  ('sl-302', 'sch-3', 'S-22', 90, 99.99, 80, 0.8, '90-100% Achievement rebate'),
  ('sl-303', 'sch-3', 'S-23', 100, 124.99, 100, 1.0, 'Target reached — 3.0% flat rebate'),
  ('sl-304', 'sch-3', 'S-24', 125, 200.0, 135, 1.35, 'Super tier dealer accelerator')
ON CONFLICT (id) DO NOTHING;

-- Rate items for sch-3
INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis) VALUES
  ('rt-301', 'sch-3', 'Enterprise Servers', 'Blade Server Series', '3.50%', '0-45 Days', 'Collected Cash'),
  ('rt-302', 'sch-3', 'Networking', 'Switch & Firewall Packages', '4.00%', '0-45 Days', 'Collected Cash')
ON CONFLICT (id) DO NOTHING;

-- Versions for sch-3
INSERT INTO scheme_versions (id, scheme_id, version, effective_from, effective_to, status, created_by, approved_by, change_summary) VALUES
  ('v-301', 'sch-3', 'v3.0', '2026-04-01', '2026-06-30', 'Approved', 'S. Perera (Incentive Admin)', 'P. Wickramasinghe (CEO)', 'Approved by CEO for Q2 rollout. Awaiting Finance activation.')
ON CONFLICT (id) DO NOTHING;

-- History for sch-3
INSERT INTO scheme_history_logs (id, scheme_id, timestamp, "user", role, action, details) VALUES
  ('h-301', 'sch-3', '2026-03-24 15:45:00+00', 'P. Wickramasinghe', 'Chief Executive Officer', 'CEO Approval Granted', 'Authorized scheme terms for Q2 dealer volume agreements Ref #CEO-2026-112.'),
  ('h-302', 'sch-3', '2026-03-10 10:15:00+00', 'S. Perera', 'Incentive Administrator', 'Draft Submitted for Approval', 'Submitted draft v3.0 to Finance & CEO for Q2 launch.')
ON CONFLICT (id) DO NOTHING;

-- 4. Showroom Promoter Fast Sell-Out Bounty (Draft)
INSERT INTO incentive_schemes (
    id, scheme_code, scheme_name, division, scheme_type, participant_role,
    calculation_basis, age_basis, payable_lag_months, effective_from, effective_to,
    status, version, description, exclusions, posting
) VALUES (
    'sch-4',
    'SCH-PRM-2026',
    'Showroom Promoter Fast Sell-Out Bounty',
    'Mobile & Accessories',
    'Flat Bounty Per Unit',
    'Showroom Promoter',
    'Sell-Out Unit Count',
    'Invoice Date',
    1,
    '2026-05-01',
    '2026-05-31',
    'Draft',
    'v1.0',
    'Special seasonal promotion incentive for in-store brand promoters selling high-margin flagship phone SKUs.',
    '{"customerGroups": ["Wholesale bulk buyers (>3 units)"], "itemCategories": ["Accessories"], "jobCodes": [], "clawbackWindowDays": 14}'::jsonb,
    '{"debitGlAccount": "621080", "debitGlName": "Promoter Seasonal Bounty Expense", "creditGlAccount": "214050", "creditGlName": "Accrued Incentive Payable — Promoters", "costCenter": "CC-MOB-PROMOTER", "projectCode": "PRJ-PRM-MAY-2026", "postingDayOfMonth": 20, "journalRemarksTemplate": "INC/{Period}/SCH-PRM-2026/{EmpNo} - Promoter Bounty"}'::jsonb
) ON CONFLICT (scheme_code) DO NOTHING;

-- Rules for sch-4
INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source) VALUES
  ('r-401', 'sch-4', 'IMEI Customer Registration Verification', 'Warranty Activation %', '100.00%', 'Promoter App Warranty Scan'),
  ('r-402', 'sch-4', 'Minimum Monthly Sold Units Qualifier', 'Min Flagship Units', '15 Units', 'Promoter Sell-out Matrix')
ON CONFLICT (id) DO NOTHING;

-- Slabs for sch-4
INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description) VALUES
  ('sl-401', 'sch-4', 'S-31', 0, 99.99, 0, 0, 'Under 15 units — standard pay only'),
  ('sl-402', 'sch-4', 'S-32', 100, 149.99, 100, 1.0, '15-25 units — LKR 1,500/unit'),
  ('sl-403', 'sch-4', 'S-33', 150, 200.0, 140, 1.4, '>25 units — LKR 2,100/unit accelerator')
ON CONFLICT (id) DO NOTHING;

-- Rate items for sch-4
INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis) VALUES
  ('rt-401', 'sch-4', 'Flagship 5G', 'Titanium Pro 256GB', 'LKR 1,500 / unit', 'N/A', 'Verified Sell-out'),
  ('rt-402', 'sch-4', 'Flagship 5G', 'Ultra Fold 512GB', 'LKR 2,500 / unit', 'N/A', 'Verified Sell-out')
ON CONFLICT (id) DO NOTHING;

-- Versions for sch-4
INSERT INTO scheme_versions (id, scheme_id, version, effective_from, effective_to, status, created_by, change_summary) VALUES
  ('v-401', 'sch-4', 'v1.0', '2026-05-01', '2026-05-31', 'Draft', 'S. Perera (Incentive Admin)', 'Initial draft configured for May 2026 promotional campaign.')
ON CONFLICT (id) DO NOTHING;

-- History for sch-4
INSERT INTO scheme_history_logs (id, scheme_id, timestamp, "user", role, action, details) VALUES
  ('h-401', 'sch-4', '2026-04-02 14:10:00+00', 'S. Perera', 'Incentive Administrator', 'Draft Scheme Initialized', 'Created draft v1.0 for May seasonal sales campaign.')
ON CONFLICT (id) DO NOTHING;

-- 5. Accessories Inventory Clearance Drive (Inactive)
INSERT INTO incentive_schemes (
    id, scheme_code, scheme_name, division, scheme_type, participant_role,
    calculation_basis, age_basis, payable_lag_months, effective_from, effective_to,
    status, version, description, exclusions, posting
) VALUES (
    'sch-5',
    'SCH-ACC-2025',
    'Accessories Inventory Clearance Drive (Archived)',
    'Mobile & Accessories',
    'Gross Margin %',
    'Retail Sales Executive',
    'Gross Margin',
    'Invoice Date',
    1,
    '2025-10-01',
    '2025-12-31',
    'Inactive',
    'v1.2',
    'Historical scheme for 2025 year-end accessories clearance. Superseded and marked inactive.',
    '{"customerGroups": ["Inter-company transfers"], "itemCategories": [], "jobCodes": [], "clawbackWindowDays": 30}'::jsonb,
    '{"debitGlAccount": "621000", "debitGlName": "Sales Staff Incentive Expense", "creditGlAccount": "214050", "creditGlName": "Accrued Incentive Payable", "costCenter": "CC-MOB-ACC", "projectCode": "PRJ-ACC-2025", "postingDayOfMonth": 25, "journalRemarksTemplate": "INC/{Period}/SCH-ACC-2025/{EmpNo}"}'::jsonb
) ON CONFLICT (scheme_code) DO NOTHING;

-- Rules for sch-5
INSERT INTO scheme_rules (id, scheme_id, rule, parameter, value, source) VALUES
  ('r-501', 'sch-5', 'Minimum Gross Margin Floor', 'Min GM %', '22.00%', 'SAP Sales Analysis')
ON CONFLICT (id) DO NOTHING;

-- Slabs for sch-5
INSERT INTO scheme_slabs (id, scheme_id, slab_id, min_percent, max_percent, payout_percent, multiplier, description) VALUES
  ('sl-501', 'sch-5', 'S-41', 100, 200.0, 100, 1.0, 'Full payout upon achieving clearance target')
ON CONFLICT (id) DO NOTHING;

-- Rate items for sch-5
INSERT INTO scheme_rate_items (id, scheme_id, category, product_line, commission_rate, payment_term_band, basis) VALUES
  ('rt-501', 'sch-5', 'Accessories', 'Power Banks & Cables', '6.00%', '0-30 Days', 'Gross Margin')
ON CONFLICT (id) DO NOTHING;

-- Versions for sch-5
INSERT INTO scheme_versions (id, scheme_id, version, effective_from, effective_to, status, created_by, approved_by, change_summary) VALUES
  ('v-501', 'sch-5', 'v1.2', '2025-10-01', '2025-12-31', 'Inactive', 'S. Perera (Incentive Admin)', 'D. Fernando', 'Completed and expired on 31-Dec-2025. Marked Inactive.')
ON CONFLICT (id) DO NOTHING;

-- History for sch-5
INSERT INTO scheme_history_logs (id, scheme_id, timestamp, "user", role, action, details) VALUES
  ('h-501', 'sch-5', '2026-01-01 00:00:00+00', 'System Daemon', 'ERP Automation', 'Status Changed to Inactive', 'Scheme validity expired. Closed and deactivated.')
ON CONFLICT (id) DO NOTHING;

-- Completion note
SELECT 'Telesonic Service Manager Database initialized and seeded successfully.' AS initialization_status;

-- ====================================================================
-- 9. COMMISSION RATE MATRICES
-- ====================================================================
CREATE TABLE IF NOT EXISTS commission_rate_matrices (
    id VARCHAR(64) PRIMARY KEY,
    scheme_code VARCHAR(64) NOT NULL,
    matrix_name VARCHAR(255) NOT NULL,
    version VARCHAR(32) NOT NULL DEFAULT 'v1.0',
    row_dimension VARCHAR(128) NOT NULL DEFAULT 'Capacity Band + Item Type',
    column_dimension VARCHAR(128) NOT NULL DEFAULT 'Payment-term / Credit-age Bands',
    rate_unit VARCHAR(64) NOT NULL DEFAULT '% of Net Invoiced Value',
    currency VARCHAR(32) NOT NULL DEFAULT 'USD ($)',
    status VARCHAR(32) NOT NULL DEFAULT 'Draft',
    description TEXT,
    created_by VARCHAR(128) NOT NULL DEFAULT 'Incentive Administrator',
    approved_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_rate_matrices_scheme ON commission_rate_matrices(scheme_code);

-- ====================================================================
-- 10. MATRIX CREDIT BANDS
-- ====================================================================
CREATE TABLE IF NOT EXISTS matrix_credit_bands (
    id VARCHAR(64) PRIMARY KEY,
    matrix_id VARCHAR(64) NOT NULL REFERENCES commission_rate_matrices(id) ON DELETE CASCADE,
    name VARCHAR(128) NOT NULL,
    column_key VARCHAR(64) NOT NULL,
    min_days INT NOT NULL DEFAULT 0,
    max_days INT NOT NULL DEFAULT 0,
    description TEXT,
    default_factor NUMERIC(6, 4) DEFAULT 1.0000,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matrix_bands_matrix ON matrix_credit_bands(matrix_id);

-- ====================================================================
-- 11. MATRIX CELLS (RATE GRID)
-- ====================================================================
CREATE TABLE IF NOT EXISTS matrix_cells (
    id VARCHAR(64) PRIMARY KEY,
    matrix_id VARCHAR(64) NOT NULL REFERENCES commission_rate_matrices(id) ON DELETE CASCADE,
    capacity_band VARCHAR(128) NOT NULL,
    item_type VARCHAR(128) NOT NULL,
    cash_immediate NUMERIC(8, 4),
    credit_lt15 NUMERIC(8, 4),
    credit_lt30 NUMERIC(8, 4),
    credit_lte45 NUMERIC(8, 4),
    credit_gt45 NUMERIC(8, 4),
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_matrix_cells_matrix ON matrix_cells(matrix_id);

-- ====================================================================
-- 12. MATRIX HISTORY LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS matrix_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    matrix_id VARCHAR(64) NOT NULL REFERENCES commission_rate_matrices(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    change_summary TEXT NOT NULL,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_matrix_history_matrix ON matrix_history_logs(matrix_id);

-- ====================================================================
-- SEED DATA: COMMISSION RATE MATRIX (v3.2 Draft for Commercial Solar)
-- ====================================================================
INSERT INTO commission_rate_matrices (
    id, scheme_code, matrix_name, version, row_dimension, column_dimension, rate_unit, currency, status, description, created_by
) VALUES (
    'mat-solar-q4',
    'SCH-2025-SOLAR-01',
    'Commercial Solar Inverter & ESS Matrix',
    'v3.2',
    'Capacity Band + Item Type',
    'Payment-term / Credit-age Bands',
    '% of Net Invoiced Value',
    'USD ($)',
    'Draft',
    'Standard commission rate matrix for Commercial Solar Inverters and Storage Modules.',
    'Ayesha Asarak'
) ON CONFLICT (id) DO NOTHING;

-- Seed Credit Bands
INSERT INTO matrix_credit_bands (id, matrix_id, name, column_key, min_days, max_days, description, default_factor, sort_order) VALUES
  ('b-cash', 'mat-solar-q4', 'Cash / Immediate Cheque', 'cashImmediate', 0, 0, 'Paid immediately upon delivery or within 0 business days.', 1.0000, 1),
  ('b-lt15', 'mat-solar-q4', 'Credit < 15 days', 'creditLt15', 1, 14, 'Invoiced payment settled between day 1 and 14 from dispatch.', 0.9500, 2),
  ('b-lt30', 'mat-solar-q4', 'Credit < 30 days', 'creditLt30', 15, 29, 'Standard net commercial terms (settlement between day 15 and 29).', 0.8500, 3),
  ('b-lte45', 'mat-solar-q4', 'Credit ≤ 45 days', 'creditLte45', 30, 45, 'Extended customer credit band; settled between 30 and 45 days.', 0.7000, 4),
  ('b-gt45', 'mat-solar-q4', 'Credit > 45 days', 'creditGt45', 46, 999, 'Overdue tier beyond 45 days; eligible for degraded rate or clawback.', 0.3500, 5)
ON CONFLICT (id) DO NOTHING;

-- Seed Matrix Cells
INSERT INTO matrix_cells (id, matrix_id, capacity_band, item_type, cash_immediate, credit_lt15, credit_lt30, credit_lte45, credit_gt45, sort_order) VALUES
  ('mc-01', 'mat-solar-q4', '< 5 kW', 'String Inverter', 3.5000, 3.2000, 2.7500, 2.0000, 0.7500, 1),
  ('mc-02', 'mat-solar-q4', '< 5 kW', 'Microinverter', 4.0000, 3.7500, 3.2500, 2.5000, 1.0000, 2),
  ('mc-03', 'mat-solar-q4', '5 - 10 kW', 'String Inverter', 3.7500, 3.4000, 2.9000, 2.1000, 0.8000, 3),
  ('mc-04', 'mat-solar-q4', '5 - 10 kW', 'Hybrid ESS Inverter', 4.2500, 4.0000, 3.5000, 2.7500, 1.2500, 4),
  ('mc-05', 'mat-solar-q4', '10 - 20 kW', 'String Inverter', 4.0000, 3.6000, 3.0000, 2.2000, 0.9000, 5),
  ('mc-06', 'mat-solar-q4', '10 - 20 kW', 'Hybrid ESS Inverter', 4.5000, 4.2000, 3.7000, 3.0000, 1.5000, 6),
  ('mc-07', 'mat-solar-q4', '20 - 50 kW', 'Commercial Hybrid', 4.8000, 4.5000, 3.9000, 3.1000, 1.6000, 7),
  ('mc-08', 'mat-solar-q4', '20 - 50 kW', 'Lithium Battery Module', 3.2000, 3.0000, 2.5000, 1.8000, 0.5000, 8),
  ('mc-09', 'mat-solar-q4', '50 - 100 kW', 'Commercial Hybrid', 5.0000, 4.7000, 4.1000, 3.3000, 1.7500, 9),
  ('mc-10', 'mat-solar-q4', '50 - 100 kW', 'Central Inverter', 4.5000, 4.1000, 3.6000, 2.8000, 1.2000, 10),
  ('mc-11', 'mat-solar-q4', '> 100 kW', 'Central Inverter', 5.5000, 5.1000, 4.5000, 3.6000, 2.0000, 11),
  ('mc-12', 'mat-solar-q4', '> 100 kW', 'High-Voltage ESS Block', 4.0000, 3.7500, 3.2000, 2.4000, 0.0000, 12)
ON CONFLICT (id) DO NOTHING;

-- Seed History Logs
INSERT INTO matrix_history_logs (id, matrix_id, version, status, timestamp, author, role, change_summary, details) VALUES
  ('mhl-04', 'mat-solar-q4', 'v3.2', 'Draft', '2026-10-13 18:45:12+00', 'Ayesha Asarak', 'Incentive Administrator', 'Initiated v3.2 Draft for Q4 2026 solar equipment lines', 'Adjusted commercial storage capacity bands and updated Credit > 45 days retention policy. Zero allowed on HV ESS Block.'),
  ('mhl-03', 'mat-solar-q4', 'v3.1', 'Approved', '2026-07-01 09:15:00+00', 'Marcus Wong', 'Finance Director', 'Approved Q3 2026 Commission Rate Matrix', 'All 12 matrix band intersections certified. No band overlaps detected across payment terms.'),
  ('mhl-02', 'mat-solar-q4', 'v3.0', 'Approved', '2026-04-02 11:30:20+00', 'Marcus Wong', 'Finance Director', 'Promoted draft to approved state after executive committee signoff', 'Aligned product types with updated SAP Business One Item Group classifications.'),
  ('mhl-01', 'mat-solar-q4', 'v2.4', 'Approved', '2026-01-10 14:22:00+00', 'David Chen', 'Commercial Operations Lead', 'Initial 2026 baseline commission matrix established', 'Imported baseline rates via Excel for 5 kW - 100 kW capacity ranges.')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 13. TARGET INCENTIVE SLAB TABLES
-- ====================================================================
CREATE TABLE IF NOT EXISTS target_incentive_slab_tables (
    id VARCHAR(64) PRIMARY KEY,
    scheme_code VARCHAR(64) NOT NULL,
    table_name VARCHAR(255) NOT NULL,
    target_type VARCHAR(128) NOT NULL DEFAULT 'Turnover Target',
    slab_method VARCHAR(128) NOT NULL DEFAULT 'Highest Slab Reached (Non-Cumulative)',
    version VARCHAR(32) NOT NULL DEFAULT 'v1.0',
    status VARCHAR(32) NOT NULL DEFAULT 'Approved',
    description TEXT,
    created_by VARCHAR(128) NOT NULL DEFAULT 'Incentive Administrator',
    approved_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slab_tables_scheme ON target_incentive_slab_tables(scheme_code);

-- ====================================================================
-- 14. SLAB TIERS
-- ====================================================================
CREATE TABLE IF NOT EXISTS slab_tiers (
    id VARCHAR(64) PRIMARY KEY,
    table_id VARCHAR(64) NOT NULL REFERENCES target_incentive_slab_tables(id) ON DELETE CASCADE,
    slab_tier_name VARCHAR(128) NOT NULL,
    min_achievement_percent NUMERIC(8, 2) NOT NULL DEFAULT 0.00,
    volume_incentive_lkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    turnover_incentive_lkr NUMERIC(12, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_slab_tiers_table ON slab_tiers(table_id);

-- ====================================================================
-- 15. SLAB TABLE HISTORY LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS slab_table_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    table_id VARCHAR(64) NOT NULL REFERENCES target_incentive_slab_tables(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    change_summary TEXT NOT NULL,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_slab_history_table ON slab_table_history_logs(table_id);

-- ====================================================================
-- SEED DATA: TARGET INCENTIVE SLAB TABLE (SCH-SLS-2026 v2.1 Approved)
-- ====================================================================
INSERT INTO target_incentive_slab_tables (
    id, scheme_code, table_name, target_type, slab_method, version, status, description, created_by, approved_by
) VALUES (
    'slt-sls-2026',
    'SCH-SLS-2026',
    'Retail Smartphone & Devices Sales Target Slabs',
    'Turnover Target',
    'Highest Slab Reached (Non-Cumulative)',
    'v2.1',
    'Approved',
    'Standard tiered slab structure with non-cumulative payout logic for retail smartphone sales.',
    'S. Perera',
    'D. Fernando'
) ON CONFLICT (id) DO NOTHING;

-- Seed Tiers for SCH-SLS-2026
INSERT INTO slab_tiers (id, table_id, slab_tier_name, min_achievement_percent, volume_incentive_lkr, turnover_incentive_lkr, notes, sort_order) VALUES
  ('slb-01', 'slt-sls-2026', 'Floor / Minimum Entry', 80.00, 15000.00, 25000.00, 'Baseline qualifying threshold; minimum required for any incentive payout.', 1),
  ('slb-02', 'slt-sls-2026', 'Intermediate Tier', 90.00, 25000.00, 45000.00, 'Satisfactory achievement tier prior to 100% quota benchmark.', 2),
  ('slb-03', 'slt-sls-2026', 'Target Parity Benchmark', 100.00, 40000.00, 75000.00, 'Full quota fulfillment benchmark. Standard scheduled payout.', 3),
  ('slb-04', 'slt-sls-2026', 'High Performer Band', 110.00, 60000.00, 110000.00, 'Above target accelerator; awarded as single non-cumulative amount.', 4),
  ('slb-05', 'slt-sls-2026', 'Excellence Accelerator', 125.00, 85000.00, 150000.00, 'Premier bracket for top quartile territory executives.', 5),
  ('slb-06', 'slt-sls-2026', 'Super Achiever Ceiling', 150.00, 120000.00, 220000.00, 'Maximum capped payout slab for extraordinary over-quota performance.', 6)
ON CONFLICT (id) DO NOTHING;

-- Seed History Logs for SCH-SLS-2026
INSERT INTO slab_table_history_logs (id, table_id, version, status, timestamp, author, role, change_summary, details) VALUES
  ('hist-slb-04', 'slt-sls-2026', 'v2.2', 'Draft', '2026-10-13 19:15:30+00', 'S. Perera', 'Incentive Administrator', 'Initiated v2.2 draft for Q4 slab optimization', 'Adjusted 125% and 150% turnover incentive values to reflect updated FY2026 revenue growth targets. Non-cumulative rule preserved.'),
  ('hist-slb-03', 'slt-sls-2026', 'v2.1', 'Approved', '2026-07-01 10:45:00+00', 'D. Fernando', 'Head of Finance', 'Approved Q3 slab table revision', 'Ratified 6 achievement tiers. Certified that slabs operate on highest-slab-reached payout logic.'),
  ('hist-slb-02', 'slt-sls-2026', 'v2.0', 'Approved', '2026-03-28 14:20:10+00', 'P. Wickramasinghe', 'Chief Executive Officer', 'Executive sign-off for mid-year incentive scaling', 'Added 150% Super Achiever tier with LKR 120,000 volume and LKR 220,000 turnover payout.'),
  ('hist-slb-01', 'slt-sls-2026', 'v1.0', 'Approved', '2026-01-02 09:00:00+00', 'S. Perera', 'Incentive Administrator', 'Initial baseline slab table established', 'Baseline 4-tier slab structure mapped directly from SAP Business One budget matrix.')
ON CONFLICT (id) DO NOTHING;

-- Seed Second Slab Table for Field Service (SCH-SRV-2026)
INSERT INTO target_incentive_slab_tables (
    id, scheme_code, table_name, target_type, slab_method, version, status, description, created_by, approved_by
) VALUES (
    'slt-srv-2026',
    'SCH-SRV-2026',
    'Field Service Technician First-Time-Fix Incentive Slabs',
    'Turnover Target',
    'Highest Slab Reached (Non-Cumulative)',
    'v1.0',
    'Approved',
    'FTF achievement threshold tiers for consumer electronics field service staff.',
    'A. Silva',
    'D. Fernando'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO slab_tiers (id, table_id, slab_tier_name, min_achievement_percent, volume_incentive_lkr, turnover_incentive_lkr, notes, sort_order) VALUES
  ('slb-srv-01', 'slt-srv-2026', 'FTF Standard Floor', 85.00, 12000.00, 18000.00, 'Technician qualifying repair threshold.', 1),
  ('slb-srv-02', 'slt-srv-2026', 'FTF Benchmark', 92.00, 28000.00, 42000.00, 'Contractual SLA baseline attainment.', 2),
  ('slb-srv-03', 'slt-srv-2026', 'FTF Excellence', 96.00, 50000.00, 75000.00, 'Master technician zero-rework tier.', 3)
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 16. MONTHLY TARGET BATCHES
-- ====================================================================
CREATE TABLE IF NOT EXISTS monthly_target_batches (
    id VARCHAR(64) PRIMARY KEY,
    period VARCHAR(64) NOT NULL,
    scheme_code VARCHAR(64) NOT NULL,
    division VARCHAR(100) NOT NULL DEFAULT 'All Divisions',
    target_type VARCHAR(100) NOT NULL DEFAULT 'Turnover Target (LKR)',
    version VARCHAR(32) NOT NULL DEFAULT 'v1.0 Draft',
    currency VARCHAR(16) NOT NULL DEFAULT 'LKR',
    status VARCHAR(32) NOT NULL DEFAULT 'Draft',
    is_locked BOOLEAN NOT NULL DEFAULT FALSE,
    description TEXT,
    created_by VARCHAR(128) NOT NULL DEFAULT 'Incentive Administrator',
    approved_by VARCHAR(128),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_monthly_targets_period ON monthly_target_batches(period);
CREATE INDEX IF NOT EXISTS idx_monthly_targets_scheme ON monthly_target_batches(scheme_code);

-- ====================================================================
-- 17. MONTHLY TARGET ENTRIES
-- ====================================================================
CREATE TABLE IF NOT EXISTS monthly_target_entries (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES monthly_target_batches(id) ON DELETE CASCADE,
    participant_id VARCHAR(64) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    territory VARCHAR(150) NOT NULL,
    scheme_code VARCHAR(64) NOT NULL,
    base_target_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    stretch_target_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    mtd_actual_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    sort_order INT DEFAULT 0,
    last_updated VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_target_entries_batch ON monthly_target_entries(batch_id);
CREATE INDEX IF NOT EXISTS idx_target_entries_participant ON monthly_target_entries(participant_id);

-- ====================================================================
-- 18. MONTHLY TARGET HISTORY LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS monthly_target_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES monthly_target_batches(id) ON DELETE CASCADE,
    version VARCHAR(32) NOT NULL,
    status VARCHAR(32) NOT NULL,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    change_summary TEXT NOT NULL,
    details TEXT
);

CREATE INDEX IF NOT EXISTS idx_target_history_batch ON monthly_target_history_logs(batch_id);

-- ====================================================================
-- SEED DATA: MONTHLY TARGET BATCHES & ENTRIES
-- ====================================================================
-- May 2026 Batch
INSERT INTO monthly_target_batches (
    id, period, scheme_code, division, target_type, version, currency, status, is_locked, description, created_by, approved_by
) VALUES (
    'mtb-2026-05',
    'May 2026 (Current)',
    'SCH-SLS-2026',
    'All Divisions',
    'Turnover Target (LKR)',
    'v1.2 Draft',
    'LKR',
    'Draft',
    FALSE,
    'May 2026 Monthly Target Allocations for Retail Sales, Field Service, and Enterprise teams.',
    'Lakmal Perera',
    NULL
) ON CONFLICT (id) DO NOTHING;

-- Seed Entries for May 2026
INSERT INTO monthly_target_entries (
    id, batch_id, participant_id, employee_name, role, division, territory, scheme_code,
    base_target_lkr, stretch_target_lkr, mtd_actual_lkr, notes, sort_order, last_updated
) VALUES
  ('TGT-202605-001', 'mtb-2026-05', 'EMP-1021', 'Nimal Perera', 'Senior Service Engineer', 'Consumer Electronics', 'Western Province - Colombo Metro', 'SCH-SRV-2026', 2500000, 3200000, 2680000, 'Met base threshold on 18th May; on track for stretch tier.', 1, '2026-05-18 14:30'),
  ('TGT-202605-002', 'mtb-2026-05', 'EMP-1045', 'Kasun Jayasuriya', 'Enterprise Key Account Manager', 'Enterprise Solutions', 'Southern & Central Hub', 'SCH-DLR-2026', 4000000, 5000000, 4680000, 'Large commercial institutional contract invoiced in SAP B1.', 2, '2026-05-17 11:20'),
  ('TGT-202605-003', 'mtb-2026-05', 'EMP-1088', 'Dilshan Silva', 'Field Support Specialist', 'Consumer Electronics', 'Western Province - Gampaha', 'SCH-SRV-2026', 1800000, 2200000, 1656000, '92% achieved; 3 service jobs pending customer signoff.', 3, '2026-05-18 09:15'),
  ('TGT-202605-004', 'mtb-2026-05', 'EMP-1092', 'Tharindu Fernando', 'Channel Account Executive', 'Mobile & Accessories', 'North Western & Sabaragamuwa', 'SCH-SLS-2026', 3200000, 4000000, 2496000, 'Mid-month dealer restocking order pending credit approval.', 4, '2026-05-16 16:40'),
  ('TGT-202605-005', 'mtb-2026-05', 'EMP-1104', 'Anura Wickramasinghe', 'Retail Sales Executive', 'Mobile & Accessories', 'Colombo Flagship Showroom', 'SCH-SLS-2026', 2800000, 3500000, 3150000, 'Exceeded base target (112.5%); qualified for Tier-2 bonus.', 5, '2026-05-18 10:05'),
  ('TGT-202605-006', 'mtb-2026-05', 'EMP-1115', 'Saman Kumara', 'Solar Solutions Specialist', 'Renewable Energy', 'Islandwide Commercial Projects', 'SCH-SOLAR-2026', 6500000, 8500000, 7200000, 'Factory rooftop hybrid installation commission confirmed.', 6, '2026-05-15 15:55'),
  ('TGT-202605-007', 'mtb-2026-05', 'EMP-1128', 'Chamara Bandara', 'Showroom Promoter', 'Mobile & Accessories', 'Kandy City Center Showroom', 'SCH-PRM-2026', 1200000, 1600000, 980000, 'Weekend promotional push planned for month-end close.', 7, '2026-05-17 17:10'),
  ('TGT-202605-008', 'mtb-2026-05', 'EMP-1142', 'Pradeep Mendis', 'Senior Technician - HVAC', 'Consumer Electronics', 'Southern Province - Galle Hub', 'SCH-SRV-2026', 2200000, 2800000, 2050000, '93.2% completed; warranty maintenance jobs logged.', 8, '2026-05-18 13:45')
ON CONFLICT (id) DO NOTHING;

-- Seed History Logs for May 2026
INSERT INTO monthly_target_history_logs (id, batch_id, version, status, timestamp, author, role, change_summary, details) VALUES
  ('REV-202605-03', 'mtb-2026-05', 'v1.2', 'Draft', '2026-05-18 10:15:00+00', 'Lakmal Perera', 'Incentive Administrator', 'Updated stretch target quota for Consumer Electronics team', 'Adjusted Nimal Perera & Dilshan Silva stretch targets based on mid-month territory reallocation.'),
  ('REV-202605-02', 'mtb-2026-05', 'v1.1', 'Draft', '2026-05-02 09:30:00+00', 'Lakmal Perera', 'Incentive Administrator', 'Bulk Excel upload of initial May 2026 quotas', 'Imported 8 participant targets from Sales Operations Master Allocation sheet.'),
  ('REV-202605-01', 'mtb-2026-05', 'v1.0', 'Draft', '2026-04-28 16:45:00+00', 'Sunil Jayawardena', 'Head of Sales Operations', 'Initialized May 2026 target period cycle', 'Base target templates cloned from April baseline with +5% growth index.')
ON CONFLICT (id) DO NOTHING;

-- April 2026 Batch (Closed / Locked)
INSERT INTO monthly_target_batches (
    id, period, scheme_code, division, target_type, version, currency, status, is_locked, description, created_by, approved_by
) VALUES (
    'mtb-2026-04',
    'April 2026 (Closed)',
    'SCH-SLS-2026',
    'All Divisions',
    'Turnover Target (LKR)',
    'v1.0',
    'LKR',
    'Locked',
    TRUE,
    'April 2026 Monthly Target Allocations (Finalized and Reconciled).',
    'Lakmal Perera',
    'D. Fernando'
) ON CONFLICT (id) DO NOTHING;

INSERT INTO monthly_target_entries (
    id, batch_id, participant_id, employee_name, role, division, territory, scheme_code,
    base_target_lkr, stretch_target_lkr, mtd_actual_lkr, notes, sort_order, last_updated
) VALUES
  ('TGT-202604-001', 'mtb-2026-04', 'EMP-1021', 'Nimal Perera', 'Senior Service Engineer', 'Consumer Electronics', 'Western Province - Colombo Metro', 'SCH-SRV-2026', 2400000, 3000000, 2880000, 'Final approved actuals. Paid in April payroll.', 1, '2026-04-30 18:00'),
  ('TGT-202604-002', 'mtb-2026-04', 'EMP-1045', 'Kasun Jayasuriya', 'Enterprise Key Account Manager', 'Enterprise Solutions', 'Southern & Central Hub', 'SCH-DLR-2026', 3800000, 4800000, 4560000, '120% achievement tier paid.', 2, '2026-04-30 18:00')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 19. INCENTIVE PARTICIPANTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS incentive_participants (
    id VARCHAR(64) PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    sales_employee_code VARCHAR(64),
    division VARCHAR(100) NOT NULL,
    segment_channel VARCHAR(150),
    area_manager VARCHAR(150),
    designation VARCHAR(100) NOT NULL,
    payroll_id VARCHAR(64) NOT NULL,
    active BOOLEAN NOT NULL DEFAULT TRUE,
    phone VARCHAR(50),
    email VARCHAR(150),
    join_date VARCHAR(64),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_participants_division ON incentive_participants(division);
CREATE INDEX IF NOT EXISTS idx_participants_sales_code ON incentive_participants(sales_employee_code);
CREATE INDEX IF NOT EXISTS idx_participants_payroll ON incentive_participants(payroll_id);

-- ====================================================================
-- 20. PARTICIPANT SCHEME ASSIGNMENTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS participant_scheme_assignments (
    id VARCHAR(64) PRIMARY KEY,
    participant_id VARCHAR(64) NOT NULL REFERENCES incentive_participants(id) ON DELETE CASCADE,
    scheme_code VARCHAR(64) NOT NULL,
    scheme_name VARCHAR(255),
    calculation_role VARCHAR(100) NOT NULL,
    is_primary_role BOOLEAN NOT NULL DEFAULT TRUE,
    effective_from DATE NOT NULL,
    effective_to DATE,
    target_allocation_percent NUMERIC(5, 2) NOT NULL DEFAULT 100.00,
    status VARCHAR(32) NOT NULL DEFAULT 'Active',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_assignments_participant ON participant_scheme_assignments(participant_id);
CREATE INDEX IF NOT EXISTS idx_assignments_scheme ON participant_scheme_assignments(scheme_code);

-- ====================================================================
-- 21. PARTICIPANT HISTORY LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS participant_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    participant_id VARCHAR(64) NOT NULL REFERENCES incentive_participants(id) ON DELETE CASCADE,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    author VARCHAR(128) NOT NULL,
    role VARCHAR(128) NOT NULL,
    event_type VARCHAR(64) NOT NULL,
    scheme_code VARCHAR(64),
    previous_value TEXT,
    new_value TEXT,
    change_reason TEXT
);

CREATE INDEX IF NOT EXISTS idx_participant_history ON participant_history_logs(participant_id);

-- ====================================================================
-- SEED DATA: INCENTIVE PARTICIPANTS & ASSIGNMENTS
-- ====================================================================
INSERT INTO incentive_participants (
    id, name, sales_employee_code, division, segment_channel, area_manager, designation, payroll_id, active, phone, email, join_date
) VALUES
  ('EMP-1021', 'Nimal Perera', 'SL-204', 'Consumer Electronics', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Senior Service Engineer', 'PAY-88342', TRUE, '+94 77 123 4567', 'nimal.p@telesonic.lk', '15-Mar-2021'),
  ('EMP-1022', 'Kasun Jayasuriya', 'SL-108', 'Enterprise Solutions', 'Corporate Key Accounts & B2B', 'Harsha Jayawardena (Enterprise Key Accounts)', 'Key Account Manager', 'PAY-88410', TRUE, '+94 71 882 3311', 'kasun.j@telesonic.lk', '01-Aug-2020'),
  ('EMP-1023', 'Dilshan Silva', 'SL-312', 'Consumer Electronics', 'Field Engineering & Repairs', 'Chathura Wijesinghe (Central & Hills)', 'Field Support Specialist', 'PAY-88519', TRUE, '+94 76 555 9012', 'dilshan.s@telesonic.lk', '10-Jan-2022'),
  ('EMP-1024', 'Tharindu Fernando', 'SL-405', 'Mobile & Accessories', 'Modern Retail & Brand Stores', 'Mahesh Rathnayake (Western Province South)', 'Senior Channel Account Exec', 'PAY-88602', TRUE, '+94 77 999 1234', 'tharindu.f@telesonic.lk', '05-Jun-2023'),
  ('EMP-1025', 'Kavinda Bandara', 'SL-490', 'Consumer Electronics', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Junior Service Technician', 'PAY-88730', FALSE, '+94 70 333 4455', 'kavinda.b@telesonic.lk', '01-Apr-2026'),
  ('EMP-1026', 'Chaminda Wickramasinghe', 'SL-102', 'Consumer Electronics', 'Field Engineering & Repairs', 'Sunil Warnakulasuriya (Western Province North)', 'Head of Department (HOD) - Field Support', 'PAY-88001', TRUE, '+94 77 777 8899', 'chaminda.w@telesonic.lk', '01-Jan-2018')
ON CONFLICT (id) DO NOTHING;

-- Seed Scheme Assignments
INSERT INTO participant_scheme_assignments (
    id, participant_id, scheme_code, scheme_name, calculation_role, is_primary_role, effective_from, effective_to, target_allocation_percent, status, notes
) VALUES
  ('ASG-101', 'EMP-1021', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Primary Technician', TRUE, '2026-01-01', '2026-12-31', 100.00, 'Active', 'Assigned lead role for Colombo Metro customer tickets'),
  ('ASG-102', 'EMP-1021', 'SCH-SLS-2026', 'Retail Smartphone & Devices Sales Incentive', 'Secondary Contributor', FALSE, '2026-02-01', '2026-06-30', 20.00, 'Active', 'Warranty extension accessory cross-sell contribution'),
  ('ASG-201', 'EMP-1022', 'SCH-DLR-2026', 'Tier-1 Authorised Dealer Quarterly Rebate', 'Key Account Manager', TRUE, '2026-04-01', '2026-06-30', 100.00, 'Active', 'Q2 Enterprise volume target keeper'),
  ('ASG-301', 'EMP-1023', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Primary Technician', TRUE, '2026-01-01', '2026-12-31', 100.00, 'Active', 'Kandy and Central Region service coverage'),
  ('ASG-401', 'EMP-1024', 'SCH-SLS-2026', 'Retail Smartphone & Devices Sales Incentive', 'Senior Channel Account Exec', TRUE, '2026-01-01', '2026-12-31', 100.00, 'Active', 'Galle Road and Liberty Plaza flagship retail stores'),
  ('ASG-501', 'EMP-1025', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Secondary Contributor', FALSE, '2026-04-01', '2026-06-30', 50.00, 'Inactive', 'Probationary period evaluation (currently inactive on live runs)'),
  ('ASG-601', 'EMP-1026', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Head of Department (HOD)', TRUE, '2026-01-01', '2026-12-31', 100.00, 'Active', 'Departmental target oversight')
ON CONFLICT (id) DO NOTHING;

-- Seed Participant History Logs
INSERT INTO participant_history_logs (
    id, participant_id, timestamp, author, role, event_type, scheme_code, previous_value, new_value, change_reason
) VALUES
  ('HIST-01', 'EMP-1021', '2026-01-05 09:30:12+00', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SRV-2026', 'None', 'Primary Technician (100% Allocation)', 'Annual 2026 Field Service Incentive kickoff enrollment'),
  ('HIST-02', 'EMP-1021', '2026-02-01 14:15:45+00', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SLS-2026', 'None', 'Secondary Contributor (20% Allocation)', 'Approved cross-selling scheme bonus for authorized repairs'),
  ('HIST-10', 'EMP-1022', '2026-03-28 11:20:00+00', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-DLR-2026', 'None', 'Key Account Manager (100% Allocation)', 'Assigned as primary relationship manager for Top 10 B2B dealers'),
  ('HIST-20', 'EMP-1023', '2026-01-05 10:00:00+00', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SRV-2026', 'None', 'Primary Technician (100% Allocation)', '2026 Field Engineer enrollment'),
  ('HIST-30', 'EMP-1024', '2026-01-10 15:40:00+00', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Scheme Enrolled', 'SCH-SLS-2026', 'None', 'Senior Channel Account Exec (100% Allocation)', 'Promotion to Senior Channel Rep with retail target tier'),
  ('HIST-40', 'EMP-1025', '2026-04-02 08:30:00+00', 'admin.incentive@telesonic.lk', 'Incentive Administrator', 'Status Changed', 'SCH-SRV-2026', 'Active', 'Inactive / Probation Hold', 'Under probation evaluation per HR guidelines')
ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 22. ATTENDANCE IMPORT BATCHES
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance_import_batches (
    id VARCHAR(64) PRIMARY KEY,
    period VARCHAR(64) NOT NULL,
    division VARCHAR(100) NOT NULL DEFAULT 'Consumer Electronics',
    source VARCHAR(150) NOT NULL DEFAULT 'Biometric Punch Terminal (ZKTeco BioTime)',
    status VARCHAR(32) NOT NULL DEFAULT 'Draft',
    imported_by VARCHAR(128) NOT NULL DEFAULT 'Service Coordinator',
    approved_by VARCHAR(128),
    approved_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_batch_period ON attendance_import_batches(period);
CREATE INDEX IF NOT EXISTS idx_attendance_batch_division ON attendance_import_batches(division);
CREATE INDEX IF NOT EXISTS idx_attendance_batch_status ON attendance_import_batches(status);

-- ====================================================================
-- 23. ATTENDANCE RECORDS
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance_records (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES attendance_import_batches(id) ON DELETE CASCADE,
    employee_code VARCHAR(64) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    working_days INT NOT NULL DEFAULT 22,
    leave_days INT NOT NULL DEFAULT 0,
    absent_days INT NOT NULL DEFAULT 0,
    attendance_factor NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    validation_status VARCHAR(32) NOT NULL DEFAULT 'Valid',
    error_messages JSONB DEFAULT '[]'::jsonb,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_rec_batch ON attendance_records(batch_id);
CREATE INDEX IF NOT EXISTS idx_attendance_rec_emp ON attendance_records(employee_code);

-- ====================================================================
-- 24. ATTENDANCE BATCH HISTORY LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS attendance_batch_history_logs (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES attendance_import_batches(id) ON DELETE CASCADE,
    action VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(128) NOT NULL,
    details TEXT,
    timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_attendance_hist_batch ON attendance_batch_history_logs(batch_id);

-- ====================================================================
-- SEED DATA: ATTENDANCE IMPORT BATCHES & RECORDS
-- ====================================================================
-- Batch 1: May 2026 (Draft)
INSERT INTO attendance_import_batches (
    id, period, division, source, status, imported_by, approved_by, notes
) VALUES (
    'BAT-ATT-2026-05A',
    'May 2026',
    'Consumer Electronics',
    'Biometric Punch Terminal (ZKTeco BioTime)',
    'Draft',
    'Kamal Silva (Service Coordinator)',
    NULL,
    'Initial monthly punch clock import for Western Province technicians.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Attendance Records for May 2026
INSERT INTO attendance_records (
    id, batch_id, employee_code, employee_name, role, division,
    working_days, leave_days, absent_days, attendance_factor, validation_status, error_messages, notes, sort_order
) VALUES
  ('att-1', 'BAT-ATT-2026-05A', 'EMP-1021', 'Kasun Jayawardena', 'Senior Service Technician', 'Consumer Electronics', 22, 2, 0, 1.00, 'Valid', '[]'::jsonb, 'Perfect attendance, full factor applied', 1),
  ('att-2', 'BAT-ATT-2026-05A', 'EMP-1022', 'Pradeep Bandara', 'Field Service Technician', 'Consumer Electronics', 21, 2, 1, 1.00, 'Valid', '[]'::jsonb, '1 unapproved absent day (within 0-1 allowance: 100%)', 2),
  ('att-3', 'BAT-ATT-2026-05A', 'EMP-1023', 'Ruwan Wijesinghe', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 20, 2, 2, 0.50, 'Valid', '[]'::jsonb, '2 absent days (50% factor applied)', 3),
  ('att-4', 'BAT-ATT-2026-05A', 'EMP-1024', 'Dilshan Madusanka', 'Junior Service Tech', 'Consumer Electronics', 18, 3, 3, 0.00, 'Valid', '[]'::jsonb, '3 absent days (0% factor applied — forfeiture threshold)', 4),
  ('att-5', 'BAT-ATT-2026-05A', 'EMP-1025', 'Nuwan Fernando', 'Solar PV Maintenance Tech', 'Renewable Energy', 23, 1, 0, 1.00, 'Valid', '[]'::jsonb, 'Full month field deployment', 5),
  ('att-6', 'BAT-ATT-2026-05A', 'EMP-1026', 'Chaminda Warnakula', 'Senior Service Technician', 'Consumer Electronics', 21, 2, 1, 1.00, 'Valid', '[]'::jsonb, 'Within normal limits', 6),
  ('att-7', 'BAT-ATT-2026-05A', 'EMP-1027', 'Sajith Gunaratne', 'Retail Sales Consultant', 'Consumer Electronics', 22, 1, 1, 1.00, 'Error', '["Ineligible Role: Retail Sales Consultant. Attendance component applies only to certified field service technicians."]'::jsonb, 'Imported accidentally from showroom sales payroll', 7),
  ('att-8', 'BAT-ATT-2026-05A', 'EMP-9999', 'Gamini Wijetunga', 'Contract Technician', 'Consumer Electronics', 15, 0, 5, 0.00, 'Error', '["Employee code EMP-9999 not found in Master Technician roster. Verify employee master record."]'::jsonb, 'Contractor code unmapped in ERP', 8),
  ('att-9', 'BAT-ATT-2026-05A', 'EMP-1029', 'Dinesh Priyashantha', 'Field Service Technician', 'Consumer Electronics', 22, 2, 0, 1.00, 'Valid', '[]'::jsonb, 'Exemplary punctuality', 9),
  ('att-10', 'BAT-ATT-2026-05A', 'EMP-1030', 'Mahesh Gunawardena', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 21, 1, 2, 0.50, 'Valid', '[]'::jsonb, '2 days unexcused absence, 50% factor', 10),
  ('att-11', 'BAT-ATT-2026-05A', 'EMP-1031', 'Niroshan De Silva', 'Diagnostic Specialist', 'Commercial Air Conditioning', 23, 1, 0, 1.00, 'Valid', '[]'::jsonb, '100% factor', 11),
  ('att-12', 'BAT-ATT-2026-05A', 'EMP-1032', 'Sunil Jayasuriya', 'Solar PV Maintenance Tech', 'Renewable Energy', 22, 2, 0, 1.00, 'Valid', '[]'::jsonb, 'Full attendance', 12)
ON CONFLICT (id) DO NOTHING;

-- History Logs for May 2026 Batch
INSERT INTO attendance_batch_history_logs (id, batch_id, action, user_name, user_role, details) VALUES
  ('ABH-01', 'BAT-ATT-2026-05A', 'Batch Created', 'Kamal Silva', 'Service Coordinator', 'Imported 12 rows from ZKTeco biometric terminal.'),
  ('ABH-02', 'BAT-ATT-2026-05A', 'Validation Executed', 'Kamal Silva', 'Service Coordinator', 'Diagnosed 10 valid records and 2 roster errors.')
ON CONFLICT (id) DO NOTHING;

-- Batch 2: April 2026 (Approved)
INSERT INTO attendance_import_batches (
    id, period, division, source, status, imported_by, approved_by, approved_at, notes
) VALUES (
    'BAT-ATT-2026-04F',
    'April 2026',
    'All Service Divisions',
    'HRIS Payroll Export (SAP SuccessFactors)',
    'Approved',
    'Niluka Senaratne (HR Manager)',
    'Niluka Senaratne (HR Manager)',
    '2026-04-28 16:30:00+00',
    'Final approved attendance baseline for April incentive distribution.'
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 25. SERVICE PERFORMANCE BATCHES (INC-SCR-07)
-- ====================================================================
CREATE TABLE IF NOT EXISTS service_performance_batches (
    id VARCHAR(64) PRIMARY KEY,
    period VARCHAR(64) NOT NULL,
    division VARCHAR(100) NOT NULL DEFAULT 'Consumer Electronics',
    source_system VARCHAR(150) NOT NULL DEFAULT 'Servio Service Desk / SAP B1 Service Module',
    received_on VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Draft',
    locked_by VARCHAR(128),
    locked_at TIMESTAMP WITH TIME ZONE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_srv_perf_period ON service_performance_batches(period);
CREATE INDEX IF NOT EXISTS idx_srv_perf_division ON service_performance_batches(division);
CREATE INDEX IF NOT EXISTS idx_srv_perf_status ON service_performance_batches(status);

-- ====================================================================
-- 26. SERVICE PERFORMANCE TECHNICIAN LINES (SUMMARIES)
-- ====================================================================
CREATE TABLE IF NOT EXISTS service_performance_technician_lines (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES service_performance_batches(id) ON DELETE CASCADE,
    employee_code VARCHAR(64) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    closed_jobs INT NOT NULL DEFAULT 0,
    hod_eligible INT NOT NULL DEFAULT 0,
    partial INT NOT NULL DEFAULT 0,
    not_eligible INT NOT NULL DEFAULT 0,
    excluded INT NOT NULL DEFAULT 0,
    avg_quality NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    avg_discipline NUMERIC(4, 2) NOT NULL DEFAULT 0.00,
    poor_repeats INT NOT NULL DEFAULT 0,
    review_status VARCHAR(32) NOT NULL DEFAULT 'Reviewed',
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_srv_tech_batch ON service_performance_technician_lines(batch_id);
CREATE INDEX IF NOT EXISTS idx_srv_tech_emp ON service_performance_technician_lines(employee_code);

-- ====================================================================
-- 27. SERVICE PERFORMANCE JOB TICKETS (JOB SHEETS)
-- ====================================================================
CREATE TABLE IF NOT EXISTS service_performance_job_tickets (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES service_performance_batches(id) ON DELETE CASCADE,
    job_ticket_no VARCHAR(64) NOT NULL,
    employee_code VARCHAR(64) NOT NULL,
    employee_name VARCHAR(150) NOT NULL,
    customer_name VARCHAR(150) NOT NULL,
    equipment_model VARCHAR(150) NOT NULL,
    completion_date VARCHAR(64) NOT NULL,
    fault_category VARCHAR(150) NOT NULL,
    first_time_fix BOOLEAN NOT NULL DEFAULT TRUE,
    quality_score NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    discipline_score NUMERIC(4, 2) NOT NULL DEFAULT 10.00,
    eligibility VARCHAR(32) NOT NULL DEFAULT 'HOD Eligible',
    is_poor_repeat BOOLEAN NOT NULL DEFAULT FALSE,
    repeat_reference_job VARCHAR(100),
    hod_reviewed BOOLEAN NOT NULL DEFAULT TRUE,
    closure_status VARCHAR(32) NOT NULL DEFAULT 'Closed',
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_srv_job_batch ON service_performance_job_tickets(batch_id);
CREATE INDEX IF NOT EXISTS idx_srv_job_ticket ON service_performance_job_tickets(job_ticket_no);
CREATE INDEX IF NOT EXISTS idx_srv_job_emp ON service_performance_job_tickets(employee_code);

-- ====================================================================
-- 28. SERVICE PERFORMANCE AUDIT LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS service_performance_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES service_performance_batches(id) ON DELETE CASCADE,
    timestamp VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_srv_audit_batch ON service_performance_audit_logs(batch_id);

-- ====================================================================
-- SEED DATA: SERVICE PERFORMANCE BATCHES & RECORDS
-- ====================================================================
-- 1. Batch 1: May 2026 (Draft)
INSERT INTO service_performance_batches (
    id, period, division, source_system, received_on, status, locked_by, locked_at, notes
) VALUES (
    'BAT-SRV-2026-05A',
    'May 2026',
    'Consumer Electronics',
    'Servio Service Desk / SAP B1 Service Module',
    '12-May-2026 14:35 IST',
    'Draft',
    NULL,
    NULL,
    'Live May 2026 closed service orders awaiting final HOD review.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Technician Lines for May 2026
INSERT INTO service_performance_technician_lines (
    id, batch_id, employee_code, employee_name, role, division,
    closed_jobs, hod_eligible, partial, not_eligible, excluded,
    avg_quality, avg_discipline, poor_repeats, review_status, notes, sort_order
) VALUES
  ('spt-1', 'BAT-SRV-2026-05A', 'EMP-1021', 'Kasun Jayawardena', 'Senior Service Technician', 'Consumer Electronics', 48, 44, 3, 1, 0, 9.40, 9.70, 0, 'Reviewed', 'High FTF rate, zero poor repeats', 1),
  ('spt-2', 'BAT-SRV-2026-05A', 'EMP-1022', 'Pradeep Bandara', 'Field Service Technician', 'Consumer Electronics', 42, 36, 4, 1, 1, 8.80, 9.10, 1, 'Exceptions Found', '1 poor repeat flagged on inverter board rework', 2),
  ('spt-3', 'BAT-SRV-2026-05A', 'EMP-1023', 'Ruwan Wijesinghe', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 38, 34, 2, 2, 0, 9.10, 9.30, 0, 'Reviewed', 'Chiller maintenance project complete', 3),
  ('spt-4', 'BAT-SRV-2026-05A', 'EMP-1024', 'Dilshan Madusanka', 'Junior Service Tech', 'Consumer Electronics', 30, 22, 5, 2, 1, 7.90, 8.40, 2, 'Exceptions Found', '2 poor repeats under senior review', 4),
  ('spt-5', 'BAT-SRV-2026-05A', 'EMP-1025', 'Nuwan Fernando', 'Solar PV Maintenance Tech', 'Renewable Energy', 35, 33, 2, 0, 0, 9.60, 9.80, 0, 'Reviewed', 'Top customer satisfaction on commercial inverters', 5),
  ('spt-6', 'BAT-SRV-2026-05A', 'EMP-1026', 'Chaminda Warnakula', 'Senior Service Technician', 'Consumer Electronics', 26, 24, 2, 0, 0, 9.50, 9.60, 0, 'Reviewed', 'Advanced diagnostic support calls', 6),
  ('spt-7', 'BAT-SRV-2026-05A', 'EMP-1029', 'Dinesh Priyashantha', 'Field Service Technician', 'Consumer Electronics', 40, 37, 2, 1, 0, 9.00, 9.20, 0, 'Reviewed', 'Consistent completion velocity', 7),
  ('spt-8', 'BAT-SRV-2026-05A', 'EMP-1030', 'Mahesh Gunawardena', 'AC & Refrigeration Technician', 'Commercial Air Conditioning', 36, 30, 3, 2, 1, 8.40, 8.90, 1, 'Exceptions Found', '1 poor repeat on duct leak sealing', 8),
  ('spt-9', 'BAT-SRV-2026-05A', 'EMP-1031', 'Niroshan De Silva', 'Diagnostic Specialist', 'Commercial Air Conditioning', 32, 30, 2, 0, 0, 9.70, 9.80, 0, 'Reviewed', 'Expert escalation calls', 9),
  ('spt-10', 'BAT-SRV-2026-05A', 'EMP-1032', 'Sunil Jayasuriya', 'Solar PV Maintenance Tech', 'Renewable Energy', 34, 31, 2, 1, 0, 9.20, 9.40, 0, 'Reviewed', 'High grid synchronisation efficiency', 10)
ON CONFLICT (id) DO NOTHING;

-- Seed Job Detail Tickets for May 2026
INSERT INTO service_performance_job_tickets (
    id, batch_id, job_ticket_no, employee_code, employee_name, customer_name,
    equipment_model, completion_date, fault_category, first_time_fix,
    quality_score, discipline_score, eligibility, is_poor_repeat,
    repeat_reference_job, hod_reviewed, closure_status, notes, sort_order
) VALUES
  ('spjt-101', 'BAT-SRV-2026-05A', 'SRV-2026-0891', 'EMP-1021', 'Kasun Jayawardena', 'Aitken Spence Hotel PLC', 'Daikin VRV-IV 12HP Heat Recovery', '04-May-2026', 'Inverter Compressor PCB Error Code U4', TRUE, 9.80, 10.00, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Verified by HOD. Flawless first-time fix with OEM thermistor replacement.', 1),
  ('spjt-102', 'BAT-SRV-2026-05A', 'SRV-2026-0904', 'EMP-1022', 'Pradeep Bandara', 'Singer Mega Showroom - Kandy', 'Panasonic 4-Way Cassette 36,000 BTU', '07-May-2026', 'Condensate Drain Pump Overflow / Float Sensor', FALSE, 6.20, 8.50, 'Not Eligible', TRUE, 'SRV-2026-0742 (Closed 22-Apr)', TRUE, 'Closed', 'Flagged as Poor Service: Drain clamp improperly secured causing return flood visit within 15 days.', 2),
  ('spjt-103', 'BAT-SRV-2026-05A', 'SRV-2026-0922', 'EMP-1023', 'Ruwan Wijesinghe', 'Hemas Hospitals Thalawathugoda', 'Trane Air-Cooled Scroll Chiller 50TR', '09-May-2026', 'Low Suction Pressure / Expansion Valve Calibration', TRUE, 9.40, 9.50, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Critical ICU unit restored within 2-hour SLA.', 3),
  ('spjt-104', 'BAT-SRV-2026-05A', 'SRV-2026-0951', 'EMP-1024', 'Dilshan Madusanka', 'Dialog Axiata Cell Tower #44', 'Huawei Solar Inverter 20kW', '10-May-2026', 'DC Ground Fault / Array Isolation Alarm', FALSE, 5.80, 7.90, 'Not Eligible', TRUE, 'SRV-2026-0810 (Closed 28-Apr)', TRUE, 'Closed', 'Flagged as Poor Repeat: MC4 connector crimp failed after 12 days, resulting in downtime call.', 4),
  ('spjt-105', 'BAT-SRV-2026-05A', 'SRV-2026-0978', 'EMP-1025', 'Nuwan Fernando', 'Brandix Apparel Logistics Hub', 'SMA Sunny Tripower 50kW', '11-May-2026', 'Grid Parameter Drift / Firmware Update', TRUE, 9.70, 10.00, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Full system telemetry re-established.', 5),
  ('spjt-106', 'BAT-SRV-2026-05A', 'SRV-2026-1002', 'EMP-1022', 'Pradeep Bandara', 'Keells Super - Moratuwa', 'Carrier Multi-Deck Commercial Freezer', '11-May-2026', 'Evaporator Fan Motor Bearing Seizure', TRUE, 8.90, 9.00, 'Partial', FALSE, NULL, TRUE, 'Closed', 'Partial incentive credit: Shared call with apprentice technician.', 6),
  ('spjt-107', 'BAT-SRV-2026-05A', 'SRV-2026-1015', 'EMP-1030', 'Mahesh Gunawardena', 'Cinnamon Grand Colombo', 'Mitsubishi Electric City Multi 16HP', '12-May-2026', 'Refrigerant R410A Leak at Flare Nut', FALSE, 6.50, 8.00, 'Not Eligible', TRUE, 'SRV-2026-0865 (Closed 02-May)', TRUE, 'Closed', 'Flagged as Poor Repeat: Leak test was rushed on first call - joint required re-brazing on callback.', 7),
  ('spjt-108', 'BAT-SRV-2026-05A', 'SRV-2026-1033', 'EMP-1021', 'Kasun Jayawardena', 'National Development Bank HQ', 'Liebert Emerson Precision Data Center AC', '12-May-2026', 'Microprocessor Controller Board Replacement', TRUE, 9.90, 10.00, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Server room temperature kept within 21°C SLA throughout swap.', 8),
  ('spjt-109', 'BAT-SRV-2026-05A', 'SRV-2026-1055', 'EMP-1024', 'Dilshan Madusanka', 'Softlogic Retail - Nugegoda', 'Samsung 24,000 BTU Inverter Split', '13-May-2026', 'Indoor Cross-Flow Fan Noise', FALSE, 5.50, 7.50, 'Not Eligible', TRUE, 'SRV-2026-0920 (Closed 05-May)', TRUE, 'Closed', 'Customer complained of repeat vibrating noise after incomplete bushing replacement.', 9),
  ('spjt-110', 'BAT-SRV-2026-05A', 'SRV-2026-1070', 'EMP-1031', 'Niroshan De Silva', 'Lanka Hospitals Blood Bank', 'Ultra-Low Temp Cold Chain Unit -80°C', '13-May-2026', 'Cascade Compressor Stage 2 Interstage Pressure', TRUE, 10.00, 10.00, 'HOD Eligible', FALSE, NULL, TRUE, 'Closed', 'Zero temperature excursion. High-complexity repair validated by HOD.', 10)
ON CONFLICT (id) DO NOTHING;

-- Seed Audit History for May 2026 Batch
INSERT INTO service_performance_audit_logs (id, batch_id, timestamp, user_name, user_role, action, details) VALUES
  ('spaud-01', 'BAT-SRV-2026-05A', '12-May-2026 14:35 IST', 'Automated Data Pipeline', 'System Integration', 'Source Sync Completed', 'Synchronized 363 closed calls from Servio Service Desk / SAP B1 Service Module.'),
  ('spaud-02', 'BAT-SRV-2026-05A', '12-May-2026 16:10 IST', 'Chaminda Warnakula', 'Service HOD', 'Poor Repeat Review', 'Classified 4 repeat calls as Poor Workmanship after customer callback inspection.'),
  ('spaud-03', 'BAT-SRV-2026-05A', '12-May-2026 17:00 IST', 'Lakmal Perera', 'Incentive Administrator', 'Draft Validation', 'Verified call closing dates fall strictly within 01-May-2026 to 31-May-2026 period boundary.')
ON CONFLICT (id) DO NOTHING;

-- 2. Batch 2: April 2026 (Locked by HOD)
INSERT INTO service_performance_batches (
    id, period, division, source_system, received_on, status, locked_by, locked_at, notes
) VALUES (
    'BAT-SRV-2026-04F',
    'April 2026',
    'All Service Divisions',
    'Servio Service Desk / SAP B1 Service Module',
    '28-Apr-2026 16:45 IST',
    'Locked',
    'Chaminda Warnakula (Service HOD)',
    '2026-04-28 17:30:00+00',
    'Final HOD locked service performance baseline for April incentive distribution.'
) ON CONFLICT (id) DO NOTHING;

-- ====================================================================
-- 29. CALCULATION RESULT BATCHES (INC-SCR-08)
-- ====================================================================
CREATE TABLE IF NOT EXISTS calculation_result_batches (
    id VARCHAR(64) PRIMARY KEY,
    period VARCHAR(64) NOT NULL,
    run_date VARCHAR(64) NOT NULL,
    status VARCHAR(32) NOT NULL DEFAULT 'Calculated',
    run_type VARCHAR(64) NOT NULL DEFAULT 'MTD Simulation',
    total_participants INT NOT NULL DEFAULT 0,
    gross_commission_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_incentive_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    penalty_clawback_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_payable_lkr NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calc_batch_period ON calculation_result_batches(period);
CREATE INDEX IF NOT EXISTS idx_calc_batch_status ON calculation_result_batches(status);

-- ====================================================================
-- 30. CALCULATION PARTICIPANT RESULTS
-- ====================================================================
CREATE TABLE IF NOT EXISTS calculation_participant_results (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES calculation_result_batches(id) ON DELETE CASCADE,
    technician_code VARCHAR(64) NOT NULL,
    technician_name VARCHAR(150) NOT NULL,
    role VARCHAR(100) NOT NULL,
    division VARCHAR(100) NOT NULL,
    scheme_code VARCHAR(64) NOT NULL,
    scheme_name VARCHAR(150) NOT NULL,
    target_volume NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    actual_volume NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    volume_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    target_turnover NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    actual_turnover NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    turnover_pct NUMERIC(6, 2) NOT NULL DEFAULT 0.00,
    slab_tier VARCHAR(100) NOT NULL DEFAULT 'Tier 1',
    slab_multiplier NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    gross_commission NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    target_incentive NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    attendance_factor NUMERIC(4, 2) NOT NULL DEFAULT 1.00,
    penalty_clawback NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    net_payable NUMERIC(15, 2) NOT NULL DEFAULT 0.00,
    status VARCHAR(32) NOT NULL DEFAULT 'Calculated',
    job_count INT NOT NULL DEFAULT 0,
    overdue_invoice_count INT NOT NULL DEFAULT 0,
    notes TEXT,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calc_part_batch ON calculation_participant_results(batch_id);
CREATE INDEX IF NOT EXISTS idx_calc_part_tech ON calculation_participant_results(technician_code);
CREATE INDEX IF NOT EXISTS idx_calc_part_status ON calculation_participant_results(status);

-- ====================================================================
-- 31. CALCULATION RESULT AUDIT LOGS
-- ====================================================================
CREATE TABLE IF NOT EXISTS calculation_result_audit_logs (
    id VARCHAR(64) PRIMARY KEY,
    batch_id VARCHAR(64) NOT NULL REFERENCES calculation_result_batches(id) ON DELETE CASCADE,
    timestamp VARCHAR(64) NOT NULL,
    user_name VARCHAR(128) NOT NULL,
    user_role VARCHAR(128) NOT NULL,
    action VARCHAR(64) NOT NULL,
    details TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_calc_audit_batch ON calculation_result_audit_logs(batch_id);

-- ====================================================================
-- SEED DATA: CALCULATION RESULTS
-- ====================================================================
-- Batch 1: May 2026 (MTD Simulation)
INSERT INTO calculation_result_batches (
    id, period, run_date, status, run_type, total_participants,
    gross_commission_lkr, target_incentive_lkr, penalty_clawback_lkr, net_payable_lkr, notes
) VALUES (
    'RUN-2026-05-MTD-04',
    'May 2026',
    '14-May-2026 18:30 IST',
    'Verified',
    'MTD Simulation',
    7,
    621000.00,
    383700.00,
    83200.00,
    901000.00,
    'Telesonic Lanka monthly incentive computation run 04 for May 2026.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Participant Results for May 2026 Batch
INSERT INTO calculation_participant_results (
    id, batch_id, technician_code, technician_name, role, division,
    scheme_code, scheme_name, target_volume, actual_volume, volume_pct,
    target_turnover, actual_turnover, turnover_pct, slab_tier, slab_multiplier,
    gross_commission, target_incentive, attendance_factor, penalty_clawback,
    net_payable, status, job_count, overdue_invoice_count, notes, sort_order
) VALUES
  ('calc-01', 'RUN-2026-05-MTD-04', 'TECH-101', 'Ruwan Jayasinghe', 'Senior Field Engineer', 'Consumer Electronics', 'SCH-CE-FIELD', 'Consumer AV & Smart Appliances Tiered Incentive', 40, 46, 115.00, 850000.00, 969000.00, 114.00, 'Tier 3 (110% - 125%)', 1.15, 98000.00, 50500.00, 1.00, 0.00, 148500.00, 'Verified', 46, 0, 'Exemplary customer turnaround', 1),
  ('calc-02', 'RUN-2026-05-MTD-04', 'TECH-102', 'Dinesh Bandara', 'Biomedical Specialist', 'Biomedical Engineering', 'SCH-MED-SPEC', 'Healthcare Diagnostic & Imaging Systems Scheme', 25, 27, 108.00, 1400000.00, 1484000.00, 106.00, 'Tier 2 (100% - 110%)', 1.05, 135000.00, 81500.00, 1.00, 24500.00, 192000.00, 'Verified', 27, 2, '2 overdue invoices (>45 days) docked per policy', 2),
  ('calc-03', 'RUN-2026-05-MTD-04', 'TECH-103', 'Kasun Wijesinghe', 'Network Technician', 'Telecommunications & Networks', 'SCH-TEL-NET', 'Fiber Optic & Microwave Installation Incentive', 35, 32, 91.00, 600000.00, 552000.00, 92.00, 'Tier 1 (80% - 99%)', 0.90, 58000.00, 30000.00, 1.00, 0.00, 88000.00, 'Calculated', 32, 0, 'Within normal standard parameters', 3),
  ('calc-04', 'RUN-2026-05-MTD-04', 'TECH-104', 'Anura Senanayake', 'IT Solutions Architect', 'Enterprise IT Solutions', 'SCH-IT-SRV', 'Enterprise Datacenter & Server Maintenance Matrix', 20, 25, 125.00, 2200000.00, 2684000.00, 122.00, 'Tier 4 (> 120% Super Achievement)', 1.25, 165000.00, 98000.00, 1.00, 18000.00, 245000.00, 'Approved', 25, 1, 'Super-accelerator multiplier applied', 4),
  ('calc-05', 'RUN-2026-05-MTD-04', 'TECH-105', 'Pradeep Kumara', 'Industrial Automation Tech', 'Industrial Automation', 'SCH-IND-AUTO', 'PLC & Robotics Field Commission Structure', 30, 23, 76.00, 950000.00, 741000.00, 78.00, 'Below Threshold (< 80%)', 0.70, 48000.00, 35200.00, 0.90, 31200.00, 52000.00, 'Held', 23, 3, 'Held for review: 3 overdue invoices & high penalty clawback', 5),
  ('calc-06', 'RUN-2026-05-MTD-04', 'TECH-106', 'Nimal Perera', 'Power Systems Technician', 'Power Systems & Generators', 'SCH-PWR-GEN', 'Diesel Generator & UPS Service Commission Scheme', 28, 29, 103.00, 750000.00, 765000.00, 102.00, 'Tier 2 (100% - 110%)', 1.00, 72000.00, 40000.00, 1.00, 0.00, 112000.00, 'Calculated', 29, 0, 'Regular maintenance target achieved', 6),
  ('calc-07', 'RUN-2026-05-MTD-04', 'TECH-107', 'Chaminda Silva', 'Consumer AV Technician', 'Consumer Electronics', 'SCH-CE-FIELD', 'Consumer AV & Smart Appliances Tiered Incentive', 32, 28, 87.00, 700000.00, 616000.00, 88.00, 'Tier 1 (80% - 99%)', 0.85, 45000.00, 28500.00, 1.00, 9500.00, 64000.00, 'Verified', 28, 1, '1 penalty clawback processed', 7)
ON CONFLICT (id) DO NOTHING;

-- Seed Audit History for May 2026 Run
INSERT INTO calculation_result_audit_logs (id, batch_id, timestamp, user_name, user_role, action, details) VALUES
  ('craud-01', 'RUN-2026-05-MTD-04', '14-May-2026 18:30 IST', 'Incentive Batch Engine v4.2', 'System Engine', 'Calculation Executed', 'Executed formula engine across 7 participant profiles for May 2026.'),
  ('craud-02', 'RUN-2026-05-MTD-04', '14-May-2026 19:15 IST', 'Lakmal Perera', 'Incentive Administrator', 'Verification Stamped', 'Verified slab tiers and customer aging deductions against SAP B1 AR aging.'),
  ('craud-03', 'RUN-2026-05-MTD-04', '14-May-2026 19:40 IST', 'Chaminda Warnakula', 'Service HOD', 'Participant Held', 'Marked TECH-105 on Hold pending resolution of disputed industrial client invoices.')
ON CONFLICT (id) DO NOTHING;

-- Batch 2: April 2026 (Approved & Closed Run)
INSERT INTO calculation_result_batches (
    id, period, run_date, status, run_type, total_participants,
    gross_commission_lkr, target_incentive_lkr, penalty_clawback_lkr, net_payable_lkr, notes
) VALUES (
    'RUN-2026-04-FINAL',
    'April 2026',
    '29-Apr-2026 17:00 IST',
    'Approved',
    'Official Payroll Run',
    7,
    598000.00,
    365000.00,
    42000.00,
    921000.00,
    'April 2026 official signed off incentive payout batch posted to payroll.'
) ON CONFLICT (id) DO NOTHING;


-- ============================================================================
-- 28. INCENTIVE CALCULATION RUN ENGINE (INC-SCR-09)
-- ============================================================================

CREATE TABLE IF NOT EXISTS incentive_calculation_runs (
    id VARCHAR(50) PRIMARY KEY,
    run_no VARCHAR(50) NOT NULL,
    period VARCHAR(50) NOT NULL,
    division VARCHAR(100) NOT NULL DEFAULT 'All Divisions',
    selected_schemes VARCHAR(255) NOT NULL DEFAULT 'All Active Schemes (4 Schemes)',
    run_type VARCHAR(50) NOT NULL DEFAULT 'Simulation',
    data_cutoff VARCHAR(50) NOT NULL,
    status VARCHAR(50) NOT NULL DEFAULT 'Simulated',
    run_by VARCHAR(150) NOT NULL,
    started_at VARCHAR(50),
    finished_at VARCHAR(50),
    total_participants INT NOT NULL DEFAULT 0,
    total_docs_read INT NOT NULL DEFAULT 0,
    total_gross_commission DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_target_incentive DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_penalty DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    total_net_payable DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    notes TEXT DEFAULT '',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_run_readiness_checks (
    id VARCHAR(50) PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
    module_name VARCHAR(100) NOT NULL,
    required_state VARCHAR(100) NOT NULL,
    current_state VARCHAR(100) NOT NULL,
    is_ready BOOLEAN NOT NULL DEFAULT TRUE,
    signer VARCHAR(150) NOT NULL,
    last_updated VARCHAR(100) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_run_scheme_summaries (
    id VARCHAR(50) PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
    scheme_code VARCHAR(50) NOT NULL,
    scheme_name VARCHAR(255) NOT NULL,
    division VARCHAR(100) NOT NULL,
    participants INT NOT NULL DEFAULT 0,
    documents_read INT NOT NULL DEFAULT 0,
    gross_commission DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    target_incentive DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    penalty DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    net_payable DECIMAL(15,2) NOT NULL DEFAULT 0.00,
    warnings_count INT NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_run_warnings (
    id VARCHAR(50) PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
    code VARCHAR(50) NOT NULL,
    scheme_code VARCHAR(50) NOT NULL,
    participant_name VARCHAR(150) NOT NULL,
    severity VARCHAR(20) NOT NULL DEFAULT 'Medium',
    message TEXT NOT NULL,
    remediation TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS calculation_run_logs (
    id VARCHAR(50) PRIMARY KEY,
    run_id VARCHAR(50) NOT NULL REFERENCES incentive_calculation_runs(id) ON DELETE CASCADE,
    timestamp VARCHAR(50) NOT NULL,
    level VARCHAR(20) NOT NULL DEFAULT 'INFO',
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_calc_runs_period ON incentive_calculation_runs(period);
CREATE INDEX IF NOT EXISTS idx_calc_runs_status ON incentive_calculation_runs(status);
CREATE INDEX IF NOT EXISTS idx_calc_run_summaries_run ON calculation_run_scheme_summaries(run_id);
CREATE INDEX IF NOT EXISTS idx_calc_run_warnings_run ON calculation_run_warnings(run_id);
CREATE INDEX IF NOT EXISTS idx_calc_run_logs_run ON calculation_run_logs(run_id);

-- Seed Run 1: May 2026 Simulation Run
INSERT INTO incentive_calculation_runs (
    id, run_no, period, division, selected_schemes, run_type, data_cutoff,
    status, run_by, started_at, finished_at, total_participants, total_docs_read,
    total_gross_commission, total_target_incentive, total_penalty, total_net_payable, notes
) VALUES (
    'RUN-2026-05-PRE-01',
    'RUN-2026-05-PRE-01',
    'May 2026',
    'All Divisions',
    'All Active Schemes (4 Schemes)',
    'Simulation',
    '12-May-2026 23:59:59',
    'Simulated',
    'Lakmal Perera (Incentive Administrator)',
    '14-May-2026 10:15:20',
    '14-May-2026 10:16:04',
    34,
    1735,
    2865000.00,
    1240000.00,
    122000.00,
    3983000.00,
    'Preliminary MTD Simulation run for May 2026 across 4 business divisions.'
) ON CONFLICT (id) DO NOTHING;

-- Seed Readiness Checks for Run 1
INSERT INTO calculation_run_readiness_checks (
    id, run_id, module_name, required_state, current_state, is_ready, signer, last_updated
) VALUES
  ('chk-2026-05-1', 'RUN-2026-05-PRE-01', 'Monthly Target Quotas', 'Locked & Approved', 'Locked & Approved', TRUE, 'Lakmal Perera (Incentive Administrator)', '12-May-2026 11:20 IST'),
  ('chk-2026-05-2', 'RUN-2026-05-PRE-01', 'Attendance & Leave Import', 'Approved by HR', 'Approved by HR', TRUE, 'Niluka Senaratne (HR Manager)', '12-May-2026 15:45 IST'),
  ('chk-2026-05-3', 'RUN-2026-05-PRE-01', 'Service Performance Data', 'Locked by HOD', 'Locked by HOD', TRUE, 'Chaminda Warnakula (Service HOD)', '12-May-2026 16:10 IST'),
  ('chk-2026-05-4', 'RUN-2026-05-PRE-01', 'SAP B1 Debtor Aging Ledger', 'Synchronized', 'Synchronized (0-120+ Days)', TRUE, 'SAP Integration Engine', '12-May-2026 18:00 IST')
ON CONFLICT (id) DO NOTHING;

-- Seed Scheme Summaries for Run 1
INSERT INTO calculation_run_scheme_summaries (
    id, run_id, scheme_code, scheme_name, division, participants,
    documents_read, gross_commission, target_incentive, penalty, net_payable, warnings_count
) VALUES
  ('sum-2026-05-1', 'RUN-2026-05-PRE-01', 'SCH-SLS-2026', 'Retail Showroom Sales Incentive', 'Consumer Electronics', 12, 842, 485000.00, 320000.00, 25000.00, 780000.00, 1),
  ('sum-2026-05-2', 'RUN-2026-05-PRE-01', 'SCH-CAC-2026', 'Commercial HVAC Dealer Commission', 'Commercial Air Conditioning', 10, 416, 1250000.00, 450000.00, 62000.00, 1638000.00, 2),
  ('sum-2026-05-3', 'RUN-2026-05-PRE-01', 'SCH-SRV-2026', 'Field Service Technician Performance Incentive', 'Consumer Electronics', 8, 363, 310000.00, 280000.00, 35000.00, 555000.00, 2),
  ('sum-2026-05-4', 'RUN-2026-05-PRE-01', 'SCH-SOLAR-2026', 'Renewable Energy Solar Consultant Incentive', 'Renewable Energy', 4, 114, 820000.00, 190000.00, 0.00, 1010000.00, 0)
ON CONFLICT (id) DO NOTHING;

-- Seed Warnings for Run 1
INSERT INTO calculation_run_warnings (
    id, run_id, code, scheme_code, participant_name, severity, message, remediation
) VALUES
  ('wrn-2026-05-1', 'RUN-2026-05-PRE-01', 'WRN-ATT-04', 'SCH-SRV-2026', 'Dilshan Madusanka (EMP-1024)', 'High', 'Technician logged 3 unapproved absent days; 0% attendance factor applied (INC-BCR-10 Proposed Demo Rule).', 'Verify with HR if authorized exemption applies before final payout sign-off.'),
  ('wrn-2026-05-2', 'RUN-2026-05-PRE-01', 'WRN-DEBT-12', 'SCH-CAC-2026', 'Pradeep Bandara (EMP-1022)', 'Medium', 'Invoice INV-2026-9042 overdue by 94 days; 15% debtor aging penalty deducted (LKR 28,500).', 'Recoverable upon customer settlement in upcoming settlement cycles.'),
  ('wrn-2026-05-3', 'RUN-2026-05-PRE-01', 'WRN-REP-02', 'SCH-SRV-2026', 'Mahesh Gunawardena (EMP-1030)', 'High', 'Repeat call #SRV-2026-1015 flagged as Poor Workmanship; job excluded from eligible count.', 'HOD classification confirmed after callback inspection.'),
  ('wrn-2026-05-4', 'RUN-2026-05-PRE-01', 'WRN-TGT-01', 'SCH-SLS-2026', 'Kasun Jayawardena (EMP-1021)', 'Low', 'Turnover achievement reached 164.2%; incentive capped at Tier 5 Super Achiever slab ceiling.', 'Informational only; payout capped as configured in Target Slab Table.'),
  ('wrn-2026-05-5', 'RUN-2026-05-PRE-01', 'WRN-DEBT-18', 'SCH-CAC-2026', 'Ruwan Wijesinghe (EMP-1023)', 'Medium', 'Partial payment receipt detected on invoice INV-2026-8911; pro-rata commission calculated.', 'Remaining balance will calculate upon subsequent collection.')
ON CONFLICT (id) DO NOTHING;

-- Seed Logs for Run 1
INSERT INTO calculation_run_logs (
    id, run_id, timestamp, level, message
) VALUES
  ('log-2026-05-1', 'RUN-2026-05-PRE-01', '10:15:20.102', 'INFO', 'Engine initialized. Configuration validated for period May 2026.'),
  ('log-2026-05-2', 'RUN-2026-05-PRE-01', '10:15:21.430', 'INFO', 'Connecting to SAP Business One Service Layer API... Connected (Latency 14ms).'),
  ('log-2026-05-3', 'RUN-2026-05-PRE-01', '10:15:22.015', 'INFO', 'Ingested 1,735 source documents: 1,258 invoices, 363 service tickets, 114 solar contracts.'),
  ('log-2026-05-4', 'RUN-2026-05-PRE-01', '10:15:25.800', 'DEBUG', 'Evaluating Target Slab Table v2.1 for Retail Showroom Sales (12 participants).'),
  ('log-2026-05-5', 'RUN-2026-05-PRE-01', '10:15:32.410', 'WARN', 'WRN-ATT-04: Dilshan Madusanka (EMP-1024) 3 absent days. Calculated 0% factor.'),
  ('log-2026-05-6', 'RUN-2026-05-PRE-01', '10:15:38.220', 'DEBUG', 'Executing payment-term aging matrix against open receivables ledger.'),
  ('log-2026-05-7', 'RUN-2026-05-PRE-01', '10:15:45.900', 'WARN', 'WRN-DEBT-12: Applied 15% debtor aging penalty on overdue invoice INV-2026-9042.'),
  ('log-2026-05-8', 'RUN-2026-05-PRE-01', '10:15:58.100', 'INFO', 'Net payable reconciliation completed across all 4 schemes. Net Pool: LKR 3,983,000.'),
  ('log-2026-05-9', 'RUN-2026-05-PRE-01', '10:16:04.110', 'SUCCESS', 'Run finished successfully in 44.008s. Generated 5 warnings.')
ON CONFLICT (id) DO NOTHING;

-- Seed Run 2: April 2026 (Final Approved & Posted Run)
INSERT INTO incentive_calculation_runs (
    id, run_no, period, division, selected_schemes, run_type, data_cutoff,
    status, run_by, started_at, finished_at, total_participants, total_docs_read,
    total_gross_commission, total_target_incentive, total_penalty, total_net_payable, notes
) VALUES (
    'RUN-2026-04-FIN-01',
    'RUN-2026-04-FIN-01',
    'April 2026',
    'All Divisions',
    'All Active Schemes (4 Schemes)',
    'Final Calculation',
    '30-Apr-2026 23:59:59',
    'Posted',
    'Lakmal Perera (Incentive Administrator)',
    '02-May-2026 09:30:15',
    '02-May-2026 09:31:02',
    34,
    1680,
    2750000.00,
    1210000.00,
    70000.00,
    3890000.00,
    'April 2026 Official Final Payout Run. Posted to SAP B1 Journal Voucher #JV-2026-04-088.'
) ON CONFLICT (id) DO NOTHING;
