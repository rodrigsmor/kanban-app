import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AppService } from './app.service';
import { AuthModule } from './auth/auth.module';
import { AppController } from './app.controller';
import { UserModule } from './api/user/user.module';
import { BoardModule } from './api/board/board.module';
import { PrismaService } from './prisma/prisma.service';
import { ColumnModule } from './api/column/column.module';

@Module({
  imports: [
    AuthModule,
    JwtModule.register({}),
    UserModule,
    BoardModule,
    ColumnModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService],
})
export class AppModule {}
