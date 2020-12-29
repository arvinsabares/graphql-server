import { GraphQLClient } from "graphql-request";
import * as config from "@app/config";
import { GET_ALL_USERS, GET_USER, SIGN_UP_USER } from "@app/graphqlAPI";
import { SignUpInput } from "./args/SignUpInput";

const graphQLClient = new GraphQLClient(config.ENDPOINT, {
    headers: {
        "x-hasura-admin-secret": config.ADMIN_SECRET
    },
});


export const findAllUsers = async () => {
    try {
        const response = await graphQLClient.request(GET_ALL_USERS);
        console.log("[userService: findAllUsers]", response);
        return response.user;
    }catch (err){
        throw err;
    }
};

export const signUpUser = async (signUpInput: SignUpInput) => {
    try{
        const response = await graphQLClient.request(SIGN_UP_USER, signUpInput);
        const newUser = response.insert_user_one;
        console.log("[userService: signUpUser]", newUser);
        return newUser.id;
    }catch(err){
        console.error("[userService: signUpUser]", err);
        throw err;
    }
};

export const logInUser = async (email: string) => {
    try{
        const response = await graphQLClient.request(GET_USER, { email });
        console.log("[userService: logInUser]", response.user);

        if (!response.user.length) {
            throw new Error("User not found.");
        }

        if (response.user.length > 1) {
            throw new Error("More than 1 user found.");
        }

        return response.user[0];
    }catch(err){
        console.error("[userService: logInUser]", err);
        throw err;
    }
};