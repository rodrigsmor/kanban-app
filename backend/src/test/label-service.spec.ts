import {
  InternalServerErrorException,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { Label } from '@prisma/client';
import { LabelDto } from '../api/card/dto';
import { CreateLabelDto, EditLabelDto } from '../api/label/dto';
import { PrismaService } from '../prisma/prisma.service';
import { LabelService } from '../api/label/label.service';
import { BoardRepository } from '../common/repositories/board.repository';

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
    it('should throw UnauthorizedException if the current user has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest.spyOn(prismaService.label, 'create').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.createLabel(
          mockUserId,
          mockBoardId,
          mockCreateCardDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you do not have authorization to edit this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.label.create).not.toBeCalled();
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if the current user is not a member of the board ', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest.spyOn(prismaService.label, 'create').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.createLabel(
          mockUserId,
          mockBoardId,
          mockCreateCardDto,
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
        expect(prismaService.label.create).not.toBeCalled();
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should throw InternalServerException if an error occurs while creating the label', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(prismaService.label, 'create')
        .mockRejectedValueOnce(
          new Error(
            'An error occurred while creating the label, please try again later',
          ),
        );
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.createLabel(
          mockUserId,
          mockBoardId,
          mockCreateCardDto,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'An error occurred while creating the label, please try again later',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.label.create).toBeCalledWith({
          data: {
            name: mockCreateCardDto.name,
            color: mockCreateCardDto.color,
            boardId: mockBoardId,
          },
        });
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should create the label provided and return an array of all board labels including it', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.label, 'create').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(mockLabels);

      const result = await labelService.createLabel(
        mockUserId,
        mockBoardId,
        mockCreateCardDto,
      );

      expect(result).toStrictEqual(mockLabelsDto);
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(prismaService.label.create).toBeCalledWith({
        data: {
          name: mockCreateCardDto.name,
          color: mockCreateCardDto.color,
          boardId: mockBoardId,
        },
      });
      expect(boardRepository.findBoardLabels).toBeCalledWith(mockBoardId);
    });
  });

  describe('editLabel', () => {
    const mockNewLabelData: EditLabelDto = {
      color: '#cc0e83',
      name: 'new label test',
    };

    it('should throw UnauthorizedException if user has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest.spyOn(prismaService.label, 'update').mockResolvedValueOnce(null);

      try {
        await labelService.editLabel(
          mockUserId,
          mockLabelId,
          mockBoardId,
          mockNewLabelData,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you do not have authorization to edit this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.label.update).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if user is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest.spyOn(prismaService.label, 'update').mockResolvedValueOnce(null);

      try {
        await labelService.editLabel(
          mockUserId,
          mockLabelId,
          mockBoardId,
          mockNewLabelData,
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
        expect(prismaService.label.update).not.toBeCalled();
      }
    });

    it('should throw InternalServerException if an error occurr while updating the label', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(prismaService.label, 'update')
        .mockRejectedValueOnce(new Error(''));

      try {
        await labelService.editLabel(
          mockUserId,
          mockLabelId,
          mockBoardId,
          mockNewLabelData,
        );
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'An error occurred while updating the label, please try again later',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(prismaService.label.update).toHaveBeenCalledWith({
          where: { id: mockLabelId },
          data: {
            color: mockNewLabelData.color,
            name: mockNewLabelData.name,
          },
        });
      }
    });

    it('should throw InternalServerException if an error occurr while updating the label', async () => {
      const mockLabelUpdated: Label = {
        ...mockNewLabelData,
        id: 39393933993,
        boardId: mockBoardId,
      };

      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(prismaService.label, 'update')
        .mockResolvedValueOnce(mockLabelUpdated);

      const result = await labelService.editLabel(
        mockUserId,
        mockLabelId,
        mockBoardId,
        mockNewLabelData,
      );

      expect(result).toStrictEqual(new LabelDto(mockLabelUpdated));
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(prismaService.label.update).toHaveBeenCalledWith({
        where: { id: mockLabelId },
        data: {
          color: mockNewLabelData.color,
          name: mockNewLabelData.name,
        },
      });
    });
  });

  describe('deleteLabel', () => {
    const mockDeleteIds = [mockLabelId];
    const mockUpdatedLabels: Label[] = [...mockLabels].splice(2, 1);
    const mockUpdatedLabelsDto: LabelDto[] = mockUpdatedLabels.map(
      (label) => new LabelDto(label),
    );

    it('should throw UnauthorizedException if user has no permission to edit', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(false);
      jest
        .spyOn(labelService, 'allLabelsExistOnBoard')
        .mockRejectedValueOnce(null);
      jest.spyOn(prismaService.label, 'deleteMany').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.deleteLabels(mockUserId, mockDeleteIds, mockBoardId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'you do not have authorization to edit this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(labelService.allLabelsExistOnBoard).not.toBeCalled();
        expect(prismaService.label.deleteMany).not.toBeCalled();
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should throw UnauthorizedException if user is not a board member', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockRejectedValueOnce(
          new UnauthorizedException(
            'the user provided is not a member of this board',
          ),
        );
      jest
        .spyOn(labelService, 'allLabelsExistOnBoard')
        .mockRejectedValueOnce(null);
      jest.spyOn(prismaService.label, 'deleteMany').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.deleteLabels(mockUserId, mockDeleteIds, mockBoardId);
      } catch (error) {
        expect(error).toBeInstanceOf(UnauthorizedException);
        expect(error.message).toStrictEqual(
          'the user provided is not a member of this board',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(labelService.allLabelsExistOnBoard).not.toBeCalled();
        expect(prismaService.label.deleteMany).not.toBeCalled();
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should throw a NotFoundException if any of the labels do not exist in the boad', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(labelService, 'allLabelsExistOnBoard')
        .mockResolvedValueOnce(false);
      jest.spyOn(prismaService.label, 'deleteMany').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.deleteLabels(mockUserId, mockDeleteIds, mockBoardId);
      } catch (error) {
        expect(error).toBeInstanceOf(NotFoundException);
        expect(error.message).toStrictEqual('Some labels do not seem to exist');
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(labelService.allLabelsExistOnBoard).toBeCalledWith(
          mockDeleteIds,
          mockBoardId,
        );
        expect(prismaService.label.deleteMany).not.toBeCalled();
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should throw InternalServerError if an error occurs while deleting the labels', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(labelService, 'allLabelsExistOnBoard')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(prismaService.label, 'deleteMany')
        .mockRejectedValueOnce(new Error(''));
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(null);

      try {
        await labelService.deleteLabels(mockUserId, mockDeleteIds, mockBoardId);
      } catch (error) {
        expect(error).toBeInstanceOf(InternalServerErrorException);
        expect(error.message).toStrictEqual(
          'An error occurred while deleting the labels, please try again later',
        );
        expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
          mockUserId,
          mockBoardId,
        );
        expect(labelService.allLabelsExistOnBoard).toBeCalledWith(
          mockDeleteIds,
          mockBoardId,
        );
        expect(prismaService.label.deleteMany).toBeCalledWith({
          where: { id: { in: mockDeleteIds } },
        });
        expect(boardRepository.findBoardLabels).not.toBeCalled();
      }
    });

    it('should throw InternalServerError if an error occurs while deleting the labels', async () => {
      jest
        .spyOn(boardRepository, 'isMemberAuthorizedToEdit')
        .mockResolvedValueOnce(true);
      jest
        .spyOn(labelService, 'allLabelsExistOnBoard')
        .mockResolvedValueOnce(true);
      jest.spyOn(prismaService.label, 'deleteMany').mockResolvedValueOnce(null);
      jest
        .spyOn(boardRepository, 'findBoardLabels')
        .mockResolvedValueOnce(mockUpdatedLabels);

      const result = await labelService.deleteLabels(
        mockUserId,
        mockDeleteIds,
        mockBoardId,
      );

      expect(result).toStrictEqual(mockUpdatedLabelsDto);
      expect(boardRepository.isMemberAuthorizedToEdit).toBeCalledWith(
        mockUserId,
        mockBoardId,
      );
      expect(labelService.allLabelsExistOnBoard).toBeCalledWith(
        mockDeleteIds,
        mockBoardId,
      );
      expect(prismaService.label.deleteMany).toBeCalledWith({
        where: { id: { in: mockDeleteIds } },
      });
      expect(boardRepository.findBoardLabels).toBeCalledWith(mockBoardId);
    });
  });
});
