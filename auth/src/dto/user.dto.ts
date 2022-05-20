import { User as UserSchema } from "../schemas/user.schema";
import { User as UserInterface } from "../interfaces/user.interface";

export class UserDtoRes implements UserInterface {
    _id: string;
    email: string;
    hashed_password: string;
    created_at: Date;
    updated_at: Date;

    constructor(user: UserSchema, role: string = "member") {
        this._id = user._id;
        this.email = user.email;
        this.hashed_password = user.hashed_password;
        this.created_at = user.created_at;
        this.updated_at = user.updated_at;

        // remove fields
        delete this.hashed_password;
    }
}
