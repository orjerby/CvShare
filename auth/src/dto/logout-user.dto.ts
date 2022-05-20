export class LogoutUserResDto {
    cookies: string[];

    constructor(cookies) {
        this.cookies = cookies;
    }
}
