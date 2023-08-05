import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { BoardInviteDto } from './dto';
import { InviteDataTypes } from '../../utils/@types';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardRepository, InviteRepository } from '../../common/repositories';
import { EncryptConfigService } from '../../utils/config/encryption-config-service';

@Injectable()
export class BoardInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypt: EncryptConfigService,
    private readonly boardRepository: BoardRepository,
    private readonly inviteRepository: InviteRepository,
  ) {}

  async inviteUserToBoard(
    userId: number,
    boardInviteDto: BoardInviteDto,
  ): Promise<string> {
    const isAdmin = await this.boardRepository.checkIfBoardMemberIsAdmin(
      userId,
      boardInviteDto.boardId,
    );

    if (!isAdmin)
      throw new ForbiddenException(
        'You are not allowed to add new members to this board',
      );

    const board = await this.boardRepository.findBoardById(
      boardInviteDto.boardId,
      userId,
    );

    if (!board) throw new NotFoundException('the board seems to not to exist');

    const membership =
      await this.boardRepository.findBoardMembershipByMemberEmail(
        boardInviteDto.email,
        boardInviteDto.boardId,
      );

    if (membership)
      throw new BadRequestException('the user is already a member');

    const currentDatetime = new Date();
    const expireAt = new Date(
      currentDatetime.getTime() + 3 * 24 * 60 * 60 * 1000,
    );

    const invite = await this.inviteRepository.createInvite(
      boardInviteDto.email,
      boardInviteDto.boardId,
      expireAt,
    );

    const inviteData: InviteDataTypes = {
      email: boardInviteDto.email,
      inviteId: invite.id,
      expireAt,
    };

    return this.crypt.encrypt(inviteData);
  }
}
