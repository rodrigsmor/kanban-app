import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { Tokens } from '../auth/types';
import { AuthDto, SignupDto } from '../auth/dto';
import { AuthService } from '../auth/auth.service';
import { PrismaService } from '../prisma/prisma.service';
import * as bcrypt from 'bcryptjs';
import { RefreshToken, User } from '@prisma/client';
import { BadRequestException, UnauthorizedException } from '@nestjs/common';

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
  const access_token = 'access_token_test';

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

  describe('logout', () => {
    it('should throw an exception if refresh token does not exist', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'delete')
        .mockRejectedValueOnce(new Error('The refresh token does not exist'));

      await expect(authService.logout('invalid-refresh-token')).rejects.toThrow(
        BadRequestException,
      );
      expect(prismaService.refreshToken.delete).toBeCalledWith({
        where: { refreshToken: 'invalid-refresh-token' },
      });
    });

    it('should effectively delete the refresh token to log out', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'delete')
        .mockResolvedValueOnce(null);

      await authService.logout('refresh-token');

      expect(prismaService.refreshToken.delete).toBeCalledWith({
        where: { refreshToken: 'refresh-token' },
      });
    });
  });

  describe('generateTokens', () => {
    const refreshTokenMockValue = {
      id: 0,
      userId: 1,
      accessToken: 'access_token_mock',
      refreshToken: 'refresh_token_mock',
    };

    it('should generate new tokens and create a new row in database', async () => {
      const prismaServiceMock = {
        refreshToken: {
          create: jest.fn().mockResolvedValueOnce(refreshTokenMockValue),
          update: jest.fn().mockResolvedValueOnce(refreshTokenMockValue),
        },
      };

      const jwtServiceMock = {
        signAsync: jest
          .fn()
          .mockImplementationOnce(() => 'access_token_mock')
          .mockImplementationOnce(() => 'refresh_token_mock'),
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

      expect(prismaServiceMock.refreshToken.update).not.toBeCalled();
      expect(prismaServiceMock.refreshToken.create).toHaveBeenCalledWith({
        data: {
          refreshToken: 'refresh_token_mock',
          accessToken: 'access_token_mock',
          userId: 1,
        },
      });
    });

    it('should generate new tokens and update the row in database', async () => {
      const prismaServiceMock = {
        refreshToken: {
          create: jest.fn().mockResolvedValueOnce(refreshTokenMockValue),
          update: jest.fn().mockResolvedValueOnce(refreshTokenMockValue),
        },
      };

      const jwtServiceMock = {
        signAsync: jest
          .fn()
          .mockImplementationOnce(() => 'access_token_mock')
          .mockImplementationOnce(() => 'refresh_token_mock'),
      };

      const result = await authService.generateTokens.call(
        { jwtService: jwtServiceMock, prisma: prismaServiceMock },
        1,
        'user@test.com',
        'old-refresh-token',
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

      expect(prismaServiceMock.refreshToken.create).not.toBeCalled();
      expect(prismaServiceMock.refreshToken.update).toHaveBeenCalledWith({
        where: { refreshToken: 'old-refresh-token' },
        data: {
          refreshToken: 'refresh_token_mock',
          accessToken: 'access_token_mock',
        },
      });
    });
  });

  describe('validateUser', () => {
    it('should return the user when valid credentials are provided', async () => {
      const dto = {
        email: 'user@test.com',
        password: 'test-password',
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(newUser);

      const bcryptCompare = jest.fn().mockResolvedValue(true);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      const result = await authService.validateUser(dto);

      expect(result).toEqual(newUser);
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when invalid credentials are provided', async () => {
      const dto = {
        email: 'user@test.com',
        password: 'wrong-password',
      };

      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(newUser);

      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      await expect(authService.validateUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).toHaveBeenCalledTimes(1);
    });

    it('should throw UnauthorizedException when the user does not exist', async () => {
      const dto = {
        email: 'user2@test.com',
        password: 'test-password',
      };

      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);

      const bcryptCompare = jest.fn().mockResolvedValue(false);
      (bcrypt.compare as jest.Mock) = bcryptCompare;

      await expect(authService.validateUser(dto)).rejects.toThrow(
        UnauthorizedException,
      );
      expect(prismaService.user.findUnique).toHaveBeenCalledTimes(1);
      expect(bcrypt.compare).not.toHaveBeenCalled();
    });
  });

  describe('validateRefreshTokens', () => {
    const invalidRefreshToken = 'refresh-token-wrong';
    const secret_token = `${jwtSecret}-refresh`;

    const testPayload = {
      sub: 1,
      email: 'user@test.com',
    };

    it('should throw an exception if refresh token does not exist', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'findUnique')
        .mockResolvedValueOnce(null);

      const mockedVerifyAsync = jest.spyOn(jwtService, 'verifyAsync');
      mockedVerifyAsync.mockResolvedValue(testPayload);

      await expect(
        authService.validateRefreshTokens(invalidRefreshToken),
      ).rejects.toThrow(UnauthorizedException);

      expect(jwtService.verifyAsync).toBeCalledWith(invalidRefreshToken, {
        secret: secret_token,
      });
    });

    it('should throw an exception if refresh token is not valid', async () => {
      jest
        .spyOn(prismaService.refreshToken, 'findUnique')
        .mockRejectedValue(null);

      const mockedVerifyAsync = jest.spyOn(jwtService, 'verifyAsync');
      mockedVerifyAsync.mockRejectedValue(new Error('Invalid credentials'));

      await expect(
        authService.validateRefreshTokens(invalidRefreshToken),
      ).rejects.toThrow(UnauthorizedException);
      expect(prismaService.refreshToken.findUnique).not.toBeCalled();
    });

    it('should validate refresh token and return new tokens', async () => {
      const refreshToken = 'refresh-token';
      const refreshTokenDbMock: RefreshToken = {
        createdAt: new Date(),
        updateAt: new Date(),
        id: 1,
        refreshToken,
        accessToken: access_token,
        userId: 1,
      };

      jest
        .spyOn(prismaService.refreshToken, 'findUnique')
        .mockResolvedValueOnce(refreshTokenDbMock);

      jest
        .spyOn(prismaService.refreshToken, 'delete')
        .mockResolvedValueOnce(null);

      jest
        .spyOn(authService, 'generateTokens')
        .mockResolvedValueOnce(expectedTokens);

      const mockedVerifyAsync = jest.spyOn(jwtService, 'verifyAsync');
      mockedVerifyAsync.mockResolvedValue(testPayload);

      const response = await authService.validateRefreshTokens(refreshToken);

      expect(response).toEqual(expectedTokens);
      expect(jwtService.verifyAsync).toBeCalledWith(refreshToken, {
        secret: secret_token,
      });
    });
  });
});
