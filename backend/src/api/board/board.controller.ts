import { BoardService } from './board.service';
import { Controller, Get } from '@nestjs/common';
import { BoardDto, BoardSummaryDto } from './dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('board')
export class BoardController {
  @Get('/')
  async getUserBoards(@UserId() userId: number): Promise<BoardSummaryDto[]> {
    return null;
  }
}
