import { Global, Module } from '@nestjs/common';
import { CacheModule as NestCacheModule } from '@nestjs/cache-manager';
import { CacheService } from '@shared/cache/cache.service';
import { CacheTtl } from '@shared/cache/cache.ttl';

@Global()
@Module({
  imports: [NestCacheModule.register({ ttl: CacheTtl.Default })],
  providers: [CacheService],
  exports: [CacheService],
})
export class SharedCacheModule {}
