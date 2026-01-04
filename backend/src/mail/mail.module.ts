import { Module } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { createTransport } from "nodemailer";
import { MailService } from "./mail.service";
import { MAIL_TRANSPORTER } from "./mail.constants";

@Module({
  imports: [ConfigModule],
  providers: [
    MailService,
    {
      provide: MAIL_TRANSPORTER,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const host = configService.get<string>("SMTP_HOST");
        const portRaw = configService.get<string>("SMTP_PORT");
        const user = configService.get<string>("SMTP_USER");
        const pass = configService.get<string>("SMTP_PASSWORD");
        const secureRaw = configService.get<string>("SMTP_SECURE");

        const port = portRaw ? Number(portRaw) : undefined;
        const secure =
          secureRaw !== undefined
            ? ["true", "1", "yes"].includes(secureRaw.toLowerCase())
            : port === 465;

        if (!host || !port || !user || !pass) {
          return createTransport({ jsonTransport: true });
        }

        return createTransport({
          host,
          port: port ?? 587,
          secure,
          auth: { user, pass },
        });
      },
    },
  ],
  exports: [MailService],
})
export class MailModule {}
