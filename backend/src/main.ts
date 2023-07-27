import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { GlobalExecptionFilter } from './utils/filters/global.exception.filter';
import { AuthMiddleware } from './utils/middlewares/auth.middleware';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  app.enableCors();
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));
  app.useGlobalFilters(new GlobalExecptionFilter());
  app.use(AuthMiddleware);

  await app.listen(3000);
}
bootstrap();
