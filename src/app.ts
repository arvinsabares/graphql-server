import { ApolloServer } from "apollo-server-express";
import { buildSchema } from "type-graphql";
import { UserResolver } from "@modules/user/UserResolver";

export const createServer = async () => {
    const schema = await buildSchema({
        resolvers: [UserResolver]
    });

    const server = new ApolloServer({ 
        schema,
        context: ({req, res}) => ({ req, res })
    });

    return server;
};