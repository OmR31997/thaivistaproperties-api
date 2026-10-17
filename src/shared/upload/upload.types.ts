export type StorageProvider = 'cloudinary' | 's3';

export interface UploadInput {
  buffer: Buffer;
  filename: string;
  mimetype: string;
  folder?: string;
}

export interface UploadedAsset {
  provider: StorageProvider;
  id: string;
  publicId: string;
  relativePath: string;
  resourceType: string;
  format?: string;
  bytes?: number;
  originalFilename?: string;
}

export interface ListResourcesOptions {
  prefix?: string;
  maxResults?: number;
  page?: number;
}

export interface UploadPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

export interface ListedResources {
  resources: UploadedAsset[];
  meta: UploadPaginationMeta;
}

export interface StorageUsageMetric {
  used: number;
  usedFormatted: string;
  limit?: number;
  limitFormatted?: string;
  remaining?: number;
  remainingFormatted?: string;
  usedPercentage?: number;
}

export interface StorageUsage {
  provider: StorageProvider;
  storage: StorageUsageMetric;
  bandwidth: StorageUsageMetric;
  requests: StorageUsageMetric;
  transformations: StorageUsageMetric;
  plan?: string;
  lastUpdated?: string;
  resetAt?: string;
}

export interface UploadErrorResponse {
  provider: StorageProvider;
  operation: string;
  message: string;
  code?: string;
  cause?: unknown;
}

export interface UploadStrategy {
  uploadOne(input: UploadInput): Promise<UploadedAsset>;
  uploadBulk(inputs: UploadInput[]): Promise<UploadedAsset[]>;
  deleteOne(id: string): Promise<void>;
  deleteBulk(ids: string[]): Promise<void>;
  listResources(options?: ListResourcesOptions): Promise<ListedResources>;
  rollBack(assets: UploadedAsset[]): Promise<void>;
  errorResponse(error: unknown, operation: string): UploadErrorResponse;
  buildUrl(relativePath: string, format?: string): string;
  getUsage(): Promise<StorageUsage>;
}
