import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    InternalServerErrorException,
    NestInterceptor,
    NotFoundException,
} from "@nestjs/common";
import { catchError, Observable, throwError } from "rxjs";

const exceptions = {
    NotFoundException,
    BadRequestException,
    InternalServerErrorException,
};

export class RpcInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            catchError((error) => {
                //console.log("error", error);
                if (exceptions[error.name]) {
                    return throwError(
                        () => new exceptions[error.name](error.response)
                    );
                }

                return throwError(() => new InternalServerErrorException());
            })
        );
    }
}
