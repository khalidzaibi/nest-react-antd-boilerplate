import { Module } from "@nestjs/common";
import { DatabaseModule } from "./database.module";
import { SeederModule } from "../seeder/seeder.module";
import { RbacModule } from "../rbac/rbac.module";
import { UsersModule } from "../users/users.module";
import { AuthModule } from "../auth/auth.module";
import { OptionsModule } from "options/options.module";

@Module({
  imports: [
    DatabaseModule,
    SeederModule,
    RbacModule,
    UsersModule,
    AuthModule,
    OptionsModule,
  ],
  exports: [
    DatabaseModule,
    SeederModule,
    RbacModule,
    UsersModule,
    AuthModule,
    OptionsModule,
  ],
})
export class ImportsModules {}
