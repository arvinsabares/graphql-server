import { Arg, Ctx, Mutation, Query, Resolver } from "type-graphql";
import bcrypt from "bcryptjs";
import { User } from "@models/User";
import { LoginResponse } from "@models/LoginResponse";
import { SignUpInput } from "@modules/user/args/SignUpInput";
import { LogInInput } from "@modules/user/args/LogInInput";
import { findAllUsers, logInUser, signUpUser } from "@modules/user/userService";
import { 
    createAccessToken,
    createRefreshToken,
    generateHashedPwd,
    setRefreshTokenCookie
} from "@helpers/authHelpers";
import { AppContext } from "@app/models/AppContext";

@Resolver()
export class UserResolver {
    // TODO: API for dev purposes only. Remove in prod.
    @Query(() => [User])
    async users /* istanbul ignore next */ () {
        const users = await findAllUsers();
        return users;
    }

    @Mutation(() => LoginResponse)
    async signUp(
        @Arg("signUpInput") { username, email, password }: SignUpInput,
        @Ctx() { res }: AppContext
    ): Promise<LoginResponse> {
        const hashedPwd = await generateHashedPwd(password);
        const userId = await signUpUser({ username, email, password: hashedPwd });
        console.log("[Mutation: signUpUser]", userId);

        setRefreshTokenCookie(
            res,
            createRefreshToken(userId)
        );

        return {
            accessToken: createAccessToken(userId)
        };   
    }

    @Mutation(() => LoginResponse)
    async logIn(
        @Arg("logInInput") { email, password }: LogInInput,
        @Ctx() { res }: AppContext
    ): Promise<LoginResponse>{
        const retrievedUser = await logInUser(email);
        console.log("[Mutation: logIn]", retrievedUser);

        const isPasswordValid = await bcrypt.compare(password, retrievedUser.password);

        if (!isPasswordValid) {
            throw new Error("Incorrect password");
        }

        setRefreshTokenCookie(
            res,
            createRefreshToken(retrievedUser.id)
        );

        return {
            accessToken: createAccessToken(retrievedUser.id)
        }
    }

    @Mutation(() => LoginResponse)
    async logOut(
        @Ctx() { res }: AppContext
    ): Promise<LoginResponse> {
        setRefreshTokenCookie(
            res,
            ""
        );

        return {
            accessToken: ""
        }
    }
}