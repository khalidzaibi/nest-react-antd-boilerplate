import { Module } from "@nestjs/common";
import { JwtModule } from "@nestjs/jwt";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { AuthService } from "./auth.service";
import { AuthController } from "./auth.controller";
import { UsersModule } from "../users/users.module";
import { JwtStrategy } from "./jwt.strategy";
import { MongooseModule } from "@nestjs/mongoose";
import {
  UserPreference,
  UserPreferenceSchema,
} from "./schemas/user-preference.schema";
import {
  PasswordResetToken,
  PasswordResetTokenSchema,
} from "./schemas/password-reset-token.schema";
import { MailModule } from "../mail/mail.module";
import { LoginOtp, LoginOtpSchema } from "./schemas/login-otp.schema";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: UserPreference.name, schema: UserPreferenceSchema },
      { name: PasswordResetToken.name, schema: PasswordResetTokenSchema },
      { name: LoginOtp.name, schema: LoginOtpSchema },
    ]),
    UsersModule,
    MailModule,
    ConfigModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>("JWT_SECRET"),
        signOptions: {
          expiresIn: (config.get<string>("JWT_EXPIRES_IN") || "1d") as any,
        },
      }),
    }),
  ],
  providers: [AuthService, JwtStrategy],
  controllers: [AuthController],
})
export class AuthModule {}
