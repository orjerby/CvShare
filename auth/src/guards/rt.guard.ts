import {
    Injectable,
    CanActivate,
    ExecutionContext,
    ForbiddenException,
} from "@nestjs/common";
import { Observable } from "rxjs";
import { AppService } from "src/app.service";

@Injectable()
export class RtGuard implements CanActivate {
    constructor(private readonly appService: AppService) {}

    canActivate(
        context: ExecutionContext
    ): boolean | Promise<boolean> | Observable<boolean> {
        const request = context.switchToHttp().getRequest();
        const { cookies: { rt = null } = {} } = request;
        if (rt) return true;
        throw new ForbiddenException();
    }
}
