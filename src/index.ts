import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "@modules/user/UserResolver";
import * as config from "config";

const startServer = async () => {
  const app = express();
  const schema = await buildSchema({
    resolvers: [UserResolver]
  });

  const server = new ApolloServer({ schema });

  server.applyMiddleware({ app });

  app.listen({ port: config.PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${config.PORT}${server.graphqlPath}`)
  );
};

startServer();