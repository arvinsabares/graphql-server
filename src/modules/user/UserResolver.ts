import { User } from "@models/User";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { signUpInput } from "@modules/user/args/signUpInput";
import { GraphQLClient } from 'graphql-request';
import * as config from "config";
import { GET_ALL_USERS, SIGN_UP_USER } from "graphqlAPI";

const graphQLClient = new GraphQLClient(config.ENDPOINT, {
    headers: {
        "x-hasura-admin-secret": config.ADMIN_SECRET
    },
})

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async users() {
        const response = await graphQLClient.request(GET_ALL_USERS);
        console.log("Query", "users", response.user);
        return response.user;
    }

    @Mutation(() => User)
    async signUpUser(@Arg("signUpInput") { username, email, password }: signUpInput) {
        const variables = {
            username,
            email,
            password,
        };
            const response = await graphQLClient.request(SIGN_UP_USER, variables);
            console.log("Mutation", "users", response.insert_user_one);
            return response.insert_user_one;   
    }
}