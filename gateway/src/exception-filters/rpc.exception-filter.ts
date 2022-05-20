import { ArgumentsHost, Catch } from "@nestjs/common";
import { BaseExceptionFilter } from "@nestjs/core";
import { RpcRes } from "src/interfaces/rpc.interface";

@Catch()
export class AllExceptionsFilter extends BaseExceptionFilter {
    catch(exception: RpcRes, host: ArgumentsHost) {
        console.log(exception);
        super.catch(exception.response, host);
    }
}
