import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../auth/types';
import { AuthDto, SignupDto } from '../auth/dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { User } from '@prisma/client';
import { BadRequestException } from '@nestjs/common';

describe('AuthService', () => {
  let jwtService: JwtService;
  let authService: AuthService;
  let prismaService: PrismaService;

  const password = bcrypt.hashSync('test-password', 10);

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
    password: 'test-password',
    lastName: 'Last name',
    email: 'user@test.com',
  };

  const newUser: User = {
    id: 0,
    isAdmin: false,
    profilePicture: '',
    password,
    ...signupDto,
  };

  const expectedTokens: Tokens = {
    access_token: 'access_token_test',
    refresh_token: 'refresh_token_test',
  };

  const jwtSecret = process.env.JWT_SECRET_KEY;

  describe('signup', () => {
    it('should create a new user and return tokens', async () => {
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

  describe('login', () => {
    const user: User = {
      email: 'user@test.com',
      firstName: 'Test name',
      lastName: 'Test last name',
      id: 0,
      isAdmin: false,
      password: '',
      profilePicture: '',
    };

    it('should authenticate user and return new tokens', async () => {
      jest.spyOn(authService, 'validateUser').mockResolvedValueOnce(user);
      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValueOnce(expectedTokens);

      const generatedTokens = await authService.login({
        email: 'user@test.com',
        password: 'very-secure-password',
      });

      expect(generatedTokens).toEqual(expectedTokens);
    });
  });

  describe('generateTokens', () => {
    it('should be generate access and refresh tokens', async () => {
      const jwtServiceMock = {
        signAsync: jest
          .fn()
          .mockImplementationOnce(() => 'access_token_mock')
          .mockImplementationOnce(() => 'refresh_token_mock'),
      };

      const prismaServiceMock = {
        refreshToken: {
          create: jest.fn().mockResolvedValue({
            id: 0,
            userId: 1,
            refreshToken: 'refresh_token_mock',
          }),
        },
      };

      const result = await authService.generateTokens.call(
        { jwtService: jwtServiceMock, prisma: prismaServiceMock },
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

      expect(prismaServiceMock.refreshToken.create).toHaveBeenCalledWith({
        data: {
          refreshToken: 'refresh_token_mock',
          userId: 1,
        },
      });
    });
  });

  describe('validateRefreshTokens', () => {
    it('should return a user if credentials are correct', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(newUser);

      (bcrypt.compare as jest.Mock).mockResolvedValueOnce(
        Promise.resolve(true),
      );

      const dto: AuthDto = {
        email: 'user@test.com',
        password: 'test-password',
      };

      const user = await authService.validateUser(dto);

      expect(user).toBeDefined();
      expect(user.email).toBe('user@test.com');
      expect(user.password).toBeUndefined();
    });

    it('should throw UnauthorizedException if credentials are incorrect', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      const dto: AuthDto = {
        email: 'user@test.com',
        password: 'wrong-password',
      };

      await expect(authService.validateUser(dto)).rejects.toThrowError(
        'The credentials provided are incorrect.',
      );
    });
  });
});
