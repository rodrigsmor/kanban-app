import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { IncomingMessage } from 'http';

export const getStatusCode = (exception: unknown) => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: unknown): string => {
  return String(exception);
};

@Catch()
export class GlobalExecptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<IncomingMessage>();
    const code = getStatusCode(exception);
    const except = getErrorMessage(exception).split(': ')[0];
    const message =
      exception?.response?.message ?? getErrorMessage(exception).split(': ')[1];

    response.status(code).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      code,
      message,
      exception: except,
    });
  }
}
