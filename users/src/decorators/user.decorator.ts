import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { User as UserSchema } from "src/schemas/user.schema";

export const User = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): UserSchema => {
        return ctx.switchToHttp().getRequest().user;
    }
);
