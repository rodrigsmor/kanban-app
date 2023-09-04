import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { CardModule } from './api/card/card.module';
import { UserModule } from './api/user/user.module';
import { BoardModule } from './api/board/board.module';
import { LabelModule } from './api/label/label.module';
import { PrismaService } from './prisma/prisma.service';
import { ColumnModule } from './api/column/column.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({}),
    UserModule,
    BoardModule,
    ColumnModule,
    CardModule,
    LabelModule,
  ],
  providers: [PrismaService],
})
export class AppModule {}
