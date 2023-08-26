import { UserDto } from '../../user/dto';
import { ApiProperty } from '@nestjs/swagger';
import { BoardRolesEnum } from 'src/utils/enums';
import { BoardPrismaType } from '../../../utils/@types/payloads.type';
import { ColumnDto } from '../../column/dto/column.dto';

export class BoardDto {
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
    example: '/images/board-cover-example.png',
    description: 'the path to cover of this board.',
  })
  background?: string;

  @ApiProperty({
    description: 'A description of the board.',
    example:
      'A board where I organize my daily tasks and also plan myself to meet my main goals.',
  })
  description?: string;

  @ApiProperty({
    description: 'if the current member pinned this board.',
  })
  isPinned: boolean;

  @ApiProperty({
    description: 'the date this board was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'the date when the last update was made to this board.',
  })
  updateAt: Date;

  @ApiProperty({
    isArray: true,
    description: 'a list of the column of this board',
  })
  columns: ColumnDto[];

  @ApiProperty({
    description: 'the user who owns this board.',
  })
  owner: UserDto;

  @ApiProperty({
    isArray: true,
    description: 'a list of the members of this board.',
  })
  members: Array<UserDto>;

  constructor(board: BoardPrismaType) {
    this.id = board.id;
    this.name = board.name;
    this.background = board.background;
    this.description = board.description;
    this.isPinned = board.isPinned;
    this.createdAt = board.createdAt;
    this.updateAt = board.updateAt;
    this.columns = board.columns.map((column) => new ColumnDto(column));
    this.owner = UserDto.fromUser(board.owner);
    this.members = board.members.map(({ user, role }) =>
      UserDto.fromUser(user, role as BoardRolesEnum),
    );
  }
}
