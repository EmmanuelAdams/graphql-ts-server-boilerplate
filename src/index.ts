import 'reflect-metadata';
import { importSchema } from 'graphql-import';
import { resolvers } from './resolvers';
// import { AppDataSource } from "./data-source"

const { createServer } = require('@graphql-yoga/node');
const typeDefs = importSchema('schema.graphql');

const server = createServer({ typeDefs, resolvers });
server.start(() =>
  console.log('Server is running on localhost:4000')
);

// AppDataSource.initialize().then(async () => {

// const server = new GraphQLServer({ typeDefs, resolvers });
