import { LabelDto } from '../card/dto';
import { CreateLabelDto, EditLabelDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { BoardRepository } from '../../common/repositories/board.repository';

@Injectable()
export class LabelService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly boardRepository: BoardRepository,
  ) {}

  async getBoardLabels(userId: number, boardId: number): Promise<LabelDto[]> {
    const isMember = await this.boardRepository.areUsersMembersOfBoard(
      [userId],
      boardId,
    );

    if (!isMember)
      throw new UnauthorizedException('you are not part of the board provided');

    const labels = await this.boardRepository.findBoardLabels(boardId);

    return labels.map((label) => new LabelDto(label));
  }

  async createLabel(
    userId: number,
    boardId: number,
    newLabel: CreateLabelDto,
  ): Promise<LabelDto[]> {
    return null;
  }

  async editLabel(
    userId: number,
    labelId: number,
    boardId: number,
    newLabelData: EditLabelDto,
  ): Promise<LabelDto> {
    return null;
  }

  async deleteLabel(
    userId: number,
    labelsIds: number[],
    boardId: number,
  ): Promise<LabelDto[]> {
    return null;
  }
}
