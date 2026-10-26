import { handleApiRequest } from '../src/lib/api-handler';
import { prisma } from '../src/lib/prisma';

async function testMst7Flow() {
  console.log('--- TESTING MST-07 EXACT FLOW ---');

  // 1. Check existing rows
  let rows = await prisma.otherBrandEquipment.findMany();
  console.log('Initial DB rows in other_brand_equipments:', rows.map(r => ({ id: r.id, equipmentId: r.equipmentId })));

  // 2. Insert test equipment
  const createReq = new Request('http://localhost:3000/api/other-brand-equipments', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      equipmentId: 'EQ-TEST-DELETE-999',
      customer: 'Jayasuriya Textiles (Pvt) Ltd',
      site: 'Colombo 03 Head Office',
      equipmentCategory: 'Air Conditioning',
      brand: 'Samsung',
      model: 'INV-123',
    }),
  });
  const createRes = await handleApiRequest(createReq);
  const createData = await createRes.json();
  console.log('Created record:', createRes.status, createData.equipment?.equipmentId, 'id:', createData.equipment?.id);

  // 3. Delete by ID
  const delReq = new Request(`http://localhost:3000/api/other-brand-equipments?id=${createData.equipment.id}`, {
    method: 'DELETE',
  });
  const delRes = await handleApiRequest(delReq);
  const delData = await delRes.json();
  console.log('Deleted by ID result:', delRes.status, delData);

  // 4. Verify from DB
  const check = await prisma.otherBrandEquipment.findUnique({ where: { id: createData.equipment.id } });
  console.log('Is record still in DB after delete?:', check !== null ? 'YES (FAILED)' : 'NO (SUCCESSFULLY DELETED)');

  // 5. Test deleting the row with equipmentId 'qdwf' which the user saw
  const delUserRow = new Request(`http://localhost:3000/api/other-brand-equipments?equipmentId=qdwf`, {
    method: 'DELETE',
  });
  const delUserRes = await handleApiRequest(delUserRow);
  console.log('Deleted user row qdwf:', delUserRes.status);

  rows = await prisma.otherBrandEquipment.findMany();
  console.log('Final DB rows in other_brand_equipments:', rows.map(r => ({ id: r.id, equipmentId: r.equipmentId })));
}

testMst7Flow().catch(console.error);

