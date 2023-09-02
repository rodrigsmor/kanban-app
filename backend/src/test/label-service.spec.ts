import { Test } from '@nestjs/testing';
import { LabelDto } from '../api/card/dto';
import { CreateLabelDto } from '../api/label/dto';
import { UnauthorizedException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { LabelService } from '../api/label/label.service';
import { BoardRepository } from '../common/repositories/board.repository';
import { Label } from '@prisma/client';

describe('LabelService', () => {
  let labelService: LabelService;
  let prismaService: PrismaService;
  let boardRepository: BoardRepository;

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [PrismaService, LabelService, BoardRepository],
    }).compile();

    labelService = moduleRef.get<LabelService>(LabelService);
    prismaService = moduleRef.get<PrismaService>(PrismaService);
    boardRepository = moduleRef.get<BoardRepository>(BoardRepository);
  });

  const mockUserId = 8639562;
  const mockBoardId = 45829293;
  const mockLabelId = 389480339;

  const mockCreateCardDto: CreateLabelDto = {
    name: '✅ Test name',
    color: '#b1f0c0',
  };

  const mockLabels: Label[] = [
    {
      id: 0,
      name: '',
      color: '',
      boardId: mockBoardId,
    },
    {
      id: 1,
      name: '',
      color: '',
      boardId: mockBoardId,
    },
    {
      id: mockLabelId,
      boardId: mockBoardId,
      ...mockCreateCardDto,
    },
  ];

  const mockLabelsDto: LabelDto[] = mockLabels.map(
    (label) => new LabelDto(label),
  );

  const mockUserIdArray = [mockUserId];

  describe('getBoardLabels', () => {
    it('should throw UnauthorizedException if user is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.getBoardLabels(mockUserId, mockBoardId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you are not part of the board provided',
        );
        expect(boardRepository.areUsersMembersOfBoard).toBeCalledWith(
          mockUserIdArray,
          mockBoardId,
        );
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should return a empty array if there is no labels on board', async () => {
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(boardRepository, 'findBoardLabels').mockResolvedValueOnce([]);

      const result = await labelService.getBoardLabels(mockUserId, mockBoardId);

      expect(result).toStrictEqual([]);
      expect(boardRepository.areUsersMembersOfBoard).toBeCalledWith(
        mockUserIdArray,
        mockBoardId,
      );
      expect(boardRepository.findBoardLabels).toBeCalledWith(mockBoardId);
    });

    it('should return an array of labels', async () => {
      jest
        .spyOn(boardRepository, 'areUsersMembersOfBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(mockLabels);

      const result = await labelService.getBoardLabels(mockUserId, mockBoardId);

      expect(result).toStrictEqual(mockLabelsDto);
      expect(boardRepository.areUsersMembersOfBoard).toBeCalledWith(
        mockUserIdArray,
        mockBoardId,
      );
      expect(boardRepository.findBoardLabels).toBeCalledWith(mockBoardId);
    });
  });

  describe('createLabel', () => {
    it('', async () => {
      console.log('');
    });
  });
});
