import { UserService } from '../user/user.service';
import { BoardCreateDto, BoardSummaryDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardWithColumns } from '../../utils/@types/board.types';
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';

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
      },
    });

    if (!boards) return [];

    const summaryBoard: BoardSummaryDto[] = boards.map((board) => {
      return new BoardSummaryDto(board);
    });

    return summaryBoard;
  }

  async getBoard(userId: number, boardId: number): Promise<BoardWithColumns> {
    const board = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        columns: {
          include: { cards: true },
        },
        owner: true,
      },
    });

    if (!board)
      throw new NotFoundException('The board provided does not seem to exist');
    else if (board.ownerId !== userId) {
      throw new ForbiddenException('You are not allowed to access this board');
    }

    delete board.owner.password;
    return board;
  }

  async createNewBoard(
    userId: number,
    newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    try {
      const boardCreated = await this.prisma.board.create({
        data: {
          name: newBoard.name,
          description: newBoard.description,
          ownerId: userId,
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

      return new BoardSummaryDto(boardCreated);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'It was not possible to create a new board',
      );
    }
  }
}
