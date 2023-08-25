import {
  BadRequestException,
  ForbiddenException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import {
  BoardMembershipType,
  BoardPrismaType,
  InvitePrismaType,
} from '../utils/@types/payloads.type';
import { User } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { BoardDto } from '../api/board/dto/board.dto';
import { PrismaService } from '../prisma/prisma.service';
import { BoardRolesEnum } from '../utils/enums/board-roles.enum';
import { BoardInviteDto } from '../api/board/dto/board-invite.dto';
import { InviteDataTypes } from '../utils/@types/invite-data.types';
import { EmailService } from '../utils/config/email-config-service';
import { BoardInviteService } from '../api/board/board-invite.service';
import { BoardRepository } from '../common/repositories/board.repository';
import { InviteRepository } from '../common/repositories/invite.repository';
import { EncryptConfigService } from '../utils/config/encryption-config-service';

describe('BoardServiceInvite', () => {
  let prisma: PrismaService;
  let emailService: EmailService;
  let crypt: EncryptConfigService;
  let boardRepository: BoardRepository;
  let inviteRepository: InviteRepository;
  let boardInviteService: BoardInviteService;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        PrismaService,
        EmailService,
        EncryptConfigService,
        BoardRepository,
        InviteRepository,
        BoardInviteService,
      ],
    }).compile();

    prisma = moduleRef.get<PrismaService>(PrismaService);
    emailService = moduleRef.get<EmailService>(EmailService);
    crypt = moduleRef.get<EncryptConfigService>(EncryptConfigService);
    boardRepository = moduleRef.get<BoardRepository>(BoardRepository);
    inviteRepository = moduleRef.get<InviteRepository>(InviteRepository);
    boardInviteService = moduleRef.get<BoardInviteService>(BoardInviteService);
  });

  const mockUserId = 2738;
  const mockBoardId = 32091;

  const mockBoardInviteDto: BoardInviteDto = {
    boardId: mockBoardId,
    email: 'test@user.mail',
  };

  const mockUser: User = {
    email: 'test@user.mail',
    firstName: 'Test first name',
    lastName: 'Test last name',
    id: mockUserId,
    isAdmin: true,
    password: 'a-very-secure-password',
    profilePicture: '/path-to-password',
  };

  const mockBoard: BoardPrismaType = {
    columns: [],
    id: mockBoardId,
    background: '/path-to-image',
    createdAt: new Date(2021, 4, 24),
    updateAt: new Date(2023, 8, 1),
    description: 'a random board description',
    isPinned: true,
    members: [
      {
        role: 'CONTRIBUTOR',
        user: mockUser,
      },
    ],
    name: 'my board',
    owner: mockUser,
    ownerId: mockUserId,
  };

  const mockMembership: BoardMembershipType = {
    id: 27393,
    board: mockBoard,
    boardId: mockBoardId,
    role: 'CONTRIBUTOR',
    user: mockUser,
    userId: mockUserId,
  };

  const mockInvite: InvitePrismaType = {
    board: mockBoard,
    boardId: mockBoardId,
    createdAt: new Date(2021, 4, 24),
    email: 'user@test.mail',
    expireAt: new Date(2021, 4, 25),
    id: 3647,
    isPending: false,
  };

  const mockInviteData: InviteDataTypes = {
    email: 'test@user.mail',
    expireAt: expect.any(Date),
    inviteId: mockInvite.id,
  };

  describe('inviteUserToBoard', () => {
    it('should throw ForbiddenException if the user is not an admin', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAdminOfBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardMembershipByMemberEmail')
        .mockResolvedValueOnce(null);
      jest.spyOn(inviteRepository, 'createInvite').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(crypt, 'encrypt').mockResolvedValueOnce(null);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce(null);

      try {
        await boardInviteService.inviteUserToBoard(
          mockUserId,
          mockBoardInviteDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'You are not allowed to add new members to this board',
        );
        expect(boardRepository.isMemberAdminOfBoard).toBeCalledWith(
          mockUserId,
          mockBoardInviteDto.boardId,
        );
        expect(boardRepository.findBoardById).not.toBeCalled();
        expect(
          boardRepository.findBoardMembershipByMemberEmail,
        ).not.toBeCalled();
        expect(inviteRepository.createInvite).not.toBeCalled();
        expect(prisma.user.findUnique).not.toBeCalled();
        expect(crypt.encrypt).not.toBeCalled();
        expect(emailService.sendEmail).not.toBeCalled();
      }
    });

    it('should throw NotFoundException if the board was not found', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAdminOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardMembershipByMemberEmail')
        .mockResolvedValueOnce(null);
      jest.spyOn(inviteRepository, 'createInvite').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(crypt, 'encrypt').mockResolvedValueOnce(null);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce(null);

      try {
        await boardInviteService.inviteUserToBoard(
          mockUserId,
          mockBoardInviteDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual('the board seems to not to exist');
        expect(boardRepository.isMemberAdminOfBoard).toBeCalledWith(
          mockUserId,
          mockBoardInviteDto.boardId,
        );
        expect(boardRepository.findBoardById).toBeCalledWith(
          mockBoardInviteDto.boardId,
          mockUserId,
        );
        expect(
          boardRepository.findBoardMembershipByMemberEmail,
        ).not.toBeCalled();
        expect(inviteRepository.createInvite).not.toBeCalled();
        expect(prisma.user.findUnique).not.toBeCalled();
        expect(crypt.encrypt).not.toBeCalled();
        expect(emailService.sendEmail).not.toBeCalled();
      }
    });

    it('should throw BadRequestException if the user is already a member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAdminOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoard);
      jest
        .spyOn(boardRepository, 'findBoardMembershipByMemberEmail')
        .mockResolvedValueOnce(mockMembership);
      jest.spyOn(inviteRepository, 'createInvite').mockResolvedValueOnce(null);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(null);
      jest.spyOn(crypt, 'encrypt').mockResolvedValueOnce(null);
      jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce(null);

      try {
        await boardInviteService.inviteUserToBoard(
          mockUserId,
          mockBoardInviteDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toStrictEqual('the user is already a member');
        expect(boardRepository.isMemberAdminOfBoard).toBeCalledWith(
          mockUserId,
          mockBoardInviteDto.boardId,
        );
        expect(boardRepository.findBoardById).toBeCalledWith(
          mockBoardInviteDto.boardId,
          mockUserId,
        );
        expect(boardRepository.findBoardMembershipByMemberEmail).toBeCalledWith(
          mockBoardInviteDto.email,
          mockBoardInviteDto.boardId,
        );
        expect(inviteRepository.createInvite).not.toBeCalled();
        expect(prisma.user.findUnique).not.toBeCalled();
        expect(crypt.encrypt).not.toBeCalled();
        expect(emailService.sendEmail).not.toBeCalled();
      }
    });

    it('should invite the user and return the token', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAdminOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoard);
      jest
        .spyOn(boardRepository, 'findBoardMembershipByMemberEmail')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(inviteRepository, 'createInvite')
        .mockResolvedValueOnce(mockInvite);
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValueOnce(mockUser);
      jest
        .spyOn(crypt, 'encrypt')
        .mockResolvedValueOnce('token-encrypted-generated');
      jest.spyOn(emailService, 'sendEmail').mockResolvedValueOnce(null);

      const result = await boardInviteService.inviteUserToBoard(
        mockUserId,
        mockBoardInviteDto,
      );

      expect(result).toStrictEqual('token-encrypted-generated');
      expect(boardRepository.isMemberAdminOfBoard).toBeCalledWith(
        mockUserId,
        mockBoardInviteDto.boardId,
      );
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardInviteDto.boardId,
        mockUserId,
      );
      expect(boardRepository.findBoardMembershipByMemberEmail).toBeCalledWith(
        mockBoardInviteDto.email,
        mockBoardInviteDto.boardId,
      );
      expect(inviteRepository.createInvite).toBeCalledWith(
        mockBoardInviteDto.email,
        mockBoardInviteDto.boardId,
        expect.any(Date),
      );
      expect(prisma.user.findUnique).toBeCalledWith({
        where: { email: mockBoardInviteDto.email },
      });
      expect(crypt.encrypt).toBeCalledWith(mockInviteData);
      expect(emailService.sendEmail).toBeCalledWith(
        mockUser.firstName,
        mockBoard.name,
        mockBoardInviteDto.email,
        'token-encrypted-generated',
        './src/templates/board-invite.hbs',
      );
    });
  });

  describe('acceptInvite', () => {
    it('should throw UnauthorizedException if the user was not found', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(null);
      jest.spyOn(crypt, 'decrypt').mockResolvedValueOnce(mockInviteData);
      jest
        .spyOn(inviteRepository, 'isInvitePending')
        .mockResolvedValueOnce(null);
      jest.spyOn(inviteRepository, 'updateInvite').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'addUserToBoard').mockResolvedValueOnce(null);

      try {
        await boardInviteService.acceptInvite(
          mockUserId,
          'token-encrypted-generated',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'You are not authorized to perform this action',
        );
        expect(prisma.user.findUnique).toBeCalledWith({
          where: { id: mockUserId },
        });
        expect(crypt.decrypt).toBeCalledWith('token-encrypted-generated');
        expect(inviteRepository.isInvitePending).not.toBeCalled();
        expect(inviteRepository.updateInvite).not.toBeCalled();
        expect(boardRepository.addUserToBoard).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if the email provided is not the same as the token', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'decrypt').mockResolvedValueOnce({
        ...mockInviteData,
        email: 'wrong.user@mail.com',
      });
      jest
        .spyOn(inviteRepository, 'isInvitePending')
        .mockResolvedValueOnce(null);
      jest.spyOn(inviteRepository, 'updateInvite').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'addUserToBoard').mockResolvedValueOnce(null);

      try {
        await boardInviteService.acceptInvite(
          mockUserId,
          'token-encrypted-generated',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'You are not authorized to perform this action',
        );
        expect(prisma.user.findUnique).toBeCalledWith({
          where: { id: mockUserId },
        });
        expect(crypt.decrypt).toBeCalledWith('token-encrypted-generated');
        expect(inviteRepository.isInvitePending).not.toBeCalled();
        expect(inviteRepository.updateInvite).not.toBeCalled();
        expect(boardRepository.addUserToBoard).not.toBeCalled();
      }
    });

    it('should throw ForbiddenException if the invitation has expired', async () => {
      const mockExpiredInviteData: InviteDataTypes = {
        ...mockInviteData,
        expireAt: new Date(new Date().getTime() - 30 * 60 * 1000),
      };

      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'decrypt').mockResolvedValueOnce(mockExpiredInviteData);
      jest
        .spyOn(inviteRepository, 'isInvitePending')
        .mockResolvedValueOnce(null);
      jest.spyOn(inviteRepository, 'updateInvite').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'addUserToBoard').mockResolvedValueOnce(null);

      try {
        await boardInviteService.acceptInvite(
          mockUserId,
          'token-encrypted-generated',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual('the invitation has expired');
        expect(prisma.user.findUnique).toBeCalledWith({
          where: { id: mockUserId },
        });
        expect(crypt.decrypt).toBeCalledWith('token-encrypted-generated');
        expect(inviteRepository.isInvitePending).not.toBeCalled();
        expect(inviteRepository.updateInvite).not.toBeCalled();
        expect(boardRepository.addUserToBoard).not.toBeCalled();
      }
    });

    it('should throw BadRequestException if the invitation was already accepted', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'decrypt').mockResolvedValueOnce(mockInviteData);
      jest
        .spyOn(inviteRepository, 'isInvitePending')
        .mockResolvedValueOnce(false);
      jest.spyOn(inviteRepository, 'updateInvite').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'addUserToBoard').mockResolvedValueOnce(null);

      try {
        await boardInviteService.acceptInvite(
          mockUserId,
          'token-encrypted-generated',
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toStrictEqual(
          'the invitation was already accepted',
        );
        expect(prisma.user.findUnique).toBeCalledWith({
          where: { id: mockUserId },
        });
        expect(crypt.decrypt).toBeCalledWith('token-encrypted-generated');
        expect(inviteRepository.isInvitePending).toBeCalledWith(
          mockInviteData.inviteId,
        );
        expect(inviteRepository.updateInvite).not.toBeCalled();
        expect(boardRepository.addUserToBoard).not.toBeCalled();
      }
    });

    it('should accept the invite and return the Board data', async () => {
      jest.spyOn(prisma.user, 'findUnique').mockResolvedValue(mockUser);
      jest.spyOn(crypt, 'decrypt').mockResolvedValueOnce(mockInviteData);
      jest
        .spyOn(inviteRepository, 'isInvitePending')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(inviteRepository, 'updateInvite')
        .mockResolvedValueOnce(mockInvite);
      jest
        .spyOn(boardRepository, 'addUserToBoard')
        .mockResolvedValueOnce(mockMembership);

      const result = await boardInviteService.acceptInvite(
        mockUserId,
        'token-encrypted-generated',
      );

      expect(result).toStrictEqual(new BoardDto(mockMembership.board));
      expect(prisma.user.findUnique).toBeCalledWith({
        where: { id: mockUserId },
      });
      expect(crypt.decrypt).toBeCalledWith('token-encrypted-generated');
      expect(inviteRepository.isInvitePending).toBeCalledWith(
        mockInviteData.inviteId,
      );
      expect(inviteRepository.updateInvite).toBeCalledWith(
        mockInviteData.inviteId,
        { isPending: false },
      );
      expect(boardRepository.addUserToBoard).toBeCalledWith(
        mockUserId,
        mockInvite.boardId,
        BoardRolesEnum.CONTRIBUTOR,
      );
    });
  });
});
