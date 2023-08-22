import {
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { CardDto, CreateCardDto, EditCardDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BoardRepository } from '../../common/repositories/board.repository';
import { CardRepository } from '../../common/repositories/card.repository';

@Injectable()
export class CardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly cardRepository: CardRepository,
    private readonly boardRepository: BoardRepository,
  ) {}

  async createCard(
    userId: number,
    boardId: number,
    newCard: CreateCardDto,
  ): Promise<CardDto> {
    const hasPermission =
      await this.boardRepository.checkIfMemberHasPermissionToEdit(
        userId,
        boardId,
      );

    if (!hasPermission)
      throw new ForbiddenException(
        'you do not have permission to perform this action',
      );

    const belongsToBoard =
      await this.boardRepository.checkIfColumnBelongsToBoard(
        boardId,
        newCard.columnId,
      );

    if (!belongsToBoard)
      throw new NotFoundException('the column provided does not seem to exist');

    try {
      const cardCreated = await this.cardRepository.createCard(newCard);

      return new CardDto(cardCreated);
    } catch (error) {
      throw new InternalServerErrorException(
        'There was a problem creating your new card. Please try again later.',
      );
    }
  }

  async updateCard(
    userId: number,
    boardId: number,
    newCardData: EditCardDto,
  ): Promise<CardDto> {
    return null;
  }
}
