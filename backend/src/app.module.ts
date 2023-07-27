import { JwtModule } from '@nestjs/jwt';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UserModule } from './api/user/user.module';
import { PrismaService } from './prisma/prisma.service';
import { AuthMiddleware } from './utils/middlewares/auth.middleware';

@Module({
  imports: [AuthModule, JwtModule.register({}), UserModule],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).exclude('auth/(.*)');
  }
}
