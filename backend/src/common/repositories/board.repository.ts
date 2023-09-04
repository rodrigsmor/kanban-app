import { Label } from '@prisma/client';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BoardRolesEnum } from '../../utils/enums/board-roles.enum';
import { BoardCreateDto } from '../../api/board/dto/board-create.dto';
import { BoardMembershipType, BoardPrismaType } from '../../utils/@types';

interface BoardMembershipUpdateData {
  role?: BoardRolesEnum;
}

const boardIncludeTemplate = {
  columns: {
    include: {
      cards: {
        include: {
          assignees: {
            include: {
              user: true,
            },
          },
          column: true,
        },
      },
    },
  },
  owner: true,
  members: { select: { user: true, role: true } },
};

const membershipIncludeTemplate = {
  board: {
    include: {
      columns: {
        include: { cards: true },
      },
      owner: true,
      members: { select: { user: true, role: true } },
    },
  },
  user: true,
};

@Injectable()
export class BoardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async findBoardLabels(boardId: number): Promise<Label[]> {
    return await this.prisma.label.findMany({
      where: {
        boardId,
      },
    });
  }

  async findBoardById(
    boardId: number,
    memberId: number,
  ): Promise<BoardPrismaType> {
    const board = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        columns: {
          orderBy: {
            columnIndex: 'asc',
          },
          include: {
            cards: {
              include: {
                assignees: {
                  include: {
                    user: true,
                  },
                },
                column: true,
              },
            },
          },
        },
        owner: true,
        members: { select: { user: true, role: true } },
      },
    });

    const isMemberOfBoard =
      board &&
      board.members &&
      board.members.find(({ user }) => user.id === memberId);
    return isMemberOfBoard ? board : null;
  }

  async findOwnedBoardsByUserId(
    userId: number,
    quantity?: number,
  ): Promise<BoardPrismaType[]> {
    return await this.prisma.board.findMany({
      where: { ownerId: userId },
      include: boardIncludeTemplate,
      ...(quantity ? { take: quantity } : {}),
    });
  }

  async findBoardMembershipsByUserId(
    userId: number,
    quantity?: number,
  ): Promise<BoardMembershipType[]> {
    return await this.prisma.boardMembership.findMany({
      where: { userId },
      include: membershipIncludeTemplate,
      ...(quantity ? { take: quantity } : {}),
    });
  }

  async createBoard(
    userId: number,
    newBoard: BoardCreateDto,
  ): Promise<BoardPrismaType> {
    return await this.prisma.board.create({
      data: {
        name: newBoard.name,
        description: newBoard.description,
        ownerId: userId,
        columns: {
          create: [
            { title: '⏳ pending', columnIndex: 0 },
            { title: '🚧 in progress', columnIndex: 1 },
            { title: '✅ done', columnIndex: 2 },
          ],
        },
      },
      include: {
        columns: {
          orderBy: {
            columnIndex: 'asc',
          },
          include: {
            cards: {
              include: {
                assignees: {
                  include: {
                    user: true,
                  },
                },
                column: true,
              },
            },
          },
        },
        owner: true,
        members: { select: { user: true, role: true } },
      },
    });
  }

  async addUserToBoard(
    userId: number,
    boardId: number,
    role: BoardRolesEnum,
  ): Promise<BoardMembershipType> {
    return this.prisma.boardMembership.create({
      data: { boardId, userId: userId, role },
      include: membershipIncludeTemplate,
    });
  }

  async findBoardMembershipByIds(
    boardId: number,
    userId: number,
  ): Promise<BoardMembershipType> {
    return await this.prisma.boardMembership.findFirst({
      where: { boardId, userId },
      include: membershipIncludeTemplate,
    });
  }

  async findBoardMembershipByMemberEmail(
    email: string,
    boardId: number,
  ): Promise<BoardMembershipType> {
    return this.prisma.boardMembership.findFirst({
      where: { user: { email }, boardId },
      include: membershipIncludeTemplate,
    });
  }

  async updateBoardMembership(
    membershipId: number,
    data: BoardMembershipUpdateData,
  ): Promise<BoardMembershipType> {
    return await this.prisma.boardMembership.update({
      where: { id: membershipId },
      data,
      include: membershipIncludeTemplate,
    });
  }

  async isColumnPartOfBoard(
    boardId: number,
    columnId: number,
  ): Promise<boolean> {
    const column = await this.prisma.column.findFirst({
      where: { boardId, id: columnId },
    });

    return column !== null;
  }

  async isMemberAdminOfBoard(
    userId: number,
    boardId: number,
  ): Promise<boolean> {
    const board = await this.prisma.boardMembership.findFirst({
      where: { boardId, userId },
    });

    return board && board.role === BoardRolesEnum.ADMIN;
  }

  async isMemberAuthorizedToEdit(
    userId: number,
    boardId: number,
  ): Promise<boolean> {
    const membership = await this.prisma.boardMembership.findFirst({
      where: { boardId, userId },
    });

    if (!membership)
      throw new UnauthorizedException(
        'the user provided is not a member of this board',
      );

    return [BoardRolesEnum.ADMIN, BoardRolesEnum.CONTRIBUTOR].includes(
      membership?.role as BoardRolesEnum,
    );
  }

  async hasDuplicateColumnIndex(
    boardId: number,
    columnIndex: number,
  ): Promise<boolean> {
    const column = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        columns: {
          some: { columnIndex },
        },
      },
    });

    return column !== null;
  }

  async areUsersMembersOfBoard(
    membersIds: number[],
    boardId: number,
  ): Promise<boolean> {
    const board = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: {
        members: {
          where: {
            userId: {
              in: membersIds,
            },
          },
        },
      },
    });

    return board?.members.length === membersIds.length;
  }

  async isCardPresentOnBoard(
    boardId: number,
    cardId: number,
  ): Promise<boolean> {
    const card = await this.prisma.board.findFirst({
      where: {
        id: boardId,
        columns: {
          some: {
            cards: {
              some: {
                id: cardId,
              },
            },
          },
        },
      },
    });

    return card !== null;
  }
}
