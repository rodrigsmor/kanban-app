import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';
import { BoardPrismaType, BoardWithColumns } from '../../../utils/@types';
import { getAmountOfCards } from '../../../utils/functions/get-amount-of-cards';

export class BoardSummaryDto {
  @ApiProperty({
    description: 'the id of the board',
  })
  id: number;

  @ApiProperty({
    description: 'the name of the board',
    example: 'My daily tasks',
  })
  name: string;

  @ApiProperty({
    description: 'the date when the last update was made to this board.',
  })
  updateAt: Date;

  @ApiProperty({
    description: 'the user who owns this board.',
  })
  owner: UserDto;

  @ApiProperty({
    description: 'the date this board was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'if the current member pinned this board.',
  })
  isPinned: boolean;

  @ApiProperty({
    description: 'A description of the board.',
    example:
      'A board where I organize my daily tasks and also plan myself to meet my main goals.',
  })
  description: string;

  @ApiProperty({
    description: 'the number of cards and/or tasks on that board',
    example: 12,
  })
  totalCards: number;

  @ApiProperty({
    example: 4,
    description: 'The number of members on this board.',
  })
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
