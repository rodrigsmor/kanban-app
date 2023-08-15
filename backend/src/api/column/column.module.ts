import { JwtModule } from '@nestjs/jwt';
import { ColumnService } from './column.service';
import { UserService } from '../user/user.service';
import { AuthService } from '../../auth/auth.service';
import { ColumnController } from './column.controller';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../../prisma/prisma.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../../utils/middlewares/auth.middleware';
import { BoardRepository } from '../../common/repositories/board.repository';
import { MulterConfigService } from '../../utils/config/multer-config-service';

@Module({
  imports: [
    JwtModule.register({}),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [ColumnController],
  providers: [
    ColumnService,
    PrismaService,
    UserService,
    AuthService,
    BoardRepository,
  ],
})
export class ColumnModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(ColumnController);
  }
}
