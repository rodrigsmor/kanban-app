import { BoardSummaryDto } from './dto';
import { BoardService } from './board.service';
import { Controller, Get } from '@nestjs/common';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/')
  async getUserBoards(@UserId() userId: number): Promise<BoardSummaryDto[]> {
    return this.boardService.getUserBoards(userId);
  }
}
