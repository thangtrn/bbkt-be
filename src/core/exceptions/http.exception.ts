import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import { HttpErrorCodeByStatus } from '../constants';
import { AppRequestContextService } from '../contexts/app-request.context';
import { ApiErrorResponse } from '../dtos';

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    const requestId = AppRequestContextService.getRequestId();

    // Default values
    let statusCode: HttpStatus = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';
    let errorCode = HttpErrorCodeByStatus[statusCode];
    let error: unknown = undefined;

    // ======= Handle HttpException =======
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const res = exceptionResponse as Record<string, any>;
        message = res.message ?? message;
        errorCode =
          res.errorCode ?? HttpErrorCodeByStatus[statusCode] ?? errorCode;
        error = res.error ?? error;
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      }
    }

    // ======= Handle generic Error (e.g., throw new Error) =======
    else if (exception instanceof Error) {
      message = exception.message;
      error = exception.stack; // check if env = production set undefined
    }

    // ======= Final response =======
    const apiError = new ApiErrorResponse({
      requestId,
      statusCode,
      message,
      errorCode,
      error,
    });

    response.status(statusCode).json(apiError);
  }
}
