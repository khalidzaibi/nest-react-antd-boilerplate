import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
  Logger,
} from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LogoutPayloadDto } from "./dto/logout-payload.dto";
import { InjectModel } from "@nestjs/mongoose";
import { Model } from "mongoose";
import { ConfigService } from "@nestjs/config";
import { User, UserDocument } from "../users/schemas/user.schema";
import {
  UserPreference,
  UserPreferenceDocument,
} from "./schemas/user-preference.schema";
import {
  PasswordResetToken,
  PasswordResetTokenDocument,
} from "./schemas/password-reset-token.schema";
import { LoginOtp, LoginOtpDocument } from "./schemas/login-otp.schema";
import * as crypto from "crypto";
import { MailService } from "../mail/mail.service";
import { buildPasswordResetEmail } from "./templates/password-reset.template";
import { buildLoginOtpEmail } from "./templates/login-otp.template";
import { resolveMailConfig } from "../common/utils/mail-config.util";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { PermissionsCacheService } from "../common/services/permissions-cache.service";

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
    private readonly permissionsCache: PermissionsCacheService,
    @InjectModel(User.name) private readonly userModel: Model<UserDocument>,
    @InjectModel(UserPreference.name)
    private readonly userPreferenceModel: Model<UserPreferenceDocument>,
    @InjectModel(PasswordResetToken.name)
    private readonly passwordResetTokenModel: Model<PasswordResetTokenDocument>,
    @InjectModel(LoginOtp.name)
    private readonly loginOtpModel: Model<LoginOtpDocument>
  ) {}

  private async validateUser(email: string, password: string) {
    const userDoc = await this.usersService.findByEmail(email);
    if (!userDoc) throw new UnauthorizedException("Invalid credentials");

    if (userDoc.status == false) {
      throw new UnauthorizedException("User is disabled");
    }

    const valid = await bcrypt.compare(password, userDoc.passwordHash);
    if (!valid) throw new UnauthorizedException("Invalid credentials");

    return userDoc;
  }

  async login(req: any, email: string, password: string): Promise<any> {
    const userDoc = await this.validateUser(email, password);
    if (!this.isLoginOtpEnabled()) {
      return this.userLoginAfterValidation(userDoc, req);
    }

    const otpMeta = await this.sendLoginOtp(userDoc);

    return {
      twoFactorRequired: true,
      message: "Verification code sent to your email",
      expiresInMinutes: otpMeta.expiresInMinutes,
      email: userDoc.email,
    };
  }

  async userLoginAfterValidation(userDoc: any, req: any) {
    const payload = { sub: userDoc._id.toString(), email: userDoc.email };
    const token = await this.jwtService.signAsync(payload);

    // hash the token before saving
    // const hashedToken = await bcrypt.hash(token, 10);

    // userDoc.accessToken = hashedToken;
    await this.usersService.updateToken(userDoc._id as string, token as string);

    // Fetch roles with permissions
    const { rolesName, permissions, modules } =
      await this.usersService.rolePermissions(userDoc._id as string);
    const roles = {
      roles: rolesName,
      permissions,
      modules,
    };
    this.permissionsCache.set(userDoc._id.toString(), permissions);

    const preferencesDoc = await this.userPreferenceModel
      .findOne({ user: userDoc._id })
      .lean()
      .exec();
    const userPreferences = preferencesDoc
      ? {
          lastMenu: preferencesDoc.lastMenu,
          tags: preferencesDoc.tags || [],
        }
      : null;

    const designationName = (userDoc as any)?.designationData?.name ?? null;

    const userPayload = userDoc.toJSON ? userDoc.toJSON() : { ...userDoc };
    delete (userPayload as any).designationData;
    userPayload.isPasswordChanged = Boolean(userPayload.isPasswordChanged);

    return {
      access_token: token,
      user: {
        ...userPayload,
        designationName,
        ...roles,
        userPreferences,
      },
    };
  }

  async logout(
    userId: string,
    token: string,
    payload?: LogoutPayloadDto
  ): Promise<void> {
    if (payload) {
      const hasLastMenu =
        payload.lastMenu !== undefined &&
        payload.lastMenu !== null &&
        payload.lastMenu !== "";
      const hasTags = Array.isArray(payload.tags) && payload.tags.length > 0;

      if (!hasLastMenu && !hasTags) {
        await this.userPreferenceModel.deleteOne({ user: userId }).exec();
      } else {
        const update: Partial<UserPreference> = {};
        if (payload.lastMenu !== undefined) {
          update.lastMenu = payload.lastMenu;
        }
        if (payload.tags !== undefined) {
          update.tags = payload.tags;
        }

        if (Object.keys(update).length > 0) {
          await this.userPreferenceModel
            .findOneAndUpdate(
              { user: userId },
              { $set: update, $setOnInsert: { user: userId } },
              { upsert: true, new: true }
            )
            .exec();
        }
      }
    }

    await this.usersService.removeToken(userId, token);
  }

  async changePassword(userId: string, dto: ChangePasswordDto) {
    const user = await this.userModel
      .findById(userId)
      .select("passwordHash")
      .exec();

    if (!user) {
      throw new NotFoundException("User not found");
    }

    const isValid = await bcrypt.compare(
      dto.currentPassword,
      user.passwordHash
    );
    if (!isValid) {
      throw new BadRequestException("Current password is incorrect");
    }

    user.passwordHash = await bcrypt.hash(dto.newPassword, 10);
    user.isPasswordChanged = true;
    await user.save();
  }

  async forgotPassword(email: string): Promise<void> {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) return;

    const userDoc = await this.usersService.findByEmail(normalizedEmail);
    if (!userDoc || userDoc.status == false) {
      return;
    }

    // Remove any existing reset tokens so only the most recent one stays valid.
    await this.passwordResetTokenModel.deleteMany({ user: userDoc._id }).exec();

    // Generate a short-lived reset token and store a hashed copy in the database.
    const resetToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = await bcrypt.hash(resetToken, 10);

    // Set the token to expire in an hour
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

    await this.passwordResetTokenModel.create({
      user: userDoc._id,
      token: hashedToken,
      expiresAt,
    });

    const { appName, supportEmail, baseUrl } = resolveMailConfig(
      this.configService
    );
    const resetLink = baseUrl
      ? `${baseUrl}/reset-password?token=${encodeURIComponent(
          resetToken
        )}&email=${encodeURIComponent(normalizedEmail)}`
      : resetToken;

    const { subject, text, html } = buildPasswordResetEmail({
      appName,
      resetLink,
      supportEmail,
    });

    try {
      await this.mailService.sendMail({
        to: normalizedEmail,
        subject,
        text,
        html,
      });
      this.logger.log(`Password reset email dispatched to ${normalizedEmail}`);
    } catch (err) {
      const error =
        err instanceof Error ? err : new Error(String(err ?? "Unknown error"));
      this.logger.error(
        `Failed to send password reset email to ${normalizedEmail}`,
        error.stack
      );
    }

    // if (
    //   (this.configService.get<string>("NODE_ENV") || "").toLowerCase() !==
    //   "production"
    // ) {
    //   this.logger.log(
    //     `Generated password reset token for user ${normalizedEmail}. (Token: ${resetToken})`
    //   );
    // }
  }

  async resetPassword(dto: ResetPasswordDto): Promise<void> {
    const normalizedEmail = dto.email?.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException("Email is required");
    }

    const userDoc = await this.usersService.findByEmail(normalizedEmail);
    if (!userDoc) {
      throw new BadRequestException("Invalid reset token or email");
    }

    const resetTokenDoc = await this.passwordResetTokenModel
      .findOne({ user: userDoc._id })
      .exec();

    if (!resetTokenDoc) {
      throw new BadRequestException("Reset token has expired or is invalid");
    }

    if (resetTokenDoc.expiresAt && resetTokenDoc.expiresAt < new Date()) {
      await this.passwordResetTokenModel
        .deleteOne({ _id: resetTokenDoc._id })
        .exec();
      throw new BadRequestException("Reset token has expired or is invalid");
    }

    const isTokenValid = await bcrypt.compare(dto.token, resetTokenDoc.token);
    if (!isTokenValid) {
      throw new BadRequestException("Reset token has expired or is invalid");
    }

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    await this.userModel
      .updateOne(
        { _id: userDoc._id },
        { $set: { passwordHash: hashedPassword, isPasswordChanged: true } }
      )
      .exec();

    await this.passwordResetTokenModel.deleteMany({ user: userDoc._id }).exec();
  }

  async verifyLoginOtp(req: any, email: string, code: string) {
    const normalizedEmail = email?.trim().toLowerCase();
    if (!normalizedEmail) {
      throw new BadRequestException("Email is required");
    }

    const userDoc = await this.usersService.findByEmail(normalizedEmail);
    if (!userDoc || userDoc.status === false) {
      throw new UnauthorizedException("Invalid credentials");
    }

    const otpDoc = await this.loginOtpModel
      .findOne({
        user: userDoc._id,
        expiresAt: { $gt: new Date() },
      })
      .sort({ createdAt: -1 })
      .exec();

    if (!otpDoc) {
      throw new BadRequestException("Invalid or expired code");
    }

    const isValid = await bcrypt.compare(code, otpDoc.codeHash);
    if (!isValid) {
      const attempts = (otpDoc.attempts ?? 0) + 1;
      const update: any = { attempts };
      if (attempts >= 5) {
        // Drop the OTP after too many failed attempts
        await this.loginOtpModel.deleteMany({ user: userDoc._id }).exec();
      } else {
        await this.loginOtpModel
          .updateOne({ _id: otpDoc._id }, { $set: update })
          .exec();
      }
      throw new BadRequestException("Invalid or expired code");
    }

    await this.loginOtpModel.deleteMany({ user: userDoc._id }).exec();
    return this.userLoginAfterValidation(userDoc, req);
  }

  private generateOtpCode() {
    return Math.floor(100000 + Math.random() * 900000).toString();
  }

  private getLoginOtpTtlMinutes() {
    const raw = this.configService.get<string>("LOGIN_OTP_TTL_MINUTES");
    const parsed = parseInt(raw ?? "", 10);
    return Number.isFinite(parsed) && parsed > 0 ? parsed : 10;
  }

  private async sendLoginOtp(userDoc: any) {
    const code = this.generateOtpCode();
    const codeHash = await bcrypt.hash(code, 10);
    const ttlMinutes = this.getLoginOtpTtlMinutes();
    const expiresAt = new Date(Date.now() + ttlMinutes * 60 * 1000);

    await this.loginOtpModel.deleteMany({ user: userDoc._id }).exec();
    await this.loginOtpModel.create({
      user: userDoc._id,
      codeHash,
      expiresAt,
      attempts: 0,
    });

    const { appName, supportEmail } = resolveMailConfig(this.configService);
    const { subject, text, html } = buildLoginOtpEmail({
      appName,
      code,
      expiresInMinutes: ttlMinutes,
    });

    try {
      await this.mailService.sendMail({
        to: userDoc.email,
        subject,
        text,
        html,
        replyTo: supportEmail,
      });
    } catch (error) {
      this.logger.error(
        `Failed to send login verification email to ${userDoc.email}`,
        error?.stack || String(error)
      );
      throw new InternalServerErrorException(
        "Failed to send verification code"
      );
    }

    return { expiresInMinutes: ttlMinutes, expiresAt };
  }

  private isLoginOtpEnabled() {
    const raw = this.configService.get<string>("LOGIN_OTP_ENABLED");
    if (!raw) return false;
    const normalized = raw.trim().toLowerCase();
    return ["1", "true", "yes", "on"].includes(normalized);
  }
}
