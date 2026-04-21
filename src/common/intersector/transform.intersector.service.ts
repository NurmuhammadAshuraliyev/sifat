import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { map, Observable } from 'rxjs';

@Injectable()
class TransformIntersector implements NestInterceptor {
  constructor(private readonly reflector: Reflector) {}

  intercept(
    context: ExecutionContext,
    next: CallHandler<any>,
  ): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const response = context.switchToHttp().getResponse();
    const classHandler = context.getClass();
    const fuctionHandler = context.getHandler();

    const isTransformIntercektor = this.reflector.getAllAndOverride(
      'isTransformIntercektor',
      [classHandler, fuctionHandler],
    );

    const statusCode = response.statusCode;

    const message = response.message;

    if (!isTransformIntercektor) {
      return next.handle().pipe(
        map((data) => {
          return {
            status: statusCode,
            success: true,
            message: message,
            ...(typeof data !== 'object' || Array.isArray(data)
              ? { data }
              : data),
          };
        }),
      );
    }

    return next.handle();
  }
}

export default TransformIntersector;
