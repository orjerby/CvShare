import { Module } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { ClientsModule, Transport } from "@nestjs/microservices";
import { options } from "../rabbitmq/auth-queue.options";

@Module({
    imports: [
        ClientsModule.register([
            {
                name: "AUTH",
                transport: Transport.RMQ,
                options,
            },
        ]),
    ],
    controllers: [AuthController],
    providers: [AuthService],
})
export class AuthModule {}
