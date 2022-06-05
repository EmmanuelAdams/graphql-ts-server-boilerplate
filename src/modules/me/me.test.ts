import { createTypeormConn } from '../../utils/createTypeormConn';
import { User } from '../../entity/User';
import { DataSource } from 'typeorm';
import { TestClient } from '../../utils/TestClient';

let userId: string;
let conn: DataSource;
const email = 'bob5@bob.com';
const password = 'jlkajoioiqwe';

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
  conn.close();
});

describe('me', () => {
  test('return null if no cookie', async () => {
    const client = new TestClient(
      process.env.TEST_HOST as string
    );
    const response = await client.me();
    expect(response.data);
  });

  test('get current user', async () => {
    const client = new TestClient(
      process.env.TEST_HOST as string
    );
    await client.login(email, password);
    const response = await client.me();

    expect(response.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});
