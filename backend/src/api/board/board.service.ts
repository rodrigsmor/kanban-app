import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserService } from '../user/user.service';
import { BoardCreateDto, BoardDto, BoardSummaryDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardWithColumns } from '../../utils/@types/board.types';
import { BoardPrismaType } from '../../utils/@types/payloads.type';

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
  ) {}

  async getUserBoards(userId: number): Promise<BoardSummaryDto[]> {
    const boards = await this.prisma.board.findMany({
      where: { ownerId: userId },
      include: {
        columns: {
          include: { cards: true },
        },
        owner: true,
        members: true,
      },
    });

    if (!boards) return [];

    const summaryBoard: BoardSummaryDto[] = boards.map((board) => {
      return new BoardSummaryDto(board as unknown as BoardWithColumns);
    });

    return summaryBoard;
  }

  async getBoard(userId: number, boardId: number): Promise<BoardDto> {
    const board = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        columns: {
          include: { cards: true },
        },
        owner: true,
        members: { select: { user: true } },
      },
    });

    if (!board)
      throw new NotFoundException('The board provided does not seem to exist');
    else if (board.ownerId !== userId) {
      throw new ForbiddenException('You are not allowed to access this board');
    }

    return new BoardDto(board);
  }

  async createNewBoard(
    userId: number,
    newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    try {
      const board = await this.prisma.board.create({
        data: {
          name: newBoard.name,
          description: newBoard.description,
          ownerId: userId,
          columns: {
            create: [
              { title: '⏳ pending', index: 0 },
              { title: '🚧 in progress', index: 1 },
              { title: '✅ done', index: 1 },
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

      const boardCreated = await this.addMemberToBoard(userId, board.id);

      return new BoardSummaryDto(boardCreated);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'It was not possible to create a new board',
      );
    }
  }

  async addMemberToBoard(
    memberId: number,
    boardId: number,
  ): Promise<BoardPrismaType> {
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member)
      throw new NotFoundException('the provided member does not seem to exist');

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board)
      throw new BadRequestException(
        'the provided board does not seem to exist',
      );

    await this.prisma.boardMembership.create({
      data: { boardId, userId: memberId },
    });

    const updatedBoard = await this.prisma.board.findUnique({
      where: { id: boardId },
      include: {
        columns: {
          include: { cards: true },
        },
        owner: true,
        members: { select: { user: true } },
      },
    });

    return updatedBoard;
  }
}
