import { UserDto } from '../../user/dto/user.dto';
import { BoardWithColumns } from '../../../utils/@types/board.types';
import { getAmountOfCards } from '../../../utils/functions/get-amount-of-cards';
import { BoardPrismaType } from '../../../utils/@types/payloads.type';

export class BoardSummaryDto {
  id: number;
  name: string;
  updateAt: Date;
  owner: UserDto;
  createdAt: Date;
  isPinned: boolean;
  description: string;
  totalCards: number;
  numberOfMembers: number;

  constructor(board: BoardWithColumns | BoardPrismaType) {
    this.id = board.id;
    this.name = board.name;
    this.isPinned = board.isPinned;
    this.updateAt = board.updateAt;
    this.createdAt = board.createdAt;
    this.description = board.description;
    this.owner = UserDto.fromUser(board.owner);
    this.numberOfMembers = board.members.length;
    this.totalCards = getAmountOfCards(board.columns);
  }
}
