import { BoardService } from './board.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BoardController } from './board.controller';
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
  controllers: [BoardController],
  providers: [BoardService, AuthService, JwtService, PrismaService],
})
export class BoardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(BoardController);
  }
}