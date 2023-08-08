import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { BoardDto, BoardInviteDto } from './dto';
import { InviteDataTypes } from '../../utils/@types';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardRepository, InviteRepository } from '../../common/repositories';
import { EncryptConfigService } from '../../utils/config/encryption-config-service';
import { EmailService } from '../../utils/config/email-config-service';
import { BoardRolesEnum } from '../../utils/enums/board-roles.enum';

@Injectable()
export class BoardInviteService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly emailService: EmailService,
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

    const user = await this.prisma.user.findUnique({
      where: { email: boardInviteDto.email },
    });

    const encryptedData = await this.crypt.encrypt(inviteData);

    await this.emailService.sendEmail(
      user?.firstName || boardInviteDto.email,
      board.name,
      boardInviteDto.email,
      encryptedData,
      './src/templates/board-invite.hbs',
    );

    return encryptedData;
  }

  async acceptInvite(userId: number, token: string): Promise<BoardDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    const inviteData: InviteDataTypes = await this.crypt.decrypt(token);

    if (!user || inviteData.email !== user.email)
      throw new UnauthorizedException(
        'You are not authorized to perform this action',
      );

    if (new Date(inviteData.expireAt).getTime() <= Date.now()) {
      throw new ForbiddenException('the invitation has expired');
    }

    const isPending = await this.inviteRepository.checkIfInviteIsPending(
      inviteData.inviteId,
    );

    if (!isPending)
      throw new BadRequestException('the invitation was already accepted');

    const newData = await this.inviteRepository.updateInvite(
      inviteData.inviteId,
      { isPending: false },
    );

    const board = await this.boardRepository.addUserToBoard(
      userId,
      newData.boardId,
      BoardRolesEnum.CONTRIBUTOR,
    );

    return new BoardDto(board.board);
  }
}
