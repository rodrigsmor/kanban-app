import { BoardService } from './board.service';
import { BoardCreateDto, BoardDto, BoardSummaryDto } from './dto';
import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/owned')
  async getUserBoards(@UserId() userId: number): Promise<BoardSummaryDto[]> {
    return this.boardService.getOwnedBoards(userId);
  }

  @Get('/:id')
  async getBoard(
    @UserId() userId: number,
    @Param('id') boardId: number,
  ): Promise<BoardDto> {
    return this.boardService.getBoard(userId, boardId);
  }

  @Post('/')
  async createNewBoard(
    @UserId() userId: number,
    @Body() newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    return this.boardService.createNewBoard(userId, newBoard);
  }
}
