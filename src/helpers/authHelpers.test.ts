import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Response } from "express";
import * as authHelpers from "./authHelpers";
import * as constants from "./constants";
import * as config from "../config";

describe("Auth Helpers", () => {
    const JWTToken = "jwt-token-mock";
    let JWTSignStub: any;
    let genSaltStub: any;
    let hashPwdStub: any;

    beforeEach(() => {
        JWTSignStub = jest.spyOn(jwt, "sign").mockImplementation(() => {
            return JWTToken;
        });
        genSaltStub = jest.spyOn(bcrypt, "genSalt");
        hashPwdStub = jest.spyOn(bcrypt, "hash");
    });
    
    afterEach(() => {
        jest.resetAllMocks();
    });

    describe("createAccessToken", () => {
        it("should return an access token", () => {
            const userId = "user-id-mock";
            const expectedPayload = {
                "custom-namespace": {
                    "x-hasura-allowed-roles": ["user"],
                    "x-hasura-default-role": "user",
                    "x-hasura-user-id": userId,
                }
            };
            const expectedExpiry = {
                expiresIn: "15m"
            };

            const accessToken = authHelpers.createAccessToken(userId);

            expect(accessToken).toEqual(JWTToken);
            expect(JWTSignStub).toHaveBeenCalledWith(
                expectedPayload,
                config.ACCESS_TOKEN_SECRET,
                expectedExpiry
            );
        });
    });

    describe("createRefreshToken", () => {
        it("should return a refresh token", () => {
            const userId = "user-id-mock";
            const expectedPayload = {
                "userId": userId
            };
            const expectedExpiry = {
                expiresIn: "3d"
            };

            const refreshToken = authHelpers.createRefreshToken(userId);

            expect(refreshToken).toEqual(JWTToken);
            expect(JWTSignStub).toHaveBeenCalledWith(
                expectedPayload,
                config.REFRESH_TOKEN_SECRET,
                expectedExpiry
            );
        });
    });

    describe("generateHashedPwd", () => {
        it("should return a hashed pwd", async () => {
            const unhashedPwd = "unhashed-pwd";
            const salt = "salt-mock";
            const hashedPwd = "hashed-pwd-mock";

            genSaltStub.mockImplementation(() => Promise.resolve(salt));
            hashPwdStub.mockImplementation(() => Promise.resolve(hashedPwd));

            const pwd = await authHelpers.generateHashedPwd(unhashedPwd);
            expect(pwd).toEqual(hashedPwd);
            expect(genSaltStub).toHaveBeenCalledWith(constants.SALT_ROUNDS);
            expect(hashPwdStub).toHaveBeenCalledWith(unhashedPwd, salt);
        });

        it("should throw an error if genSalt fails", async () => {
            const unhashedPwd = "unhashed-pwd";
            const expectedError = "genSalt-error";

            genSaltStub.mockImplementation(() => Promise.reject(expectedError));

            try {
                await authHelpers.generateHashedPwd(unhashedPwd);
                throw new Error("generateHashedPwd did not throw an error");
            } catch(err){
                expect(err).toEqual(expectedError);
            }
        });

        it("should throw an error if hashing fails", async () => {
            const unhashedPwd = "unhashed-pwd";
            const salt = "salt-mock";
            const expectedError = "hashing-error";

            genSaltStub.mockImplementation(() => Promise.resolve(salt));
            genSaltStub.mockImplementation(() => Promise.reject(expectedError));

            try {
                await authHelpers.generateHashedPwd(unhashedPwd);
                throw new Error("generateHashedPwd did not throw an error");
            } catch(err){
                expect(err).toEqual(expectedError);
            }
        });
    });

    describe("setRefreshTokenCookie", () => {
        it("should add the refresh token in the response cookie", () => {
            const responseMock = {
                cookie: jest.fn()
            } as unknown as Response;
            const token = "token-mock";
            authHelpers.setRefreshTokenCookie(responseMock, token);
            expect(responseMock.cookie).toHaveBeenCalledWith(
                constants.REFRESH_TOKEN_COOKIE,
                token,
                {
                    httpOnly: true,
                    path: config.REFRESH_ENDPOINT
                }
            );
        })
    });
});