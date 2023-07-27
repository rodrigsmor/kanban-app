import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthService } from './auth/auth.service';
import { PrismaService } from './prisma/prisma.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { JwtModule } from '@nestjs/jwt';
import { UserModule } from './api/user/user.module';
import { UserController } from './api/user/user.controller';
import { UserService } from './api/user/user.service';

@Module({
  imports: [AuthModule, JwtModule.register({}), UserModule],
  controllers: [AppController, AuthController, UserController],
  providers: [AppService, AuthService, PrismaService, UserService],
})
export class AppModule {}
