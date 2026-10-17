import { Injectable } from '@nestjs/common';
import { EventEmitter } from 'node:events';
import type { UploadedAsset } from '@shared/upload/upload.types';

export const UploadEvent = {
  RollbackStarted: 'upload.rollback.started',
  RollbackCompleted: 'upload.rollback.completed',
  RollbackFailed: 'upload.rollback.failed',
} as const;

export interface RollbackEventPayload {
  assets: UploadedAsset[];
  count: number;
  error?: unknown;
}

@Injectable()
export class UploadEvents extends EventEmitter {}
