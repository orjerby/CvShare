import { Allow, IsEmail, IsNotEmpty } from "class-validator";

export class PasswordResetReqDto {
    @Allow()
    code: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    resetUrl: string;
}
