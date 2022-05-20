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
                //console.log("context", context);
                this.ack(context.getArgByIndex(1));
                console.log("finishing response - complete rabbit");
            }),
            catchError((error) => {
                //console.log("context", context);
                this.ack(context.getArgByIndex(1));
                console.log("catching error - complete rabbit");

                return throwError(() => error);
            })
        );
    }

    ack(rmqContext: RmqContext) {
        //console.log("rmqContext", rmqContext);
        const channel = rmqContext.getChannelRef();
        const originalMsg = rmqContext.getMessage();
        channel.ack(originalMsg);
    }
}
