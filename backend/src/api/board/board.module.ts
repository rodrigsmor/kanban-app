import { BoardService } from './board.service';
import { UserService } from '../user/user.service';
import { JwtModule, JwtService } from '@nestjs/jwt';
import { BoardController } from './board.controller';
import { AuthService } from '../../auth/auth.service';
import { MulterModule } from '@nestjs/platform-express';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardInviteService } from './board-invite.service';
import { BoardInviteController } from './board-invite.controller';
import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AuthMiddleware } from '../../utils/middlewares/auth.middleware';
import { MulterConfigService } from '../../utils/config/multer-config-service';
import { BoardRepository, InviteRepository } from '../../common/repositories';
import { EncryptConfigService } from '../../utils/config/encryption-config-service';
import { EmailService } from '../../utils/config/email-config-service';

@Module({
  imports: [
    JwtModule.register({}),
    MulterModule.registerAsync({
      useClass: MulterConfigService,
    }),
  ],
  controllers: [BoardController, BoardInviteController],
  providers: [
    BoardService,
    UserService,
    AuthService,
    JwtService,
    EmailService,
    PrismaService,
    BoardRepository,
    InviteRepository,
    BoardInviteService,
    EncryptConfigService,
  ],
})
export class BoardModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(AuthMiddleware)
      .forRoutes(BoardController, BoardInviteController);
  }
}
