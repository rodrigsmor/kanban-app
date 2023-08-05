import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BoardService } from './board.service';
import { BoardCreateDto, BoardDto, BoardSummaryDto } from './dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';
import { UserDto } from '../user/dto';
import { BoardRolesEnum } from '../../utils/enums/board-roles.enum';

@Controller('/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/')
  async getUserBoards(
    @UserId() userId: number,
    @Query('limit') limit?: number,
  ): Promise<BoardSummaryDto[]> {
    return this.boardService.getUserBoards(userId, limit);
  }

  @Get('/owned')
  async getOwnedBoards(@UserId() userId: number): Promise<BoardSummaryDto[]> {
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

  @Patch('/:boardId/')
  async updateMemberRole(
    @Param('boardId') boardId: number,
    @Query('memberId') memberId: number,
    @Query('role') role: BoardRolesEnum,
    @UserId() userId: number,
  ): Promise<UserDto> {
    return this.boardService.updateMemberRole(userId, boardId, memberId, role);
  }
}
