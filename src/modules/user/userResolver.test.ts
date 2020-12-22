import "reflect-metadata";
import { ApolloServerTestClient, createTestClient } from 'apollo-server-testing'
import { GraphQLClient } from "graphql-request";
import bcrypt from "bcryptjs";
import { createServer } from "@app/app";
import * as utils from "@app/utils";
import { GET_ALL_USERS, SIGN_UP_USER } from "@app/graphqlAPI";
import * as config from "@app/config"; 

describe("User resolvers", () => {
    let testClient: ApolloServerTestClient;
    let requestMock: any;
    let genSaltMock: any;
    let hashMock: any;
    let createAccessTokenMock: any;
    const mockedValues = {
        userId: "user-id-mock",
        username: "username-mock",
        email: "email@mock.com",
        accessToken: "access-token-mock",
        salt: "salt-mock",
        hashedPwd: "hashed-pwd-mock",
    }

    beforeAll(async () => {
        const testServer = await createServer(); 
        testClient = createTestClient(testServer);
    });

    beforeEach(() => {
        requestMock = jest.spyOn(GraphQLClient.prototype, "request");
        genSaltMock = jest.spyOn(bcrypt, "genSalt");
        hashMock = jest.spyOn(bcrypt, "hash");
        createAccessTokenMock = jest.spyOn(utils, "createAccessToken");
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    it("should fetch all users", async () => {
        const { query } = testClient;
        const expectedResults = [
            {
                "id": mockedValues.userId,
                "username": mockedValues.username,
                "email": mockedValues.email
            }
        ];
        const getUsersQuery = `
            query {
                users{
                    id
                    username
                    email
                }
            }
        `;

        requestMock.mockImplementation(() => Promise.resolve({
            "user": expectedResults
        }));

        const { data } = await query({ query: getUsersQuery });
        expect(data.users).toEqual(expectedResults);
        expect(requestMock).toHaveBeenNthCalledWith(1, GET_ALL_USERS);
    });

    it("should return a access token when signing up", async () => {
        const { mutate } = testClient;
        const signUpMutation = `
            mutation($username: String!, $email: String!, $password: String!) {
                signUp(signUpInput: {
                    username: $username,
                    email: $email,
                    password: $password
                }){
                    accessToken
                }
            }
        `;
        const nonHashedPwd = "non-hashed-pwd-mock";
        const variables = {
            username: mockedValues.username,
            email: mockedValues.email,
            password: nonHashedPwd
        };

        genSaltMock.mockImplementation(() => Promise.resolve(mockedValues.salt));
        hashMock.mockImplementation(() => Promise.resolve(mockedValues.hashedPwd));
        createAccessTokenMock.mockReturnValue(mockedValues.accessToken);

        requestMock.mockImplementation(() => Promise.resolve({
            "insert_user_one": {
                id: mockedValues.userId
            }
        }));

        const { data } = await mutate({ mutation: signUpMutation, variables });
        expect(genSaltMock).toHaveBeenNthCalledWith(1, config.SALT_ROUNDS);
        expect(hashMock).toHaveBeenNthCalledWith(1, nonHashedPwd, mockedValues.salt);
        expect(requestMock).toHaveBeenNthCalledWith(1,
            SIGN_UP_USER,
            {
                username: mockedValues.username,
                email: mockedValues.email,
                password: mockedValues.hashedPwd
            }
        );
        expect(createAccessTokenMock).toHaveBeenNthCalledWith(1, mockedValues.userId);
        expect(data.signUp.accessToken).toEqual(mockedValues.accessToken);
    });
});