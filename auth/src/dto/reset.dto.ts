import { Allow, IsNotEmpty, MinLength } from "class-validator";

export class ResetReqDto {
    @Allow()
    code: string;

    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @MinLength(6)
    @IsNotEmpty()
    confirmationPassword: string;
}
