import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { JwtModule } from "@nestjs/jwt";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { User, UserSchema } from "./schemas/user.schema";
import { PassportModule } from "@nestjs/passport";
import { AtStrategy } from "./strategies/at.strategy";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { options as cvOptions } from "./rabbitmq/cvs-queue.options";
import { options as authOptions } from "./rabbitmq/auth-queue.options";

@Module({
    imports: [
        MongooseModule.forRoot(process.env.MONGODB_URI_USERS), // actual connection to mongodb users db
        ClientsModule.register([
            {
                name: "CVS",
                transport: Transport.RMQ,
                options: cvOptions,
            },
            {
                name: "AUTH",
                transport: Transport.RMQ,
                options: authOptions,
            },
        ]),
        MongooseModule.forFeature([{ name: User.name, schema: UserSchema }]),
        JwtModule.register({}),
        PassportModule,
    ],
    controllers: [AppController],
    providers: [AppService, AtStrategy],
})
export class AppModule {}
