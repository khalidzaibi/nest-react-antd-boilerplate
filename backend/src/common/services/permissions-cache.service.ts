import { Injectable } from "@nestjs/common";

type CachedPermissions = {
  permissions: string[];
  cachedAt: number;
};

@Injectable()
export class PermissionsCacheService {
  private readonly cache = new Map<string, CachedPermissions>();
  private readonly ttlMs: number;

  constructor() {
    this.ttlMs = 60 * 60 * 1000; // 1 hour
  }

  get(userId: string): string[] | null {
    const entry = this.cache.get(this.key(userId));
    if (!entry) return null;

    const isExpired = Date.now() - entry.cachedAt > this.ttlMs;
    if (isExpired) {
      this.cache.delete(this.key(userId));
      return null;
    }
    return entry.permissions;
  }

  set(userId: string, permissions: string[]): void {
    this.cache.set(this.key(userId), {
      permissions: [...new Set(permissions)],
      cachedAt: Date.now(),
    });
  }

  invalidate(userId: string): void {
    this.cache.delete(this.key(userId));
  }

  clear(): void {
    this.cache.clear();
  }

  private key(userId: string) {
    return `perm:${userId}`;
  }
}
