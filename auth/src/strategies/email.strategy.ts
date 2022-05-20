import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { Strategy } from "passport-local";
import { User } from "src/schemas/user.schema";
import { AppService } from "../app.service";

@Injectable()
export class EmailStrategy extends PassportStrategy(Strategy) {
    constructor(private readonly appService: AppService) {
        super({
            usernameField: "email",
            passwordField: "password",
        });
    }

    async validate(email: string, password: string): Promise<User> {
        return this.appService.validateUser({ email, password });
    }
}
