import "reflect-metadata";
import bcrypt from "bcryptjs";
import { Request, Response } from "express";
import * as utils from "@app/utils";
import { UserResolver } from "./UserResolver";
import * as userService from "@modules/user/userService";

describe("User resolvers", () => {
    let signUpUserStub: any;
    let logInUserStub: any;
    let generateHashedPwdStub: any;
    let passwordCompareStub: any;
    let setRefreshTokenCookieStub: any;
    const cookieMock = jest.fn();
    let contextMock: any;

    const mockedValues = {
        userId: "user-id-mock",
        username: "username-mock",
        email: "email@mock.com",
        accessToken: "access-token-mock",
        refreshToken: "refresh-token-mock",
        salt: "salt-mock",
        hashedPwd: "hashed-pwd-mock",
    };

    beforeEach(() => {
        contextMock = {
            res: {
                cookie: cookieMock
            } as unknown as Response,
            req: {} as Request
        };

        signUpUserStub = jest.spyOn(userService, "signUpUser");
        logInUserStub = jest.spyOn(userService, "logInUser");
        passwordCompareStub = jest.spyOn(bcrypt, "compare");
        generateHashedPwdStub = jest.spyOn(utils, "generateHashedPwd");
        setRefreshTokenCookieStub = jest.spyOn(utils, "setRefreshTokenCookie");

        jest.spyOn(utils, "createAccessToken")
            .mockReturnValue(mockedValues.accessToken);
        jest.spyOn(utils, "createRefreshToken")
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
            signUpUserStub.mockImplementation(() => Promise.resolve(mockedValues.userId));

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
            signUpUserStub.mockImplementation(() => Promise.reject(errorMock));

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
        it("should return an access token when logging in", async () => {
            const userResolver = new UserResolver();
            logInUserStub.mockImplementation(() => {
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

        it("should throw an error on failed login", async () => {
            const userResolver = new UserResolver();
            const errorMock = new Error("login-error");
            logInUserStub.mockImplementation(() => Promise.reject(errorMock));
            
            try{
                await userResolver.logIn({
                    email: mockedValues.email,
                    password: passwordMock
                }, contextMock);
                throw new Error("userResolver.logIn did not throw an error");
            }catch(err){
                expect(err).toEqual(errorMock);
            }
        });

        it("should throw an error if password is invalid", async () => {
            const userResolver = new UserResolver();

            logInUserStub.mockImplementation(() => {
                return Promise.resolve({
                    id: mockedValues.userId,
                    password: passwordMock
                })
            });
            passwordCompareStub.mockImplementation(() => Promise.resolve(false));
            
            try{
                await userResolver.logIn({
                    email: mockedValues.email,
                    password: "pwd-mock"
                }, contextMock);
                throw new Error("userResolver.logIn did not throw an error");
            }catch(err){
                expect(err).toEqual(new Error("Incorrect password"));
            }
        });

        it("should throw an error if comparing password failed", async () => {
            const userResolver = new UserResolver();
            const errorMock = new Error("pwd-error");
            logInUserStub.mockImplementation(() => {
                return Promise.resolve({
                    id: mockedValues.userId,
                    password: passwordMock
                })
            });
            passwordCompareStub.mockImplementation(() => Promise.reject(errorMock));
            
            try{
                await userResolver.logIn({
                    email: mockedValues.email,
                    password: "pwd-mock"
                }, contextMock);
                throw new Error("userResolver.logIn did not throw an error");
            }catch(err){
                expect(err).toEqual(errorMock);
            }
        });
    });
});