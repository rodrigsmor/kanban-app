import {
  BadRequestException,
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { User } from '@prisma/client';
import { Test } from '@nestjs/testing';
import { CardDto } from '../api/card/dto/card.dto';
import { CardService } from '../api/card/card.service';
import { PrismaService } from '../prisma/prisma.service';
import { EditCardDto } from '../api/card/dto/edit.card.dto';
import { CardPrismaType } from '../utils/@types/payloads.type';
import { CreateCardDto } from '../api/card/dto/create-card.dto';
import { CardRepository } from '../common/repositories/card.repository';
import { BoardRepository } from '../common/repositories/board.repository';
import { Readable } from 'stream';

describe('CardService', () => {
  let cardService: CardService;
  let prismaService: PrismaService;
  let cardRepository: CardRepository;
  let boardRepository: BoardRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, CardService, CardRepository, BoardRepository],
    }).compile();

    cardService = moduleRef.get<CardService>(CardService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    cardRepository = moduleRef.get<CardRepository>(CardRepository);
    boardRepository = moduleRef.get<BoardRepository>(BoardRepository);
  });

  const mockUserId = 1202;
  const mockBoardId = 29392;
  const mockColumnId = 348929;
  const mockNewCardId = 929047294;

  const mockNewCard: CreateCardDto = {
    columnId: mockColumnId,
    title: 'New column title',
    description: 'New description data',
    assigneesIds: [123, 9292],
    rowIndex: 0,
    labelsIds: [839, 9202, 2929],
  };

  const mockAssigneeFirstCard: User = {
    id: 123,
    email: 'assignee1@test.com',
    firstName: 'Assignee 1',
    lastName: 'Assignee 1 last name',
    isAdmin: false,
    password: 'password',
    profilePicture: '/path/to/test.png',
  };

  const mockAssigneeSecondCard: User = {
    id: 8293,
    email: 'assignee1@test.com',
    firstName: 'Assignee 1',
    lastName: 'Assignee 1 last name',
    isAdmin: false,
    password: 'password',
    profilePicture: '/path/to/test.png',
  };

  const mockColumn = {
    id: mockColumnId,
    boardId: mockBoardId,
    columnIndex: 0,
    cards: [],
    title: 'Column of new tasks',
    createdAt: new Date(2023, 8, 4),
    updateAt: new Date(2024, 2, 12),
  };

  const mockCardPrismaPayload: CardPrismaType = {
    ...mockNewCard,
    id: mockNewCardId,
    column: mockColumn,
    columnId: mockColumnId,
    title: mockNewCard.title,
    cover: 'path/to/card-cover.png',
    description: mockNewCard.description,
    assignees: [
      {
        cardId: mockNewCardId,
        id: 1922920,
        userId: mockAssigneeFirstCard.id,
        user: mockAssigneeFirstCard,
      },
      {
        cardId: mockNewCardId,
        id: 1922920,
        userId: mockAssigneeSecondCard.id,
        user: mockAssigneeSecondCard,
      },
    ],
    createdAt: new Date(2023, 8, 4),
    updateAt: new Date(2024, 2, 12),
    attachments: [
      {
        cardId: mockNewCardId,
        id: 819,
        path: '/path/to/file.pdf',
        title: 'Support file',
        commentId: 2,
        type: 'File',
      },
    ],
    comments: [],
    labels: [],
    rowIndex: 0,
  };

  const mockCardDto: CardDto = new CardDto(mockCardPrismaPayload);

  const mockCardCover: Express.Multer.File = {
    fieldname: 'picture',
    originalname: 'card-cover.jpg',
    encoding: '7bit',
    mimetype: 'image/jpeg',
    size: 1024,
    buffer: Buffer.from('file-content'),
    stream: new Readable(),
    destination: '',
    filename: 'card-cover',
    path: '/path/to/new-card-cover.jpg',
  };

  describe('createCard', () => {
    it('should throw ForbiddenException if member has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'createCard').mockResolvedValueOnce(null);

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(cardRepository.createCard).not.toBeCalled();
      }
    });

    it('should throw an UnauthorizedException if the provided member is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'createCard').mockResolvedValueOnce(null);

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(cardRepository.createCard).not.toBeCalled();
      }
    });

    it('should throw a NotFoundException if column does not belong to given board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(cardRepository, 'createCard').mockResolvedValueOnce(null);

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the column provided does not seem to exist',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(cardRepository.createCard).not.toBeCalled();
      }
    });

    it('should throw an InternalServerException if an error occurs while creating the card', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'createCard')
        .mockRejectedValueOnce(
          new Error(
            'There was a problem creating your new card. Please try again later.',
          ),
        );

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'There was a problem creating your new card. Please try again later.',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(cardRepository.createCard).toBeCalledWith(mockNewCard);
      }
    });

    it('should create a new card and return it', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'createCard')
        .mockResolvedValueOnce(mockCardPrismaPayload);

      const result = await cardService.createCard(
        mockUserId,
        mockBoardId,
        mockNewCard,
      );

      expect(result).toStrictEqual(mockCardDto);
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(cardRepository.createCard).toBeCalledWith(mockNewCard);
    });
  });

  describe('updateCard', () => {
    const mockEditCard: EditCardDto = {
      cardId: mockCardDto.id,
      title: '🔜 Edit title | Test',
      columnId: mockCardDto.columnId,
      description: 'my new description test',
      rowIndex: 4,
    };

    const mockEditCardPrismaPayload: CardPrismaType = {
      ...mockCardPrismaPayload,
      title: mockEditCard.title,
      columnId: mockEditCard.columnId,
      description: mockEditCard.description,
      rowIndex: mockEditCard.rowIndex,
    };

    const mockCardDtoUpdated = new CardDto(mockEditCardPrismaPayload);

    it('should throw ForbiddenException if member has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'editCard').mockResolvedValueOnce(null);

      try {
        await cardService.updateCard(mockUserId, mockBoardId, mockEditCard);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(cardRepository.editCard).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if the provided member is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'editCard').mockResolvedValueOnce(null);

      try {
        await cardService.updateCard(mockUserId, mockBoardId, mockEditCard);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).not.toBeCalled();
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(cardRepository.editCard).not.toBeCalled();
      }
    });

    it('should throw NotFoundException if column does not belong to given board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'editCard').mockResolvedValueOnce(null);

      try {
        await cardService.updateCard(mockUserId, mockBoardId, mockEditCard);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the column provided does not seem to exist',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(cardRepository.editCard).not.toBeCalled();
      }
    });

    it('should throw NotFoundException if card does not belong to given board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(cardRepository, 'editCard').mockResolvedValueOnce(null);

      try {
        await cardService.updateCard(mockUserId, mockBoardId, mockEditCard);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the card provided does not seem to exist',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockEditCard.cardId,
        );
        expect(cardRepository.editCard).not.toBeCalled();
      }
    });

    it('should throw an InternalServerException if an error occurs while updating the card', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'editCard')
        .mockRejectedValueOnce(
          new Error(
            'There was a problem updating your card. Please try again later.',
          ),
        );

      try {
        await cardService.updateCard(mockUserId, mockBoardId, mockEditCard);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'There was a problem creating your new card. Please try again later.',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockEditCard.cardId,
        );
        expect(cardRepository.editCard).toBeCalledWith(mockEditCard);
      }
    });

    it('should update the card and return it', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isColumnPartOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'editCard')
        .mockResolvedValueOnce(mockEditCardPrismaPayload);

      const result = await cardService.updateCard(
        mockUserId,
        mockBoardId,
        mockEditCard,
      );

      expect(result).toStrictEqual(mockCardDtoUpdated);
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.isColumnPartOfBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
        mockBoardId,
        mockEditCard.cardId,
      );
      expect(cardRepository.editCard).toBeCalledWith(mockEditCard);
    });
  });

  describe('addAssigneeToCard', () => {
    const mockAssigneesIds = [23, 12];

    const mockCardWithNewAssignees: CardPrismaType = {
      ...mockCardPrismaPayload,
      assignees: [
        {
          cardId: mockCardDto.id,
          id: 1922920,
          userId: mockAssigneeFirstCard.id,
          user: mockAssigneeFirstCard,
        },
        {
          cardId: mockCardDto.id,
          id: 1922920,
          userId: mockAssigneeSecondCard.id,
          user: mockAssigneeSecondCard,
        },
        {
          cardId: mockCardDto.id,
          id: 9829904494,
          user: {
            id: 23,
            firstName: 'Josivaldo test',
            lastName: 'Test surname',
            email: 'josivaldo.ex@example.test',
            isAdmin: false,
            password: 'password',
            profilePicture: '/path/to/josivaldo-image.png',
          },
          userId: 23,
        },
        {
          cardId: mockCardDto.id,
          id: 9829904494,
          user: {
            id: 12,
            firstName: 'Mary test',
            lastName: 'Jane test',
            email: 'mary@example.test',
            isAdmin: false,
            password: 'password',
            profilePicture: '/path/to/mary-jane-image.png',
          },
          userId: 12,
        },
      ],
    };

    it('should throw ForbiddenException if user has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(cardRepository, 'addAssigneesToCard')
        .mockResolvedValueOnce(null);

      try {
        await cardService.addAssigneesToCard(
          mockUserId,
          mockBoardId,
          mockCardDto.id,
          mockAssigneesIds,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(boardRepository.areUsersMembersOfBoard).not.toBeCalled();
        expect(cardRepository.addAssigneesToCard).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if user is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException('You are not a member of this board'),
        );
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(cardRepository, 'addAssigneesToCard')
        .mockResolvedValueOnce(null);

      try {
        await cardService.addAssigneesToCard(
          mockUserId,
          mockBoardId,
          mockCardDto.id,
          mockAssigneesIds,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'You are not a member of this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(boardRepository.areUsersMembersOfBoard).not.toBeCalled();
        expect(cardRepository.addAssigneesToCard).not.toBeCalled();
      }
    });

    it('should throw NotFoundException if the provided card is not a board card', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(null);
      jest
        .spyOn(cardRepository, 'addAssigneesToCard')
        .mockResolvedValueOnce(null);

      try {
        await cardService.addAssigneesToCard(
          mockUserId,
          mockBoardId,
          mockCardDto.id,
          mockAssigneesIds,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the card provided does not seem to exist',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockCardDto.id,
        );
        expect(boardRepository.areUsersMembersOfBoard).not.toBeCalled();
        expect(cardRepository.addAssigneesToCard).not.toBeCalled();
      }
    });

    it('should throw BadRequestException if any of the provided assignees Ids are not board members', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(cardRepository, 'addAssigneesToCard')
        .mockResolvedValueOnce(null);

      try {
        await cardService.addAssigneesToCard(
          mockUserId,
          mockBoardId,
          mockCardDto.id,
          mockAssigneesIds,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toStrictEqual(
          'some of the members provided do not seem to exist.',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockCardDto.id,
        );
        expect(boardRepository.areUsersMembersOfBoard).toBeCalledWith(
          mockAssigneesIds,
          mockBoardId,
        );
        expect(cardRepository.addAssigneesToCard).not.toBeCalled();
      }
    });

    it('should throw InternalServerException if an error occurs while adding assignees to card', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'addAssigneesToCard')
        .mockRejectedValueOnce(
          new Error(
            'There was a problem adding new assignees to card. Please try again later.',
          ),
        );

      try {
        await cardService.addAssigneesToCard(
          mockUserId,
          mockBoardId,
          mockCardDto.id,
          mockAssigneesIds,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'There was a problem adding new assignees to card. Please try again later.',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockCardDto.id,
        );
        expect(boardRepository.areUsersMembersOfBoard).toBeCalledWith(
          mockAssigneesIds,
          mockBoardId,
        );
        expect(cardRepository.addAssigneesToCard).toBeCalledWith(
          mockCardDto.id,
          mockAssigneesIds,
        );
      }
    });

    it('should add new assignees to card and return the card updated', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'addAssigneesToCard')
        .mockResolvedValueOnce(mockCardWithNewAssignees);

      const result = await cardService.addAssigneesToCard(
        mockUserId,
        mockBoardId,
        mockCardDto.id,
        mockAssigneesIds,
      );

      expect(result).toStrictEqual(new CardDto(mockCardWithNewAssignees));
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
        mockBoardId,
        mockCardDto.id,
      );
      expect(boardRepository.areUsersMembersOfBoard).toBeCalledWith(
        mockAssigneesIds,
        mockBoardId,
      );
      expect(cardRepository.addAssigneesToCard).toBeCalledWith(
        mockCardDto.id,
        mockAssigneesIds,
      );
    });
  });

  describe('setCardCover', () => {
    const mockCardCoverPrismaPayload: CardPrismaType = {
      ...mockCardPrismaPayload,
      cover: mockCardCover.path,
    };

    it('should throw ForbiddenException if member has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'updateCardCover').mockResolvedValueOnce(null);

      try {
        await cardService.setCardCover(
          mockUserId,
          mockCardDto.id,
          mockBoardId,
          mockCardCover,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(cardRepository.updateCardCover).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if the provided member is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'updateCardCover').mockResolvedValueOnce(null);

      try {
        await cardService.setCardCover(
          mockUserId,
          mockCardDto.id,
          mockBoardId,
          mockCardCover,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).not.toBeCalled();
        expect(cardRepository.updateCardCover).not.toBeCalled();
      }
    });

    it('should throw NotFoundException if card does not belong to given board', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(cardRepository, 'updateCardCover').mockResolvedValueOnce(null);

      try {
        await cardService.setCardCover(
          mockUserId,
          mockCardDto.id,
          mockBoardId,
          mockCardCover,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the card provided does not seem to exist',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockCardDto.id,
        );
        expect(cardRepository.updateCardCover).not.toBeCalled();
      }
    });

    it('should throw an InternalServerException if an error occurs while changing the card cover', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'updateCardCover')
        .mockRejectedValueOnce(
          new Error(
            'There was a problem changing the cover card. Please try again later.',
          ),
        );

      try {
        await cardService.setCardCover(
          mockUserId,
          mockCardDto.id,
          mockBoardId,
          mockCardCover,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'There was a problem changing the cover card. Please try again later.',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
          mockBoardId,
          mockCardDto.id,
        );
        expect(cardRepository.updateCardCover).toBeCalledWith(
          mockCardDto.id,
          mockCardCover,
        );
      }
    });

    it('should update card cover and return it', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'isCardPresentOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(cardRepository, 'updateCardCover')
        .mockResolvedValueOnce(mockCardCoverPrismaPayload);

      const result = await cardService.setCardCover(
        mockUserId,
        mockCardDto.id,
        mockBoardId,
        mockCardCover,
      );

      expect(result).toStrictEqual(new CardDto(mockCardCoverPrismaPayload));
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.isCardPresentOnBoard).toBeCalledWith(
        mockBoardId,
        mockCardDto.id,
      );
      expect(cardRepository.updateCardCover).toBeCalledWith(
        mockCardDto.id,
        mockCardCover,
      );
    });
  });
});
