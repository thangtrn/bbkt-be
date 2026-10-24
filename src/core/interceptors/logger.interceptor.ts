import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { MqttContext } from '@nestjs/microservices';
import { Request, Response } from 'express';
import { Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

@Injectable()
export class LoggerInterceptor implements NestInterceptor {
  constructor() {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const startTime = Date.now();
    const contextType = context.getType();

    return next.handle().pipe(
      tap(() => {
        if (contextType === 'http') {
          this.logHttpRequest(context, startTime);
        } else if (contextType === 'rpc') {
          this.logRpcMessage(context, startTime);
        }
      }),
      catchError((error: Error, caught) => {
        if (contextType === 'http') {
          this.logHttpRequest(context, startTime);
        } else {
          const reqTime = Date.now() - startTime;
          console.log(`[${error.name}] ${error.message} ${reqTime}ms`);
        }
        return throwError(() => error);
      }),
    );
  }

  //==================================================================================================
  /**
   * logs the HTTP requests
   * @param context context
   * @param startTime start time
   * @returns nothing
   */
  private logHttpRequest(context: ExecutionContext, startTime: number) {
    if (context.getType() !== 'http') return;
    const reqTime = Date.now() - startTime;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const request = context.switchToHttp().getRequest<Request>();
    const response = context.switchToHttp().getResponse<Response>();
    const { url, method } = request;
    const { statusCode } = response;
    console.log(
      `[HTTP] ${method.toUpperCase()} ${url} ${statusCode} [${controllerName}:${handlerName}] ${reqTime}ms`,
    );
  }

  //==================================================================================================
  /**
   * logs the RTC requests
   * @param context context
   * @param startTime start time
   * @returns nothing
   */
  private logRpcMessage(context: ExecutionContext, startTime: number) {
    if (context.getType() !== 'rpc') return;
    const reqTime = Date.now() - startTime;
    const controllerName = context.getClass().name;
    const handlerName = context.getHandler().name;
    const args = context.getArgs();
    if (args[1] && args[1] instanceof MqttContext) {
      this.logMqttMessage(
        args[1],
        startTime,
        reqTime,
        controllerName,
        handlerName,
      );
    } else {
      this.logKafkaMessage(
        context,
        startTime,
        reqTime,
        controllerName,
        handlerName,
        args,
      );
    }
  }

  //==================================================================================================
  /**
   * logs the KAFKA requests
   * @param context context
   * @param startTime start time
   * @returns nothing
   */
  private logKafkaMessage(
    context: ExecutionContext,
    startTime: number,
    reqTime: number,
    controllerName: string,
    handlerName: string,
    args: any,
  ) {
    for (const arg of args) {
      if (!arg.args) {
        console.log(
          `[KAFKA] ${arg.partition} ${arg.topic} [${controllerName}:${handlerName}] ${reqTime}ms`,
        );
      }
    }
  }

  //==================================================================================================
  /**
   * logs the MQTT requests
   * @param context context
   * @param startTime start time
   * @returns nothing
   */
  private logMqttMessage(
    context: MqttContext,
    startTime: number,
    reqTime: number,
    controllerName: string,
    handlerName: string,
  ) {
    const packet = context.getPacket();
    console.log(
      `[MQTT] ${packet.cmd} ${context.getTopic()} [${controllerName}:${handlerName}] ${reqTime}ms`,
    );
  }

  //==================================================================================================
}
