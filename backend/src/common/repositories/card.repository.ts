import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { PrismaService } from '../../prisma/prisma.service';
import { CardPrismaType } from '../../utils/@types/payloads.type';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async addAssigneesToCard(
    cardId: number,
    assigneesIds: number[],
  ): Promise<CardPrismaType> {
    const createManyData = assigneesIds.map((assigneeId) => ({
      cardId,
      userId: assigneeId,
    }));

    try {
      await this.prisma.cardAssignees.createMany({
        data: createManyData,
        skipDuplicates: true,
      });
    } catch (error) {
      throw new InternalServerErrorException(
        'It was not possible to add the assignees to this card. Please try again later.',
      );
    }

    const cardUpdated = await this.prisma.card.findUnique({
      where: { id: cardId },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        column: true,
      },
    });

    return cardUpdated;
  }
}
