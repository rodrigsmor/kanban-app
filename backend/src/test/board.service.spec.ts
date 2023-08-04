import { User } from '@prisma/client';
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
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { BoardCreateDto } from '../api/board/dto/board-create.dto';
import { BoardPrismaType, ColumnPrismaType } from '../utils/@types';
import { BoardDto } from '../api/board/dto/board.dto';

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

  const mockColumns: ColumnPrismaType = {
    boardId: 152,
    cards: [],
    cover: '/a-mock-cover.jpg',
    createdAt: new Date(2023, 6, 31),
    id: 0,
    title: 'New column',
    updateAt: new Date(2024, 5, 1),
    index: 0,
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

  const mockBoardDto: BoardDto = new BoardDto(mockBoards);

  const mockSummaryDto: BoardSummaryDto = new BoardSummaryDto(mockBoards);

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
          members: { select: { user: true } },
        },
      });
    });

    it('should return an array of boards as Summary DTO', async () => {
      jest
        .spyOn(prismaService.board, 'findMany')
        .mockResolvedValueOnce([mockBoards]);

      const result = await boardService.getUserBoards(203);

      expect(result).toStrictEqual([mockSummaryDto]);
      expect(prismaService.board.findMany).toBeCalledWith({
        where: { ownerId: 203 },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
          members: { select: { user: true } },
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
          members: { select: { user: true } },
        },
      });
    });

    it('should throw ForbiddenException if the user does not participate in the board', async () => {
      const mockWrongBoard: BoardPrismaType = {
        ...mockBoards,
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
          members: { select: { user: true } },
        },
      });
    });

    it('should return the board information', async () => {
      jest
        .spyOn(prismaService.board, 'findUnique')
        .mockResolvedValueOnce(mockBoards);

      const result = await boardService.getBoard(mockUserId, mockBoardId);

      const mockBoardsWithNoOwnerPassword = mockBoards;
      delete mockBoardsWithNoOwnerPassword.owner.password;

      expect(result).toStrictEqual(mockBoardDto);
      expect(prismaService.board.findUnique).toBeCalledWith({
        where: {
          id: mockBoardId,
        },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
          members: { select: { user: true } },
        },
      });
    });
  });

  describe('createNewBoard', () => {
    const mockColumnsCreated: Array<ColumnsWithCards> = [
      { ...mockColumns, title: '⏳ pending' },
      { ...mockColumns, title: '🚧 in progress' },
      { ...mockColumns, title: '✅ done' },
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
        },
      ],
    };

    const mockBoardSummaryDTO: BoardSummaryDto = new BoardSummaryDto(
      mockBoardCreatedResponse,
    );

    it('should create a new board and return a DTO summary of it', async () => {
      jest
        .spyOn(prismaService.board, 'create')
        .mockResolvedValueOnce(mockBoardCreated);

      jest
        .spyOn(boardService, 'addMemberToBoard')
        .mockResolvedValueOnce(mockBoardCreatedResponse);

      const result = await boardService.createNewBoard(203, mockNewBoard);

      expect(result).toStrictEqual(mockBoardSummaryDTO);
      expect(prismaService.board.create).toBeCalledWith({
        data: {
          name: mockNewBoard.name,
          description: mockNewBoard.description,
          ownerId: 203,
          columns: {
            create: [
              { title: '⏳ pending', index: 0 },
              { title: '🚧 in progress', index: 1 },
              { title: '✅ done', index: 2 },
            ],
          },
        },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
          members: true,
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

  describe('addMemberToBoard', () => {
    const mockBoardsWithMembers: BoardPrismaType = {
      ...mockBoards,
      members: [
        {
          user: mockOwner,
        },
      ],
    };

    it('should throw a NotFoundException when the user is not found', async () => {
      jest.spyOn(prismaService.user, 'findUnique').mockResolvedValueOnce(null);
      jest
        .spyOn(prismaService.boardMembership, 'create')
        .mockResolvedValueOnce(null);
      jest.spyOn(prismaService.board, 'findUnique').mockResolvedValueOnce(null);

      try {
        await boardService.addMemberToBoard(203, 152);
      } catch (error) {
        expect(prismaService.user.findUnique).toBeCalledWith({
          where: { id: 203 },
        });
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the provided member does not seem to exist',
        );
        expect(prismaService.boardMembership.create).not.toBeCalled();
        expect(prismaService.board.findUnique).not.toBeCalled();
        expect(error).not.toBeInstanceOf(BadRequestException);
      }
    });

    it('should throw a BadRequestException when the board is not found', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockOwner);
      jest
        .spyOn(prismaService.boardMembership, 'create')
        .mockResolvedValueOnce(null);
      jest.spyOn(prismaService.board, 'findUnique').mockResolvedValueOnce(null);

      try {
        await boardService.addMemberToBoard(203, 152);
      } catch (error) {
        expect(prismaService.user.findUnique).toBeCalledWith({
          where: { id: 203 },
        });
        expect(prismaService.board.findUnique).toBeCalledWith({
          where: { id: 152 },
        });
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toStrictEqual(
          'the provided board does not seem to exist',
        );
        expect(prismaService.boardMembership.create).not.toBeCalled();
        expect(error).not.toBeInstanceOf(NotFoundException);
      }
    });

    it('should return the updated board with the new members', async () => {
      jest
        .spyOn(prismaService.user, 'findUnique')
        .mockResolvedValueOnce(mockOwner);
      jest
        .spyOn(prismaService.board, 'findUnique')
        .mockResolvedValueOnce(mockBoards);
      jest
        .spyOn(prismaService.boardMembership, 'create')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(prismaService.board, 'findUnique')
        .mockResolvedValueOnce(mockBoardsWithMembers);

      const result = await boardService.addMemberToBoard(203, 152);

      expect(result).toBe(mockBoardsWithMembers);
      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: 203 },
      });
      expect(prismaService.board.findUnique).toHaveBeenCalledWith({
        where: { id: 152 },
      });
      expect(prismaService.boardMembership.create).toBeCalledWith({
        data: { boardId: 152, userId: 203 },
      });
      expect(prismaService.board.findUnique).toHaveBeenLastCalledWith({
        where: { id: 152 },
        include: {
          columns: {
            include: { cards: true },
          },
          owner: true,
          members: { select: { user: true } },
        },
      });
    });
  });
});
