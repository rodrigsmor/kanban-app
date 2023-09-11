import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Response } from 'express';
import { IncomingMessage } from 'http';
import { I18nContext } from 'nestjs-i18n';
import { I18nTranslations } from '../@types/i18n.translations';
import { i18nPaths } from '../constants';

export const getStatusCode = (exception: unknown) => {
  return exception instanceof HttpException
    ? exception.getStatus()
    : HttpStatus.INTERNAL_SERVER_ERROR;
};

export const getErrorMessage = (exception: unknown): string => {
  return String(exception);
};

async function isI18nPath(path: string): Promise<boolean> {
  if (!path.includes('.')) return false;

  const keys = path.split('.');
  let currentObj = i18nPaths;

  for (const key of keys) {
    if (!currentObj.hasOwnProperty(key)) {
      return false;
    }
    currentObj = currentObj[key];
  }

  return true;
}

@Catch()
export class GlobalExecptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const context = host.switchToHttp();
    const response = context.getResponse<Response>();
    const request = context.getRequest<IncomingMessage>();
    const code = getStatusCode(exception);
    const except = getErrorMessage(exception).split(': ')[0];

    const i18n = I18nContext.current<I18nTranslations>(host);
    let message =
      exception?.response?.message ?? getErrorMessage(exception).split(': ')[1];

    if (Array.isArray(message)) {
      message = exception?.response?.message.map((path: any) => {
        return i18n.translate(path);
      });
    }

    response.status(code).json({
      timestamp: new Date().toISOString(),
      path: request.url,
      code,
      message,
      exception: except,
    });
  }
}
