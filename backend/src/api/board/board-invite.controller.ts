import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Put,
  Query,
} from '@nestjs/common';
import { BoardDto, BoardInviteDto } from './dto';
import { BoardInviteService } from './board-invite.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@ApiTags('Board invite')
@Controller('/api/board/invite')
export class BoardInviteController {
  constructor(private readonly boardInviteService: BoardInviteService) {}

  @Post('/new')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'This endpoint will generate a new invitation for a user to join the board. The invitation will be sent to the email provided.',
  })
  @ApiResponse({
    status: 201,
    type: String,
    description:
      'It will send a link to accept the invitation to the user and return a verification token.',
  })
  async createNewMemberInvite(
    @UserId() userId: number,
    @Body() inviteData: BoardInviteDto,
  ): Promise<string> {
    return this.boardInviteService.inviteUserToBoard(userId, inviteData);
  }

  @Put('/accept')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description:
      'This endpoint will accept the invitation to join the board, making the user a member.',
  })
  @ApiResponse({
    status: 200,
    type: BoardDto,
    description: 'It will accept the invitation and return the board data.',
  })
  async acceptInvite(
    @UserId() userId: number,
    @Query('token') token: string,
  ): Promise<BoardDto> {
    return await this.boardInviteService.acceptInvite(userId, token);
  }
}
