import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { BoardCreateDto, BoardDto, BoardSummaryDto } from './dto';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';
import { Column } from '@prisma/client';

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
