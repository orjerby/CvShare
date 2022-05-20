import { MailerService } from "@nestjs-modules/mailer";
import { Injectable } from "@nestjs/common";
import { EmailVerificationReqDto } from "src/dto/email-verification.dto";
import { PasswordResetReqDto } from "src/dto/password-reset.dto";

@Injectable()
export class MailService {
    constructor(private mailerService: MailerService) {}

    async sendEmailVerification(
        emailVerificationReqDto: EmailVerificationReqDto
    ) {
        const url = `${emailVerificationReqDto.confirmUrl}?code=${emailVerificationReqDto.code}`;
        await this.mailerService.sendMail({
            to: emailVerificationReqDto.email,
            subject: "Confirm your Email",
            template: "/confirmation.hbs",
            context: {
                url,
            },
        });
    }

    async sendPasswordReset(passwordResetReqDto: PasswordResetReqDto) {
        const url = `${passwordResetReqDto.resetUrl}?code=${passwordResetReqDto.code}`;
        await this.mailerService.sendMail({
            to: passwordResetReqDto.email,
            subject: "Change your password",
            template: "/password-reset.hbs",
            context: {
                url,
            },
        });
    }
}
