import { NestFactory } from "@nestjs/core";
import { MicroserviceOptions, Transport } from "@nestjs/microservices";
import { AppModule } from "./app.module";
import { BadRequestExceptionFilter } from "./exception-filters/bad-request.exception-filter";
import { RpcInterceptor } from "./interceptors/rpc.interceptor";

async function bootstrap() {
    const app = await NestFactory.createMicroservice<MicroserviceOptions>(
        AppModule,
        {
            transport: Transport.RMQ,
            options: {
                urls: [`amqp://admin:admin@rabbitmq:5672`],
                queue: "users_queue",
                noAck: false,
                queueOptions: {
                    durable: false,
                },
            },
        }
    );
    app.useGlobalInterceptors(new RpcInterceptor());
    app.useGlobalFilters(new BadRequestExceptionFilter());
    await app.listen();
}
bootstrap();
