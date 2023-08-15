import { BoardMembershipType, BoardPrismaType } from '../../utils/@types';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardCreateDto } from '../../api/board/dto/board-create.dto';
import { BoardRolesEnum } from '../../utils/enums/board-roles.enum';
import { Injectable, UnauthorizedException } from '@nestjs/common';

interface BoardMembershipUpdateData {
  role?: BoardRolesEnum;
}

const boardIncludeTemplate = {
  columns: {
    include: { cards: true },
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

  async findBoardById(
    boardId: number,
    memberId: number,
  ): Promise<BoardPrismaType> {
    const board = await this.prisma.board.findUnique({
      where: {
        id: boardId,
      },
      include: boardIncludeTemplate,
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
      include: boardIncludeTemplate,
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

  async checkIfColumnBelongsToBoard(
    boardId: number,
    columnId: number,
  ): Promise<boolean> {
    const column = await this.prisma.column.findFirst({
      where: { boardId, id: columnId },
    });

    return column !== null;
  }

  async checkIfBoardMemberIsAdmin(
    userId: number,
    boardId: number,
  ): Promise<boolean> {
    const board = await this.prisma.boardMembership.findFirst({
      where: { boardId, userId },
    });

    return board && board.role === BoardRolesEnum.ADMIN;
  }

  async checkIfMemberHasPermissionToEdit(
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

  async checkIfColumnIndexIsRepeated(
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
}
