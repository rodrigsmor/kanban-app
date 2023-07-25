import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Tokens } from './types';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthDto, SignupDto } from './dto';
import { PrismaService } from '../prisma/prisma.service';
import { User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async signup(signupDto: SignupDto): Promise<Tokens> {
    const isEmailUsed = await this.prisma.user.findUnique({
      where: { email: signupDto.email },
    });

    if (isEmailUsed)
      throw new BadRequestException(
        'The email address provided is already in use.',
      );

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);

    const newUser = await this.prisma.user.create({
      data: {
        ...signupDto,
        password: hashedPassword,
      },
    });

    const tokens: Tokens = await this.generateTokens(newUser.id, newUser.email);
    return tokens;
  }

  async login(authDto: AuthDto): Promise<Tokens> {
    const user = await this.validateUser(authDto);

    const tokens: Tokens = await this.generateTokens(user.id, user.email);

    return tokens;
  }

  async logout(refreshToken: string) {
    try {
      await this.prisma.refreshToken.delete({
        where: { refreshToken },
      });
    } catch (error) {
      throw new BadRequestException(
        error?.message || 'The refresh token does not exist',
      );
    }
  }

  async validateUser(dto: AuthDto): Promise<User> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { email: dto.email },
      });

      const isPasswordMatch = await bcrypt.compare(dto.password, user.password);

      if (user && isPasswordMatch) {
        delete user.password;
        return user;
      } else {
        throw new UnauthorizedException(
          'The credentials provided are incorrect.',
        );
      }
    } catch (e) {
      throw new UnauthorizedException(
        e.message || 'The credentials provided are incorrect',
      );
    }
  }

  async generateTokens(
    sub: number,
    email: string,
    oldRefreshToken?: string,
  ): Promise<Tokens> {
    const jwtSecret = process.env.JWT_SECRET_KEY;

    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync(
        { sub, email },
        { secret: `${jwtSecret}-access`, expiresIn: 60 * 80 },
      ),
      this.jwtService.signAsync(
        { sub, email },
        { secret: `${jwtSecret}-refresh`, expiresIn: 60 * 60 * 24 * 7 },
      ),
    ]);

    if (oldRefreshToken) {
      await this.prisma.refreshToken.update({
        where: { refreshToken: oldRefreshToken },
        data: { refreshToken: refresh_token, accessToken: access_token },
      });
    } else {
      await this.prisma.refreshToken.create({
        data: {
          refreshToken: refresh_token,
          accessToken: access_token,
          userId: sub,
        },
      });
    }

    return { access_token, refresh_token };
  }

  async validateRefreshTokens(refreshToken: string): Promise<Tokens> {
    try {
      const payload = await this.jwtService.verifyAsync(refreshToken, {
        secret: `${process.env.JWT_SECRET_KEY}-refresh`,
      });

      const refreshTokenDb = await this.prisma.refreshToken.findUnique({
        where: { refreshToken },
      });

      if (!refreshTokenDb)
        throw new UnauthorizedException(
          'The credential provided is incorrect.',
        );

      return this.generateTokens(payload.sub, payload.email, refreshToken);
    } catch (error) {
      throw new UnauthorizedException(
        error?.message || 'The credential provided is incorrect.',
      );
    }
  }
}
