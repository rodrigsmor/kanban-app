import { JwtService } from '@nestjs/jwt';
import { Injectable } from '@nestjs/common';
import * as randomstring from 'randomstring';
import { PrismaService } from '../prisma/prisma.service';

type TwoFactorGenerationResponse = {
  verificationCode: string;
  token: string;
};

@Injectable()
export class TwoFactorService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async generateTwoFactorToken(
    userId: number,
    email: string,
    expireAt: Date,
  ): Promise<TwoFactorGenerationResponse> {
    const jwtSecret = process.env.JWT_SECRET_KEY;

    const verificationCode = randomstring.generate({
      length: 8,
      charset: 'numeric',
    });

    const token = await this.jwtService.signAsync(
      { email, sub: userId },
      { secret: `${jwtSecret}-2Fa`, expiresIn: 30 * 60 },
    );

    await this.prisma.twoFactor.create({
      data: {
        userId,
        token,
        expireAt,
        verificationCode,
      },
    });

    return { token, verificationCode };
  }
}
