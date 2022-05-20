export class LoginUserReqDto {
    email: string;
    password: string;
}

export class LoginUserResDto {
    cookies: string[];

    constructor(cookies) {
        this.cookies = cookies;
    }
}
