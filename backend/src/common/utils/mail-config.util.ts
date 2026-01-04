import { ConfigService } from "@nestjs/config";

export const resolveMailConfig = (configService: ConfigService) => {
  const appName = configService.get<string>("APP_NAME") ?? "YO CRM";

  const supportEmail =
    configService.get<string>("MAIL_FROM") ??
    configService.get<string>("GMAIL_SUPPORT_USER") ??
    null;

  const nodeEnv = (configService.get<string>("NODE_ENV") || "").toLowerCase();
  const prodResetUrl = configService.get<string>("FRONTEND_ORIGIN_PROD");
  const defaultResetUrl =
    configService.get<string>("FRONTEND_ORIGIN") ?? prodResetUrl;
  const baseUrl =
    nodeEnv === "production"
      ? prodResetUrl ?? defaultResetUrl
      : defaultResetUrl;

  return { appName, supportEmail, baseUrl };
};
