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
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('/api/board/invite')
export class BoardInviteController {
  constructor(private readonly boardInviteService: BoardInviteService) {}

  @Post('/new')
  @HttpCode(HttpStatus.CREATED)
  async createNewMemberInvite(
    @UserId() userId: number,
    @Body() inviteData: BoardInviteDto,
  ): Promise<string> {
    return this.boardInviteService.inviteUserToBoard(userId, inviteData);
  }

  @Put('/accept')
  @HttpCode(HttpStatus.OK)
  async acceptInvite(
    @UserId() userId: number,
    @Query('token') token: string,
  ): Promise<BoardDto> {
    return await this.boardInviteService.acceptInvite(userId, token);
  }
}
