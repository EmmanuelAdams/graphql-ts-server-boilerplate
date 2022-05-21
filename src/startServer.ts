import { GraphQLServer } from 'graphql-yoga';
import { redis } from './redis';
import * as session from 'express-session';
import * as connectRedis from 'connect-redis';

import { createTypeormConn } from './utils/createTypeormConn';
import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';

const SESSION_SECRET = 'sdjaldsiasdk';
const RedisStore = connectRedis(session);

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host'),
      session: request.session,
    }),
  });

  server.express.use(
    session({
      store: new RedisStore({
        client: redis as any,
      }),
      name: 'qid',
      secret: SESSION_SECRET,
      resave: false,
      saveUninitialized: false,
      cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        maxAge: 1000 * 60 * 60 * 24 * 7, // 7 days
      },
    })
  );

  const cors = {
    credentials: true,
    origin:
      process.env.NODE_ENV === 'test'
        ? '*'
        : (process.env.FRONTEND_HOST as string),
  };

  server.express.get('/confirm/:id', confirmEmail);

  await createTypeormConn();
  const port = process.env.PORT || 4000;
  const app = await server.start({
    cors,
  });
  console.log(`🛡  Server listening on port: ${port} 🛡`);

  return app;
};
