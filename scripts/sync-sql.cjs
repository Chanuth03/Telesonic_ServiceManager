const fs = require('fs');
let sql = fs.readFileSync('prisma/init-database.sql', 'utf8');

const tableSql = `
-- CreateTable master_records (For all Master screens MST-01 to MST-31)
CREATE TABLE IF NOT EXISTS "master_records" (
    "id" SERIAL NOT NULL,
    "screenCode" TEXT NOT NULL,
    "recordKey" TEXT NOT NULL,
    "data" JSONB NOT NULL,
    "status" TEXT NOT NULL DEFAULT 'Active',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "master_records_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "master_records_screenCode_recordKey_key" ON "master_records"("screenCode", "recordKey");
CREATE INDEX IF NOT EXISTS "master_records_screenCode_idx" ON "master_records"("screenCode");
`;

if (!sql.includes('master_records')) {
  sql += '\n' + tableSql;
  fs.writeFileSync('prisma/init-database.sql', sql, 'utf8');
  console.log('init-database.sql updated with master_records table');
} else {
  console.log('master_records already exists in init-database.sql');
}

