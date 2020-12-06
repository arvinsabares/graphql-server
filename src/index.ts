import "reflect-metadata";
import "module-alias/register";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "@modules/user/UserResolver";

const startServer = async () => {
  const app = express();
  const schema = await buildSchema({
    resolvers: [UserResolver]
  });

  const server = new ApolloServer({ schema });

  server.applyMiddleware({ app });

  app.listen({ port: 4000 }, () =>
    console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`)
  );
};

startServer();