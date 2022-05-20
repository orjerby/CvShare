import {
    CallHandler,
    ExecutionContext,
    Injectable,
    NestInterceptor,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { Observable } from "rxjs";
import { AtPayload } from "src/interfaces/at-payload.interface";

@Injectable()
export class AtPayloadInterceptor implements NestInterceptor {
    constructor(private readonly jwtService: JwtService) {}

    async intercept(
        context: ExecutionContext,
        next: CallHandler<any>
    ): Promise<Observable<any>> {
        const { user = null, cookies: { at = null } = {} } =
            context.getArgByIndex(0);

        if (!user) {
            try {
                const res: AtPayload = await this.jwtService.verify(at, {
                    secret: process.env.ACCESS_TOKEN_SECRET,
                    ignoreExpiration: false,
                });

                context.getArgByIndex(0).user = {
                    sub: res.sub,
                    role: res.role,
                };
            } catch (ex) {}
        }

        return next.handle();
    }
}
