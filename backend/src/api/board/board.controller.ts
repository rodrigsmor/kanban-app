import {
  BoardCreateDto,
  BoardDto,
  BoardSummaryDto,
  DeleteBoardDTO,
} from './dto';
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
  Query,
} from '@nestjs/common';
import { UserDto } from '../user/dto';
import { BoardService } from './board.service';
import { BoardRolesEnum } from '../../utils/enums';
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

  @Post('/delete/:boardId/init')
  @HttpCode(HttpStatus.CREATED)
  async initiateBoardDeletion(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
  ): Promise<string> {
    return this.boardService.initiateBoardDeletion(userId, boardId);
  }

  @Delete('/:boardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  async deleteBoard(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
    @Body() authData: DeleteBoardDTO,
  ) {
    return await this.boardService.deleteBoard(userId, boardId, authData);
  }
}
