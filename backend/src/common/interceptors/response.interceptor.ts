import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Observable, throwError } from 'rxjs';
import { catchError, map } from 'rxjs/operators';

export interface ApiResponse<T> {
  code: number;
  message: string;
  data: T;
}

@Injectable()
export class ResponseInterceptor<T> implements NestInterceptor<T, ApiResponse<T>> {
  intercept(context: ExecutionContext, next: CallHandler): Observable<ApiResponse<T>> {
    return next.handle().pipe(
      map((data) => ({
        code: 0,
        message: 'success',
        data: data ?? null,
      })),
      catchError((err) => {
        const code = err instanceof HttpException ? err.getStatus() : HttpStatus.INTERNAL_SERVER_ERROR;
        const message = err instanceof HttpException ? (err.getResponse() as any).message || err.message : 'Internal Server Error';
        return throwError(() => ({
          code,
          message: Array.isArray(message) ? message.join(', ') : message,
          data: null,
        }));
      }),
    );
  }
}
