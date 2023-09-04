import { JwtModule } from '@nestjs/jwt';
import { LabelService } from './label.service';
import { LabelController } from './label.controller';
import { AuthService } from '../../auth/auth.service';
import { PrismaService } from '../../prisma/prisma.service';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../../utils/middlewares/auth.middleware';
import { BoardRepository } from '../../common/repositories/board.repository';

@Module({
  imports: [JwtModule.register({})],
  controllers: [LabelController],
  providers: [LabelService, AuthService, PrismaService, BoardRepository],
})
export class LabelModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(LabelController);
  }
}
