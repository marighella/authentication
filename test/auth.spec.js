import test from 'ava';
import request from 'supertest';
import jwt from 'jsonwebtoken';
import app from '../lib/app';

test('auth:Success', async t => {
  t.plan(1);
  process.env.SECRET_JWT = 'random_string';
  const res = await request(app())
    .get('/?code=685342281f0d09fdd38e')
    .send();


  const token = res.headers['authorization'].split(' ')[1];
  jwt.verify(token, process.env.SECRET_JWT)

  t.is(res.status, 200);
});
