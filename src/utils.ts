import jwt from "jsonwebtoken";
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
}