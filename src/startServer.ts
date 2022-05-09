import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import * as Redis from 'ioredis';
import { createTypeormConn } from './utils/createTypeormConn';

import { User } from './entity/User';

import {
  mergeSchemas,
  makeExecutableSchema,
} from '@graphql-tools/schema';

import { GraphQLServer } from 'graphql-yoga';
import { GraphQLSchema } from 'graphql';

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
  const port = process.env.PORT || 4000;
  const app = server.start(() =>
    console.log(`🛡  Server listening on port: ${port} 🛡`)
  );

  return app;
};