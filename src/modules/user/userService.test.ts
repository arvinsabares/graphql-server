import { GraphQLClient } from "graphql-request";
import { mockedValues } from "../../helpers/testConstants";
import * as userService from "./userService";

describe("User Service", () => {
    let requestStub: any;

    beforeEach(() => {
        requestStub = jest.spyOn(GraphQLClient.prototype, "request");
    });

    describe("findUserById", () => {
        it("should return the user object on successful query", async () => {
            const expectedUser = {
                id: mockedValues.userId
            };
            requestStub.mockImplementation(() => Promise.resolve({
                "user_by_id": expectedUser
            }));
            const user = await userService.findUserById(mockedValues.userId);

            expect(user).toEqual(expectedUser);
        });

        it("should throw an error on failed query", async () => {
            const errorMock = "find-user-by-id-failed"
            requestStub.mockImplementation(() => Promise.reject(errorMock));

            try {
                await userService.findUserById(mockedValues.userId);
                throw new Error("userService.findUserById did not throw an error");
            } catch (err) {
                expect(err).toEqual(errorMock);
            }

        });

        it("should throw an error if user is not found", async () => {
            const expectedError = new Error("User not found");
            requestStub.mockImplementation(() => Promise.resolve({
                "user_by_id": null
            }));

            try {
                await userService.findUserById(mockedValues.userId);
                throw new Error("userService.findUserById did not throw an error");
            } catch (err) {
                expect(err).toEqual(expectedError);
            }

        });
    });

    describe("saveUser", () => {
        it("should return the user id on successful sign up", async () => {
            requestStub.mockImplementation(() => Promise.resolve({
                "insert_user_one": {
                    id: mockedValues.userId
                }
            }));
            const userId = await userService.saveUser({
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
                await userService.saveUser({
                    username: mockedValues.username,
                    email: mockedValues.email,
                    password: mockedValues.hashedPwd
                });
                throw new Error("userService.saveUser did not throw an error");
            }catch (err){
                expect(err).toEqual(errorMock);
            }

        });
    });

    describe("findUserByEmail", () => {
        it("should return the user on successful log in", async () => {
            requestStub.mockImplementation(() => Promise.resolve({
                "user": [{
                    id: mockedValues.userId
                }]
            }));
            const user = await userService.findUserByEmail(mockedValues.email);

            expect(user.id).toEqual(mockedValues.userId);
        });

        it("should throw an error on failed log in", async () => {
            const errorMock = "login-failed"
            requestStub.mockImplementation(() => Promise.reject(errorMock));

            try{
                await userService.findUserByEmail(mockedValues.email);
                throw new Error("userService.findUserByEmail did not throw an error");
            } catch(err){
                expect(err).toEqual(errorMock);
            }

        });

        it("should throw an error if user is not found", async () => {
            const expectedError = new Error("User not found");
            requestStub.mockImplementation(() => Promise.resolve({
                "user": []
            }));

            try{
                await userService.findUserByEmail(mockedValues.email);
                throw new Error("userService.findUserByEmail did not throw an error");
            } catch(err){
                expect(err).toEqual(expectedError);
            }
        });

        it("should throw an error if more than 1 user is found", async () => {
            const expectedError = new Error("More than 1 user found");
            requestStub.mockImplementation(() => Promise.resolve({
                "user": [{
                    id: "id-1"
                },
                {
                    id: "id-2"
                }]
            }));

            try{
                await userService.findUserByEmail(mockedValues.email);
                throw new Error("userService.findUserByEmail did not throw an error");
            } catch(err){
                expect(err).toEqual(expectedError);
            }
        });
    });
});