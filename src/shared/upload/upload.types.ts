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
  cursor?: string;
  page?: number;
}

export interface UploadPaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  nextCursor?: string;
  currentCursor?: string;
}

export interface ListedResources {
  resources: UploadedAsset[];
  meta: UploadPaginationMeta;
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
}
