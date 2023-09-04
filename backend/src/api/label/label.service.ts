import {
  Injectable,
  InternalServerErrorException,
  UnauthorizedException,
} from '@nestjs/common';
import { LabelDto } from '../card/dto';
import { CreateLabelDto, EditLabelDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
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
    const hasAuthorization =
      await this.boardRepository.isMemberAuthorizedToEdit(userId, boardId);

    if (!hasAuthorization)
      throw new UnauthorizedException(
        'you do not have authorization to edit this board',
      );

    try {
      await this.prisma.label.create({
        data: {
          name: newLabel.name,
          color: newLabel.color,
          boardId,
        },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ||
          'An error occurred while creating the label, please try again later',
      );
    }

    const labels = await this.boardRepository.findBoardLabels(boardId);

    return labels.map((label) => new LabelDto(label));
  }

  async editLabel(
    userId: number,
    labelId: number,
    boardId: number,
    newLabelData: EditLabelDto,
  ): Promise<LabelDto> {
    const hasAuthorization =
      await this.boardRepository.isMemberAuthorizedToEdit(userId, boardId);

    if (!hasAuthorization)
      throw new UnauthorizedException(
        'you do not have authorization to edit this board',
      );

    try {
      const labelUpdated = await this.prisma.label.update({
        where: { id: labelId },
        data: {
          ...(newLabelData.color && { color: newLabelData.color }),
          ...(newLabelData.name && { name: newLabelData.name }),
        },
      });

      return new LabelDto(labelUpdated);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ||
          'An error occurred while updating the label, please try again later',
      );
    }
  }

  async deleteLabels(
    userId: number,
    labelsIds: number[],
    boardId: number,
  ): Promise<LabelDto[]> {
    try {
      await this.prisma.label.deleteMany({
        where: { id: { in: labelsIds } },
      });
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ||
          'An error occurred while deleting the labels, please try again later',
      );
    }
    return null;
  }

  async allLabelsExistOnBoard(
    labelsIds: number[],
    boardId: number,
  ): Promise<boolean> {
    const labels = await this.prisma.label.findMany({
      where: {
        boardId,
        id: {
          in: labelsIds,
        },
      },
    });

    return labels?.length === labelsIds.length;
  }
}
