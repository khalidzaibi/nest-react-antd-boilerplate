import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { OptionsController } from "./options.controller";
import { Option, OptionSchema } from "./schemas/option.schema";
import { OptionsService } from "./options.service";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { UsersModule } from "../users/users.module";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([{ name: Option.name, schema: OptionSchema }]),
  ],
  controllers: [OptionsController],
  providers: [OptionsService, PermissionsGuard],
  exports: [OptionsService, MongooseModule],
})
export class OptionsModule {}
