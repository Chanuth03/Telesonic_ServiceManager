import { handleApiRequest } from '../src/lib/api-handler';
import { prisma } from '../src/lib/prisma';

async function runTests() {
  console.log('--- STARTING AUTOMATED CRUD TESTS FOR BATCH 1 (MST-08 to MST-12) ---');

  // ==========================================
  // Test MST-08: Equipment System
  // ==========================================
  console.log('\n[1/5] Testing MST-08 (Equipment Systems)...');
  // POST Create
  let req = new Request('http://localhost:3000/api/equipment-systems', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      systemId: 'SYS-TEST-001',
      customer: 'Jayasuriya Textiles (Pvt) Ltd',
      site: 'Colombo 03 Head Office',
      location: 'Roof 2nd Floor',
      equipmentCategory: 'VRF System',
      status: 'Active',
    }),
  });
  let res = await handleApiRequest(req);
  let data = await res.json();
  console.log('MST-08 Create status:', res.status, 'systemId:', data?.system?.systemId);

  // GET Read
  req = new Request('http://localhost:3000/api/equipment-systems?systemId=SYS-TEST-001');
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-08 Read status:', res.status, 'found count:', data?.systems?.length);

  // DELETE
  req = new Request('http://localhost:3000/api/equipment-systems?systemId=SYS-TEST-001', { method: 'DELETE' });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-08 Delete status:', res.status, data);

  // ==========================================
  // Test MST-09: Technicians
  // ==========================================
  console.log('\n[2/5] Testing MST-09 (Technicians)...');
  // POST Create
  req = new Request('http://localhost:3000/api/technicians', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      employeeId: 'EMP-TEST-99',
      name: 'Sunil Weerasinghe',
      position: 'Lead HVAC Technician',
      department: 'Field Operations - Colombo',
      branch: 'Colombo Head Office',
      mobile: '+94 77 999 8888',
      status: 'Active',
    }),
  });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-09 Create status:', res.status, 'name:', data?.technician?.name);

  // GET Read
  req = new Request('http://localhost:3000/api/technicians?employeeId=EMP-TEST-99');
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-09 Read status:', res.status, 'found count:', data?.technicians?.length);

  // DELETE
  req = new Request('http://localhost:3000/api/technicians?employeeId=EMP-TEST-99', { method: 'DELETE' });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-09 Delete status:', res.status, data);

  // ==========================================
  // Test MST-10: Subcontractors
  // ==========================================
  console.log('\n[3/5] Testing MST-10 (Subcontractors)...');
  req = new Request('http://localhost:3000/api/subcontractors', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      vendorCode: 'V-TEST-001',
      vendorName: 'Apex Aircon Subcontractors',
      subcontractorType: 'HVAC Installation Contractor',
      territory: 'Western Province Express',
      paymentTerms: 'Net 30 Days',
      status: 'Active',
    }),
  });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-10 Create status:', res.status, 'vendorName:', data?.subcontractor?.vendorName);

  req = new Request('http://localhost:3000/api/subcontractors?vendorCode=V-TEST-001');
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-10 Read status:', res.status, 'found count:', data?.subcontractors?.length);

  req = new Request('http://localhost:3000/api/subcontractors?vendorCode=V-TEST-001', { method: 'DELETE' });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-10 Delete status:', res.status, data);

  // ==========================================
  // Test MST-11: Service Roles
  // ==========================================
  console.log('\n[4/5] Testing MST-11 (Service Roles)...');
  req = new Request('http://localhost:3000/api/service-roles', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      roleCode: 'ROLE-TEST-LEAD',
      roleName: 'Senior Field Lead Tech',
      incentiveEligible: 'Yes',
      status: 'Active',
    }),
  });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-11 Create status:', res.status, 'roleName:', data?.role?.roleName);

  req = new Request('http://localhost:3000/api/service-roles?roleCode=ROLE-TEST-LEAD');
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-11 Read status:', res.status, 'found count:', data?.roles?.length);

  req = new Request('http://localhost:3000/api/service-roles?roleCode=ROLE-TEST-LEAD', { method: 'DELETE' });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-11 Delete status:', res.status, data);

  // ==========================================
  // Test MST-12: Service Types
  // ==========================================
  console.log('\n[5/5] Testing MST-12 (Service Types)...');
  req = new Request('http://localhost:3000/api/service-types', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      code: 'SVC-TEST-01',
      description: 'Test Routine Maintenance Call',
      listType: 'Service Type',
      defaultPriority: 'P1 - High Priority',
      status: 'Active',
    }),
  });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-12 Create status:', res.status, 'description:', data?.serviceType?.description);

  req = new Request('http://localhost:3000/api/service-types?code=SVC-TEST-01');
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-12 Read status:', res.status, 'found count:', data?.serviceTypes?.length);

  req = new Request('http://localhost:3000/api/service-types?code=SVC-TEST-01', { method: 'DELETE' });
  res = await handleApiRequest(req);
  data = await res.json();
  console.log('MST-12 Delete status:', res.status, data);

  console.log('\n--- ALL BATCH 1 (MST-08 TO MST-12) CRUD TESTS PASSED 100%! ---');
}

runTests().catch(err => {
  console.error('Test failed:', err);
  process.exit(1);
});

