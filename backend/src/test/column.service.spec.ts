import {
  BadRequestException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { BoardPrismaType } from '../utils/@types';
import { PrismaService } from '../prisma/prisma.service';
import { ColumnDto } from '../api/column/dto/column.dto';
import { ColumnService } from '../api/column/column.service';
import { FileService } from '../utils/config/file-service';
import { EditColumnDto } from '../api/column/dto/edit-column.dto';
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
      providers: [
        PrismaService,
        ColumnService,
        UserService,
        BoardRepository,
        FileService,
      ],
    }).compile();

    userService = moduleRef.get<UserService>(UserService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    columnService = moduleRef.get<ColumnService>(ColumnService);
    boardRepository = moduleRef.get<BoardRepository>(BoardRepository);
  });

  const mockUserId = 282192;
  const mockBoardId = 629738;
  const mockColumnId = 81121392;

  const mockCreateColumnData: CreateColumnDto = {
    columnIndex: 2,
    title: 'New column name mock',
  };

  const mockBoardUpdated: BoardPrismaType = {
    id: 18212929,
    background: './path-to-background',
    columns: [
      {
        id: mockColumnId,
        boardId: mockBoardId,
        columnIndex: 0,
        cards: [],
        title: 'Column of new tasks',
        createdAt: new Date(2023, 8, 4),
        updateAt: new Date(2024, 2, 12),
      },
      {
        id: 972929101,
        boardId: mockBoardId,
        columnIndex: 1,
        cards: [],
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

  const mockColumnsUpdated: ColumnDto[] = mockBoardUpdated.columns.map(
    (column) => new ColumnDto(column),
  );

  const mockEditColumnDto: EditColumnDto = {
    columnId: mockColumnId,
    title: 'New title',
    columnIndex: 2,
  };

  describe('createNewColumn', () => {
    it('should throw UnauthorizedException if the user is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
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
        expect(boardRepository.hasDuplicateColumnIndex).not.toBeCalled();
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.create).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if user has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
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
        expect(boardRepository.hasDuplicateColumnIndex).not.toBeCalled();
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.create).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw BadRequestException if column Index is repeated', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'create').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.createNewColumn(
          mockUserId,
          mockBoardId,
          mockCreateColumnData,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toStrictEqual(
          'it is not possible to set this index for this column. It is already occupied.',
        );
        expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
          mockBoardId,
          mockCreateColumnData.columnIndex,
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.create).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw InternalServerError if there is an error creating the column', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
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
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
          mockBoardId,
          mockCreateColumnData.columnIndex,
        );
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
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
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
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
        mockBoardId,
        mockCreateColumnData.columnIndex,
      );
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

  describe('updateColumn', () => {
    it('should throw UnauthorizedException if member has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.updateColumn(
          mockUserId,
          mockBoardId,
          mockEditColumnDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.hasDuplicateColumnIndex).not.toBeCalled();
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.update).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.updateColumn(
          mockUserId,
          mockBoardId,
          mockEditColumnDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.hasDuplicateColumnIndex).not.toBeCalled();
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.update).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw BadRequestException if column index is repeated', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.updateColumn(
          mockUserId,
          mockBoardId,
          mockEditColumnDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toStrictEqual(
          'it is not possible to set this index for this column. It is already occupied.',
        );
        expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
          mockBoardId,
          mockEditColumnDto.columnIndex,
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.update).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw NotFoundException if column does not belong to board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.updateColumn(
          mockUserId,
          mockBoardId,
          mockEditColumnDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'this column does not seem to exist',
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
          mockBoardId,
          mockEditColumnDto.columnIndex,
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.update).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw InternalServerError if an error occurs while updating the column', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(prismaService.column, 'update')
        .mockRejectedValueOnce(new Error(''));
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.updateColumn(
          mockUserId,
          mockBoardId,
          mockEditColumnDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'it was not possible to update your column',
        );
        expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
          mockBoardId,
          mockEditColumnDto.columnIndex,
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.update).toBeCalledWith({
          where: { id: mockEditColumnDto.columnId },
          data: {
            title: mockEditColumnDto.title,
            columnIndex: mockEditColumnDto.columnIndex,
          },
        });
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should only update the column title if it is the only field provided', async () => {
      const mockEditTitleColumnDto: EditColumnDto = {
        ...mockEditColumnDto,
        columnIndex: undefined,
      };

      const mockBoardColumnTitleUpdated: BoardPrismaType = {
        ...mockBoardUpdated,
        columns: [
          {
            ...mockBoardUpdated.columns[0],
            title: mockEditTitleColumnDto.title,
          },
          mockBoardUpdated.columns[1],
        ],
      };

      const mockColumnsTitleUpdated: ColumnDto[] =
        mockBoardColumnTitleUpdated.columns.map(
          (column) => new ColumnDto(column),
        );

      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoardColumnTitleUpdated);

      const result = await columnService.updateColumn(
        mockUserId,
        mockBoardId,
        mockEditTitleColumnDto,
      );

      expect(result).toStrictEqual(mockColumnsTitleUpdated);
      expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(boardRepository.hasDuplicateColumnIndex).not.toBeCalled();
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(prismaService.column.update).toBeCalledWith({
        where: { id: mockEditColumnDto.columnId },
        data: {
          title: mockEditColumnDto.title,
        },
      });
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardId,
        mockUserId,
      );
    });

    it('should only update the column index if it is the only field provided', async () => {
      const mockEditColumnIndexDto: EditColumnDto = {
        ...mockEditColumnDto,
        title: undefined,
      };

      const mockBoardColumnIndexUpdated: BoardPrismaType = {
        ...mockBoardUpdated,
        columns: [
          mockBoardUpdated.columns[1],
          {
            ...mockBoardUpdated.columns[0],
            columnIndex: mockEditColumnIndexDto.columnIndex,
          },
        ],
      };

      const mockColumnIndexUpdated: ColumnDto[] =
        mockBoardColumnIndexUpdated.columns.map(
          (column) => new ColumnDto(column),
        );

      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoardColumnIndexUpdated);

      const result = await columnService.updateColumn(
        mockUserId,
        mockBoardId,
        mockEditColumnIndexDto,
      );

      expect(result).toStrictEqual(mockColumnIndexUpdated);
      expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
        mockBoardId,
        mockEditColumnIndexDto.columnIndex,
      );
      expect(prismaService.column.update).toBeCalledWith({
        where: { id: mockEditColumnDto.columnId },
        data: {
          columnIndex: mockEditColumnDto.columnIndex,
        },
      });
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardId,
        mockUserId,
      );
    });

    it('should update column if all data is provided', async () => {
      const mockBoardColumnsUpdated: BoardPrismaType = {
        ...mockBoardUpdated,
        columns: [
          mockBoardUpdated.columns[1],
          {
            ...mockBoardUpdated.columns[0],
            columnIndex: mockEditColumnDto.columnIndex,
            title: mockEditColumnDto.title,
          },
        ],
      };

      const mockColumnsUpdated: ColumnDto[] =
        mockBoardColumnsUpdated.columns.map((column) => new ColumnDto(column));

      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'hasDuplicateColumnIndex')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'update').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoardColumnsUpdated);

      const result = await columnService.updateColumn(
        mockUserId,
        mockBoardId,
        mockEditColumnDto,
      );

      expect(result).toStrictEqual(mockColumnsUpdated);
      expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(boardRepository.hasDuplicateColumnIndex).toBeCalledWith(
        mockBoardId,
        mockEditColumnDto.columnIndex,
      );
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(prismaService.column.update).toBeCalledWith({
        where: { id: mockEditColumnDto.columnId },
        data: {
          title: mockEditColumnDto.title,
          columnIndex: mockEditColumnDto.columnIndex,
        },
      });
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardId,
        mockUserId,
      );
    });
  });

  describe('deleteColumn', () => {
    it('should throw a UnauthorizedException if the user is not an admin or contributor', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'delete').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.deleteColumn(mockUserId, mockBoardId, mockColumnId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.delete).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw a BadRequestException if column does not belong to board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(prismaService.column, 'delete').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.deleteColumn(mockUserId, mockBoardId, mockColumnId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'this column does not seem to exist',
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.delete).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw a UnauthorizedException if is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'delete').mockResolvedValueOnce(null);
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.deleteColumn(mockUserId, mockBoardId, mockColumnId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.delete).not.toBeCalled();
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw a InternalServerException if an error occurs while deleting the board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(prismaService.column, 'delete')
        .mockRejectedValueOnce(new Error(''));
      jest.spyOn(boardRepository, 'findBoardById').mockResolvedValueOnce(null);

      try {
        await columnService.deleteColumn(mockUserId, mockBoardId, mockColumnId);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'error while deleting board. Try again later',
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.column.delete).toBeCalledWith({
          where: { id: mockColumnId },
        });
        expect(boardRepository.findBoardById).not.toBeCalled();
      }
    });

    it('should throw a InternalServerException if an error occurs while deleting the board', async () => {
      const mockBoardUpdatedReturn: BoardPrismaType = {
        ...mockBoardUpdated,
        columns: [
          {
            id: 972929101,
            boardId: mockBoardId,
            columnIndex: 0,
            cards: [],
            title: 'Column of new tasks',
            createdAt: new Date(2023, 8, 4),
            updateAt: new Date(2024, 2, 12),
          },
        ],
      };

      const mockColumns: ColumnDto[] = mockBoardUpdatedReturn.columns.map(
        (column) => new ColumnDto(column),
      );

      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.column, 'delete').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardById')
        .mockResolvedValueOnce(mockBoardUpdatedReturn);

      const result = await columnService.deleteColumn(
        mockUserId,
        mockBoardId,
        mockColumnId,
      );

      expect(result).toStrictEqual(mockColumns);
      expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(prismaService.column.delete).toBeCalledWith({
        where: { id: mockColumnId },
      });
      expect(boardRepository.findBoardById).toBeCalledWith(
        mockBoardId,
        mockUserId,
      );
    });
  });
});
