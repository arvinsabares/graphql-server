import { Field, InputType } from "type-graphql";
import { IsEmail } from "class-validator";

@InputType()
export class LogInInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    password: string;
}