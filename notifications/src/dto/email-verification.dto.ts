import { Allow, IsEmail, IsNotEmpty } from "class-validator";

export class EmailVerificationReqDto {
    @Allow()
    code: string;

    @IsEmail()
    email: string;

    @IsNotEmpty()
    confirmUrl: string;
}
