import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { ColumnDto, CreateColumnDto, EditColumnDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardRepository } from '../../common/repositories/board.repository';

@Injectable()
export class ColumnService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly boardRepository: BoardRepository,
  ) {}

  async createNewColumn(
    userId: number,
    boardId: number,
    columnData: CreateColumnDto,
  ): Promise<ColumnDto[]> {
    const hasPermissionToEdit =
      await this.boardRepository.isMemberAuthorizedToEdit(userId, boardId);

    if (!hasPermissionToEdit)
      throw new UnauthorizedException(
        'you do not have permission to perform this action',
      );

    const isColumnIndexRepeated =
      await this.boardRepository.hasDuplicateColumnIndex(
        boardId,
        columnData.columnIndex,
      );

    if (isColumnIndexRepeated)
      throw new BadRequestException(
        'it is not possible to set this index for this column. It is already occupied.',
      );

    try {
      await this.prisma.column.create({
        data: {
          boardId,
          title: columnData.title,
          columnIndex: columnData.columnIndex,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'it was not possible to save your new column',
      );
    }

    const board = await this.boardRepository.findBoardById(boardId, userId);

    const columns: ColumnDto[] = board.columns.map(
      (column) => new ColumnDto(column),
    );

    return columns;
  }

  async updateColumn(
    userId: number,
    boardId: number,
    columnData: EditColumnDto,
  ): Promise<ColumnDto[]> {
    const hasPermissionToEdit =
      await this.boardRepository.isMemberAuthorizedToEdit(userId, boardId);

    if (!hasPermissionToEdit)
      throw new UnauthorizedException(
        'you do not have permission to perform this action',
      );

    if (columnData?.columnIndex) {
      const isColumnIndexRepeated =
        await this.boardRepository.hasDuplicateColumnIndex(
          boardId,
          columnData.columnIndex,
        );

      if (isColumnIndexRepeated)
        throw new BadRequestException(
          'it is not possible to set this index for this column. It is already occupied.',
        );
    }

    const columnExistsOnBoard = await this.boardRepository.isColumnPartOfBoard(
      boardId,
      columnData.columnId,
    );

    if (!columnExistsOnBoard)
      throw new NotFoundException('this column does not seem to exist');

    try {
      await this.prisma.column.update({
        where: { id: columnData.columnId },
        data: {
          ...(columnData?.title && { title: columnData?.title }),
          ...(columnData?.columnIndex && {
            columnIndex: columnData?.columnIndex,
          }),
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'it was not possible to update your column',
      );
    }

    const board = await this.boardRepository.findBoardById(boardId, userId);

    const columns: ColumnDto[] = board.columns.map(
      (column) => new ColumnDto(column),
    );

    return columns;
  }

  async deleteColumn(
    userId: number,
    boardId: number,
    columnId: number,
  ): Promise<ColumnDto[]> {
    const hasPermissionToEdit =
      await this.boardRepository.isMemberAuthorizedToEdit(userId, boardId);

    if (!hasPermissionToEdit)
      throw new UnauthorizedException(
        'you do not have permission to perform this action',
      );

    const columnExistsOnBoard = await this.boardRepository.isColumnPartOfBoard(
      boardId,
      columnId,
    );

    if (!columnExistsOnBoard)
      throw new NotFoundException('this column does not seem to exist');

    try {
      await this.prisma.column.delete({
        where: { id: columnId },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'error while deleting board. Try again later',
      );
    }

    const board = await this.boardRepository.findBoardById(boardId, userId);

    const columns: ColumnDto[] = board.columns.map(
      (column) => new ColumnDto(column),
    );

    return columns;
  }
}
