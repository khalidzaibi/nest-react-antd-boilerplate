import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { Permission, PermissionSchema } from "./schema/permission.schema";
import { Role, RoleSchema } from "./schema/role.schema";
import { PermissionsController } from "./permissions.controller";
import { PermissionsService } from "./permissions.service";
import { RolesService } from "./roles.service";
import { RolesController } from "./roles.controller";
import { User, UserSchema } from "users/schemas/user.schema";
import { UsersModule } from "../users/users.module";
import { PermissionsGuard } from "../common/guards/permissions.guard";

@Module({
  imports: [
    UsersModule,
    MongooseModule.forFeature([
      { name: Permission.name, schema: PermissionSchema },
      { name: Role.name, schema: RoleSchema },
      { name: User.name, schema: UserSchema },
    ]),
  ],
  controllers: [PermissionsController, RolesController],
  providers: [PermissionsService, RolesService, PermissionsGuard],
  exports: [PermissionsService, RolesService, MongooseModule],
})
export class RbacModule {}
