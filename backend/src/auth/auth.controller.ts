import {
  Body,
  Controller,
  Post,
  Req,
  Get,
  Patch,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
} from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginDto } from "./dto/login.dto";
import { Public } from "common/decorators/public.decorator";
import { GetUser } from "../common/decorators/get-user.decorator";
import { UsersService } from "../users/users.service";
import { UpdateProfileDto } from "../users/dto/user.dto";
import { ChangePasswordDto } from "./dto/change-password.dto";
import { LogoutPayloadDto } from "./dto/logout-payload.dto";
import { ForgotPasswordDto } from "./dto/forgot-password.dto";
import { ResetPasswordDto } from "./dto/reset-password.dto";
import { VerifyLoginOtpDto } from "./dto/verify-login-otp.dto";
import { FileInterceptor } from "@nestjs/platform-express";
import { FilesService } from "files/files.service";
import * as path from "path";

@Controller("auth")
export class AuthController {
  constructor(
    private readonly usersService: UsersService,
    private readonly authService: AuthService,
    private readonly filesService: FilesService
  ) {}

  // OPEN endpoint
  @Public()
  @Post("login")
  async login(@Req() req: any, @Body() dto: LoginDto) {
    try {
      return this.authService.login(req, dto.email, dto.password);
    } catch (err) {
      throw new BadRequestException(err.message);
    }
  }

  @Public()
  @Post("login/verify-otp")
  async verifyLoginOtp(@Req() req: any, @Body() dto: VerifyLoginOtpDto) {
    return this.authService.verifyLoginOtp(req, dto.email, dto.code);
  }

  @Public()
  @Post("forgot-password")
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return {
      message:
        "If an account exists for that email, password reset instructions have been sent.",
    };
  }

  @Public()
  @Post("reset-password")
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto);
    return { message: "Password has been reset successfully" };
  }

  @Post("logout")
  async logout(@Req() req: any, @Body() dto: LogoutPayloadDto) {
    await this.authService.logout(req.user.userId, req.user.token, dto);
    return { message: "Logout successful" };
  }
  @Get("me")
  async getMe(@GetUser("userId") userId: string) {
    return this.usersService.findById(userId);
  }

  @Patch("me")
  async updateMe(
    @GetUser("userId") userId: string,
    @Body() dto: UpdateProfileDto
  ) {
    return this.usersService.updateProfile(userId, dto);
  }

  @Patch("me/password")
  async changePassword(
    @GetUser("userId") userId: string,
    @Body() dto: ChangePasswordDto
  ) {
    await this.authService.changePassword(userId, dto);
    return { message: "Password updated successfully" };
  }

  @Post("me/avatar")
  @UseInterceptors(FileInterceptor("avatar"))
  async uploadAvatar(
    @Req() req: any,
    @UploadedFile() file: Express.Multer.File
  ) {
    const userId = req.user.userId;

    if (!file) {
      throw new BadRequestException("Avatar file is required");
    }

    const dest = path.join("avatars", userId);
    await this.filesService.ensureDir(dest);

    const savedFile = await this.filesService.createFromUpload(
      dest,
      {
        modelType: "User",
        modelId: userId,
        collectionType: "user-avatar",
        metadata: {},
      },
      file,
      userId
    );

    const avatarPath = savedFile?.path ?? null;
    const updated = await this.usersService.updateProfile(userId, {
      avatar: avatarPath,
    });

    return {
      message: "Avatar updated successfully",
      data: updated,
    };
  }
}
