import {
    BadRequestException,
    CallHandler,
    ExecutionContext,
    InternalServerErrorException,
    NestInterceptor,
} from "@nestjs/common";
import { RmqContext, RpcException } from "@nestjs/microservices";
import { catchError, Observable, tap, throwError } from "rxjs";

export class AckRmqInterceptor implements NestInterceptor {
    intercept(
        context: ExecutionContext,
        next: CallHandler<any>
    ): Observable<any> | Promise<Observable<any>> {
        return next.handle().pipe(
            tap(() => {
                this.ack(context.getArgByIndex(1));
                console.log("finishing response - complete rabbit");
            }),
            catchError((error) => {
                this.ack(context.getArgByIndex(1));
                console.log("catching error - complete rabbit");

                return throwError(() => error);
            })
        );
    }

    ack(rmqContext: RmqContext) {
        const channel = rmqContext.getChannelRef();
        const originalMsg = rmqContext.getMessage();
        channel.ack(originalMsg);
    }
}
