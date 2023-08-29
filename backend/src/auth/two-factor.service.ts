import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as randomstring from 'randomstring';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../utils/@types/jwt.payload';

export type TwoFactorGenerationResponse = {
  verificationCode: string;
  token: string;
};

@Injectable()
export class TwoFactorService {
  private readonly jwtSecret: string;

  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {
    this.jwtSecret = process.env.JWT_SECRET_KEY;
  }

  async generateTwoFactorToken(
    userId: number,
    email: string,
    expireAt: Date,
  ): Promise<TwoFactorGenerationResponse> {
    const verificationCode = randomstring.generate({
      length: 8,
      charset: 'numeric',
    });

    const token = await this.jwtService.signAsync(
      { email, sub: userId },
      { secret: `${this.jwtSecret}-2Fa`, expiresIn: 30 * 60 },
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

  async validateTwoFactorTokens(
    userId: number,
    token: string,
    code: string,
  ): Promise<JwtPayload> {
    const payload: JwtPayload = await this.jwtService
      .verifyAsync(token, {
        secret: `${this.jwtSecret}-2Fa`,
      })
      .catch((error) => {
        throw new UnauthorizedException(
          error?.message || 'the code provided is expired',
        );
      });

    if (userId !== payload.sub)
      throw new ForbiddenException(
        'You do not have permission to perform this action',
      );

    const twoFactor = await this.prisma.twoFactor.findUnique({
      where: { token },
    });

    if (!twoFactor)
      throw new UnauthorizedException('it is not possible to authenticate');

    if (twoFactor.verificationCode !== code)
      throw new UnauthorizedException('the code provided is incorrect.');

    await this.prisma.twoFactor.delete({
      where: { id: twoFactor.id },
    });

    return payload;
  }
}
