import { GraphQLServer } from 'graphql-yoga';
import { redis } from './redis';

import { createTypeormConn } from './utils/createTypeormConn';

import { confirmEmail } from './routes/confirmEmail';
import { genSchema } from './utils/genSchema';

export const startServer = async () => {
  const server = new GraphQLServer({
    schema: genSchema(),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host'),
    }),
  });

  server.express.get('/confirm/:id', confirmEmail);

  await createTypeormConn();
  const port = process.env.PORT || 4000;
  const app = server.start(() =>
    console.log(`🛡  Server listening on port: ${port} 🛡`)
  );

  return app;
};
