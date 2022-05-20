import { Injectable } from "@nestjs/common";
import { EmailVerificationReqDto } from "./dto/email-verification.dto";
import { PasswordResetReqDto } from "./dto/password-reset.dto";
import { MailService } from "./mail/mail.service";

@Injectable()
export class AppService {
    constructor(private mailService: MailService) {}

    async sendEmailVerification(
        emailVerificationReqDto: EmailVerificationReqDto
    ): Promise<any> {
        await this.mailService.sendEmailVerification(emailVerificationReqDto);
    }

    async sendPasswordReset(
        passwordResetReqDto: PasswordResetReqDto
    ): Promise<any> {
        await this.mailService.sendPasswordReset(passwordResetReqDto);
    }
}
