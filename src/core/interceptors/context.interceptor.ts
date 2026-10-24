import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, tap } from 'rxjs';
import { systemId } from '@/libs/utils/system';
import { AppRequestContextService } from '../contexts/app-request.context';

@Injectable()
export class ContextInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    if (context.getType() === 'http') {
      const request = context.switchToHttp().getRequest<Request>();

      const requestId = request.headers['x-request-id'] ?? systemId();
      AppRequestContextService.setRequestId(requestId);

      return next.handle().pipe(
        tap(() => {
          // Perform cleaning if needed
        }),
      );
    }

    return next.handle();
  }
}
