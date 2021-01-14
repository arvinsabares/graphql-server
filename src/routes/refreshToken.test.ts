import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { refreshToken } from "./refreshToken";
import { REFRESH_TOKEN_COOKIE } from "../helpers/constants";
import * as userService from "../modules/user/userService";
import * as authHelpers from "../helpers/authHelpers";
import { mockedValues } from "../helpers/testConstants";

describe("refreshToken", () => {
    
    let verifyTokenStub: any;
    let findUserByIdStub: any;
    let sendMock = jest.fn(x => x);

    const generateContextWithCookie = (cookieValue?: string) => {
        return {
            res: {
                send: sendMock
            } as unknown as Response,
            req: {
                cookies: {
                    [REFRESH_TOKEN_COOKIE]: cookieValue
                }
            } as unknown as Request
        }
    };

    beforeEach(() => {
        verifyTokenStub = jest.spyOn(jwt, "verify");
        findUserByIdStub = jest.spyOn(userService, "findUserById");
        jest.spyOn(authHelpers, "createAccessToken").mockReturnValue(mockedValues.accessToken);
    });

    afterEach(() => {
        jest.restoreAllMocks();
    });

    describe("when refresh token is valid", () => {
        it("should return an access token", async () => {
            verifyTokenStub.mockImplementation(() => {
                return Promise.resolve({
                    userId: mockedValues.userId
                })
            });
            findUserByIdStub.mockImplementation(() => {
                return Promise.resolve({
                    id: mockedValues.userId
                })
            });
            const contexMock = generateContextWithCookie(mockedValues.cookieValueMock);
            const response = await refreshToken(contexMock.req, contexMock.res);
            expect(response).toEqual({
                accessToken: mockedValues.accessToken,
                ok: true
            });
        });
    });

    describe("when refresh token or user is invalid", () => {
        it("should not return an access token", async () => {
            const expectedError = "user-or-token-invalid";
            verifyTokenStub.mockImplementation(() => {
                return Promise.resolve()
            });
            findUserByIdStub.mockImplementation(() => {
                return Promise.reject(expectedError)
            });
            const contexMock = generateContextWithCookie(mockedValues.cookieValueMock);
            const response = await refreshToken(contexMock.req, contexMock.res);
            expect(response).toEqual({
                accessToken: "",
                ok: false
            });
        });
    });

    describe("when refresh cookie doesnt exist", () => {
        it("should not send an access token", async () => {
            const contexMock = generateContextWithCookie();
            const response = await refreshToken(contexMock.req, contexMock.res);
            expect(response).toEqual({
                accessToken: "",
                ok: false
            });
        });
    });
});