import {
  TwoFactorGenerationResponse,
  TwoFactorService,
} from '../auth/two-factor.service';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import * as randomstring from 'randomstring';
import { PrismaService } from '../prisma/prisma.service';

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

  const jwtSecret = process.env.JWT_SECRET_KEY;

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
        { secret: `${jwtSecret}-2Fa`, expiresIn: 30 * 60 },
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

  describe('generateTwoFactorToken', () => {
    it('', async () => {

    });
  });
});
