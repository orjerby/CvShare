import {
    ArgumentMetadata,
    BadRequestException,
    CallHandler,
    Controller,
    ExecutionContext,
    Inject,
    Injectable,
    InternalServerErrorException,
    NestInterceptor,
    NotFoundException,
    PipeTransform,
    UseFilters,
    UseGuards,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import {
    ClientProxy,
    MessagePattern,
    Payload,
    RmqContext,
    RpcException,
} from "@nestjs/microservices";
import { catchError, Observable, throwError } from "rxjs";
import { AppService } from "./app.service";
import { AtPayload } from "./decorators/at-payload.decorator";
import { AddUserReqDto, AddUserResDto } from "./dto/add-user.dto";

import { AtGuard } from "./guards/at.guard";
import { AckRmqInterceptor } from "./interceptors/ack-rmq.interceptor";
import { AtPayloadInterceptor } from "./interceptors/at-payload.interceptor";
import { AtPayload as AtPayloadInterface } from "./interfaces/at-payload.interface";

@UseInterceptors(AtPayloadInterceptor, AckRmqInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller()
export class AppController {
    constructor(
        private readonly appService: AppService,
        @Inject("AUTH")
        private readonly authClient: ClientProxy
    ) {}

    @MessagePattern("add")
    add(@Payload() addUserReqDto: AddUserReqDto) {
        this.appService.add(addUserReqDto);
    }

    @UseGuards(AtGuard)
    @MessagePattern("update")
    update(@AtPayload() atPayload: AtPayloadInterface) {
        //return this.appService.update(atPayload.sub);
    }
}
