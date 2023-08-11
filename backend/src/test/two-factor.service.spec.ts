import {
  TwoFactorGenerationResponse,
  TwoFactorService,
} from '../auth/two-factor.service';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as randomstring from 'randomstring';
import { PrismaService } from '../prisma/prisma.service';
import { JwtPayload } from '../utils/@types/jwt.payload';
import { TwoFactor } from '@prisma/client';
import { ForbiddenException, UnauthorizedException } from '@nestjs/common';

describe('TwoFactorService', () => {
  let prisma: PrismaService;
  let jwtService: JwtService;
  let twoFactorService: TwoFactorService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [JwtService, PrismaService, TwoFactorService],
    }).compile();

    jwtService = moduleRef.get<JwtService>(JwtService);
    prisma = moduleRef.get<PrismaService>(PrismaService);
    twoFactorService = moduleRef.get<TwoFactorService>(TwoFactorService);
  });

  const mockUserId = 27228;
  const mockEmail = 'test@mail.com';
  const expireAt = new Date(2023, 7, 1);

  const mockToken = 'test-token-mock';
  const mockVerificationCode = '2782022t';

  const mockTwoFactorGenerationResponse: TwoFactorGenerationResponse = {
    token: mockToken,
    verificationCode: mockVerificationCode,
  };

  const mockJwtPayload: JwtPayload = {
    email: mockEmail,
    exp: expireAt.getMilliseconds(),
    iat: 0,
    sub: mockUserId,
  };

  const mockTwoFactor: TwoFactor = {
    createdAt: new Date(2023, 6, 12),
    expireAt,
    id: 2992,
    token: mockToken,
    type: 'auth',
    userId: mockUserId,
    verificationCode: mockVerificationCode,
  };

  const jwtSecret = process.env.JWT_SECRET_KEY;
  const mockJwtSecretKey = `${jwtSecret}-2Fa`;

  describe('generateTwoFactorToken', () => {
    it('should generate a verification token and verification code then return them', async () => {
      jest
        .spyOn(randomstring, 'generate')
        .mockImplementationOnce(() => mockVerificationCode);
      jest.spyOn(jwtService, 'signAsync').mockResolvedValueOnce(mockToken);
      jest.spyOn(prisma.twoFactor, 'create').mockResolvedValueOnce(null);

      const result = await twoFactorService.generateTwoFactorToken(
        mockUserId,
        mockEmail,
        expireAt,
      );

      expect(result).toStrictEqual(mockTwoFactorGenerationResponse);
      expect(randomstring.generate).toBeCalledWith({
        length: 8,
        charset: 'numeric',
      });
      expect(jwtService.signAsync).toBeCalledWith(
        { email: mockEmail, sub: mockUserId },
        { secret: mockJwtSecretKey, expiresIn: 30 * 60 },
      );
      expect(prisma.twoFactor.create).toBeCalledWith({
        data: {
          userId: mockUserId,
          token: mockToken,
          expireAt,
          verificationCode: mockVerificationCode,
        },
      });
    });
  });

  describe('validateTwoFactorTokens', () => {
    it('should throw ForbiddenException when the provided userId does not match the payload sub', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockJwtPayload);
      jest.spyOn(prisma.twoFactor, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.twoFactor, 'delete').mockResolvedValueOnce(null);

      try {
        await twoFactorService.validateTwoFactorTokens(
          mockUserId * 6,
          mockToken,
          mockVerificationCode,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'You do not have permission to perform this action',
        );
        expect(jwtService.verifyAsync).toBeCalledWith(mockToken, {
          secret: mockJwtSecretKey,
        });
        expect(prisma.twoFactor.findUnique).not.toBeCalled();
        expect(prisma.twoFactor.delete).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException when the provided code is incorrect', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockJwtPayload);
      jest
        .spyOn(prisma.twoFactor, 'findUnique')
        .mockResolvedValueOnce(mockTwoFactor);
      jest.spyOn(prisma.twoFactor, 'delete').mockResolvedValueOnce(null);

      try {
        await twoFactorService.validateTwoFactorTokens(
          mockUserId,
          mockToken,
          `wrong-${mockVerificationCode}`,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual('the code provided is incorrect.');
        expect(jwtService.verifyAsync).toBeCalledWith(mockToken, {
          secret: mockJwtSecretKey,
        });
        expect(prisma.twoFactor.findUnique).toBeCalledWith({
          where: { token: mockToken },
        });
        expect(prisma.twoFactor.delete).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException when the token was not found', async () => {
      jest
        .spyOn(jwtService, 'verifyAsync')
        .mockResolvedValueOnce(mockJwtPayload);
      jest.spyOn(prisma.twoFactor, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(prisma.twoFactor, 'delete').mockResolvedValueOnce(null);

      try {
        await twoFactorService.validateTwoFactorTokens(
          mockUserId,
          mockToken,
          `wrong-${mockVerificationCode}`,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'it is not possible to authenticate',
        );
        expect(jwtService.verifyAsync).toBeCalledWith(mockToken, {
          secret: mockJwtSecretKey,
        });
        expect(prisma.twoFactor.findUnique).toBeCalledWith({
          where: { token: mockToken },
        });
        expect(prisma.twoFactor.delete).not.toBeCalled();
      }
    });
  });
});
