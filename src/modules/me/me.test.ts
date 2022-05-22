import axios from 'axios';
import { DataSource } from 'typeorm';
import { User } from '../../entity/User';
import { createTypeormConn } from '../../utils/createTypeormConn';

let userId: string;
let conn: DataSource;
const email = 'emmyy@boby.com';
const password = '1234566';

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

const loginMutation = (e: string, p: string) => `
mutation {
  login(email: "${e}", password: "${p}") {
    path
    message
  }
}
`;

const meQuery = `
{
  me { 
    id
    email
  }
}`;

describe('me', () => {
  test('return null if no cookie', async () => {
    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      }
    );
    console.log(response.data);
    expect(response.data.data.me).toBeNull();
  });

  test('get current user', async () => {
    await axios.post(
      process.env.TEST_HOST as string,
      {
        query: loginMutation(email, password),
      },
      {
        withCredentials: true,
      }
    );

    const response = await axios.post(
      process.env.TEST_HOST as string,
      {
        query: meQuery,
      },
      {
        withCredentials: true,
      }
    );

    expect(response.data.data).toEqual({
      me: {
        id: userId,
        email,
      },
    });
  });
});
