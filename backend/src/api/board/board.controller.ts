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
import { ApiOperation, ApiQuery, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@ApiTags('Board')
@Controller('/api/board')
export class BoardController {
  constructor(private readonly boardService: BoardService) {}

  @Get('/')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    description:
      'This endpoint will get all the boards the user is a member of.',
  })
  @ApiResponse({
    status: 202,
    type: BoardSummaryDto,
    isArray: true,
    description:
      'It will return a summary list of the boards the user is a member of.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async getUserBoards(
    @UserId() userId: number,
    @Query('limit') limit?: number,
  ): Promise<BoardSummaryDto[]> {
    return this.boardService.getUserBoards(userId, limit);
  }

  @Get('/owned')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    description: 'This endpoint will get all the boards owned by the user.',
  })
  @ApiResponse({
    status: 202,
    type: BoardSummaryDto,
    isArray: true,
    description: 'It will return a summary list of boards owned by the user.',
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    type: Number,
  })
  async getOwnedBoards(
    @UserId() userId: number,
    @Query('limit') limit?: number,
  ): Promise<BoardSummaryDto[]> {
    return this.boardService.getOwnedBoards(userId, limit);
  }

  @Get('/:id')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    description:
      'This endpoint will get board information according to the id entered in the request.',
  })
  @ApiResponse({
    status: 202,
    type: BoardDto,
    description: 'It will return the board information.',
  })
  async getBoard(
    @UserId() userId: number,
    @Param('id') boardId: number,
  ): Promise<BoardDto> {
    return this.boardService.getBoard(userId, boardId);
  }

  @Post('/')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description: 'This endpoint will create a new board.',
  })
  @ApiResponse({
    status: 202,
    type: BoardSummaryDto,
    description: 'It will return the summarized board that was just created.',
  })
  async createNewBoard(
    @UserId() userId: number,
    @Body() newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    return this.boardService.createNewBoard(userId, newBoard);
  }

  @Patch('/:boardId/')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'This endpoint will change the role of a board member.',
  })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'It will return the new member data.',
  })
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
  @ApiOperation({
    description:
      'This endpoint will start a new board deletion process. To delete a board, you must confirm that you are a member who has permission to perform this action, as well as confirm that this procedure is actually being requested by the member.',
  })
  @ApiResponse({
    status: 201,
    type: String,
    description: 'It will start the process and return a authentication token.',
  })
  async initiateBoardDeletion(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
  ): Promise<string> {
    return this.boardService.initiateBoardDeletion(userId, boardId);
  }

  @Delete('/:boardId')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    description:
      'This endpoint will verify that the data entered is correct, in this case the verification code sent by email and also the authentication token. If it is correct, it will proceed with the process, thus deleting the board.',
  })
  async deleteBoard(
    @UserId() userId: number,
    @Param('boardId') boardId: number,
    @Body() authData: DeleteBoardDTO,
  ) {
    return await this.boardService.deleteBoard(userId, boardId, authData);
  }
}
