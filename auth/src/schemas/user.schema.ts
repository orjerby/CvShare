import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import { Document } from "mongoose";
import { User as UserInterface } from "../interfaces/user.interface";

export type UserDocument = User & Document;

@Schema({
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
})
export class User implements UserInterface {
    _id: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop({ required: true })
    hashed_password: string;

    @Prop({ default: false })
    activated: boolean;

    @Prop()
    created_at: Date;

    @Prop()
    updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
