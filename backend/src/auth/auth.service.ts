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

  async validateUser(dto: AuthDto): Promise<User> {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });

    if (user && (await bcrypt.compare(dto.password, user.password))) {
      delete user.password;
      return user;
    } else {
      throw new UnauthorizedException(
        'The credentials provided are incorrect.',
      );
    }
  }

  async generateTokens(sub: number, email: string): Promise<Tokens> {
    const jwtSecret = process.env.JWT_SECRET;

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

    await this.prisma.refreshToken.create({
      data: {
        refreshToken: refresh_token,
        userId: sub,
      },
    });

    return { access_token, refresh_token };
  }

  async validateRefreshTokens(token: string): Promise<Tokens> {
    try {
      const payload = this.jwtService.verify(token);

      const refreshToken = await this.prisma.refreshToken.findUnique({
        where: { refreshToken: token },
      });

      if (!refreshToken)
        throw new UnauthorizedException(
          'The credential provided is incorrect.',
        );

      await this.prisma.refreshToken.delete({
        where: { id: refreshToken.id },
      });

      return this.generateTokens(payload.sub, payload.email);
    } catch (error) {
      throw new UnauthorizedException('The credential provided is incorrect.');
    }
  }
}
