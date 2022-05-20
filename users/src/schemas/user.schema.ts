import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
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
    @Prop({ type: mongoose.Types.ObjectId })
    _id: string;

    @Prop({ unique: true, required: true })
    email: string;

    @Prop()
    first_name: string;

    @Prop()
    last_name: string;

    @Prop()
    created_at: Date;

    @Prop()
    updated_at: Date;
}

export const UserSchema = SchemaFactory.createForClass(User);
