import { Allow, IsEmail, IsNotEmpty, MinLength } from "class-validator";
import { User } from "../schemas/user.schema";
import { UserDtoRes } from "./user.dto";

export class RegisterUserReqDto {
    @IsEmail()
    @IsNotEmpty()
    email: string;

    @MinLength(6)
    @IsNotEmpty()
    password: string;

    @MinLength(6)
    @IsNotEmpty()
    confirmationPassword: string;

    @Allow()
    firstName: string;

    @Allow()
    lastName: string;

    @IsNotEmpty()
    confirmUrl: string;
}

export class RegisterUserResDto extends UserDtoRes {
    constructor(user: User, role: string = "member") {
        super(user, role);
    }
}
