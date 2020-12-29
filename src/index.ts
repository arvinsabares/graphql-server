import "dotenv/config";
import "reflect-metadata";
import express from "express";
import { createServer } from "@app/app";
import * as config from "@app/config";

const startServer = async () => {
  const app = express();
  const server = await createServer();

  server.applyMiddleware({ app });

  app.listen({ port: config.PORT }, () =>
    console.log(`🚀 Server ready at http://localhost:${config.PORT}${server.graphqlPath}`)
  );
};

startServer();