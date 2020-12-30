import "dotenv/config";
import "reflect-metadata";
import express from "express";
import cookieParser from "cookie-parser";
import { createServer } from "@app/app";
import * as config from "@app/config";
import { refreshToken } from "@routes/refreshToken";

const startServer = async () => {
  const app = express();
  app.use(express.json());
  app.use(cookieParser());

  app.post("/refresh_token", refreshToken);

  const server = await createServer();

  server.applyMiddleware({ app });

  app.listen({ port: config.PORT }, () =>
    console.log(`🚀 Server ready at port:${config.PORT}${server.graphqlPath}`)
  );
};

startServer();