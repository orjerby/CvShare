import { Allow, IsEmail, IsMongoId, IsNotEmpty } from "class-validator";
import { User as UserSchema } from "src/schemas/user.schema";
import { UserDtoRes } from "./user.dto";

export class AddUserReqDto {
    @IsMongoId()
    _id: string;

    @IsEmail()
    @IsNotEmpty()
    email: string;

    @Allow()
    firstName: string;

    @Allow()
    lastName: string;
}

export class AddUserResDto extends UserDtoRes {
    constructor(user: UserSchema, role: string = "member") {
        super(user, role);
    }
}
