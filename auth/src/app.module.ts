import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { User, UserSchema } from "./schemas/user.schema";
import { Token, TokenSchema } from "./schemas/token.schema";
import { EmailStrategy } from "./strategies/email.strategy";
import { PassportModule } from "@nestjs/passport";
import { AtStrategy } from "./strategies/at.strategy";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { Code, CodeSchema } from "./schemas/code.schema";
import { options as usersOptions } from "./rabbitmq/users-queue.options";
import { options as notificationsOptions } from "./rabbitmq/notifications-queue.options";

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI_AUTH), // actual connection to mongodb users db
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        ClientsModule.register([
            {
                name: "USERS",
                transport: Transport.RMQ,
                options: usersOptions,
            },
        ]),
        ClientsModule.register([
            {
                name: "NOTIFICATIONS",
                transport: Transport.RMQ,
                options: notificationsOptions,
            },
        ]),
        MongooseModule.forFeature([{ name: Token.name, schema: TokenSchema }]),
        MongooseModule.forFeature([{ name: Code.name, schema: CodeSchema }]),
        JwtModule.register({}),
        PassportModule,
    ],
    controllers: [AppController],
    providers: [AppService, EmailStrategy, AtStrategy],
})
export class AppModule {}
