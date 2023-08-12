import {
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnService } from '../api/column/column.service';
import { BoardPrismaType, ColumnType } from '../utils/@types';
import { CreateColumnDto } from '../api/column/dto/create-column.dto';
import { BoardRepository } from '../common/repositories/board.repository';
import { UserService } from '../api/user/user.service';

describe('ColumnService', () => {
  let userService: UserService;
  let prismaService: PrismaService;
  let columnService: ColumnService;
  let boardRepository: BoardRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, ColumnService, UserService, BoardRepository],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    columnService = moduleRef.get<ColumnService>(ColumnService);
    boardRepository = moduleRef.get<BoardRepository>(BoardRepository);
  });

  const mockUserId = 282192;
  const mockBoardId = 629738;

  const mockCreateColumnData: CreateColumnDto = {
    columnIndex: 2,
    title: 'New column name mock',
  };

  const mockBoardUpdated: BoardPrismaType = {
    id: 18212929,
    background: './path-to-background',
    columns: [
      {
        id: 0,
        boardId: mockBoardId,
        columnIndex: 0,
        cards: [],
        cover: './path-to-cover',
        title: 'Column of new tasks',
        createdAt: new Date(2023, 8, 4),
        updateAt: new Date(2024, 2, 12),
      },
    ],
    createdAt: new Date(2023, 11, 22),
    isPinned: false,
    members: [],
    name: 'a random name',
    owner: null,
    updateAt: new Date(2024, 1, 4),
    description: 'a random description',
    ownerId: mockUserId,
  };

  const mockColumnsUpdated: ColumnType[] = mockBoardUpdated.columns.map(
    (column) => new ColumnType(column),
  );

  describe('createNewColumn', () => {
    it('should throw UnauthorizedException if the user is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockRejectedValueOnce(
          () =>
            new UnauthorizedException(
              'the user provided is not a member of this board',
            ),
        );
      jest.spyOn(prismaService.column, 'create').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.createNewColumn(
          mockUserId,
          mockBoardId,
          mockCreateColumnData,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository).toBeCalledWith(mockUserId, mockBoardId);
        expect(prismaService.column.create).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if user has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockRejectedValueOnce(false);
      jest.spyOn(prismaService.column, 'create').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.createNewColumn(
          mockUserId,
          mockBoardId,
          mockCreateColumnData,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository).toBeCalledWith(mockUserId, mockBoardId);
        expect(prismaService.column.create).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw InternalServerError if there is an error creating the column', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockRejectedValueOnce(false);
      jest
        .spyOn(prismaService.column, 'create')
        .mockRejectedValueOnce(
          new Error('it was not possible to save your new column'),
        );
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.createNewColumn(
          mockUserId,
          mockBoardId,
          mockCreateColumnData,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'it was not possible to save your new column',
        );
        expect(boardRepository).toBeCalledWith(mockUserId, mockBoardId);
        expect(prismaService.column.create).toBeCalledWith({
          data: {
            boardId: mockBoardId,
            title: mockCreateColumnData.title,
            columnIndex: mockCreateColumnData.columnIndex,
          },
        });
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should creates a new column and return the updated columns', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockRejectedValueOnce(false);
      jest.spyOn(prismaService.column, 'create').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoardUpdated);

      const result = await columnService.createNewColumn(
        mockUserId,
        mockBoardId,
        mockCreateColumnData,
      );

      expect(result).toStrictEqual(mockColumnsUpdated);
      expect(boardRepository).toBeCalledWith(mockUserId, mockBoardId);
      expect(prismaService.column.create).toBeCalledWith({
        data: {
          boardId: mockBoardId,
          title: mockCreateColumnData.title,
          columnIndex: mockCreateColumnData.columnIndex,
        },
      });
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardId,
        mockUserId,
      );
    });
  });
});
