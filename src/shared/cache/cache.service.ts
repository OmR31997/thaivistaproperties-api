import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject, Injectable } from '@nestjs/common';
import type { Cache } from '@nestjs/cache-manager';
import { CacheTtl } from '@shared/cache/cache.ttl';

@Injectable()
export class CacheService {
  constructor(@Inject(CACHE_MANAGER) private readonly cache: Cache) {}

  get<T>(key: string): Promise<T | undefined> {
    return this.cache.get<T>(key);
  }

  set<T>(key: string, value: T, ttl = CacheTtl.Default): Promise<T> {
    return this.cache.set(key, value, ttl);
  }

  delete(key: string): Promise<boolean> {
    return this.cache.del(key);
  }

  clear(): Promise<boolean> {
    return this.cache.clear();
  }

  getOrSet<T>(key: string, factory: () => Promise<T>, ttl = CacheTtl.Default): Promise<T> {
    return this.cache.wrap(key, factory, ttl);
  }
}
