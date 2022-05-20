import { ArgumentsHost, BadRequestException, Catch } from "@nestjs/common";
import { BaseRpcExceptionFilter, RpcException } from "@nestjs/microservices";

@Catch()
export class BadRequestExceptionFilter extends BaseRpcExceptionFilter {
    catch(exception: BadRequestException, host: ArgumentsHost) {
        //console.log(2, exception);
        return super.catch(new RpcException(exception), host);
    }
}
