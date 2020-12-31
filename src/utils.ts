import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { Response } from "express";
import * as config from "@app/config";
import * as constants from "@helpers/constants";

export const createAccessToken = (userId: string) => {
    return jwt.sign({
        "custom-namespace": {
            "x-hasura-allowed-roles": ["user"],
            "x-hasura-default-role": "user",
            "x-hasura-user-id": userId,
        }
    },
    config.ACCESS_TOKEN_SECRET,
    { expiresIn: '15m' });
};

export const createRefreshToken = (userId: string) => {
    return jwt.sign({
        "userId": userId
    },
    config.REFRESH_TOKEN_SECRET,
    { expiresIn: '3d' });
};

export const generateHashedPwd = async (password: string) => {
    try{
        const salt = await bcrypt.genSalt(constants.SALT_ROUNDS);
        const hashedPwd = await bcrypt.hash(password, salt);
        return hashedPwd;
    }catch(err){
        console.error("[generateHashedPwd]", err);
        throw err;
    }
};

export const setRefreshTokenCookie = (res: Response, token: string) => {
    res.cookie(
        constants.REFRESH_TOKEN_COOKIE,
        token,
        {
            httpOnly: true,
            path: config.REFRESH_ENDPOINT
        }
    );
};