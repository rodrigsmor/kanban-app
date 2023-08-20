import {
  ForbiddenException,
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { CardService } from '../api/card/card.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCardDto } from '../api/card/dto/create-card.dto';
import { CardRepository } from '../common/repositories/card.repository';
import { BoardRepository } from '../common/repositories/board.repository';
import { CardDto } from '../api/card/dto/card.dto';
import { CardPrismaType } from '../utils/@types/payloads.type';
import { User } from '@prisma/client';

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

  const mockCardPrismaPayload: CardPrismaType = {
    id: 2829,
    ...mockNewCard,
    assignees: [
      {
        cardId: 2829,
        id: 1922920,
        userId: mockAssigneeFirstCard.id,
        user: mockAssigneeFirstCard,
      },
      {
        cardId: 2829,
        id: 1922920,
        userId: mockAssigneeSecondCard.id,
        user: mockAssigneeSecondCard,
      },
    ],
  };

  const mockCardDto: CardDto = new CardDto(mockCardPrismaPayload);

  describe('createCard', () => {
    it('should throw ForbiddenException if member has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'checkIfColumnBelongsToBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'createCard').mockResolvedValueOnce(null);

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(ForbiddenException);
        expect(error.message).toStrictEqual(
          'you do not have permission to perform this action',
        );
        expect(boardRepository.checkIfMemberHasPermissionToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.checkIfColumnBelongsToBoard).not.toBeCalled();
        expect(cardRepository.createCard).not.toBeCalled();
      }
    });

    it('should throw an UnauthorizedException if the provided member is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(boardRepository, 'checkIfColumnBelongsToBoard')
        .mockResolvedValueOnce(null);
      jest.spyOn(cardRepository, 'createCard').mockResolvedValueOnce(null);

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.checkIfMemberHasPermissionToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.checkIfColumnBelongsToBoard).not.toBeCalled();
        expect(cardRepository.createCard).not.toBeCalled();
      }
    });

    it('should throw a NotFoundException if column does not belong to given board', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'checkIfColumnBelongsToBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(cardRepository, 'createCard').mockResolvedValueOnce(null);

      try {
        await cardService.createCard(mockUserId, mockBoardId, mockNewCard);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual(
          'the column provided does not seem to exist',
        );
        expect(boardRepository.checkIfMemberHasPermissionToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.checkIfColumnBelongsToBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(cardRepository.createCard).not.toBeCalled();
      }
    });

    it('should throw an InternalServerException if an error occurs while creating the card', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'checkIfColumnBelongsToBoard')
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
        expect(boardRepository.checkIfMemberHasPermissionToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(boardRepository.checkIfColumnBelongsToBoard).toBeCalledWith(
          mockBoardId,
          mockColumnId,
        );
        expect(cardRepository.createCard).toBeCalledWith(mockNewCard);
      }
    });

    it('should create a new card and return it', async () => {
      jest
        .spyOn(boardRepository, 'checkIfMemberHasPermissionToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'checkIfColumnBelongsToBoard')
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
      expect(boardRepository.checkIfMemberHasPermissionToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(boardRepository.checkIfColumnBelongsToBoard).toBeCalledWith(
        mockBoardId,
        mockColumnId,
      );
      expect(cardRepository.createCard).toBeCalledWith(mockNewCard);
    });
  });
});
