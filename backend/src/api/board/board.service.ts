import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { UserDto } from '../user/dto';
import { UserService } from '../user/user.service';
import { BoardPrismaType } from '../../utils/@types';
import { PrismaService } from '../../prisma/prisma.service';
import { TwoFactorService } from '../../auth/two-factor.service';
import { BoardCreateDto, BoardDto, BoardSummaryDto } from './dto';
import { BoardRolesEnum } from '../../utils/enums/board-roles.enum';
import { EmailService } from '../../utils/config/email-config-service';
import { BoardRepository } from '../../common/repositories/board.repository';

@Injectable()
export class BoardService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly emailService: EmailService,
    private readonly boardRepository: BoardRepository,
    private readonly twoFactorService: TwoFactorService,
  ) {}

  async getUserBoards(
    userId: number,
    quantity?: number,
  ): Promise<BoardSummaryDto[]> {
    const participatingBoards =
      await this.boardRepository.findBoardMembershipsByUserId(userId, quantity);

    if (!participatingBoards) return [];

    const summaryBoards: BoardSummaryDto[] = participatingBoards.map(
      (board) => {
        return new BoardSummaryDto(board.board);
      },
    );

    return summaryBoards;
  }

  async getOwnedBoards(
    userId: number,
    quantity?: number,
  ): Promise<BoardSummaryDto[]> {
    const boards = await this.boardRepository.findOwnedBoardsByUserId(
      userId,
      quantity,
    );

    if (!boards) return [];

    const summaryBoard: BoardSummaryDto[] = boards.map((board) => {
      return new BoardSummaryDto(board);
    });

    return summaryBoard;
  }

  async getBoard(userId: number, boardId: number): Promise<BoardDto> {
    const board = await this.boardRepository.findBoardById(boardId, userId);

    if (!board)
      throw new NotFoundException('The board provided does not seem to exist');
    else if (board.ownerId !== userId) {
      throw new ForbiddenException('You are not allowed to access this board');
    }

    return new BoardDto(board);
  }

  async createNewBoard(
    userId: number,
    newBoard: BoardCreateDto,
  ): Promise<BoardSummaryDto> {
    try {
      const boardCreated = await this.boardRepository.createBoard(
        userId,
        newBoard,
      );

      const boardWithMember = await this.addMemberToBoard(
        userId,
        boardCreated.id,
        BoardRolesEnum.ADMIN,
      );

      return new BoardSummaryDto(boardWithMember);
    } catch (error) {
      throw new InternalServerErrorException(
        error.message || 'It was not possible to create a new board',
      );
    }
  }

  async addMemberToBoard(
    memberId: number,
    boardId: number,
    memberRole: BoardRolesEnum,
  ): Promise<BoardPrismaType> {
    const member = await this.prisma.user.findUnique({
      where: { id: memberId },
    });

    if (!member)
      throw new NotFoundException('the provided member does not seem to exist');

    const board = await this.prisma.board.findUnique({
      where: { id: boardId },
    });

    if (!board)
      throw new BadRequestException(
        'the provided board does not seem to exist',
      );

    await this.boardRepository.addUserToBoard(memberId, boardId, memberRole);

    const updatedBoard = await this.boardRepository.findBoardById(
      boardId,
      memberId,
    );

    return updatedBoard;
  }

  async updateMemberRole(
    userId: number,
    boardId: number,
    memberId: number,
    role: BoardRolesEnum,
  ): Promise<UserDto> {
    const isAdmin = await this.boardRepository.checkIfBoardMemberIsAdmin(
      userId,
      boardId,
    );

    if (!isAdmin)
      throw new ForbiddenException('You cannot perform this change');

    if (!(role in BoardRolesEnum))
      throw new BadRequestException('the role provided is not a valid role');

    const membership = await this.boardRepository.findBoardMembershipByIds(
      boardId,
      memberId,
    );

    if (!membership)
      throw new BadRequestException(
        'the member provided is not a participant in this board',
      );

    const updatedBoard = await this.boardRepository.updateBoardMembership(
      membership.id,
      { role },
    );

    return UserDto.fromUser(
      updatedBoard.user,
      updatedBoard.role as BoardRolesEnum,
    );
  }

  async initiateBoardDeletion(
    userId: number,
    boardId: number,
  ): Promise<string> {
    const isAdmin = await this.boardRepository.checkIfBoardMemberIsAdmin(
      userId,
      boardId,
    );

    if (!isAdmin)
      throw new ForbiddenException(
        'you do not have permission to perform this action',
      );

    const user = await this.userService.getCurrentUser(userId);
    const board = await this.boardRepository.findBoardById(boardId, userId);

    const expirationDate = new Date(Date.now() + 30 * 60 * 1000);

    const { verificationCode, token } =
      await this.twoFactorService.generateTwoFactorToken(
        user.id,
        user.email,
        expirationDate,
      );

    await this.emailService.sendEmail(
      user.firstName,
      board.name,
      user.email,
      verificationCode,
      './src/templates/board-delete-2fa.hbs',
      'New request to delete a board',
    );

    return token;
  }
}
