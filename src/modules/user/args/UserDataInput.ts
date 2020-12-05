import { Field, InputType } from "type-graphql";

@InputType()
export class UserDataInput {
    @Field()
    username: string;

    @Field()
    email: string;
}