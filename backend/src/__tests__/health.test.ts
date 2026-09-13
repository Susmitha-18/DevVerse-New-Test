/**
 * Backend Health Endpoint & Database Readiness Test Suite
 */

import request from 'supertest';
import { app } from '../app';

interface HealthResponse {
  status: string;
  data: {
    backend: string;
    database: { connected: boolean; state: string };
  };
}

describe('Backend Health & Database Readiness API', () => {
  it('GET /health should return 200 with structured readiness status', async () => {
    const res = await request(app).get('/health');
    const body = res.body as HealthResponse;

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data).toBeDefined();
    expect(body.data.backend).toBe('ready');
    expect(body.data.database).toBeDefined();
    expect(typeof body.data.database.connected).toBe('boolean');
    expect(typeof body.data.database.state).toBe('string');
  });

  it('GET /api/v1/health should return identical structured readiness status', async () => {
    const res = await request(app).get('/api/v1/health');
    const body = res.body as HealthResponse;

    expect(res.status).toBe(200);
    expect(body.status).toBe('success');
    expect(body.data.backend).toBe('ready');
  });

  it('POST /api/v1/auth/refresh without refresh cookie should return 401 Unauthorized (not 500)', async () => {
    const res = await request(app).post('/api/v1/auth/refresh');
    const body = res.body as { success: boolean; message: string };
    expect(res.status).toBe(401);
    expect(body.success).toBe(false);
    expect(body.message).toContain('Session expired');
  });
});
