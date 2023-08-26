import { UserService } from './user.service';
import { UserController } from './user.controller';
import { FileService } from '../../utils/config/file-service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { AuthService } from '../../auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../../prisma/prisma.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../../utils/middlewares/auth.middleware';
import { MulterConfigService } from '../../utils/config/multer-config-service';

@Module({
  imports: [
    JwtModule.register({}),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [UserController],
  providers: [UserService, AuthService, JwtService, PrismaService, FileService],
})
export class UserModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(UserController);
  }
}
