import {
    Controller,
    UseInterceptors,
    UsePipes,
    ValidationPipe,
} from "@nestjs/common";
import { MessagePattern, Payload } from "@nestjs/microservices";
import { AppService } from "./app.service";
import { EmailVerificationReqDto } from "./dto/email-verification.dto";
import { PasswordResetReqDto } from "./dto/password-reset.dto";

import { AckRmqInterceptor } from "./interceptors/ack-rmq.interceptor";

@UseInterceptors(AckRmqInterceptor)
@UsePipes(new ValidationPipe({ whitelist: true }))
@Controller()
export class AppController {
    constructor(private readonly appService: AppService) {}

    @MessagePattern("email_verification")
    async emailVerification(
        @Payload() emailVerificationReqDto: EmailVerificationReqDto
    ): Promise<any> {
        await this.appService.sendEmailVerification(emailVerificationReqDto);
    }

    @MessagePattern("password_reset")
    async passwordReset(
        @Payload() passwordResetReqDto: PasswordResetReqDto
    ): Promise<any> {
        await this.appService.sendPasswordReset(passwordResetReqDto);
    }
}
