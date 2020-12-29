import { GraphQLClient } from "graphql-request";
import * as userService from "./userService";

describe("User Service", () => {
    let requestStub: any;
    const mockedValues = {
        userId: "user-id-mock",
        username: "username-mock",
        email: "email@mock.com",
        accessToken: "access-token-mock",
        salt: "salt-mock",
        hashedPwd: "hashed-pwd-mock",
    };

    beforeEach(() => {
        requestStub = jest.spyOn(GraphQLClient.prototype, "request");
    });

    describe("signUpUser", () => {
        it("should return the user id on successful sign up", async () => {
            requestStub.mockImplementation(() => Promise.resolve({
                "insert_user_one": {
                    id: mockedValues.userId
                }
            }));
            const userId = await userService.signUpUser({
                username: mockedValues.username,
                email: mockedValues.email,
                password: mockedValues.hashedPwd
            });

            expect(userId).toEqual(mockedValues.userId);
        });

        it("should throw an error on failed sign up", async () => {
            const errorMock = "signup-failed"
            requestStub.mockImplementation(() => Promise.reject(errorMock));

            try{
                await userService.signUpUser({
                    username: mockedValues.username,
                    email: mockedValues.email,
                    password: mockedValues.hashedPwd
                });
                throw new Error("userService.signUpUser did not throw an error");
            }catch (err){
                expect(err).toEqual(errorMock);
            }

        });
    });

    describe("logInUser", () => {
        it("should return the user on successful log in", async () => {
            requestStub.mockImplementation(() => Promise.resolve({
                "user": [{
                    id: mockedValues.userId
                }]
            }));
            const user = await userService.logInUser(mockedValues.email);

            expect(user.id).toEqual(mockedValues.userId);
        });

        it("should throw an error on failed log in", async () => {
            const errorMock = "login-failed"
            requestStub.mockImplementation(() => Promise.reject(errorMock));

            try{
                await userService.logInUser(mockedValues.email);
                throw new Error("userService.logInUser did not throw an error");
            } catch(err){
                expect(err).toEqual(errorMock);
            }

        });

        it("should throw an error if user is not found", async () => {
            const expectedError = new Error("User not found.");
            requestStub.mockImplementation(() => Promise.resolve({
                "user": []
            }));

            try{
                await userService.logInUser(mockedValues.email);
                throw new Error("userService.logInUser did not throw an error");
            } catch(err){
                expect(err).toEqual(expectedError);
            }

        });

        it("should throw an error if more than 1 user is found", async () => {
            const expectedError = new Error("More than 1 user found.");
            requestStub.mockImplementation(() => Promise.resolve({
                "user": [{
                    id: "id-1"
                },
                {
                    id: "id-2"
                }]
            }));

            try{
                await userService.logInUser(mockedValues.email);
                throw new Error("userService.logInUser did not throw an error");
            } catch(err){
                expect(err).toEqual(expectedError);
            }

        });
    });
});