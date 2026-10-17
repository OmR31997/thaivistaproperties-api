import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { v2 as cloudinary, type UploadApiResponse } from 'cloudinary';
import { CacheService } from '@shared/cache/cache.service';
import { UploadEvent, UploadEvents } from '@shared/upload/upload.events';
import { CacheTtl } from '@shared/cache/cache.ttl';
import type {
  ListResourcesOptions,
  ListedResources,
  UploadErrorResponse,
  UploadInput,
  UploadStrategy,
  UploadedAsset,
  StorageUsage,
  StorageUsageMetric,
} from '@shared/upload/upload.types';

@Injectable()
export class CloudinaryStorageStrategy implements UploadStrategy {
  private readonly rootFolder: string;
  private readonly mediaBaseUrl?: string;
  private readonly cloudName?: string;
  private readonly apiKey?: string;
  private readonly apiSecret?: string;

  constructor(
    private readonly configService: ConfigService,
    private readonly cacheService: CacheService,
    private readonly uploadEvents: UploadEvents,
  ) {
    this.cloudName = this.configService.get<string>('storage.cloudinary.cloudName');
    this.apiKey = this.configService.get<string>('storage.cloudinary.apiKey');
    this.apiSecret = this.configService.get<string>('storage.cloudinary.apiSecret');
    this.rootFolder = this.configService.get<string>('storage.rootFolder', 'thaivista/assets');
    this.mediaBaseUrl = this.configService.get<string>('storage.mediaBaseUrl');
  }

  async uploadOne(input: UploadInput): Promise<UploadedAsset> {
    try {
      this.ensureConfigured();
      const result = await new Promise<UploadApiResponse>((resolve, reject) => {
        const stream = cloudinary.uploader.upload_stream(
          {
            folder: this.resolveFolder(input.folder),
            resource_type: 'auto',
            use_filename: true,
            unique_filename: true,
          },
          (error, response) => {
            if (error || !response) {
              reject(error ?? new Error('Cloudinary returned an empty response'));
              return;
            }
            resolve(response);
          },
        );
        stream.end(input.buffer);
      });

      return this.toAsset(result, input.filename);
    } catch (error: unknown) {
      throw this.errorResponse(error, 'uploadOne');
    }
  }

  async uploadBulk(inputs: UploadInput[]): Promise<UploadedAsset[]> {
    const uploaded: UploadedAsset[] = [];
    try {
      for (const input of inputs) {
        uploaded.push(await this.uploadOne(input));
      }
      return uploaded;
    } catch (error: unknown) {
      await this.rollBack(uploaded);
      throw this.errorResponse(error, 'uploadBulk');
    }
  }

  async deleteOne(id: string): Promise<void> {
    try {
      this.ensureConfigured();
      await cloudinary.uploader.destroy(id, { invalidate: true, resource_type: 'image' });
      await this.cacheService.delete(this.resourceCacheKey(id));
    } catch (error: unknown) {
      throw this.errorResponse(error, 'deleteOne');
    }
  }

  async deleteBulk(ids: string[]): Promise<void> {
    try {
      this.ensureConfigured();
      if (ids.length > 0) {
        await cloudinary.api.delete_resources(ids, { invalidate: true });
        await Promise.all(ids.map((id) => this.cacheService.delete(this.resourceCacheKey(id))));
      }
    } catch (error: unknown) {
      throw this.errorResponse(error, 'deleteBulk');
    }
  }

  async listResources(options: ListResourcesOptions = {}): Promise<ListedResources> {
    const cacheKey = `upload:cloudinary:${options.prefix ?? 'all'}:${options.cursor ?? 'first'}:${options.maxResults ?? 100}`;
    const cached = await this.cacheService.get<ListedResources>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.ensureConfigured();
      const response = await cloudinary.api.resources({
        type: 'upload',
        prefix: this.resolvePrefix(options.prefix),
        max_results: options.maxResults ?? 100,
        next_cursor: options.cursor,
      });
      const limit = options.maxResults ?? 100;
      const page = options.page ?? 1;
      const total =
        typeof response.total_count === 'number' ? response.total_count : response.resources.length;
      const totalPages =
        typeof response.total_count === 'number' ? Math.max(1, Math.ceil(total / limit)) : page;
      const result = {
        resources: response.resources.map((resource: UploadApiResponse) => this.toAsset(resource)),
        meta: {
          page,
          limit,
          total,
          totalPages,
          hasNextPage: Boolean(response.next_cursor),
          hasPreviousPage: page > 1 || Boolean(options.cursor),
          nextCursor: response.next_cursor,
          currentCursor: options.cursor,
        },
      };
      await this.cacheService.set(cacheKey, result);
      return result;
    } catch (error: unknown) {
      throw this.errorResponse(error, 'listResources');
    }
  }

  async getUsage(): Promise<StorageUsage> {
    const cacheKey = 'upload:cloudinary:usage';
    const cached = await this.cacheService.get<StorageUsage>(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      this.ensureConfigured();
      const usage = (await cloudinary.api.usage()) as Record<string, unknown>;
      const result: StorageUsage = {
        provider: 'cloudinary',
        storage: this.toUsageMetric(usage.storage, 'bytes'),
        bandwidth: this.toUsageMetric(usage.bandwidth, 'bytes'),
        requests: this.toUsageMetric(usage.requests, 'count'),
        transformations: this.toUsageMetric(usage.transformations, 'count'),
        plan: this.toString(usage.plan),
        lastUpdated: this.toString(usage.last_updated),
        resetAt: this.toString(usage.reset_at),
      };
      await this.cacheService.set(cacheKey, result, CacheTtl.Long);
      return result;
    } catch (error: unknown) {
      throw this.errorResponse(error, 'getUsage');
    }
  }

  async rollBack(assets: UploadedAsset[]): Promise<void> {
    if (assets.length === 0) {
      return;
    }

    const payload = { assets, count: assets.length };
    this.uploadEvents.emit(UploadEvent.RollbackStarted, payload);
    try {
      await this.deleteBulk(assets.map((asset) => asset.publicId));
      this.uploadEvents.emit(UploadEvent.RollbackCompleted, payload);
    } catch (error: unknown) {
      this.uploadEvents.emit(UploadEvent.RollbackFailed, { ...payload, error });
      throw this.errorResponse(error, 'rollBack');
    }
  }

  errorResponse(error: unknown, operation: string): UploadErrorResponse {
    const message = error instanceof Error ? error.message : 'Storage operation failed';
    const code =
      typeof error === 'object' && error !== null && 'http_code' in error
        ? String(error.http_code)
        : undefined;
    return { provider: 'cloudinary', operation, message, code, cause: error };
  }

  buildUrl(relativePath: string, format?: string): string {
    this.ensureMediaBaseUrl();
    const normalizedPath = relativePath.replace(/^\/+/, '');
    const extension = format ? `.${format.replace(/^\./, '')}` : '';
    return `${this.mediaBaseUrl!.replace(/\/$/, '')}/${normalizedPath}${extension}`;
  }

  private resolveFolder(folder?: string): string {
    return folder ? `${this.rootFolder}/${folder}` : this.rootFolder;
  }

  private resolvePrefix(prefix?: string): string | undefined {
    return prefix ? `${this.rootFolder}/${prefix}` : this.rootFolder;
  }

  private resourceCacheKey(id: string): string {
    return `upload:cloudinary:resource:${id}`;
  }

  private toAsset(resource: UploadApiResponse, originalFilename?: string): UploadedAsset {
    return {
      provider: 'cloudinary',
      id: resource.asset_id,
      publicId: resource.public_id,
      relativePath: this.resourcePath(resource),
      resourceType: resource.resource_type,
      format: resource.format,
      bytes: resource.bytes,
      originalFilename,
    };
  }

  private ensureConfigured(): void {
    if (!this.cloudName || !this.apiKey || !this.apiSecret) {
      throw new Error('Cloudinary storage is not fully configured');
    }
    cloudinary.config({
      cloud_name: this.cloudName,
      api_key: this.apiKey,
      api_secret: this.apiSecret,
    });
  }

  private ensureMediaBaseUrl(): void {
    if (!this.mediaBaseUrl) {
      throw new Error('MEDIA_BASE_URL is not configured');
    }
  }

  private resourcePath(resource: UploadApiResponse): string {
    return `/${resource.resource_type}/upload/${resource.public_id}`;
  }

  private toUsageMetric(value: unknown, unit: 'bytes' | 'count'): StorageUsageMetric {
    const metric = this.toRecord(value);
    const used =
      this.toNumber(metric.used) ??
      this.toNumber(metric.usage) ??
      this.toNumber(value) ??
      0;
    const limit = this.toNumber(metric.limit) ?? this.toNumber(metric.quota);
    const remaining = limit === undefined ? undefined : Math.max(limit - used, 0);
    return {
      used,
      usedFormatted: this.formatMetric(used, unit),
      limit,
      limitFormatted: limit === undefined ? undefined : this.formatMetric(limit, unit),
      remaining,
      remainingFormatted:
        remaining === undefined ? undefined : this.formatMetric(remaining, unit),
      usedPercentage: limit && limit > 0 ? Number(((used / limit) * 100).toFixed(2)) : undefined,
    };
  }

  private toRecord(value: unknown): Record<string, unknown> {
    return typeof value === 'object' && value !== null
      ? (value as Record<string, unknown>)
      : {};
  }

  private toNumber(value: unknown): number | undefined {
    return typeof value === 'number' && Number.isFinite(value) ? value : undefined;
  }

  private toString(value: unknown): string | undefined {
    return typeof value === 'string' ? value : undefined;
  }

  private formatBytes(bytes: number): string {
    if (bytes < 1024) {
      return `${bytes} B`;
    }
    const units = ['KB', 'MB', 'GB', 'TB'];
    let value = bytes;
    let unitIndex = -1;
    while (value >= 1024 && unitIndex < units.length - 1) {
      value /= 1024;
      unitIndex += 1;
    }
    const precision = value >= 100 ? 0 : value >= 10 ? 1 : 2;
    return `${value.toFixed(precision)} ${units[unitIndex]}`;
  }

  private formatMetric(value: number, unit: 'bytes' | 'count'): string {
    return unit === 'bytes' ? this.formatBytes(value) : value.toLocaleString('en-US');
  }
}
