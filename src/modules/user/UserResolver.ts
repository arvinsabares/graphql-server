import { User } from "@models/User";
import { Arg, Mutation, Query, Resolver } from "type-graphql";

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
    async registerUser(@Arg("registerData") registerData: string) {
        return `User ${registerData} is registered with email: ${registerData} and password: ${registerData}`
    }
}