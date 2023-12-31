import * as express from 'express';
import { AppModule } from './app.module';
import { NestFactory } from '@nestjs/core';
import { json, urlencoded } from 'express';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { I18nMiddleware, I18nValidationExceptionFilter } from 'nestjs-i18n';
import { GlobalExecptionFilter } from './utils/filters/global.exception.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    bodyParser: true,
  });

  app.use(I18nMiddleware);
  app.useGlobalPipes(new ValidationPipe({ transform: true }));

  const config = new DocumentBuilder()
    .setTitle('Kanban Application')
    .setDescription(
      'Welcome to the Ruma documentation! Ruma is a project and task management web application based on the agile Kanban methodology. In this documentation, you’ll find the main functions of the application, as well as some guidance on how it works.',
    )
    .setVersion('1.0')
    .addBearerAuth({
      type: 'http',
      scheme: 'bearer',
      bearerFormat: 'JWT',
      description: 'Enter your jwt token',
    })
    .build();

  app.enableCors();
  app.use(json({ limit: '100mb' }));
  app.use(urlencoded({ limit: '100mb', extended: true }));

  app.useGlobalFilters(new I18nValidationExceptionFilter());
  app.useGlobalFilters(new GlobalExecptionFilter());

  app.use('/uploads', express.static('uploads'));

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('docs', app, document);

  await app.listen(3000);
}
bootstrap();
