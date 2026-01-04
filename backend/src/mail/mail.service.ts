import { Inject, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { SendMailOptions, Transporter } from "nodemailer";
import { MAIL_TRANSPORTER } from "./mail.constants";

@Injectable()
export class MailService {
  constructor(
    @Inject(MAIL_TRANSPORTER) private readonly transporter: Transporter,
    private readonly configService: ConfigService
  ) {}

  async sendMail(options: SendMailOptions): Promise<void> {
    const defaultFrom =
      options.from ?? this.configService.get<string>("MAIL_FROM");

    await this.transporter.sendMail({
      ...options,
      from: defaultFrom,
    });
  }
}
