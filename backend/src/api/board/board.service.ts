import { BoardSummaryDto } from './dto';
import { Injectable } from '@nestjs/common';
import { UserService } from '../user/user.service';
import { PrismaService } from '../../prisma/prisma.service';

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
}
