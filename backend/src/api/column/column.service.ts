import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { ColumnType } from '../../utils/@types';
import { UserService } from '../user/user.service';
import { CreateColumnDto, EditColumnDto } from './dto';
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
  ): Promise<ColumnType[]> {
    const hasPermission =
      await this.boardRepository.checkIfMemberHasPermissionToEdit(
        userId,
        boardId,
      );

    if (!hasPermission)
      throw new UnauthorizedException(
        'you do not have permission to perform this action',
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

    const columns: ColumnType[] = board.columns.map(
      (column) => new ColumnType(column),
    );

    return columns;
  }

  async updateColumn(
    userId: number,
    boardId: number,
    columnData: EditColumnDto,
  ): Promise<ColumnType[]> {
    const hasPermission =
      await this.boardRepository.checkIfMemberHasPermissionToEdit(
        userId,
        boardId,
      );

    if (!hasPermission)
      throw new UnauthorizedException(
        'you do not have permission to perform this action',
      );

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

    const columns: ColumnType[] = board.columns.map(
      (column) => new ColumnType(column),
    );

    return columns;
  }

  async deleteColumn(
    userId: number,
    boardId: number,
    columnId: number,
  ): Promise<ColumnType[]> {
    const hasPermission =
      await this.boardRepository.checkIfMemberHasPermissionToEdit(
        userId,
        boardId,
      );

    if (!hasPermission)
      throw new UnauthorizedException(
        'you do not have permission to perform this action',
      );

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

    const columns: ColumnType[] = board.columns.map(
      (column) => new ColumnType(column),
    );

    return columns;
  }
}