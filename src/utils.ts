import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import * as config from "@app/config";

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

export const generateHashedPwd = async (password: string) => {
    try{
        const salt = await bcrypt.genSalt(config.SALT_ROUNDS);
        const hashedPwd = await bcrypt.hash(password, salt);
        return hashedPwd;
    }catch(err){
        console.error("[generateHashedPwd]", err);
        throw err;
    }
};