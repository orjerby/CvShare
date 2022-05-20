import {
    ArgumentMetadata,
    BadRequestException,
    CallHandler,
    Controller,
    ExecutionContext,
    HttpException,
    HttpStatus,
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
    BaseRpcExceptionFilter,
    ClientProxy,
    Ctx,
    EventPattern,
    MessagePattern,
    Payload,
    RmqContext,
    RpcException,
} from "@nestjs/microservices";
import { AppService } from "./app.service";
import { AtPayload } from "./decorators/at-payload.decorator";
import { User } from "./decorators/user.decorator";

import {
    RegisterUserReqDto,
    RegisterUserResDto,
} from "./dto/register-user.dto";
import { BadRequestExceptionFilter } from "./exception-filters/bad-request.exception-filter";
import { EmailGuard } from "./guards/email.guard";
import { AckRmqInterceptor } from "./interceptors/ack-rmq.interceptor";
import { AtPayloadInterceptor } from "./interceptors/at-payload.interceptor";
import { User as UserSchema } from "./schemas/user.schema";
import { AtPayload as AtPayloadInterface } from "./interfaces/at-payload.interface";
import { AtGuard } from "./guards/at.guard";
import { RtGuard } from "./guards/rt.guard";
import { Cookie } from "./decorators/cookies.decorator";
import { LoginUserResDto } from "./dto/login-user.dto";
import { firstValueFrom } from "rxjs";
import { LogoutUserResDto } from "./dto/logout-user.dto";
import { ConfirmReqDto } from "./dto/confirm.dto";
import { ResetReqDto } from "./dto/reset.dto";
import { ChangetReqDto } from "./dto/change.dto";
import { ForgotReqDto } from "./dto/forgot.dto";

@UseInterceptors(AtPayloadInterceptor, AckRmqInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @MessagePattern("register")
    async register(
        @Payload() registerUserReqDto: RegisterUserReqDto
    ): Promise<any> {
        await this.appService.register(registerUserReqDto);

        return true;
    }

    @UseGuards(EmailGuard)
    @MessagePattern("login")
    async login(@User() user: UserSchema): Promise<LoginUserResDto> {
        const loginUserResDto: LoginUserResDto =
            await this.appService.createTokens(user._id);

        return loginUserResDto;
    }

    @UseGuards(RtGuard)
    @MessagePattern("refresh")
    async refresh(@Cookie("rt") rt: string): Promise<LoginUserResDto> {
        const loginUserResDto: LoginUserResDto = await this.appService.refresh(
            rt
        );

        return loginUserResDto;
    }

    @UseGuards(AtGuard)
    @MessagePattern("logout")
    async logout(
        @AtPayload() atPayload: AtPayloadInterface
    ): Promise<LogoutUserResDto> {
        const logoutUserResDto: LogoutUserResDto = await this.appService.logout(
            atPayload.rtid
        );

        return logoutUserResDto;
    }

    @MessagePattern("confirm")
    async confirm(@Payload() confirmReqDto: ConfirmReqDto): Promise<any> {
        await this.appService.confirm(confirmReqDto);

        return true;
    }

    @MessagePattern("forgot")
    async forgot(@Payload() forgotReqDto: ForgotReqDto): Promise<any> {
        await this.appService.forgot(forgotReqDto);

        return true;
    }

    @MessagePattern("reset")
    async reset(@Payload() resetReqDto: ResetReqDto): Promise<any> {
        const logoutUserResDto: LogoutUserResDto = await this.appService.reset(
            resetReqDto
        );

        return logoutUserResDto;
    }

    @UseGuards(AtGuard)
    @MessagePattern("change")
    async change(
        @AtPayload() atPayload: AtPayloadInterface,
        @Payload() changetReqDto: ChangetReqDto
    ): Promise<any> {
        const loginUserResDto: LoginUserResDto = await this.appService.change(
            atPayload.sub,
            changetReqDto
        );

        return loginUserResDto;
    }
}
