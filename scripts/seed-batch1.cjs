const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function seed() {
  // MST-08 Seed
  await prisma.$executeRawUnsafe(`
    INSERT INTO equipment_systems ("systemId", "customerName", "siteName", location, "equipmentCategory", status, "installedDate", "commissionedDate", "warrantyStart", "warrantyEnd", contract, project)
    VALUES ('SYS-VRF-COL-009', 'Jayasuriya Textiles (Pvt) Ltd', 'Colombo 03 Head Office', 'Rooftop Plant & 3rd Floor Admin', 'VRF Commercial Multi-Zone System', 'Active', '2026-09-10', '2026-09-15', '2026-09-15', '2028-09-15', 'AMC-2026-0192', 'PRJ-CAC-2026-014')
    ON CONFLICT ("systemId") DO NOTHING;
  `);

  // MST-09 Seed
  await prisma.$executeRawUnsafe(`
    INSERT INTO technicians ("employeeId", name, position, department, branch, mobile, "technicianType", team, certifications, status)
    VALUES ('EMP-0412', 'K. Silva', 'Lead HVAC Technician', 'Field Operations - Colombo', 'Colombo Head Office', '+94 77 123 4567', 'Direct In-House Staff', 'Commercial VRF Alpha', 'Carrier Level III Certified', 'Active')
    ON CONFLICT ("employeeId") DO NOTHING;
  `);

  // MST-10 Seed
  await prisma.$executeRawUnsafe(`
    INSERT INTO subcontractors ("vendorCode", "vendorName", "subcontractorType", territory, "paymentTerms", rating, status)
    VALUES ('V-4410', 'Lanka Cool Services & Engineering', 'HVAC Installation Contractor', 'Southern Coastal Region', 'Net 30 Days', 9.2, 'Active')
    ON CONFLICT ("vendorCode") DO NOTHING;
  `);

  // MST-11 Seed
  await prisma.$executeRawUnsafe(`
    INSERT INTO service_roles ("roleCode", "roleName", "internalSubcontractor", "incentiveEligible", "incentiveBasisRef", "multiplePerCall", active, status)
    VALUES ('ROLE-LEAD-TECH', 'Lead Field Technician', 'Both Internal and Subcontractor', 'Yes', 'Resolution SLA Bonus Scale A', 'No', 'Yes', 'Active')
    ON CONFLICT ("roleCode") DO NOTHING;
  `);

  // MST-12 Seed
  await prisma.$executeRawUnsafe(`
    INSERT INTO service_types (code, description, "listType", "defaultPriority", "checklistTemplate", "slaRule", "chargeableDefault", active, status)
    VALUES ('SVC-PREV-MAINT', 'Quarterly Preventive Maintenance Routine', 'Service Type', 'P2 - Normal Schedule', 'CHK-PM-AC-SPLIT', 'SLA-STD-COMMERCIAL', 'No', 'Yes', 'Active')
    ON CONFLICT (code) DO NOTHING;
  `);

  console.log('Seeded sample data for Batch 1 (MST-08 to MST-12)');
  await prisma.$disconnect();
}

seed().catch(console.error);

