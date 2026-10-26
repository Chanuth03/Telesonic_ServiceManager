import { prisma } from '../src/lib/prisma';

async function main() {
  // MST-18: free_service_plans
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS free_service_plans (
      id SERIAL PRIMARY KEY,
      "planCode" VARCHAR(100) UNIQUE NOT NULL,
      division VARCHAR(150) NOT NULL,
      "equipmentCategory" VARCHAR(150) NOT NULL,
      visits INTEGER NOT NULL,
      "intervalBasis" VARCHAR(100) NOT NULL,
      "intervalValue" INTEGER NOT NULL,
      "startBasis" VARCHAR(100) NOT NULL,
      active VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-19: contract_templates
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS contract_templates (
      id SERIAL PRIMARY KEY,
      template VARCHAR(150) UNIQUE NOT NULL,
      "contractKind" VARCHAR(150) NOT NULL,
      "visitsPerYear" INTEGER DEFAULT 4,
      coverage VARCHAR(150) DEFAULT '24/7 Priority Emergency Coverage',
      "responseHours" INTEGER DEFAULT 4,
      "billingBasis" VARCHAR(150) DEFAULT 'Quarterly in Advance',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-20: relationship_stages
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS relationship_stages (
      id SERIAL PRIMARY KEY,
      code VARCHAR(100) UNIQUE NOT NULL,
      description TEXT NOT NULL,
      "listType" VARCHAR(100) NOT NULL,
      "appliesTo" VARCHAR(150) DEFAULT 'All Customer Accounts',
      active VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-21: reminder_rules
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS reminder_rules (
      id SERIAL PRIMARY KEY,
      "ruleCode" VARCHAR(100) UNIQUE NOT NULL,
      "reminderType" VARCHAR(150) NOT NULL,
      "customerCategory" VARCHAR(150) DEFAULT 'All Customers',
      "leadDays" INTEGER NOT NULL,
      "maxReminders" INTEGER DEFAULT 3,
      "intervalDays" INTEGER DEFAULT 7,
      channel VARCHAR(100) DEFAULT 'SMS + WhatsApp',
      "consentRequired" VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  // MST-22: notification_templates
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS notification_templates (
      id SERIAL PRIMARY KEY,
      "templateId" VARCHAR(100) UNIQUE NOT NULL,
      name VARCHAR(255) NOT NULL,
      channel VARCHAR(100) NOT NULL,
      language VARCHAR(50) DEFAULT 'English',
      subject VARCHAR(255),
      body TEXT NOT NULL,
      active VARCHAR(10) DEFAULT 'Yes',
      status VARCHAR(50) DEFAULT 'Active',
      "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
      "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Batch 3 tables (free_service_plans, contract_templates, relationship_stages, reminder_rules, notification_templates) created successfully!');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

