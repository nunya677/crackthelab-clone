import { describe, expect, it } from 'vitest';
import request from 'supertest';
import { createApp } from '../app.js';

const app = createApp();

function uniqueUser() {
  const id = Math.random().toString(36).slice(2, 10);
  return { email: `test-${id}@example.com`, username: `user_${id}`, password: 'password123' };
}

describe('auth', () => {
  it('registers a new user and returns an access token', async () => {
    const user = uniqueUser();
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(201);
    expect(res.body.user.email).toBe(user.email);
    expect(typeof res.body.accessToken).toBe('string');
  });

  it('rejects duplicate registration', async () => {
    const user = uniqueUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app).post('/api/auth/register').send(user);
    expect(res.status).toBe(409);
  });

  it('rejects login with wrong password', async () => {
    const user = uniqueUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: 'wrong-password' });
    expect(res.status).toBe(401);
  });

  it('logs in with correct credentials', async () => {
    const user = uniqueUser();
    await request(app).post('/api/auth/register').send(user);
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: user.email, password: user.password });
    expect(res.status).toBe(200);
    expect(typeof res.body.accessToken).toBe('string');
  });
});
