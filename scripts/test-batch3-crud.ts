import { prisma } from '../src/lib/prisma';

async function testBatch3Crud() {
  console.log('--- STARTING AUTOMATED CRUD TESTS FOR BATCH 3 (MST-18 to MST-22) ---\n');

  // [1/5] MST-18: Free Service Plan
  console.log('[1/5] Testing MST-18 (Free Service Plan)...');
  const plan = await prisma.freeServicePlanMaster.create({
    data: {
      planCode: 'FSP-TEST-001',
      division: 'Air Conditioning & HVAC',
      equipmentCategory: 'Air Conditioning Commercial',
      visits: 3,
      intervalBasis: 'Fixed Months',
      intervalValue: 4,
      startBasis: 'Commissioning Date',
      active: 'Yes',
      status: 'Active',
    },
  });
  console.log('MST-18 Create: planCode =', plan.planCode);
  const foundPlan = await prisma.freeServicePlanMaster.findUnique({ where: { planCode: 'FSP-TEST-001' } });
  if (!foundPlan) throw new Error('MST-18 Read failed');
  console.log('MST-18 Read: successfully found record');
  await prisma.freeServicePlanMaster.delete({ where: { planCode: 'FSP-TEST-001' } });
  console.log('MST-18 Delete: successfully deleted\n');

  // [2/5] MST-19: Contract Templates
  console.log('[2/5] Testing MST-19 (Contract Templates)...');
  const contract = await prisma.contractTemplateMaster.create({
    data: {
      template: 'AMC-TEST-001',
      contractKind: 'Comprehensive (Parts + Labour)',
      visitsPerYear: 4,
      coverage: '24/7 Priority Emergency Coverage',
      responseHours: 4,
      billingBasis: 'Quarterly in Advance',
      status: 'Active',
    },
  });
  console.log('MST-19 Create: template =', contract.template);
  const foundContract = await prisma.contractTemplateMaster.findUnique({ where: { template: 'AMC-TEST-001' } });
  if (!foundContract) throw new Error('MST-19 Read failed');
  console.log('MST-19 Read: successfully found record');
  await prisma.contractTemplateMaster.delete({ where: { template: 'AMC-TEST-001' } });
  console.log('MST-19 Delete: successfully deleted\n');

  // [3/5] MST-20: Relationship Stages / Reasons
  console.log('[3/5] Testing MST-20 (Relationship Stages)...');
  const stage = await prisma.relationshipStageMaster.create({
    data: {
      code: 'STG-TEST-001',
      description: 'Active contract customer under full AMC',
      listType: 'Relationship Stage',
      appliesTo: 'All Customer Accounts',
      active: 'Yes',
      status: 'Active',
    },
  });
  console.log('MST-20 Create: code =', stage.code);
  const foundStage = await prisma.relationshipStageMaster.findUnique({ where: { code: 'STG-TEST-001' } });
  if (!foundStage) throw new Error('MST-20 Read failed');
  console.log('MST-20 Read: successfully found record');
  await prisma.relationshipStageMaster.delete({ where: { code: 'STG-TEST-001' } });
  console.log('MST-20 Delete: successfully deleted\n');

  // [4/5] MST-21: Reminder Rules
  console.log('[4/5] Testing MST-21 (Reminder Rules)...');
  const reminder = await prisma.reminderRuleMaster.create({
    data: {
      ruleCode: 'REM-TEST-001',
      reminderType: 'AMC Renewal Notice',
      customerCategory: 'All Customers',
      leadDays: 30,
      maxReminders: 3,
      intervalDays: 7,
      channel: 'SMS + WhatsApp',
      consentRequired: 'Yes',
      status: 'Active',
    },
  });
  console.log('MST-21 Create: ruleCode =', reminder.ruleCode);
  const foundReminder = await prisma.reminderRuleMaster.findUnique({ where: { ruleCode: 'REM-TEST-001' } });
  if (!foundReminder) throw new Error('MST-21 Read failed');
  console.log('MST-21 Read: successfully found record');
  await prisma.reminderRuleMaster.delete({ where: { ruleCode: 'REM-TEST-001' } });
  console.log('MST-21 Delete: successfully deleted\n');

  // [5/5] MST-22: Notification Templates
  console.log('[5/5] Testing MST-22 (Notification Templates)...');
  const ntf = await prisma.notificationTemplateMaster.create({
    data: {
      templateId: 'NTF-TEST-001',
      name: 'Service Booking Confirmation Test',
      channel: 'SMS (160 Chars)',
      language: 'English',
      body: 'Your service visit is booked for {Customer}.',
      active: 'Yes',
      status: 'Active',
    },
  });
  console.log('MST-22 Create: templateId =', ntf.templateId);
  const foundNtf = await prisma.notificationTemplateMaster.findUnique({ where: { templateId: 'NTF-TEST-001' } });
  if (!foundNtf) throw new Error('MST-22 Read failed');
  console.log('MST-22 Read: successfully found record');
  await prisma.notificationTemplateMaster.delete({ where: { templateId: 'NTF-TEST-001' } });
  console.log('MST-22 Delete: successfully deleted\n');

  console.log('--- ALL BATCH 3 (MST-18 TO MST-22) CRUD TESTS PASSED 100%! ---');
}

testBatch3Crud()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

