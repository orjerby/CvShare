import { Prop, Schema, SchemaFactory } from "@nestjs/mongoose";
import mongoose from "mongoose";
import { Document } from "mongoose";

export type TokenDocument = Token & Document;

@Schema({
    timestamps: {
        createdAt: "created_at",
        updatedAt: "updated_at",
    },
})
export class Token {
    _id: string;

    @Prop({ unique: true, required: true })
    hashed_value: string;

    @Prop({ required: true })
    expires: Date;

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

    //createdByIp: [some ip],
    //replacedBy: [anotherRefreshTokenId],
    //revokedByIp: [some other ip],
    //revokedBy: [some other date],
}

export const TokenSchema = SchemaFactory.createForClass(Token);
