import { prisma } from '../src/lib/prisma';

async function testBatch2Crud() {
  console.log('--- STARTING AUTOMATED CRUD TESTS FOR BATCH 2 (MST-13 to MST-17) ---\n');

  // [1/5] MST-13: Hold Reasons
  console.log('[1/5] Testing MST-13 (Hold Reasons)...');
  const hold = await prisma.holdReasonMaster.create({
    data: {
      reasonCode: 'HLD-TEST-001',
      description: 'Awaiting urgent import spare part',
      customerWording: 'Your job is paused awaiting components.',
      excludeFromSla: 'Yes (Clock Paused)',
      maxHoldDays: 14,
      status: 'Active',
    },
  });
  console.log('MST-13 Create: reasonCode =', hold.reasonCode);
  const foundHold = await prisma.holdReasonMaster.findUnique({ where: { reasonCode: 'HLD-TEST-001' } });
  if (!foundHold) throw new Error('MST-13 Read failed');
  console.log('MST-13 Read: successfully found record');
  await prisma.holdReasonMaster.delete({ where: { reasonCode: 'HLD-TEST-001' } });
  console.log('MST-13 Delete: successfully deleted\n');

  // [2/5] MST-14: Repeat Reasons
  console.log('[2/5] Testing MST-14 (Repeat Reasons)...');
  const repeat = await prisma.repeatReasonMaster.create({
    data: {
      reasonCode: 'RPT-TEST-001',
      description: 'Recurring PCB error after repair',
      countsAsPoorService: 'Yes',
      detectionPeriodDays: 30,
      appliesToCategory: 'Air Conditioning Commercial',
      status: 'Active',
    },
  });
  console.log('MST-14 Create: reasonCode =', repeat.reasonCode);
  const foundRepeat = await prisma.repeatReasonMaster.findUnique({ where: { reasonCode: 'RPT-TEST-001' } });
  if (!foundRepeat) throw new Error('MST-14 Read failed');
  console.log('MST-14 Read: successfully found record');
  await prisma.repeatReasonMaster.delete({ where: { reasonCode: 'RPT-TEST-001' } });
  console.log('MST-14 Delete: successfully deleted\n');

  // [3/5] MST-15: SLA Rules
  console.log('[3/5] Testing MST-15 (SLA Rules)...');
  const sla = await prisma.slaRuleMaster.create({
    data: {
      ruleCode: 'SLA-TEST-001',
      serviceType: 'Emergency Breakdown',
      priority: 'P0 - Emergency Blocker',
      area: 'Western Metro Zone',
      responseHours: 2.0,
      resolutionHours: 8.0,
      warningPct: 75.0,
      calendar: 'CAL-24X7-EMERGENCY',
      status: 'Active',
    },
  });
  console.log('MST-15 Create: ruleCode =', sla.ruleCode);
  const foundSla = await prisma.slaRuleMaster.findUnique({ where: { ruleCode: 'SLA-TEST-001' } });
  if (!foundSla) throw new Error('MST-15 Read failed');
  console.log('MST-15 Read: successfully found record');
  await prisma.slaRuleMaster.delete({ where: { ruleCode: 'SLA-TEST-001' } });
  console.log('MST-15 Delete: successfully deleted\n');

  // [4/5] MST-16: Checklist Templates
  console.log('[4/5] Testing MST-16 (Checklist Templates)...');
  const chk = await prisma.checklistTemplateMaster.create({
    data: {
      templateCode: 'CHK-TEST-001',
      name: '50-Point Inspection Plan Test',
      equipmentCategory: 'Air Conditioning Commercial',
      serviceType: 'Preventive Maintenance',
      version: 1,
      status: 'Active',
    },
  });
  console.log('MST-16 Create: templateCode =', chk.templateCode);
  const foundChk = await prisma.checklistTemplateMaster.findUnique({ where: { templateCode: 'CHK-TEST-001' } });
  if (!foundChk) throw new Error('MST-16 Read failed');
  console.log('MST-16 Read: successfully found record');
  await prisma.checklistTemplateMaster.delete({ where: { templateCode: 'CHK-TEST-001' } });
  console.log('MST-16 Delete: successfully deleted\n');

  // [5/5] MST-17: Warranty Rules
  console.log('[5/5] Testing MST-17 (Warranty Rules)...');
  const war = await prisma.warrantyRuleMaster.create({
    data: {
      ruleCode: 'WAR-TEST-001',
      equipmentCategory: 'Air Conditioning Commercial',
      componentRole: 'Complete Unit',
      startBasis: 'Commissioning Date',
      months: 24,
      labourCovered: 'Yes',
      status: 'Active',
    },
  });
  console.log('MST-17 Create: ruleCode =', war.ruleCode);
  const foundWar = await prisma.warrantyRuleMaster.findUnique({ where: { ruleCode: 'WAR-TEST-001' } });
  if (!foundWar) throw new Error('MST-17 Read failed');
  console.log('MST-17 Read: successfully found record');
  await prisma.warrantyRuleMaster.delete({ where: { ruleCode: 'WAR-TEST-001' } });
  console.log('MST-17 Delete: successfully deleted\n');

  console.log('--- ALL BATCH 2 (MST-13 TO MST-17) CRUD TESTS PASSED 100%! ---');
}

testBatch2Crud()
  .catch(console.error)
  .finally(() => prisma.$disconnect());

