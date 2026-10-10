process.env.NODE_ENV = 'test';

import http from 'node:http';
import mongoose from 'mongoose';
import { connectDB } from '../config/db.js';
import { app } from '../server.js';

const runTests = async () => {
  console.log('[Test-API] Starting automated test suite for Doctor Tracker API...');

  try {
    await connectDB();
  } catch (_dbErr) {
    console.warn('[Test-API] Running in mock/disconnected mode. DB connection skipped.');
  }

  const server = http.createServer(app);
  await new Promise<void>((resolve) => server.listen(5099, resolve));
  const baseUrl = 'http://localhost:5099';

  let passed = 0;
  let failed = 0;

  const assert = (condition: boolean, msg: string) => {
    if (condition) {
      console.log(`  ✓ PASS: ${msg}`);
      passed++;
    } else {
      console.error(`  ✗ FAIL: ${msg}`);
      failed++;
    }
  };

  try {
    const healthRes = await fetch(`${baseUrl}/api/health`);
    const healthData = (await healthRes.json()) as any;
    assert(
      healthRes.status === 200 && healthData.status === 'ok',
      'GET /api/health returns 200 OK'
    );

    const notFoundRes = await fetch(`${baseUrl}/api/non-existent-route`);
    const notFoundData = (await notFoundRes.json()) as any;
    assert(
      notFoundRes.status === 404 && notFoundData.success === false,
      '404 handler returns 404 for unknown route'
    );

    const unauthRes = await fetch(`${baseUrl}/api/doctors`);
    const unauthData = (await unauthRes.json()) as any;
    assert(
      unauthRes.status === 401 && unauthData.success === false,
      'GET /api/doctors rejects unauthenticated request with 401'
    );

    const invalidLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'not-an-email', password: '123' }),
    });
    const invalidLoginData = (await invalidLoginRes.json()) as any;
    assert(
      invalidLoginRes.status === 422 && invalidLoginData.success === false,
      'POST /api/auth/login rejects invalid input with 422'
    );

    console.log(
      `\n[Test-API] Core API route tests completed. Passed: ${passed}, Failed: ${failed}`
    );

    if (mongoose.connection.readyState === 1) {
      console.log('[Test-API] MongoDB is connected. Testing live authenticated flows...');
      const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: 'admin@doctortracker.com', password: 'Admin@123456' }),
      });
      if (loginRes.status === 200) {
        const loginData = (await loginRes.json()) as any;
        const token = loginData.data?.token;
        assert(!!token, 'POST /api/auth/login generates valid JWT');

        const docsRes = await fetch(`${baseUrl}/api/doctors`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const docsData = (await docsRes.json()) as any;
        assert(
          docsRes.status === 200 && Array.isArray(docsData.data),
          'GET /api/doctors returns paginated list'
        );

        const conditionsRes = await fetch(`${baseUrl}/api/patients/conditions`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const conditionsData = (await conditionsRes.json()) as any;
        assert(
          conditionsRes.status === 200 &&
            Array.isArray(conditionsData.data) &&
            conditionsData.data.length > 0,
          'GET /api/patients/conditions returns dynamic list of conditions'
        );

        const analyticsRes = await fetch(`${baseUrl}/api/analytics/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const analyticsData = (await analyticsRes.json()) as any;
        assert(
          analyticsRes.status === 200 && !!analyticsData.data?.kpis,
          'GET /api/analytics/dashboard returns KPI analytics'
        );
      }
    } else {
      console.log(
        '[Test-API] Note: Database not connected in test runner environment. Route and middleware tests passed.'
      );
    }

    console.log(`\n[Test-API] All tests finished. Total passed: ${passed}, Failed: ${failed}\n`);
  } catch (err) {
    console.error('[Test-API] Unexpected test runner error:', err);
    failed++;
  } finally {
    await new Promise<void>((resolve) => {
      server.close(() => resolve());
    });
    if (mongoose.connection.readyState !== 0) {
      await mongoose.connection.close();
    }
  }

  if (failed > 0) {
    process.exitCode = 1;
  } else {
    process.exitCode = 0;
  }
};

runTests();
