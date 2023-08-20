import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';
import { CardPrismaType } from 'src/utils/@types';

export class CardSummaryDto {
  @ApiProperty({
    required: true,
    example: 'the id of the card',
  })
  id: number;

  @ApiProperty({
    required: true,
    example: '🔜 Write the project README',
  })
  title: string;

  @ApiProperty({
    example: 0,
    required: true,
    description: 'the id of the column the card is part of',
  })
  columnId: number;

  @ApiProperty({
    required: false,
    description:
      'This field is the card’s description, allowing Markdown-formatted text.',
    example:
      'Create an informative and concise project README that outlines key features, installation steps, and usage instructions. Give users a clear roadmap to understand and engage with your project effectively.',
  })
  description: string;

  @ApiProperty({
    isArray: true,
    description: 'members who are assignees of this card',
  })
  assignees: UserDto[];

  @ApiProperty({
    description: 'the date this board was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'the date when the last update was made to this column.',
  })
  updateAt: Date;

  constructor(card: CardPrismaType) {
    this.id = card.id;
    this.title = card.title;
    this.columnId = card.columnId;
    this.updateAt = card.updateAt;
    this.createdAt = card.createdAt;
    // ADDS LABEL
    this.assignees = card.assignees.map(({ user }) => UserDto.fromUser(user));
  }
}
