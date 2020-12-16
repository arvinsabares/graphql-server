import { Field, ObjectType } from "type-graphql";

@ObjectType()
export class User {
    @Field()
    id: string;

    @Field()
    username: string;

    @Field()
    email: string;
}