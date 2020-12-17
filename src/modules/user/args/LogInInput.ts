import { Field, InputType } from "type-graphql";
import { IsAlphanumeric, IsEmail } from "class-validator";

@InputType()
export class LogInInput {
    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsAlphanumeric()
    password: string;
}