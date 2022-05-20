import {
    Body,
    Controller,
    Get,
    Inject,
    Post,
    Query,
    Req,
    Res,
    UseFilters,
} from "@nestjs/common";
import { Request, Response } from "express";
import { firstValueFrom } from "rxjs";
import { Cookie } from "../decorators/cookies.decorator";
import { AuthService } from "./auth.service";
import { ClientProxy } from "@nestjs/microservices";
import { AllExceptionsFilter } from "../exception-filters/rpc.exception-filter";

@UseFilters(AllExceptionsFilter)
@Controller("auth")
export class AuthController {
    constructor(
        private readonly authService: AuthService,
        @Inject("AUTH")
        private readonly authClient: ClientProxy
    ) {}

    @Post("email/register")
    async register(
        @Body() user: any,
        @Req() req: Request,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const confirmUrl = `${req.protocol}://${req.get("Host")}${
            req.baseUrl
        }/auth/confirm`;

        const data = await firstValueFrom(
            this.authClient.send("register", {
                ...user,
                confirmUrl,
            })
        );
    }

    @Post("email/login")
    async login(
        @Body() user: any,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const data = await firstValueFrom(
            this.authClient.send("login", { body: user })
        );

        res.setHeader("Set-Cookie", [...data.cookies]);
    }

    @Post("refresh")
    async refresh(
        @Cookie("rt") rt: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const data = await firstValueFrom(
            this.authClient.send("refresh", { cookies: { rt } })
        );

        res.setHeader("Set-Cookie", [...data.cookies]);
    }

    @Post("logout")
    async logout(
        @Cookie("at") at: string,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const data = await firstValueFrom(
            this.authClient.send("logout", { cookies: { at } })
        );

        data.cookies.forEach((cookie) => {
            res.clearCookie(cookie);
        });
    }

    @Get("confirm")
    async confirm(@Query() queries: any): Promise<any> {
        const data = await firstValueFrom(
            this.authClient.send("confirm", { ...queries })
        );
    }

    @Get("forgot")
    async forgot(@Query() queries: any, @Req() req: Request): Promise<any> {
        const resetUrl = `${req.protocol}://${req.get("Host")}${
            req.baseUrl
        }/auth/reset`;

        const data = await firstValueFrom(
            this.authClient.send("forgot", { ...queries, resetUrl })
        );
    }

    @Post("reset")
    async reset(
        @Body() resetReqDto: any,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const data = await firstValueFrom(
            this.authClient.send("reset", { ...resetReqDto })
        );

        data.cookies.forEach((cookie) => {
            res.clearCookie(cookie);
        });
    }

    @Post("change")
    async change(
        @Body() changetReqDto: any,
        @Res({ passthrough: true }) res: Response
    ): Promise<any> {
        const data = await firstValueFrom(
            this.authClient.send("change", { ...changetReqDto })
        );

        res.setHeader("Set-Cookie", [...data.cookies]);
    }
}
