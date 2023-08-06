import { ForbiddenException, Injectable } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { InvitePrismaType } from '../../utils/@types/payloads.type';
import { BoardRepository } from './board.repository';

const includeInvite = {
  board: {
    include: {
      columns: {
        include: { cards: true },
      },
      owner: true,
      members: { select: { user: true, role: true } },
    },
  },
};

interface InviteUpdateDataType {
  expireAt?: Date;
  isPending?: boolean;
}

@Injectable()
export class InviteRepository {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardRepository: BoardRepository,
  ) {}

  async createInvite(
    email: string,
    boardId: number,
    expireAt: Date,
  ): Promise<InvitePrismaType> {
    const invite = await this.prisma.boardInvite.findFirst({
      where: { email, boardId },
    });

    if (invite) {
      if (invite.expireAt.getTime() <= Date.now() && invite.isPending) {
        return await this.updateInvite(invite.id, { expireAt });
      } else {
        throw new ForbiddenException(
          'there is a pending invitation for this member',
        );
      }
    }

    return this.prisma.boardInvite.create({
      data: { email, boardId, expireAt },
      include: includeInvite,
    });
  }

  async checkIfInviteIsPending(inviteId: number): Promise<boolean> {
    const invite = await this.prisma.boardInvite.findUnique({
      where: { id: inviteId },
    });

    return invite.isPending;
  }

  async updateInvite(
    inviteId: number,
    data: InviteUpdateDataType,
  ): Promise<InvitePrismaType> {
    return this.prisma.boardInvite.update({
      where: { id: inviteId },
      data,
      include: includeInvite,
    });
  }
}
