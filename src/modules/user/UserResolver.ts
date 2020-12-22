import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { GraphQLClient } from "graphql-request";
import bcrypt from "bcryptjs";
import { User } from "@models/User";
import { LoginResponse } from "@models/LoginResponse";
import { SignUpInput } from "@modules/user/args/SignUpInput";
import { LogInInput } from "@modules/user/args/LogInInput";
import * as config from "@app/config"; 
import { createAccessToken } from "@app/utils";
import { GET_ALL_USERS, SIGN_UP_USER, GET_USER } from "@app/graphqlAPI";

const graphQLClient = new GraphQLClient(config.ENDPOINT, {
    headers: {
        "x-hasura-admin-secret": config.ADMIN_SECRET
    },
})

@Resolver()
export class UserResolver {
    // TODO: API for dev purposes only
    @Query(() => [User])
    async users() {
        const response = await graphQLClient.request(GET_ALL_USERS);
        console.log("[Query: users] ", response.user);
        return response.user;
    }

    @Mutation(() => LoginResponse)
    async signUp(@Arg("signUpInput") { username, email, password }: SignUpInput
    ): Promise<LoginResponse> {
        const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
        const hashedPwd = await bcrypt.hash(password, salt);
        const variables = {
            username,
            email,
            password: hashedPwd,
        };

        const response = await graphQLClient.request(SIGN_UP_USER, variables);
        console.log("[Mutation: signUpUser]", response.insert_user_one);

        return {
            accessToken: createAccessToken(response.insert_user_one.id)
        };   
    }

    @Mutation(() => LoginResponse)
    async logIn(@Arg("logInInput") { email, password }: LogInInput
    ): Promise<LoginResponse>{
        const response = await graphQLClient.request(GET_USER, { email });
        console.log("[Mutation: logIn]", response.user);

        if(!response.user.length){
            throw new Error("User not found.");
        }

        if (response.user.length > 1) {
            throw new Error("More than 1 user found.");
        }

        const retrievedUser = response.user[0];
        const isPasswordValid = await bcrypt.compare(password, retrievedUser.password);

        if (!isPasswordValid) {
            throw new Error("Incorrect password");
        }

        return {
            accessToken: createAccessToken(retrievedUser.id)
        }
    }
}