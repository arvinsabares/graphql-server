import "reflect-metadata";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import { buildSchema } from "type-graphql";
import * as authHelpers from "../../helpers/authHelpers";
import { UserResolver } from "./UserResolver";
import * as userService from "./userService";
import { mockedValues } from "../../helpers/testConstants";

describe("User resolvers", () => {
    let saveUserStub: any;
    let findUserByEmailStub: any;
    let generateHashedPwdStub: any;
    let passwordCompareStub: any;
    let setRefreshTokenCookieStub: any;
    const cookieMock = jest.fn();
    const contextMock = {
        res: {
            cookie: cookieMock
        } as unknown as Response,
        req: {} as Request
    };;

    // Adds coverage for type-graphql decorators with return types
    beforeAll(async () => {
        await buildSchema({
            resolvers: [UserResolver]
        })
    });

    beforeEach(() => {
        saveUserStub = jest.spyOn(userService, "saveUser");
        findUserByEmailStub = jest.spyOn(userService, "findUserByEmail");
        passwordCompareStub = jest.spyOn(bcrypt, "compare");
        generateHashedPwdStub = jest.spyOn(authHelpers, "generateHashedPwd");
        setRefreshTokenCookieStub = jest.spyOn(authHelpers, "setRefreshTokenCookie");

        jest.spyOn(authHelpers, "createAccessToken")
            .mockReturnValue(mockedValues.accessToken);
        jest.spyOn(authHelpers, "createRefreshToken")
            .mockReturnValue(mockedValues.refreshToken);
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("Sign up", () => {
        it("should return an access token on successful sign up", async () => {
            const userResolver = new UserResolver();
            const nonHashedPwd = "non-hashed-pwd-mock";
            generateHashedPwdStub.mockImplementation(() => Promise.resolve(mockedValues.hashedPwd));
            saveUserStub.mockImplementation(() => Promise.resolve(mockedValues.userId));

            const response = await userResolver.signUp({
                username: mockedValues.username,
                email: mockedValues.email,
                password: nonHashedPwd
            }, contextMock);

            expect(setRefreshTokenCookieStub).toHaveBeenCalledWith(
                contextMock.res,
                mockedValues.refreshToken
            );
            expect(response.accessToken).toEqual(mockedValues.accessToken);
        });

        it("should throw an error on failed hashed pwd", async () => {
            const userResolver = new UserResolver();
            const nonHashedPwd = "non-hashed-pwd-mock";
            const errorMock = new Error("generate-hash-error");
            generateHashedPwdStub.mockImplementation(() => Promise.reject(errorMock));

            try{
                await userResolver.signUp({
                    username: mockedValues.username,
                    email: mockedValues.email,
                    password: nonHashedPwd
                }, contextMock);
                throw new Error("userResolver.signUp did not throw an error");
            }catch(err){
                expect(err).toEqual(errorMock);
            }
        });

        it("should throw an error on failed sign up", async () => {
            const userResolver = new UserResolver();
            const nonHashedPwd = "non-hashed-pwd-mock";
            const errorMock = new Error("signup-error");
            saveUserStub.mockImplementation(() => Promise.reject(errorMock));

            try{
                await userResolver.signUp({
                    username: mockedValues.username,
                    email: mockedValues.email,
                    password: nonHashedPwd
                }, contextMock);
                throw new Error("userResolver.signUp did not throw an error");
            }catch(err){
                expect(err).toEqual(errorMock);
            }
        });
    });

    describe("Log in", () => {
        const passwordMock = "pwd-mock";
        describe("when email and pasword are valid", () => {
            it("should return an access token", async () => {
                const userResolver = new UserResolver();
                findUserByEmailStub.mockImplementation(() => {
                    return Promise.resolve({
                        id: mockedValues.userId,
                        password: passwordMock
                    })
                });
                passwordCompareStub.mockImplementation(() => Promise.resolve(true));

                const response = await userResolver.logIn({
                    email: mockedValues.email,
                    password: passwordMock
                }, contextMock);

                expect(setRefreshTokenCookieStub).toHaveBeenCalledWith(
                    contextMock.res,
                    mockedValues.refreshToken
                );
                expect(response.accessToken).toEqual(mockedValues.accessToken);
            });
        });

        describe("when email or password is invalid", () => {
            it("should throw an error if email is invalid", async () => {
                const userResolver = new UserResolver();
                const errorMock = new Error("login-error");
                findUserByEmailStub.mockImplementation(() => Promise.reject(errorMock));

                try {
                    await userResolver.logIn({
                        email: mockedValues.email,
                        password: passwordMock
                    }, contextMock);
                    throw new Error("userResolver.logIn did not throw an error");
                } catch (err) {
                    expect(err).toEqual(errorMock);
                }
            });

            it("should throw an error if password is invalid", async () => {
                const userResolver = new UserResolver();

                findUserByEmailStub.mockImplementation(() => {
                    return Promise.resolve({
                        id: mockedValues.userId,
                        password: passwordMock
                    })
                });
                passwordCompareStub.mockImplementation(() => Promise.resolve(false));

                try {
                    await userResolver.logIn({
                        email: mockedValues.email,
                        password: "pwd-mock"
                    }, contextMock);
                    throw new Error("userResolver.logIn did not throw an error");
                } catch (err) {
                    expect(err).toEqual(new Error("Incorrect password"));
                }
            });

            it("should throw an error if comparing password failed", async () => {
                const userResolver = new UserResolver();
                const errorMock = new Error("pwd-error");
                findUserByEmailStub.mockImplementation(() => {
                    return Promise.resolve({
                        id: mockedValues.userId,
                        password: passwordMock
                    })
                });
                passwordCompareStub.mockImplementation(() => Promise.reject(errorMock));

                try {
                    await userResolver.logIn({
                        email: mockedValues.email,
                        password: "pwd-mock"
                    }, contextMock);
                    throw new Error("userResolver.logIn did not throw an error");
                } catch (err) {
                    expect(err).toEqual(errorMock);
                }
            });
        });
    });

    describe("Log out", () => {
        it("should return an empty access token and refresh cookie", async () => {
            const userResolver = new UserResolver();
            const response = await userResolver.logOut(contextMock);

            expect(setRefreshTokenCookieStub).toHaveBeenCalledWith(
                contextMock.res,
                ""
            );
            expect(response.accessToken).toEqual("");
        });
    });
});