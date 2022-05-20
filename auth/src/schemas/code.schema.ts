import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Document } from "mongoose";

export type CodeDocument = Code & Document;

@Schema({
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
})
export class Code {
    _id: string;

    @Prop({ unique: true, required: true })
    hashed_value: string;

    @Prop({ required: true })
    expires: Date;

    @Prop({ required: true, enum: ["email_verification", "password_reset"] })
    type: string;

    @Prop({ default: false })
    used: boolean;

    @Prop()
    created_at: Date;

    @Prop()
    updated_at: Date;

    @Prop({
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
    })
    user_id: string;
}

export const CodeSchema = SchemaFactory.createForClass(Code);
