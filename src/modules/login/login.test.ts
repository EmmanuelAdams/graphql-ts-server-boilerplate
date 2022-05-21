import { request } from 'graphql-request';
import { Connection } from 'typeorm';
import { User } from '../../entity/User';
import { createTypeormConn } from '../../utils/createTypeormConn';
import {
  confirmEmailError,
  invalidLogin,
} from './errorMessages';

const email = 'emmyy@boby.com';
const password = '1234566';

const registerMutation = (e: string, p: string) => `
mutation {
  register(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

let conn: Connection;
beforeAll(async () => {
  conn = await createTypeormConn();
});
afterAll(async () => {
  conn.destroy;
});

const loginExpectError = async (
  e: string,
  p: string,
  errMsg: string
) => {
  const response = await request(
    process.env.TEST_HOST as string,
    loginMutation(e, p)
  );

  expect(response).toEqual({
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
    await loginExpectError(
      'emmyy@boby.com',
      'whatever',
      invalidLogin
    );
  });

  test('email not confirmed', async () => {
    await request(
      process.env.TEST_HOST as string,
      registerMutation(email, password)
    );

    await loginExpectError(
      email,
      password,
      confirmEmailError
    );

    await User.update({ email }, { confirmed: true });

    await loginExpectError(
      email,
      'yfkufkuyf',
      invalidLogin
    );

    const response = await request(
      process.env.TEST_HOST as string,
      loginMutation(email, password)
    );

    expect(response).toEqual({ login: null });
  });
});
