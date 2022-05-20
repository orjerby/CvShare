import {
    BadRequestException,
    ForbiddenException,
    Inject,
    Injectable,
    NotFoundException,
    UnauthorizedException,
} from "@nestjs/common";
import { InjectConnection, InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import * as bcrypt from "bcrypt";
import { JwtService } from "@nestjs/jwt";
import {
    RegisterUserReqDto,
    RegisterUserResDto,
} from "./dto/register-user.dto";
import { User, UserDocument } from "./schemas/user.schema";
import { Token, TokenDocument } from "./schemas/token.schema";
import { LoginUserReqDto, LoginUserResDto } from "./dto/login-user.dto";
import { v4 as uuidv4 } from "uuid";
import { AtPayload } from "./interfaces/at-payload.interface";
import { ClientProxy } from "@nestjs/microservices";
import { firstValueFrom } from "rxjs";
import { LogoutUserResDto } from "./dto/logout-user.dto";
import { createHash } from "crypto";
import { Code, CodeDocument } from "./schemas/code.schema";
import { ConfirmReqDto } from "./dto/confirm.dto";
import { Connection } from "mongoose";
import { ClientSession } from "mongodb";
import { ResetReqDto } from "./dto/reset.dto";
import { ChangetReqDto } from "./dto/change.dto";
import { ForgotReqDto } from "./dto/forgot.dto";

@Injectable()
export class AppService {
    constructor(
        private readonly jwtService: JwtService,
        @InjectModel(User.name)
        private readonly userModel: Model<UserDocument>,
        @InjectModel(Token.name)
        private readonly tokenModel: Model<TokenDocument>,
        @InjectModel(Code.name)
        private readonly codeModel: Model<CodeDocument>,
        @Inject("USERS")
        private readonly usersClient: ClientProxy,
        @Inject("NOTIFICATIONS")
        private readonly notificationsClient: ClientProxy,
        @InjectConnection() private readonly connection: Connection
    ) {}

    async register(user: RegisterUserReqDto): Promise<void> {
        const existingUser = await this.findOne(user.email, "email");

        if (existingUser) {
            throw new BadRequestException("User email must be unique");
        }

        if (user.password !== user.confirmationPassword) {
            throw new BadRequestException(
                "Password and Confirmation Password must match"
            );
        }

        let createdUser: User;
        const emailVerificationCode = uuidv4();

        const session = await this.connection.startSession();

        await session.withTransaction(async () => {
            createdUser = await this.createUser(user, session);

            await this.createEmailVerificationCode(
                emailVerificationCode,
                createdUser._id,
                session
            );
        });

        session.endSession();

        this.usersClient.emit("add", {
            _id: createdUser._id,
            email: createdUser.email,
            firstName: user.firstName,
            lastName: user.lastName,
        });

        this.notificationsClient.emit("email_verification", {
            code: emailVerificationCode,
            email: user.email,
            confirmUrl: user.confirmUrl,
        });
    }

    async validateUser(user: LoginUserReqDto): Promise<User> {
        const foundUser = await this.findOne(user.email, "email");

        if (
            !foundUser ||
            !(await bcrypt.compare(user.password, foundUser.hashed_password))
        ) {
            throw new UnauthorizedException("Incorrect email or password");
        }

        if (!foundUser.activated) {
            throw new UnauthorizedException("Email is not verified");
        }

        return foundUser;
    }

    async createTokens(userId: string): Promise<LoginUserResDto> {
        const rt = uuidv4();

        const createdToken = await this.createToken(userId, rt);

        const cookies = await this.getCookies(userId, createdToken._id, rt);

        return cookies;
    }

    async refresh(rt: string): Promise<LoginUserResDto> {
        const updatedToken = await this.tokenModel.findOneAndUpdate(
            { hashed_value: createHash("sha256").update(rt).digest("hex") },
            { expires: new Date() },
            { new: true }
        );

        if (!updatedToken) {
            throw new ForbiddenException();
        }

        const loginUserResDto = await this.createTokens(updatedToken.user_id);

        return loginUserResDto;
    }

    async logout(rtid: string): Promise<LogoutUserResDto> {
        const updatedToken: Token = await this.tokenModel.findOneAndUpdate(
            {
                _id: rtid,
                expires: {
                    $gt: new Date(),
                },
            },
            { expires: new Date() },
            {
                new: true,
            }
        );

        if (!updatedToken) {
            throw new NotFoundException("User is not logged in");
        }

        const logoutUserResDto = new LogoutUserResDto(["at", "rt"]);

        return logoutUserResDto;
    }

    async confirm(confirmReqDto: ConfirmReqDto): Promise<void> {
        const hashedToken = createHash("sha256")
            .update(confirmReqDto.code)
            .digest("hex");

        const foundCode = await this.codeModel.findOne({
            hashed_value: hashedToken,
            type: "email_verification",
        });

        if (!foundCode) {
            throw new BadRequestException("Code not found");
        }

        if (foundCode.used) {
            throw new BadRequestException("Code is used");
        }

        if (foundCode.expires < new Date()) {
            throw new BadRequestException("Code is expired");
        }

        const session = await this.connection.startSession();

        await session.withTransaction(async () => {
            const updatedUser = await this.userModel.findOneAndUpdate(
                {
                    _id: foundCode.user_id,
                    activated: false,
                },
                { activated: true },
                {
                    new: true,
                    session,
                }
            );

            if (!updatedUser) {
                throw new BadRequestException("User is already verified");
            }

            await this.codeModel.findByIdAndUpdate(
                foundCode._id,
                {
                    used: true,
                },
                {
                    new: true,
                    session,
                }
            );

            await this.codeModel.updateMany(
                {
                    user_id: foundCode.user_id,
                    type: "email_verification",
                    used: false,
                    expires: {
                        $gt: new Date(),
                    },
                },
                {
                    expires: new Date(),
                },
                {
                    new: true,
                    session,
                }
            );
        });

        session.endSession();
    }

    async forgot(forgotReqDto: ForgotReqDto): Promise<any> {
        const passwordResetCode = uuidv4();

        await this.createPasswordResetCode(
            passwordResetCode,
            forgotReqDto.email
        );

        this.notificationsClient.emit("password_reset", {
            code: passwordResetCode,
            email: forgotReqDto.email,
            resetUrl: forgotReqDto.resetUrl,
        });
    }

    async reset(resetReqDto: ResetReqDto): Promise<LogoutUserResDto> {
        if (resetReqDto.password !== resetReqDto.confirmationPassword) {
            throw new BadRequestException(
                "Password and Confirmation Password must match"
            );
        }

        const foundCode = await this.codeModel.findOne({
            hashed_value: createHash("sha256")
                .update(resetReqDto.code)
                .digest("hex"),
            type: "password_reset",
        });

        if (!foundCode) {
            throw new BadRequestException("Code not found");
        }

        if (foundCode.used) {
            throw new BadRequestException("Code is used");
        }

        if (foundCode.expires < new Date()) {
            throw new BadRequestException("Code is expired");
        }

        const session = await this.connection.startSession();

        await session.withTransaction(async () => {
            await this.userModel.findOneAndUpdate(
                {
                    _id: foundCode.user_id,
                },
                {
                    hashed_password: await bcrypt.hash(
                        resetReqDto.password,
                        10
                    ),
                },
                {
                    new: true,
                    session,
                }
            );

            await this.tokenModel.updateMany(
                {
                    user_id: foundCode.user_id,
                    expires: {
                        $gt: new Date(),
                    },
                },
                {
                    expires: new Date(),
                },
                {
                    new: true,
                    session,
                }
            );

            await this.codeModel.findByIdAndUpdate(
                foundCode._id,
                {
                    used: true,
                },
                {
                    new: true,
                    session,
                }
            );

            await this.codeModel.updateMany(
                {
                    user_id: foundCode.user_id,
                    type: "password_reset",
                    used: false,
                    expires: {
                        $gt: new Date(),
                    },
                },
                {
                    expires: new Date(),
                },
                {
                    new: true,
                    session,
                }
            );
        });

        session.endSession();

        const logoutUserResDto = new LogoutUserResDto(["at", "rt"]);

        return logoutUserResDto;
    }

    async change(
        userId: string,
        changetReqDto: ChangetReqDto
    ): Promise<LoginUserResDto> {
        if (
            changetReqDto.newPassword !== changetReqDto.newConfirmationPassword
        ) {
            throw new BadRequestException(
                "Password and Confirmation Password must match"
            );
        }

        const foundUser = await this.userModel.findById(userId);

        if (!foundUser) {
            throw new BadRequestException("User not found");
        }

        if (
            !(await bcrypt.compare(
                changetReqDto.oldPassword,
                foundUser.hashed_password
            ))
        ) {
            throw new BadRequestException("Incorrect current password");
        }

        const rt = uuidv4();
        let createdToken: Token;

        const session = await this.connection.startSession();

        await session.withTransaction(async () => {
            await this.userModel.findByIdAndUpdate(
                foundUser._id,
                {
                    hashed_password: await bcrypt.hash(
                        changetReqDto.newPassword,
                        10
                    ),
                },
                {
                    new: true,
                    session,
                }
            );

            await this.tokenModel.updateMany(
                {
                    user_id: foundUser._id,
                    expires: {
                        $gt: new Date(),
                    },
                },
                {
                    expires: new Date(),
                },
                {
                    new: true,
                    session,
                }
            );

            createdToken = await this.createToken(foundUser._id, rt, session);
        });

        session.endSession();

        const cookies = await this.getCookies(userId, createdToken._id, rt);

        return cookies;
    }

    private async createUser(
        user: RegisterUserReqDto,
        session: ClientSession = null
    ): Promise<User> {
        const createUser = new this.userModel({
            email: user.email,
            hashed_password: await bcrypt.hash(user.password, 10),
        });

        let createdUser;

        if (session) {
            createdUser = await createUser.save({ session });
        } else {
            createdUser = await createUser.save();
        }

        return createdUser;
    }

    private async createEmailVerificationCode(
        emailVerificationCode: string,
        userId: string,
        session: ClientSession = null
    ) {
        const twoHoursFromNow = new Date();
        twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

        const addCode = new this.codeModel({
            hashed_value: createHash("sha256")
                .update(emailVerificationCode)
                .digest("hex"),
            user_id: userId,
            expires: twoHoursFromNow,
            type: "email_verification",
        });

        let createdCode;

        if (session) {
            createdCode = await addCode.save({ session });
        } else {
            createdCode = await addCode.save();
        }

        return createdCode;
    }

    private async createToken(
        userId,
        rt,
        session: ClientSession = null
    ): Promise<Token> {
        const aYearFromNow = new Date();
        aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

        const addToken = new this.tokenModel({
            hashed_value: createHash("sha256").update(rt).digest("hex"),
            user_id: userId,
            expires: aYearFromNow,
        });

        let createdToken;

        if (session) {
            createdToken = await addToken.save({ session });
        } else {
            createdToken = await addToken.save();
        }

        return createdToken;
    }

    private getCookies(userId, rtid, rt): LoginUserResDto {
        const rtCookie = this.getRtCookie(rt);
        const atCookie = this.getAtCookie(userId, rtid);

        const loginUserResDto = new LoginUserResDto([rtCookie, atCookie]);

        return loginUserResDto;
    }

    private getRtCookie(rt) {
        const rtExpiresIn = 60 * 60 * 24 * 365;

        const rtCookie = `rt=${rt}; HttpOnly; Path=/; Max-Age=${rtExpiresIn}`;

        return rtCookie;
    }

    private getAtCookie(userId, rtid) {
        const atExpiresIn = 60 * 30;

        const atPayload: AtPayload = {
            rtid,
            sub: userId,
            role: "member",
        };

        const at = this.jwtService.sign(atPayload, {
            secret: process.env.ACCESS_TOKEN_SECRET,
            expiresIn: `${atExpiresIn}s`,
        });

        const atCookie = `at=${at}; HttpOnly; Path=/; Max-Age=${atExpiresIn}`;

        return atCookie;
    }

    private async createPasswordResetCode(
        passwordResetCode: string,
        email: string,
        session: ClientSession = null
    ) {
        const twoHoursFromNow = new Date();
        twoHoursFromNow.setHours(twoHoursFromNow.getHours() + 2);

        const foundUser = await this.findOne(email, "email");

        if (!foundUser) {
            throw new BadRequestException("User not found");
        }

        const addCode = new this.codeModel({
            hashed_value: createHash("sha256")
                .update(passwordResetCode)
                .digest("hex"),
            user_id: foundUser._id,
            expires: twoHoursFromNow,
            type: "password_reset",
        });

        let createdCode;

        if (session) {
            createdCode = await addCode.save({ session });
        } else {
            createdCode = await addCode.save();
        }

        return createdCode;
    }

    private findOne(value: string, by: string = "_id"): Promise<User> {
        return this.userModel.findOne({ [by]: value }).exec();
    }
}
