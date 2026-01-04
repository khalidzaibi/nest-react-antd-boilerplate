import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import {
  PERMISSIONS_ALL_KEY,
  PERMISSIONS_ANY_KEY,
} from "../decorators/permissions.decorator";
import { UsersService } from "../../users/users.service";
import { PermissionsCacheService } from "../services/permissions-cache.service";

@Injectable()
export class PermissionsGuard implements CanActivate {
  constructor(
    private readonly reflector: Reflector,
    private readonly usersService: UsersService,
    private readonly permissionsCache: PermissionsCacheService
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const requiresAll =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ALL_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    const requiresAny =
      this.reflector.getAllAndOverride<string[]>(PERMISSIONS_ANY_KEY, [
        context.getHandler(),
        context.getClass(),
      ]) ?? [];

    if (!requiresAll.length && !requiresAny.length) {
      return true;
    }

    const request = context.switchToHttp().getRequest();
    const user = request.user;
    const userId = user?.userId;

    if (!userId) {
      throw new ForbiddenException("Missing user context");
    }

    let userPermissions: string[] | null =
      Array.isArray(user?.permissions) && user.permissions.length
        ? user.permissions
        : this.permissionsCache.get(userId);

    if (!userPermissions) {
      const { permissions } = await this.usersService.rolePermissions(userId);
      userPermissions = permissions;
      this.permissionsCache.set(userId, userPermissions);
      if (user) {
        user.permissions = userPermissions;
      }
    } else if (user) {
      user.permissions = userPermissions;
    }

    const hasAll =
      requiresAll.length === 0 ||
      requiresAll.every((permission) => userPermissions!.includes(permission));

    const hasAny =
      requiresAny.length === 0 ||
      requiresAny.some((permission) => userPermissions!.includes(permission));

    if (!hasAll || !hasAny) {
      throw new ForbiddenException(
        "You do not have permission to perform this action"
      );
    }

    return true;
  }
}
