import 'reflect-metadata';
import { importSchema } from 'graphql-import';
import { resolvers } from './resolvers';
import { GraphQLServer } from '@paulxuca/graphql-yoga';
import { AppDataSource } from './data-source';
import * as path from 'path';

// const { createServer } = require('@graphql-yoga/node');
const typeDefs = importSchema(
  path.join(__dirname, './schema.graphql')
);

// const server = createServer({ typeDefs, resolvers });
const server = new GraphQLServer({ typeDefs, resolvers });
AppDataSource.initialize().then(async () => {
  server.start(() =>
    console.log('Server is running on localhost:4000')
  );
});
