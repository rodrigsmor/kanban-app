import { BoardDto, BoardInviteDto } from './dto';
import { Body, Controller, Post, Put, Query } from '@nestjs/common';
import { BoardInviteService } from './board-invite.service';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('/api/board/invite')
export class BoardInviteController {
  constructor(private readonly boardInviteService: BoardInviteService) {}

  @Post('/new')
  async createNewMemberInvite(
    @UserId() userId: number,
    @Body() inviteData: BoardInviteDto,
  ): Promise<string> {
    return this.boardInviteService.inviteUserToBoard(userId, inviteData);
  }

  @Put('/accept')
  async acceptInvite(
    @UserId() userId: number,
    @Query('token') token: string,
  ): Promise<BoardDto> {
    return await this.boardInviteService.acceptInvite(userId, token);
  }
}
