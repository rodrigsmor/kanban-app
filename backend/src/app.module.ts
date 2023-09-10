import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthModule } from './auth/auth.module';
import { CardModule } from './api/card/card.module';
import { UserModule } from './api/user/user.module';
import { BoardModule } from './api/board/board.module';
import { LabelModule } from './api/label/label.module';
import { PrismaService } from './prisma/prisma.service';
import { ColumnModule } from './api/column/column.module';
import { AcceptLanguageResolver, I18nModule, QueryResolver } from 'nestjs-i18n';
import * as path from 'path';

@Module({
  imports: [
    I18nModule.forRoot({
      fallbackLanguage: 'en',
      loaderOptions: {
        path: path.join(__dirname, '../src/i18n/'),
        watch: true,
      },
      resolvers: [
        { use: QueryResolver, options: ['lang'] },
        AcceptLanguageResolver,
      ],
      typesOutputPath: path.join(
        __dirname,
        '../src/utils/@types/i18n.translations.d.ts',
      ),
    }),
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
