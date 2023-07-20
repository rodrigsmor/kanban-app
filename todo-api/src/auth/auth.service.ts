import { Tokens } from './types';
import * as bcrypt from 'bcryptjs';
import { JwtService } from '@nestjs/jwt';
import { AuthDto, SignupDto } from './dto';
import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
  ) {}

  async register(signupDto: SignupDto): Promise<Tokens> {
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

  async validateUser(dto: AuthDto) {
    //
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

    return { access_token, refresh_token };
  }
}
