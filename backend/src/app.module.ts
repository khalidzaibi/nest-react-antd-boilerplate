import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { APP_GUARD } from "@nestjs/core";
import { ServeStaticModule } from "@nestjs/serve-static";
import { MulterModule } from "@nestjs/platform-express";
import { memoryStorage } from "multer";
import { join } from "path";

import { JwtAuthGuard } from "./common/guards/jwt-auth.guard";
import { ImportsModules } from "./common/imports.modules";
import { FilesModule } from "./files/files.module";

const isProduction = process.env.NODE_ENV === "production";

const serveStaticModules = isProduction
  ? [
      ServeStaticModule.forRoot({
        rootPath: join(__dirname, "..", "public"),
        serveRoot: "/public",
      }),
    ]
  : [
      ServeStaticModule.forRoot({
        rootPath: join(process.cwd(), "src", "public"),
        serveRoot: "/public",
      }),
    ];

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    ...serveStaticModules,
    ImportsModules,
    FilesModule,
    MulterModule.registerAsync({
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const configuredLimit = Number(
          configService.get("FILE_UPLOAD_MAX_MB")
        );
        const maxFileSizeMb = Number.isFinite(configuredLimit)
          ? configuredLimit
          : 20;

        return {
          storage: memoryStorage(),
          limits: { fileSize: maxFileSizeMb * 1024 * 1024 },
          fileFilter: (req, file, cb) => cb(null, true),
        };
      },
    }),
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
