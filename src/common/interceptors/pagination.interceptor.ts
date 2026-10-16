import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, map } from 'rxjs';

interface PaginatedResult<T> {
  data: T;
  meta: Record<string, unknown>;
}

@Injectable()
export class PaginationInterceptor<T> implements NestInterceptor<PaginatedResult<T>> {
  intercept(
    _context: ExecutionContext,
    next: CallHandler<PaginatedResult<T>>,
  ): Observable<{ success: true; message: string; data: T; meta: Record<string, unknown> }> {
    return next.handle().pipe(
      map((result) => ({
        success: true as const,
        message: 'Success',
        data: result.data,
        meta: result.meta,
      })),
    );
  }
}
