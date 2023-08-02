import { User, Board } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { UserService } from '../api/user/user.service';
import { PrismaService } from '../prisma/prisma.service';
import { BoardService } from '../api/board/board.service';
import { BoardSummaryDto } from '../api/board/dto/board-summary.dto';
import {
  BoardWithColumns,
  ColumnsWithCards,
} from '../utils/@types/board.types';
import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BoardCreateDto } from '../api/board/dto/board-create.dto';

describe('BoardService', () => {
  let boardService: BoardService;
  let prismaService: PrismaService;

  const mockOwner: User = {
    id: 203,
    isAdmin: false,
    lastName: 'Test last name',
    email: 'user@test.com',
    profilePicture: '/a-mock-profile.jpg',
    password: 'super-secure-password',
    firstName: 'Test first name',
  };

  const mockColumnsWithCards: ColumnsWithCards = {
    boardId: 152,
    cards: [],
    cover: '/a-mock-cover.jpg',
    createdAt: new Date(2023, 6, 31),
    id: 0,
    title: 'New column',
    updateAt: new Date(2024, 5, 1),
  };

  const mockBoardsWithColumns: BoardWithColumns = {
    id: 152,
    isPinned: true,
    name: 'My mock board',
    owner: mockOwner,
    ownerId: 203,
    updateAt: new Date(2024, 2, 1),
    background: null,
    columns: [mockColumnsWithCards],
    createdAt: new Date(2023, 5, 1),
    description: 'a little mock description',
  };

  const mockSummaryDto: BoardSummaryDto = new BoardSummaryDto(
    mockBoardsWithColumns,
  );

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [BoardService, UserService, PrismaService],
    }).compile();

    boardService = moduleRef.get<BoardService>(BoardService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
  });

  describe('getUserBoards', () => {
    it('should return an empty array when the user has no boards', async () => {
      jest.spyOn(prismaService.board, 'findMany').mockResolvedValueOnce(null);

      const result = await boardService.getUserBoards(203);

      expect(result).toStrictEqual([]);
      expect(prismaService.board.findMany).toBeCalledWith({
        where: { ownerId: 203 },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
        },
      });
    });

    it('should return an array of boards as Summary DTO', async () => {
      jest
        .spyOn(prismaService.board, 'findMany')
        .mockResolvedValueOnce([mockBoardsWithColumns]);

      const result = await boardService.getUserBoards(203);

      expect(result).toStrictEqual([mockSummaryDto]);
      expect(prismaService.board.findMany).toBeCalledWith({
        where: { ownerId: 203 },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
        },
      });
    });
  });

  describe('getBoard', () => {
    const mockUserId = 203;
    const mockBoardId = 152;

    it('should throw NotFoundException in case the board Id does not match any board', async () => {
      jest.spyOn(prismaService.board, 'findUnique').mockResolvedValueOnce(null);

      expect(
        boardService.getBoard(mockUserId, mockBoardId),
      ).rejects.toThrowError(NotFoundException);
      expect(prismaService.board.findUnique).toBeCalledWith({
        where: {
          id: mockBoardId,
        },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
        },
      });
    });

    it('should throw ForbiddenException if the user does not participate in the board', async () => {
      const mockWrongBoard: BoardWithColumns = {
        ...mockBoardsWithColumns,
        ownerId: 67,
        owner: {
          ...mockOwner,
          id: 67,
        },
      };

      jest
        .spyOn(prismaService.board, 'findUnique')
        .mockResolvedValueOnce(mockWrongBoard);

      expect(
        boardService.getBoard(mockUserId, mockBoardId),
      ).rejects.toThrowError(ForbiddenException);
      expect(prismaService.board.findUnique).toBeCalledWith({
        where: {
          id: mockBoardId,
        },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
        },
      });
    });

    it('should return the board information', async () => {
      jest
        .spyOn(prismaService.board, 'findUnique')
        .mockResolvedValueOnce(mockBoardsWithColumns);

      const result = await boardService.getBoard(mockUserId, mockBoardId);

      const mockBoardsWithNoOwnerPassword = mockBoardsWithColumns;
      delete mockBoardsWithNoOwnerPassword.owner.password;

      expect(result).toStrictEqual(mockBoardsWithNoOwnerPassword);
      expect(prismaService.board.findUnique).toBeCalledWith({
        where: {
          id: mockBoardId,
        },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
        },
      });
    });
  });

  describe('createNewBoard', () => {
    const mockColumnsCreated: Array<ColumnsWithCards> = [
      { ...mockColumnsWithCards, title: '⏳ pending' },
      { ...mockColumnsWithCards, title: '🚧 in progress' },
      { ...mockColumnsWithCards, title: '✅ done' },
    ];

    const mockBoardCreated: BoardWithColumns = {
      ...mockBoardsWithColumns,
      columns: mockColumnsCreated,
    };

    const mockNewBoard: BoardCreateDto = {
      name: mockBoardCreated.name,
      description: mockBoardCreated.description,
    };

    const mockBoardSummaryDTO: BoardSummaryDto = new BoardSummaryDto(
      mockBoardCreated,
    );

    it('should create a new board and return a DTO summary of it', async () => {
      jest
        .spyOn(prismaService.board, 'create')
        .mockResolvedValueOnce(mockBoardCreated);

      const result = await boardService.createNewBoard(203, mockNewBoard);

      expect(result).toStrictEqual(mockBoardSummaryDTO);
      expect(prismaService.board.create).toBeCalledWith({
        data: {
          name: mockNewBoard.name,
          description: mockNewBoard.description,
          ownerId: 203,
          columns: {
            create: [
              { title: '⏳ pending' },
              { title: '🚧 in progress' },
              { title: '✅ done' },
            ],
          },
        },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
        },
      });
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
});
