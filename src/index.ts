import "reflect-metadata";
// import { AppDataSource } from "./data-source"


const { createServer } = require('@graphql-yoga/node')
    // Provide your schema
    const server = createServer({
      schema: {
        typeDefs: `
        type Query {
            hello(name: String): String!
          }
        `,
        resolvers: {
            Query: {
                hello: (_: any, { name }: any) => `Bye ${name || "World"}`
              }
        },
      },
    })
    server.start(() => console.log("Server is running on localhost:4000"));






// AppDataSource.initialize().then(async () => {

// const server = new GraphQLServer({ typeDefs, resolvers });
