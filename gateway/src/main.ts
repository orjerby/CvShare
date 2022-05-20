import { Logger } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import * as cookieParser from "cookie-parser";
import { AppModule } from "./app.module";

const bootstrap = async () => {
    const app = await NestFactory.create(AppModule);
    app.use(cookieParser());
    const logger = app.get(Logger);
    await app.listen(3000);
    logger.log(`Application listening at ${await app.getUrl()}`);
};

bootstrap();
