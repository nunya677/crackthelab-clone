import { describe, expect, it, beforeAll } from 'vitest';
import request from 'supertest';
import { prisma } from '@crackthelab/db';
import { createApp } from '../app.js';

const app = createApp();

function uniqueUser() {
  const id = Math.random().toString(36).slice(2, 10);
  return { email: `test-${id}@example.com`, username: `user_${id}`, password: 'password123' };
}

async function registerAndGetToken() {
  const user = uniqueUser();
  const res = await request(app).post('/api/auth/register').send(user);
  return res.body.accessToken as string;
}

describe('challenges + submissions', () => {
  let caesarId: string;

  beforeAll(async () => {
    const challenge = await prisma.challenge.findUniqueOrThrow({
      where: { slug: 'caesar-cipher' },
    });
    caesarId = challenge.id;
  });

  it('lists challenges without requiring auth', async () => {
    const res = await request(app).get('/api/challenges');
    expect(res.status).toBe(200);
    expect(res.body.some((c: { slug: string }) => c.slug === 'caesar-cipher')).toBe(true);
  });

  it('rejects an incorrect flag without awarding points', async () => {
    const token = await registerAndGetToken();
    const res = await request(app)
      .post(`/api/challenges/${caesarId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flag: 'flag{definitely_wrong}' });
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ correct: false, alreadySolved: false, pointsAwarded: 0 });
  });

  it('accepts the correct flag once and awards points only the first time', async () => {
    const token = await registerAndGetToken();

    const first = await request(app)
      .post(`/api/challenges/${caesarId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flag: 'flag{rot13_is_not_encryption}' });
    expect(first.body).toEqual({ correct: true, alreadySolved: false, pointsAwarded: 50 });

    const second = await request(app)
      .post(`/api/challenges/${caesarId}/submit`)
      .set('Authorization', `Bearer ${token}`)
      .send({ flag: 'flag{rot13_is_not_encryption}' });
    expect(second.body).toEqual({ correct: true, alreadySolved: true, pointsAwarded: 0 });
  });

  it('rejects submission without auth', async () => {
    const res = await request(app)
      .post(`/api/challenges/${caesarId}/submit`)
      .send({ flag: 'flag{rot13_is_not_encryption}' });
    expect(res.status).toBe(401);
  });
});
