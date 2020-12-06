import { Field, InputType } from "type-graphql";

@InputType()
export class RegisterUserInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;
}