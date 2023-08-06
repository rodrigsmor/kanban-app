import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Patch,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { UserDto } from '../user/dto';
import { BoardService } from './board.service';
import { BoardRolesEnum } from '../../utils/enums';
import { BoardCreateDto, BoardDto, BoardSummaryDto } from './dto';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/')
  @HttpCode(HttpStatus.ACCEPTED)
  async getUserBoards(
    @UserId() userId: number,
    @Query('limit') limit?: number,
  ): Promise<BoardSummaryDto[]> {
    return this.boardService.getUserBoards(userId, limit);
  }

  @Get('/owned')
  @HttpCode(HttpStatus.ACCEPTED)
  async getOwnedBoards(
    @UserId() userId: number,
    @Query('limit') limit?: number,
  ): Promise<BoardSummaryDto[]> {
    return this.boardService.getOwnedBoards(userId, limit);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  async getBoard(
    @UserId() userId: number,
    @Param('id') boardId: number,
  ): Promise<BoardDto> {
    return this.boardService.getBoard(userId, boardId);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  async createNewBoard(
    @UserId() userId: number,
    @Body() newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    return this.boardService.createNewBoard(userId, newBoard);
  }

  @Patch('/:boardId/')
  @HttpCode(HttpStatus.OK)
  async updateMemberRole(
    @Param('boardId') boardId: number,
    @Query('memberId') memberId: number,
    @Query('role') role: BoardRolesEnum,
    @UserId() userId: number,
  ): Promise<UserDto> {
    return this.boardService.updateMemberRole(userId, boardId, memberId, role);
  }
}
