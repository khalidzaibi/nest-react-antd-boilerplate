import { Module } from "@nestjs/common";
import { RoleSeeder } from "./roles/role.seeder";
import { OptionsSeeder } from "./options/options.seeder";
import { UsersSeeder } from "./users/users.seeder";
import { UserDetailsSeeder } from "./users/userDetails.seeder";
import { UserDocumentsSeeder } from "./users/userDocuments.seeder";

import { UsersModule } from "../users/users.module";
import { RbacModule } from "../rbac/rbac.module";
import { OptionsModule } from "../options/options.module";
// Add other feature modules your seeders depend on

@Module({
  imports: [
    RbacModule,
    UsersModule,
    OptionsModule,
    // other modules used by seeders
  ],
  providers: [
    RoleSeeder,
    UsersSeeder,
    OptionsSeeder,
    UserDetailsSeeder,
    UserDocumentsSeeder,
  ],
  exports: [
    RoleSeeder,
    UsersSeeder,
    OptionsSeeder,
    UserDetailsSeeder,
    UserDocumentsSeeder,
  ],
})
export class SeederModule {}
