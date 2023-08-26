import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { CardService } from './card.service';
import { CardController } from './card.controller';
import { JwtModule } from '@nestjs/jwt';
import { MulterModule } from '@nestjs/platform-express';
import { MulterConfigService } from 'src/utils/config';
import { PrismaService } from 'src/prisma/prisma.service';
import { UserService } from '../user/user.service';
import { BoardRepository } from '../../common/repositories/board.repository';
import { AuthService } from '../../auth/auth.service';
import { AuthMiddleware } from '../../utils/middlewares/auth.middleware';
import { CardRepository } from '../../common/repositories/card.repository';
import { FileService } from '../../utils/config/file-service';

@Module({
  imports: [
    JwtModule.register({}),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [CardController],
  providers: [
    CardService,
    PrismaService,
    UserService,
    AuthService,
    BoardRepository,
    CardRepository,
    FileService,
  ],
})
export class CardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes(CardController);
  }
}
