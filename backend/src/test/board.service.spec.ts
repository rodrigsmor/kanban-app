import {
  BoardMembershipType,
  BoardPrismaType,
  ColumnPrismaType,
} from '../utils/@types';
import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { JwtService } from '@nestjs/jwt';
import { BoardRolesEnum } from '../utils/enums';
import { BoardDto } from '../api/board/dto/board.dto';
import { UserService } from '../api/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BoardService } from '../api/board/board.service';
import { TwoFactorService } from '../auth/two-factor.service';
import { ColumnsWithCards } from '../utils/@types/board.types';
import { BoardCreateDto } from '../api/board/dto/board-create.dto';
import { EmailService } from '../utils/config/email-config-service';
import { BoardSummaryDto } from '../api/board/dto/board-summary.dto';
import { BoardRepository } from '../common/repositories/board.repository';

describe('BoardService', () => {
  let boardService: BoardService;
  let emailService: EmailService;
  let prismaService: PrismaService;
  let boardRepository: BoardRepository;
  let twoFactorService: TwoFactorService;

  const mockOwner: User = {
    id: 203,
    isAdmin: false,
    lastName: 'Test last name',
    email: 'user@test.com',
    profilePicture: '/a-mock-profile.jpg',
    password: 'super-secure-password',
    firstName: 'Test first name',
  };

  const mockColumns: ColumnPrismaType = {
    boardId: 152,
    cards: [],
    cover: '/a-mock-cover.jpg',
    createdAt: new Date(2023, 6, 31),
    id: 0,
    title: 'New column',
    updateAt: new Date(2024, 5, 1),
    columnIndex: 0,
  };

  const mockBoards: BoardPrismaType = {
    id: 152,
    isPinned: true,
    name: 'My mock board',
    owner: mockOwner,
    ownerId: 203,
    updateAt: new Date(2024, 2, 1),
    background: null,
    columns: [mockColumns],
    createdAt: new Date(2023, 5, 1),
    description: 'a little mock description',
    members: [],
  };

  const mockBoardsArray: Array<BoardPrismaType> = [
    {
      id: 152,
      isPinned: true,
      name: 'My mock board',
      owner: mockOwner,
      ownerId: 203,
      updateAt: new Date(2024, 2, 1),
      background: null,
      columns: [mockColumns],
      createdAt: new Date(2023, 5, 1),
      description: 'a little mock description',
      members: [
        {
          user: mockOwner,
          role: 'CONTRIBUTE',
        },
      ],
    },
    {
      id: 172,
      isPinned: true,
      name: 'My mock board',
      owner: mockOwner,
      ownerId: 222,
      updateAt: new Date(2024, 2, 1),
      background: null,
      columns: [mockColumns],
      createdAt: new Date(2023, 5, 1),
      description: 'a little mock description',
      members: [
        {
          user: mockOwner,
          role: 'CONTRIBUTE',
        },
      ],
    },
  ];

  const mockBoardMembership: Array<BoardMembershipType> = [
    {
      board: mockBoardsArray[0],
      boardId: 152,
      id: 28392,
      role: 'CONTRIBUTOR',
      user: mockOwner,
      userId: 203,
    },
    {
      board: mockBoardsArray[1],
      boardId: 172,
      id: 162,
      role: 'CONTRIBUTOR',
      user: mockOwner,
      userId: 203,
    },
  ];

  const mockParticipatingBoardsDTO: BoardSummaryDto[] = mockBoardMembership.map(
    (board) => {
      return new BoardSummaryDto(board.board);
    },
  );

  const mockBoardDto: BoardDto = new BoardDto(mockBoards);

  const mockSummaryDto: BoardSummaryDto = new BoardSummaryDto(mockBoards);

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        BoardService,
        UserService,
        PrismaService,
        BoardRepository,
        EmailService,
        TwoFactorService,
        JwtService,
      ],
    }).compile();

    emailService = moduleRef.get<EmailService>(EmailService);
    boardService = moduleRef.get<BoardService>(BoardService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    boardRepository = moduleRef.get<BoardRepository>(BoardRepository);
    twoFactorService = moduleRef.get<TwoFactorService>(TwoFactorService);
  });

  describe('getUserBoards', () => {
    it('should return an empty array when the user is not participating in any board', async () => {
      jest
        .spyOn(boardRepository, 'findBoardMembershipsByUserId')
        .mockResolvedValueOnce(null);

      const result = await boardService.getUserBoards(202, 10);

      expect(boardRepository.findBoardMembershipsByUserId).toBeCalledWith(
        202,
        10,
      );
      expect(result).toStrictEqual([]);
    });

    it('should return an array of boards as Summary DTO', async () => {
      jest
        .spyOn(boardRepository, 'findBoardMembershipsByUserId')
        .mockResolvedValueOnce(mockBoardMembership);

      const result = await boardService.getUserBoards(202, 10);

      expect(boardRepository.findBoardMembershipsByUserId).toBeCalledWith(
        202,
        10,
      );
      expect(result).toStrictEqual(mockParticipatingBoardsDTO);
    });
  });

  describe('getOwnedBoards', () => {
    it('should return an empty array when the user has no boards', async () => {
      jest
        .spyOn(boardRepository, 'findOwnedBoardsByUserId')
        .mockResolvedValueOnce(null);

      const result = await boardService.getOwnedBoards(203, 10);

      expect(result).toStrictEqual([]);
      expect(boardRepository.findOwnedBoardsByUserId).toBeCalledWith(203, 10);
    });

    it('should return an array of boards as Summary DTO', async () => {
      jest
        .spyOn(boardRepository, 'findOwnedBoardsByUserId')
        .mockResolvedValueOnce([mockBoards]);

      const result = await boardService.getOwnedBoards(203, 10);

      expect(result).toStrictEqual([mockSummaryDto]);
      expect(boardRepository.findOwnedBoardsByUserId).toBeCalledWith(203, 10);
    });
  });

  describe('getBoard', () => {
    const mockUserId = 203;
    const mockBoardId = 152;

    it('should throw NotFoundException in case the board Id does not match any board', async () => {
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await boardService.getBoard(mockUserId, mockBoardId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toBe('The board provided does not seem to exist');
        expect(boardRepository.findBoardById).toBeCalledWith(
          mockBoardId,
          mockUserId,
        );
      }
    });

    it('should return the board information', async () => {
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoards);

      const result = await boardService.getBoard(mockUserId, mockBoardId);

      const mockBoardsWithNoOwnerPassword = mockBoards;
      delete mockBoardsWithNoOwnerPassword.owner.password;

      expect(result).toStrictEqual(mockBoardDto);
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardId,
        mockUserId,
      );
    });
  });

  describe('createNewBoard', () => {
    const mockColumnsCreated: Array<ColumnsWithCards> = [
      { ...mockColumns, title: '⏳ pending', columnIndex: 0 },
      { ...mockColumns, title: '🚧 in progress', columnIndex: 1 },
      { ...mockColumns, title: '✅ done', columnIndex: 2 },
    ];

    const mockBoardCreated: BoardPrismaType = {
      ...mockBoards,
      columns: mockColumnsCreated,
      members: [],
    };

    const mockNewBoard: BoardCreateDto = {
      name: mockBoardCreated.name,
      description: mockBoardCreated.description,
    };

    const mockBoardCreatedResponse: BoardPrismaType = {
      ...mockBoardCreated,
      members: [
        {
          user: {
            email: 'test@user.com',
            firstName: 'Test first name',
            id: 203,
            isAdmin: true,
            lastName: 'Test last name',
            password: 'hyper-secure-password',
            profilePicture: '/path-to-image',
          },
          role: 'ADMIN',
        },
      ],
    };

    const mockBoardSummaryDTO: BoardSummaryDto = new BoardSummaryDto(
      mockBoardCreatedResponse,
    );

    it('should create a new board and return a DTO summary of it', async () => {
      jest
        .spyOn(boardRepository, 'createBoard')
        .mockResolvedValueOnce(mockBoardCreated);

      jest
        .spyOn(boardService, 'addMemberToBoard')
        .mockResolvedValueOnce(mockBoardCreatedResponse);

      const result = await boardService.createNewBoard(203, mockNewBoard);

      expect(result).toStrictEqual(mockBoardSummaryDTO);
      expect(boardRepository.createBoard).toBeCalledWith(203, mockNewBoard);
      expect(boardService.addMemberToBoard).toBeCalledWith(
        203,
        mockBoardCreatedResponse.id,
        BoardRolesEnum.ADMIN,
      );
    });

    it('should throw a InternalServerErrorException when board creation fails', async () => {
      jest
        .spyOn(prismaService.board, 'create')
        .mockRejectedValueOnce(new Error(''));

      try {
        await boardService.createNewBoard(203, mockNewBoard);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toBe('It was not possible to create a new board');
      }
    });
  });

  // describe('addMemberToBoard', () => {
  //   const mockBoardsWithMembers: BoardPrismaType = {
  //     ...mockBoards,
  //     members: [
  //       {
  //         user: mockOwner,
  //         role: 'OBSERVER',
  //       },
  //     ],
  //   };

  //   it('should throw a NotFoundException when the user is not found', async () => {
  //     jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
  //     jest
  //       .spyOn(prismaService.boardMembership, 'create')
  //       .mockResolvedValueOnce(null);
  //     jest.spyOn(prismaService.board, 'findUnique').mockResolvedValueOnce(null);

  //     try {
  //       await boardService.addMemberToBoard(203, 152, BoardRolesEnum.OBSERVER);
  //     } catch (error) {
  //       expect(prismaService.user.findUnique).toBeCalledWith({
  //         where: { id: 203 },
  //       });
  //       expect(error).toBeInstanceOf(NotFoundException);
  //       expect(error.message).toStrictEqual(
  //         'the provided member does not seem to exist',
  //       );
  //       expect(prismaService.boardMembership.create).not.toBeCalled();
  //       expect(prismaService.board.findUnique).not.toBeCalled();
  //       expect(error).not.toBeInstanceOf(BadRequestException);
  //     }
  //   });

  //   it('should throw a BadRequestException when the board is not found', async () => {
  //     jest
  //       .spyOn(prismaService.user, 'findUnique')
  //       .mockResolvedValueOnce(mockOwner);
  //     jest
  //       .spyOn(prismaService.boardMembership, 'create')
  //       .mockResolvedValueOnce(null);
  //     jest.spyOn(prismaService.board, 'findUnique').mockResolvedValueOnce(null);

  //     try {
  //       await boardService.addMemberToBoard(203, 152, BoardRolesEnum.OBSERVER);
  //     } catch (error) {
  //       expect(prismaService.user.findUnique).toBeCalledWith({
  //         where: { id: 203 },
  //       });
  //       expect(prismaService.board.findUnique).toBeCalledWith({
  //         where: { id: 152 },
  //       });
  //       expect(error).toBeInstanceOf(BadRequestException);
  //       expect(error.message).toStrictEqual(
  //         'the provided board does not seem to exist',
  //       );
  //       expect(prismaService.boardMembership.create).not.toBeCalled();
  //       expect(error).not.toBeInstanceOf(NotFoundException);
  //     }
  //   });

  //   it('should return the updated board with the new members', async () => {
  //     jest
  //       .spyOn(prismaService.user, 'findUnique')
  //       .mockResolvedValueOnce(mockOwner);
  //     jest
  //       .spyOn(prismaService.board, 'findUnique')
  //       .mockResolvedValueOnce(mockBoards);
  //     jest
  //       .spyOn(prismaService.boardMembership, 'create')
  //       .mockResolvedValueOnce(null);
  //     jest
  //       .spyOn(prismaService.board, 'findUnique')
  //       .mockResolvedValueOnce(mockBoardsWithMembers);

  //     const result = await boardService.addMemberToBoard(
  //       203,
  //       152,
  //       BoardRolesEnum.OBSERVER,
  //     );

  //     expect(result).toBe(mockBoardsWithMembers);
  //     expect(prismaService.user.findUnique).toHaveBeenCalledWith({
  //       where: { id: 203 },
  //     });
  //     expect(prismaService.board.findUnique).toHaveBeenCalledWith({
  //       where: { id: 152 },
  //     });
  //     expect(prismaService.boardMembership.create).toBeCalledWith({
  //       data: { boardId: 152, userId: 203, role: BoardRolesEnum.OBSERVER },
  //     });
  //     expect(prismaService.board.findUnique).toHaveBeenLastCalledWith({
  //       where: { id: 152 },
  //       include: {
  //         columns: {
  //           include: { cards: true },
  //         },
  //         owner: true,
  //         members: { select: { user: true, role: true } },
  //       },
  //     });
  //   });
  // });
});
