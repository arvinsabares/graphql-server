import { User } from "@models/User";
import { Arg, Mutation, Query, Resolver } from "type-graphql";
import { RegisterUserInput } from "@modules/user/args/RegisterUserInput";

const users = [
    {
        id: "example-id-1",
        username: "user1",
        email: "user1@email.com"
    },
    {
        id: "example-id-2",
        username: "user2",
        email: "user2@email.com"
    }
]

@Resolver()
export class UserResolver {
    @Query(() => [User])
    async users() {
        return users;
    }

    @Mutation(() => String)
    async registerUser(@Arg("registerData") { username, email, password }: RegisterUserInput) {
        return `User ${username} is registered with email: ${email} and password: ${password}`
    }
}