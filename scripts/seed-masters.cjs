const { PrismaClient } = require('@prisma/client');
const { MASTER_SCREENS_LIST } = require('../src/data/mastersSpecData.ts');

const prisma = new PrismaClient();

async function seedMasters() {
  console.log('Seeding initial master sample records into master_records table...');
  let count = 0;

  for (const screen of MASTER_SCREENS_LIST) {
    // Only seed MST-01 through MST-31 (MST-32 and MST-33 have dedicated tables system_roles and users)
    if (screen.code === 'MST-32' || screen.code === 'MST-33') continue;

    if (screen.sampleRecord && screen.fields.length > 0) {
      const primaryKeyField = screen.fields[0].key;
      const recordKey = String(screen.sampleRecord[primaryKeyField] || `${screen.code}-SAMPLE-01`).trim();
      
      const payload = {
        ...screen.sampleRecord,
        status: screen.sampleRecord.status || 'Active',
      };

      await prisma.masterRecord.upsert({
        where: {
          screenCode_recordKey: {
            screenCode: screen.code,
            recordKey: recordKey,
          }
        },
        create: {
          screenCode: screen.code,
          recordKey: recordKey,
          data: payload,
          status: String(payload.status || 'Active'),
        },
        update: {
          data: payload,
          status: String(payload.status || 'Active'),
        }
      });
      count++;
    }
  }

  console.log(`Successfully seeded ${count} master screens into PostgreSQL!`);
}

seedMasters()
  .catch(e => {
    console.error('Seed error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

