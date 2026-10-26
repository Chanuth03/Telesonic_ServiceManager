import { handleApiRequest } from '../src/lib/api-handler';

async function testDelete() {
  const req = new Request('http://localhost:3000/api/other-brand-equipments?equipmentId=testeqotherbrand001', {
    method: 'DELETE',
  });
  const res = await handleApiRequest(req);
  const data = await res.json();
  console.log('Delete response:', res.status, data);
}
testDelete().catch(console.error);

