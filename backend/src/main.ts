import { register } from "tsconfig-paths";
register({
  baseUrl: __dirname,
  paths: {
    "*": ["*"],
  },
});
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { ValidationExceptionFilter } from "./common/filters/validation-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ ACCESS EXPRESS INSTANCE SAFELY
  const server = app.getHttpAdapter().getInstance();
  server.set("trust proxy", 1); // 🔐 TRUST NGINX ONLY

  const config = app.get(ConfigService);

  // Detect environment
  const isProd = process.env.NODE_ENV === "production";

  app.setGlobalPrefix("api");
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  // const origin = config.get<string>("FRONTEND_ORIGIN") ?? "*";
  const origin = isProd
    ? config.get<string>("FRONTEND_ORIGIN_PROD")
    : config.get<string>("FRONTEND_ORIGIN");
  app.enableCors({ origin, credentials: true });

  // Global validation pipe with custom error response
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.useGlobalFilters(new ValidationExceptionFilter());

  // app.useGlobalPipes(
  //   new ValidationPipe({
  //     exceptionFactory: (errors) => {
  //       const messages = errors.flatMap(err => Object.values(err.constraints ?? {}));
  //       return new BadRequestException({
  //         messages: messages,        // full array of errors
  //         message: messages[0],  // first error only
  //       });
  //     },
  //   }),
  // );

  const port = config.get<number>("PORT") ?? 3000;
  await app.listen(port);
  console.log(`API running on http://localhost:${port}/api`);
}
bootstrap();
