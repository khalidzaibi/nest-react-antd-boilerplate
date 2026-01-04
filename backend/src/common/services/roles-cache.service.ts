import { Injectable } from "@nestjs/common";

type CachedRoles = {
  roles: string[];
  cachedAt: number;
};

@Injectable()
export class RolesCacheService {
  private readonly cache = new Map<string, CachedRoles>();
  private readonly ttlMs = 60 * 60 * 1000; // 1 hour

  get(userId: string): string[] | null {
    const entry = this.cache.get(this.key(userId));
    if (!entry) return null;

    const expired = Date.now() - entry.cachedAt > this.ttlMs;
    if (expired) {
      this.cache.delete(this.key(userId));
      return null;
    }
    return entry.roles;
  }

  set(userId: string, roles: string[]): void {
    const unique = Array.from(new Set(roles.map((r) => r.trim().toLowerCase()).filter(Boolean)));
    this.cache.set(this.key(userId), {
      roles: unique,
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
    return `role:${userId}`;
  }
}
