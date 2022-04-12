import { importSchema } from 'graphql-import';
import * as path from 'path';
import * as fs from 'fs';
import { makeExecutableSchema } from '@graphql-tools/schema';
import { GraphQLSchema } from 'graphql';

import { createTypeormConn } from './utils/createTypeormConn';
import { mergeSchemas } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server';

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

  const server = new ApolloServer({
    schema: mergeSchemas({ schemas }),
  });
  await createTypeormConn();
  const port = process.env.PORT || 4000;
  const app = server.listen(port, () =>
    console.log(`🛡  Server listening on port: ${port} 🛡`)
  );

  return app;
};
