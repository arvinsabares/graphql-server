import { Field, InputType } from "type-graphql";
import { IsAlphanumeric, IsEmail, MinLength } from "class-validator";

@InputType()
export class SignUpInput {
    @Field()
    @IsAlphanumeric()
    @MinLength(2)
    username: string;

    @Field()
    @IsEmail()
    email: string;

    @Field()
    @IsAlphanumeric()
    @MinLength(4)
    password: string;
}
