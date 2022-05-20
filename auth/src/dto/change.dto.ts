import { IsNotEmpty, MinLength } from "class-validator";

export class ChangetReqDto {
    @MinLength(6)
    @IsNotEmpty()
    oldPassword: string;

    @MinLength(6)
    @IsNotEmpty()
    newPassword: string;

    @MinLength(6)
    @IsNotEmpty()
    newConfirmationPassword: string;
}
