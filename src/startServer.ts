import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';
import * as Redis from 'ioredis';

import { createTypeormConn } from './utils/createTypeormConn';
import { mergeSchemas } from '@graphql-tools/schema';
import { User } from './entity/User';
import { GraphQLServer } from '@paulxuca/graphql-yoga';

export const startServer = async () => {
  const schemas: GraphQLSchema[] = [];
  const folders = fs.readdirSync(
    path.join(__dirname, './modules')
  );
  folders.forEach((folder) => {
    const {
      resolvers,
    } = require(`./modules/${folder}/resolvers`);
    const typeDefs = importSchema(
      path.join(
        __dirname,
        `./modules/${folder}/schema.graphql`
      )
    );
    schemas.push(
      makeExecutableSchema({ resolvers, typeDefs })
    );
  });

  const redis = new Redis();

  const server = new GraphQLServer({
    schema: mergeSchemas({ schemas }),
    context: ({ request }) => ({
      redis,
      url: request.protocol + '://' + request.get('host'),
    }),
  });

  server.express.get('/confirm/:id', async (req, res) => {
    const { id } = req.params;
    const userId = await redis.get(id);
    if (userId) {
      await User.update(
        { id: userId },
        { confirmed: true }
      );
      res.send('ok');
    } else {
      res.send('invalid');
    }
  });

  await createTypeormConn();
  const app = server.start({
    port: process.env.NODE_ENV === 'test' ? 0 : 4000,
  });
  console.log(`🛡  Server listening on port: 4000 🛡`);

  return app;
};
