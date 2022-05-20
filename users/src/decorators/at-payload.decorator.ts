import { createParamDecorator, ExecutionContext } from "@nestjs/common";
import { AtPayload as AtPayloadInterface } from "../interfaces/at-payload.interface";

export const AtPayload = createParamDecorator(
    (data: unknown, ctx: ExecutionContext): AtPayloadInterface => {
        const request = ctx.switchToHttp().getRequest();
        const { user: { rtid = null, sub = null, role = null } = {} } = request;
        return { sub, role, rtid };
    }
);
