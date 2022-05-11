import fetch from 'node-fetch';
import { DataSource } from 'typeorm';

import { createConfirmEmailLink } from './createConfirmEmailLink';
import { createTypeormConn } from './createTypeormConn';
import { User } from '../entity/User';
import { redis } from '../redis';

let userId = '';

let conn: DataSource;

beforeAll(async () => {
  conn = await createTypeormConn();
  const user = await User.create({
    email: 'emmyy@boby.com',
    password: '1234566',
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.destroy();
});

test('Make sure it confirms user and clears key in redis', async () => {
  const url = await createConfirmEmailLink(
    process.env.TEST_HOST as string,
    userId,
    redis
  );

  const response = await fetch(url);
  const text = await response.text();
  expect(text).toEqual('ok');
  const user = await User.findOne({
    where: { id: userId },
  });
  expect((user as User).confirmed).toBeTruthy();
  const chunks = url.split('/');
  const key = chunks[chunks.length - 1];
  const value = await redis.get(key);
  expect(value).toBeNull();
});
