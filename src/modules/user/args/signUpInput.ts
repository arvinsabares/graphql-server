import { Field, InputType } from "type-graphql";
import { IsEmail, MinLength } from "class-validator";

@InputType()
export class signUpInput {
    @Field()
    @MinLength(2)
    username: string;

    @Field()
    @IsEmail()
    email: string;

    @Field()
    @MinLength(4)
    password: string;
}