import * as fs from 'fs';
import { EditCardDto } from '../../api/card/dto';
import { PrismaService } from '../../prisma/prisma.service';
import { CardPrismaType } from '../../utils/@types/payloads.type';
import { CreateCardDto } from '../../api/card/dto/create-card.dto';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class CardRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createCard(newCardData: CreateCardDto): Promise<CardPrismaType> {
    const cardAssigneesData = newCardData.assigneesIds.map((userId) => ({
      userId,
    }));

    const cardLabelsCreateManyData = newCardData.labelsIds.map((labelId) => ({
      labelId,
    }));

    const cardCreated = await this.prisma.card.create({
      data: {
        rowIndex: 0,
        description: newCardData?.description || '',
        title: newCardData.title,
        columnId: newCardData.columnId,
        ...(cardAssigneesData.length > 0 && {
          assignees: {
            createMany: {
              data: cardAssigneesData,
            },
          },
        }),
        ...(cardLabelsCreateManyData.length > 0 && {
          labels: {
            createMany: {
              data: cardLabelsCreateManyData,
            },
          },
        }),
      },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            attachments: true,
            author: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        column: true,
        attachments: true,
      },
    });

    return cardCreated;
  }

  async editCard(newCardData: EditCardDto): Promise<CardPrismaType> {
    const cardUpdated = await this.prisma.card.update({
      where: { id: newCardData.cardId },
      data: {
        ...(newCardData?.title && { title: newCardData?.title }),
        ...(newCardData?.rowIndex && { rowIndex: newCardData?.rowIndex }),
        ...(newCardData?.columnId && { columnId: newCardData?.columnId }),
        ...(newCardData?.description && {
          description: newCardData?.description,
        }),
      },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            attachments: true,
            author: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        column: true,
        attachments: true,
      },
    });

    return cardUpdated;
  }

  async updateCardCover(
    cardId: number,
    cover: Express.Multer.File,
  ): Promise<CardPrismaType> {
    const oldCard = await this.prisma.card.findUnique({
      where: { id: cardId },
    });

    if (oldCard?.cover && fs.existsSync(oldCard.cover)) {
      try {
        fs.unlinkSync(oldCard.cover);
      } catch (error) {
        throw new InternalServerErrorException(
          'Something went wrong when updating the card cover. Try again later.',
        );
      }
    }

    const cardUpdated = await this.prisma.card.update({
      where: { id: cardId },
      data: { cover: cover?.path },
      include: {
        assignees: {
          include: {
            user: true,
          },
        },
        comments: {
          include: {
            attachments: true,
            author: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        column: true,
        attachments: true,
      },
    });

    return cardUpdated;
  }

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
        comments: {
          include: {
            attachments: true,
            author: true,
          },
        },
        labels: {
          include: {
            label: true,
          },
        },
        column: true,
        attachments: true,
      },
    });

    return cardUpdated;
  }
}
