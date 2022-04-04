import 'reflect-metadata';
import { importSchema } from 'graphql-import';
import { resolvers } from './resolvers';
import { GraphQLServer } from '@paulxuca/graphql-yoga';
// import { AppDataSource } from './data-source';
import * as path from 'path';
import { createTypeormConn } from './utils/createTypeormConn';

export const startServer = async () => {
  const typeDefs = importSchema(
    path.join(__dirname, './schema.graphql')
  );

  const server = new GraphQLServer({ typeDefs, resolvers });
  // await AppDataSource.initialize();
  await createTypeormConn();
  await server.start();
  console.log('Server is running on localhost:4000');
};

startServer();
