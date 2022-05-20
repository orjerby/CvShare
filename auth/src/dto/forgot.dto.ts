import { IsEmail, IsNotEmpty } from "class-validator";

export class ForgotReqDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @IsNotEmpty()
    resetUrl: string;
}
