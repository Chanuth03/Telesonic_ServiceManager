import { handleApiRequest } from '../src/lib/api-handler';

async function testBatch4() {
  console.log('--- STARTING AUTOMATED CRUD TESTS FOR BATCH 4 (MST-23 to MST-31) ---\n');

  // 1. MST-23: Project Budget
  console.log('[1/9] Testing MST-23 (Project and G/L Budget)...');
  const postRes23 = await handleApiRequest(new Request('http://localhost/api/project-budgets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      projectCode: 'PRJ-TEST-001',
      projectName: 'Test Chiller Project',
      customer: 'Test Customer PLC',
      projectManager: 'Eng. Perera',
      budgetVersion: 1,
      status: 'Active',
    }),
  }));
  const postData23 = await postRes23.json();
  if (!postData23.success) throw new Error('MST-23 POST failed: ' + JSON.stringify(postData23));
  console.log('MST-23 Create: projectCode =', postData23.budget.projectCode);

  const getRes23 = await handleApiRequest(new Request('http://localhost/api/project-budgets?projectCode=PRJ-TEST-001', { method: 'GET' }));
  const getData23 = await getRes23.json();
  if (!getData23.budgets || getData23.budgets.length === 0) throw new Error('MST-23 GET failed');
  console.log('MST-23 Read: successfully found record');

  const delRes23 = await handleApiRequest(new Request('http://localhost/api/project-budgets?projectCode=PRJ-TEST-001', { method: 'DELETE' }));
  const delData23 = await delRes23.json();
  if (!delData23.success) throw new Error('MST-23 DELETE failed: ' + JSON.stringify(delData23));
  console.log('MST-23 Delete: successfully deleted\n');

  // 2. MST-24: Cost Element Mapping
  console.log('[2/9] Testing MST-24 (Cost Element / G/L Mapping)...');
  const postRes24 = await handleApiRequest(new Request('http://localhost/api/cost-element-mappings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      costElement: 'Test Parts Consumed',
      description: 'Test spare parts mapping',
      glAccount: '410100 - Inventory COGS',
      revenueCost: 'Expense',
      requiresCallRef: 'Yes',
      status: 'Active',
    }),
  }));
  const postData24 = await postRes24.json();
  if (!postData24.success) throw new Error('MST-24 POST failed: ' + JSON.stringify(postData24));
  console.log('MST-24 Create: costElement =', postData24.mapping.costElement);

  const getRes24 = await handleApiRequest(new Request('http://localhost/api/cost-element-mappings?costElement=Test%20Parts%20Consumed', { method: 'GET' }));
  const getData24 = await getRes24.json();
  if (!getData24.mappings || getData24.mappings.length === 0) throw new Error('MST-24 GET failed');
  console.log('MST-24 Read: successfully found record');

  const delRes24 = await handleApiRequest(new Request('http://localhost/api/cost-element-mappings?costElement=Test%20Parts%20Consumed', { method: 'DELETE' }));
  const delData24 = await delRes24.json();
  if (!delData24.success) throw new Error('MST-24 DELETE failed: ' + JSON.stringify(delData24));
  console.log('MST-24 Delete: successfully deleted\n');

  // 3. MST-25: Labour Rates
  console.log('[3/9] Testing MST-25 (Labour Rates)...');
  const postRes25 = await handleApiRequest(new Request('http://localhost/api/labour-rates', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      rateCode: 'RATE-TEST-001',
      technicianType: 'Lead SRE Engineer',
      normalRate: 3500.0,
      overtimeRate: 5000.0,
      subcontractRate: 4200.0,
      status: 'Active',
    }),
  }));
  const postData25 = await postRes25.json();
  if (!postData25.success) throw new Error('MST-25 POST failed: ' + JSON.stringify(postData25));
  console.log('MST-25 Create: rateCode =', postData25.rate.rateCode);

  const getRes25 = await handleApiRequest(new Request('http://localhost/api/labour-rates?rateCode=RATE-TEST-001', { method: 'GET' }));
  const getData25 = await getRes25.json();
  if (!getData25.rates || getData25.rates.length === 0) throw new Error('MST-25 GET failed');
  console.log('MST-25 Read: successfully found record');

  const delRes25 = await handleApiRequest(new Request('http://localhost/api/labour-rates?rateCode=RATE-TEST-001', { method: 'DELETE' }));
  const delData25 = await delRes25.json();
  if (!delData25.success) throw new Error('MST-25 DELETE failed: ' + JSON.stringify(delData25));
  console.log('MST-25 Delete: successfully deleted\n');

  // 4. MST-26: Franchise & Warehouse
  console.log('[4/9] Testing MST-26 (Franchise and Franchise Warehouse)...');
  const postRes26 = await handleApiRequest(new Request('http://localhost/api/franchise-warehouses', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      franchiseBp: 'BP-TEST-001',
      franchiseName: 'Galle Cooling Center',
      warehouse: 'FR-GAL-001',
      stockOwnership: 'Telesonic Consignment Stock',
      active: 'Yes',
      status: 'Active',
    }),
  }));
  const postData26 = await postRes26.json();
  if (!postData26.success) throw new Error('MST-26 POST failed: ' + JSON.stringify(postData26));
  console.log('MST-26 Create: franchiseBp =', postData26.warehouse.franchiseBp);

  const getRes26 = await handleApiRequest(new Request('http://localhost/api/franchise-warehouses?franchiseBp=BP-TEST-001', { method: 'GET' }));
  const getData26 = await getRes26.json();
  if (!getData26.warehouses || getData26.warehouses.length === 0) throw new Error('MST-26 GET failed');
  console.log('MST-26 Read: successfully found record');

  const delRes26 = await handleApiRequest(new Request('http://localhost/api/franchise-warehouses?franchiseBp=BP-TEST-001', { method: 'DELETE' }));
  const delData26 = await delRes26.json();
  if (!delData26.success) throw new Error('MST-26 DELETE failed: ' + JSON.stringify(delData26));
  console.log('MST-26 Delete: successfully deleted\n');

  // 5. MST-27: Deviation Reasons
  console.log('[5/9] Testing MST-27 (Deviation Reason Codes and Thresholds)...');
  const postRes27 = await handleApiRequest(new Request('http://localhost/api/deviation-reasons', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      reasonCode: 'DEV-TEST-001',
      description: 'Transit damage audit variance',
      recoverableFromFranchise: 'No (Telesonic Absorption)',
      qtyThreshold: 2,
      valueThresholdLkr: 25000.0,
      status: 'Active',
    }),
  }));
  const postData27 = await postRes27.json();
  if (!postData27.success) throw new Error('MST-27 POST failed: ' + JSON.stringify(postData27));
  console.log('MST-27 Create: reasonCode =', postData27.reason.reasonCode);

  const getRes27 = await handleApiRequest(new Request('http://localhost/api/deviation-reasons?reasonCode=DEV-TEST-001', { method: 'GET' }));
  const getData27 = await getRes27.json();
  if (!getData27.reasons || getData27.reasons.length === 0) throw new Error('MST-27 GET failed');
  console.log('MST-27 Read: successfully found record');

  const delRes27 = await handleApiRequest(new Request('http://localhost/api/deviation-reasons?reasonCode=DEV-TEST-001', { method: 'DELETE' }));
  const delData27 = await delRes27.json();
  if (!delData27.success) throw new Error('MST-27 DELETE failed: ' + JSON.stringify(delData27));
  console.log('MST-27 Delete: successfully deleted\n');

  // 6. MST-28: Export Permissions
  console.log('[6/9] Testing MST-28 (Export Permissions)...');
  const postRes28 = await handleApiRequest(new Request('http://localhost/api/export-permissions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      role: 'Service Coordinator',
      reportGrid: 'O1-RPT-TEST Daily Job Matrix',
      excel: 'Yes',
      pdf: 'Yes',
      rowLimit: 5000,
      status: 'Active',
    }),
  }));
  const postData28 = await postRes28.json();
  if (!postData28.success) throw new Error('MST-28 POST failed: ' + JSON.stringify(postData28));
  console.log('MST-28 Create: role & reportGrid =', postData28.permission.role, postData28.permission.reportGrid);

  const getRes28 = await handleApiRequest(new Request('http://localhost/api/export-permissions?role=Service%20Coordinator', { method: 'GET' }));
  const getData28 = await getRes28.json();
  if (!getData28.permissions || getData28.permissions.length === 0) throw new Error('MST-28 GET failed');
  console.log('MST-28 Read: successfully found record');

  const delRes28 = await handleApiRequest(new Request('http://localhost/api/export-permissions?id=' + postData28.permission.id, { method: 'DELETE' }));
  const delData28 = await delRes28.json();
  if (!delData28.success) throw new Error('MST-28 DELETE failed: ' + JSON.stringify(delData28));
  console.log('MST-28 Delete: successfully deleted\n');

  // 7. MST-29: Google Meet Settings
  console.log('[7/9] Testing MST-29 (Google Meet Settings)...');
  const postRes29 = await handleApiRequest(new Request('http://localhost/api/google-meet-settings', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      workspaceDomain: 'test.telesonic.lk',
      organiserAccount: 'meet.test@telesonic.lk',
      authMethod: 'Google Cloud Service Account JWT',
      defaultDuration: 30,
      enabled: 'Yes',
      status: 'Active',
    }),
  }));
  const postData29 = await postRes29.json();
  if (!postData29.success) throw new Error('MST-29 POST failed: ' + JSON.stringify(postData29));
  console.log('MST-29 Create: workspaceDomain =', postData29.setting.workspaceDomain);

  const getRes29 = await handleApiRequest(new Request('http://localhost/api/google-meet-settings?workspaceDomain=test.telesonic.lk', { method: 'GET' }));
  const getData29 = await getRes29.json();
  if (!getData29.settings || getData29.settings.length === 0) throw new Error('MST-29 GET failed');
  console.log('MST-29 Read: successfully found record');

  const delRes29 = await handleApiRequest(new Request('http://localhost/api/google-meet-settings?workspaceDomain=test.telesonic.lk', { method: 'DELETE' }));
  const delData29 = await delRes29.json();
  if (!delData29.success) throw new Error('MST-29 DELETE failed: ' + JSON.stringify(delData29));
  console.log('MST-29 Delete: successfully deleted\n');

  // 8. MST-30: Equipment Category Attributes
  console.log('[8/9] Testing MST-30 (Equipment Category Attributes)...');
  const postRes30 = await handleApiRequest(new Request('http://localhost/api/equipment-category-attributes', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      categoryCode: 'CAT-TEST-001',
      categoryName: 'Commercial Precision Chillers',
      industryGroup: 'HVAC & Climate Control',
      multiComponent: 'Yes',
      defaultInterval: 3,
      status: 'Active',
    }),
  }));
  const postData30 = await postRes30.json();
  if (!postData30.success) throw new Error('MST-30 POST failed: ' + JSON.stringify(postData30));
  console.log('MST-30 Create: categoryCode =', postData30.category.categoryCode);

  const getRes30 = await handleApiRequest(new Request('http://localhost/api/equipment-category-attributes?categoryCode=CAT-TEST-001', { method: 'GET' }));
  const getData30 = await getRes30.json();
  if (!getData30.categories || getData30.categories.length === 0) throw new Error('MST-30 GET failed');
  console.log('MST-30 Read: successfully found record');

  const delRes30 = await handleApiRequest(new Request('http://localhost/api/equipment-category-attributes?categoryCode=CAT-TEST-001', { method: 'DELETE' }));
  const delData30 = await delRes30.json();
  if (!delData30.success) throw new Error('MST-30 DELETE failed: ' + JSON.stringify(delData30));
  console.log('MST-30 Delete: successfully deleted\n');

  // 9. MST-31: Tools & Vehicles
  console.log('[9/9] Testing MST-31 (Tools, Tool Boxes and Vehicles)...');
  const postRes31 = await handleApiRequest(new Request('http://localhost/api/tool-vehicle-assets', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      assetId: 'ASSET-TEST-001',
      type: 'Service Van / Transport',
      description: 'Toyota HiAce Service Van #05',
      holder: 'K. Silva',
      vehicleRegNo: 'WP-CAS-9999',
      status: 'Available in Stores',
    }),
  }));
  const postData31 = await postRes31.json();
  if (!postData31.success) throw new Error('MST-31 POST failed: ' + JSON.stringify(postData31));
  console.log('MST-31 Create: assetId =', postData31.asset.assetId);

  const getRes31 = await handleApiRequest(new Request('http://localhost/api/tool-vehicle-assets?assetId=ASSET-TEST-001', { method: 'GET' }));
  const getData31 = await getRes31.json();
  if (!getData31.assets || getData31.assets.length === 0) throw new Error('MST-31 GET failed');
  console.log('MST-31 Read: successfully found record');

  const delRes31 = await handleApiRequest(new Request('http://localhost/api/tool-vehicle-assets?assetId=ASSET-TEST-001', { method: 'DELETE' }));
  const delData31 = await delRes31.json();
  if (!delData31.success) throw new Error('MST-31 DELETE failed: ' + JSON.stringify(delData31));
  console.log('MST-31 Delete: successfully deleted\n');

  console.log('--- ALL BATCH 4 (MST-23 TO MST-31) CRUD TESTS PASSED 100%! ---');
}

testBatch4()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('Test Failed:', err);
    process.exit(1);
  });

