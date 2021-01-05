import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { REFRESH_TOKEN_COOKIE } from "@helpers/constants";
import { REFRESH_TOKEN_SECRET } from "@app/config";
import { findUserById } from "@app/modules/user/userService";
import { createAccessToken } from "@helpers/authHelpers";

export const refreshToken = async (req: Request, res: Response) => {
    const refreshToken = req.cookies[REFRESH_TOKEN_COOKIE];
    if(!refreshToken){
        return res.send({
            ok: false,
            accessToken: ""
        });
    }

    try{
        const payload: any = jwt.verify(refreshToken, REFRESH_TOKEN_SECRET);
        console.log("[refresh_token: payload]", payload);

        const retrievedUser = await findUserById(payload.userId);
        return res.send({
            ok: true,
            accessToken: createAccessToken(retrievedUser.id)
        });
    } catch(err){
        console.error("[refresh_token]", err);
        return res.send({
            ok: false,
            accessToken: ""
        });
    }
};