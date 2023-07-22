import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../auth/types';
import { SignupDto } from '../auth/dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let jwtService: JwtService;
  let authService: AuthService;
  let prismaService: PrismaService;

  const password = bcrypt.hashSync('password123', 10);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [AuthService, JwtService, PrismaService],
    }).compile();

    authService = moduleRef.get<AuthService>(AuthService);
    jwtService = moduleRef.get<JwtService>(JwtService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  const signupDto: SignupDto = {
    firstName: 'User',
    password: 'password',
    lastName: 'Last name',
    email: 'user@example.com',
  };

  const newUser: User = {
    id: 0,
    isAdmin: false,
    profilePicture: '',
    password,
    ...signupDto,
  };

  describe('signup', () => {
    it('should create a new user and return tokens', async () => {
      const expectedTokens: Tokens = {
        access_token: 'test_access_token',
        refresh_token: 'test_refresh_token',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(prismaService.user, 'create').mockResolvedValue(newUser);
      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValue(expectedTokens);

      const tokens = await authService.signup(signupDto);

      expect(tokens).toEqual(expectedTokens);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
      expect(authService.generateTokens).toHaveBeenCalledWith(
        newUser.id,
        newUser.email,
      );
    });

    it('should throw BadRequestException when the e-mail is already in use', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(newUser);

      await expect(authService.signup(signupDto)).rejects.toThrowError(
        BadRequestException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: signupDto.email },
      });
    });
  });

  describe('generateTokens', () => {
    const jwtSecret = process.env.JWT_SECRET;

    it('should be generate access and refresh tokens', async () => {
      const jwtServiceMock = {
        signAsync: jest
          .fn()
          .mockImplementationOnce(() => 'access_token_mock')
          .mockImplementationOnce(() => 'refresh_token_mock'),
      };

      const result = await authService.generateTokens.call(
        { jwtService: jwtServiceMock },
        1,
        'user@test.com',
      );

      expect(result).toEqual({
        access_token: 'access_token_mock',
        refresh_token: 'refresh_token_mock',
      });

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
        { sub: 1, email: 'user@test.com' },
        { secret: `${jwtSecret}-access`, expiresIn: 60 * 80 },
      );

      expect(jwtServiceMock.signAsync).toHaveBeenCalledWith(
        { sub: 1, email: 'user@test.com' },
        {
          secret: `${jwtSecret}-refresh`,
          expiresIn: 60 * 60 * 24 * 7,
        },
      );
    });
  });
});
