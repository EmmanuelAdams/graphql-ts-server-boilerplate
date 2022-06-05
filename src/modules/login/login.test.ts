import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createTypeormConn } from '../../utils/createTypeormConn';
import { TestClient } from '../../utils/TestClient';
import {
  confirmEmailError,
  invalidLogin,
} from './errorMessages';

const email = 'emmyy@boby.com';
const password = '1234566';

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeormConn();
});
afterAll(async () => {
  conn.destroy;
});

const loginExpectError = async (
  client: TestClient,
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await client.login(e, p);

  expect(response.data).toEqual({
    login: [
      {
        path: 'email',
        message: errMsg,
      },
    ],
  });
};

describe('login', () => {
  test('email not found send back error', async () => {
    const client = new TestClient(
      process.env.TEST_HOST as string
    );
    await loginExpectError(
      client,
      'emmyy@boby.com',
      'whatever',
      invalidLogin
    );
  });

  test('email not confirmed', async () => {
    const client = new TestClient(
      process.env.TEST_HOST as string
    );

    await client.register(email, password);

    await loginExpectError(
      client,
      email,
      password,
      confirmEmailError
    );

    await User.update({ email }, { confirmed: true });

    await loginExpectError(
      client,
      email,
      'yfkufkuyf',
      invalidLogin
    );

    const response = await client.login(email, password);

    expect(response.data).toEqual({ login: null });
  });
});
