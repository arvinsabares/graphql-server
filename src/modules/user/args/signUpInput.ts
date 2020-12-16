import { Field, InputType } from "type-graphql";

@InputType()
export class signUpInput {
    @Field()
    username: string;

    @Field()
    email: string;

    @Field()
    password: string;
}