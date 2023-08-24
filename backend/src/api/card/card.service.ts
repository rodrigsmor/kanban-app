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
        newCardData.columnId,
      );

    if (!belongsToBoard)
      throw new NotFoundException('the column provided does not seem to exist');

    const existOnBoard = await this.boardRepository.checkIfCardExistsOnBoard(
      boardId,
      newCardData.cardId,
    );

    if (!existOnBoard)
      throw new NotFoundException('the card provided does not seem to exist');

    try {
      const cardUpdated = await this.cardRepository.editCard(newCardData);

      return new CardDto(cardUpdated);
    } catch (error) {
      throw new InternalServerErrorException(
        'There was a problem creating your new card. Please try again later.',
      );
    }
  }

  async setCardCover(
    userId: number,
    cardId: number,
    boardId: number,
    cover: Express.Multer.File,
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

    const hasCardOnBoard = await this.boardRepository.checkIfCardExistsOnBoard(
      boardId,
      cardId,
    );

    if (!hasCardOnBoard)
      throw new NotFoundException('the card provided does not seem to exist');

    try {
      const cardUpdated = await this.cardRepository.updateCardCover(
        cardId,
        cover,
      );

      return new CardDto(cardUpdated);
    } catch (error) {
      throw new InternalServerErrorException(
        error?.message ||
          'There was a problem changing the cover card. Please try again later.',
      );
    }
  }
}
