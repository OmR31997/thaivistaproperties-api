import { Injectable } from '@nestjs/common';
import { CloudinaryStorageStrategy } from '@shared/upload/cloudinary-storage.strategy';
import type {
  ListResourcesOptions,
  ListedResources,
  UploadErrorResponse,
  UploadInput,
  StorageUsage,
  UploadedAsset,
} from '@shared/upload/upload.types';

@Injectable()
export class UploadService {
  constructor(
    private readonly cloudinaryStrategy: CloudinaryStorageStrategy,
  ) {}

  uploadOne(input: UploadInput): Promise<UploadedAsset> {
    return this.strategy().uploadOne(input);
  }

  uploadBulk(inputs: UploadInput[]): Promise<UploadedAsset[]> {
    return this.strategy().uploadBulk(inputs);
  }

  deleteOne(id: string): Promise<void> {
    return this.strategy().deleteOne(id);
  }

  deleteBulk(ids: string[]): Promise<void> {
    return this.strategy().deleteBulk(ids);
  }

  listResources(options?: ListResourcesOptions): Promise<ListedResources> {
    return this.strategy().listResources(options);
  }

  rollBack(assets: UploadedAsset[]): Promise<void> {
    return this.strategy().rollBack(assets);
  }

  errorResponse(error: unknown, operation: string): UploadErrorResponse {
    return this.strategy().errorResponse(error, operation);
  }

  buildUrl(relativePath: string, format?: string): string {
    return this.strategy().buildUrl(relativePath, format);
  }

  getUsage(): Promise<StorageUsage> {
    return this.strategy().getUsage();
  }

  private strategy() {
    return this.cloudinaryStrategy;
  }
}
