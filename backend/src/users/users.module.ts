import { Module } from "@nestjs/common";
import { MongooseModule } from "@nestjs/mongoose";
import { UsersService } from "./users.service";
import { UsersController } from "./users.controller";
import { User, UserSchema } from "./schemas/user.schema";
import { UserDetails, UserDetailsSchema } from "./schemas/user-details.schema";
import {
  UserDocument,
  UserDocumentSchema,
} from "./schemas/user-document.schema";
import {
  UserAccessToken,
  UserAccessTokenSchema,
} from "./schemas/user-access-token.schema";
import { Role, RoleSchema } from "../rbac/schema/role.schema";
import { PermissionsCacheService } from "../common/services/permissions-cache.service";
import { PermissionsGuard } from "../common/guards/permissions.guard";
import { Option, OptionSchema } from "options/schemas/option.schema";
import { UsersImportService } from "./users-import.service";
import { RolesCacheService } from "../common/services/roles-cache.service";
import { configureRoleHelpers } from "../common/utils/roles.util";

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: User.name, schema: UserSchema },
      { name: UserDetails.name, schema: UserDetailsSchema },
      { name: UserDocument.name, schema: UserDocumentSchema },
      { name: UserAccessToken.name, schema: UserAccessTokenSchema },
      { name: Role.name, schema: RoleSchema },
      { name: Option.name, schema: OptionSchema },
    ]),
  ],
  controllers: [UsersController],
  providers: [
    UsersService,
    UsersImportService,
    PermissionsCacheService,
    RolesCacheService,
    PermissionsGuard,
    {
      provide: "ROLE_HELPERS_INIT",
      inject: [UsersService, RolesCacheService],
      useFactory: (usersService: UsersService, rolesCache: RolesCacheService) => {
        configureRoleHelpers({ usersService, rolesCache });
        return true;
      },
    },
  ],
  exports: [
    UsersService,
    UsersImportService,
    PermissionsCacheService,
    RolesCacheService,
    MongooseModule,
  ],
})
export class UsersModule {}
