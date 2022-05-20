import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { Request } from "express";
import { AtPayload } from "../interfaces/at-payload.interface";

export class AtStrategy extends PassportStrategy(Strategy) {
    constructor() {
        super({
            secretOrKey: process.env.ACCESS_TOKEN_SECRET,
            ignoreExpiration: false,
            jwtFromRequest: ExtractJwt.fromExtractors([
                (request: Request) => {
                    const { cookies: { at = null } = {} } = request;
                    return at;
                },
            ]),
        });
    }

    async validate(payload: AtPayload): Promise<AtPayload> {
        return { sub: payload.sub, role: payload.role, rtid: payload.rtid };
    }
}
