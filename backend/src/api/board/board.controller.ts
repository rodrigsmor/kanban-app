import { BoardCreateDto, BoardSummaryDto } from './dto';
import { BoardService } from './board.service';
import { Body, Controller, Get, Post } from '@nestjs/common';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/')
  async getUserBoards(@UserId() userId: number): Promise<BoardSummaryDto[]> {
    return this.boardService.getUserBoards(userId);
  }

  @Post('/')
  async createNewBoard(
    @UserId() userId: number,
    @Body() newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    return this.boardService.createNewBoard(userId, newBoard);
  }
}
