import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { TestClient } from '../../utils/TestClient';
import { createForgotPasswordLink } from '../../utils/createForgotPasswordLink';
import * as Redis from 'ioredis';
import { forgotPasswordLockAccount } from '../../utils/forgotPasswordLockAccount';
import { expiredKeyError } from './errorMessages';
import { forgotPasswordLockedError } from '../login/errorMessages';
import { passwordNotLongEnough } from '../register/errorMessages';

let conn: DataSource;
export const redis = new Redis();
const email = 'emmyy@boby.com';
const password = '1234566';
const newPassword = 'qowuieoiqwueoq';

let userId: string;
beforeAll(async () => {
  conn = await createTypeormConn();
  const user = await User.create({
    email,
    password,
    confirmed: true,
  }).save();
  userId = user.id;
});

afterAll(async () => {
  conn.destroy();
});

describe('forgot password', () => {
  test('make sure it works', async () => {
    const client = new TestClient(
      process.env.TEST_HOST as string
    );

    // lock account
    await forgotPasswordLockAccount(userId, redis);
    const url = await createForgotPasswordLink(
      '',
      userId,
      redis
    );

    const parts = url.split('/');
    const key = parts[parts.length - 1];

    // make sure you can't login to locked account
    expect(await client.login(email, password)).toEqual({
      data: {
        login: [
          {
            message: forgotPasswordLockedError,
            path: 'email',
          },
        ],
      },
    });

    // try changing to a password that's too short
    expect(
      await client.forgotPasswordChange('a', key)
    ).toEqual({
      data: {
        forgotPasswordChange: [
          {
            message: passwordNotLongEnough,
            path: 'newPassword',
          },
        ],
      },
    });

    const response = await client.forgotPasswordChange(
      newPassword,
      key
    );

    expect(response.data).toEqual({
      forgotPasswordChange: null,
    });

    // make sure redis key expires after password change
    expect(
      await client.forgotPasswordChange(
        'alksdjfalksdjfl',
        key
      )
    ).toEqual({
      data: {
        forgotPasswordChange: [
          {
            path: 'key',
            message: expiredKeyError,
          },
        ],
      },
    });

    expect(await client.login(email, newPassword)).toEqual({
      data: {
        login: null,
      },
    });
  });
});
