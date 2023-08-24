import { LabelDto } from './label.dto';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';
import { CardPrismaType } from '../../../utils/@types/payloads.type';

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
    required: true,
    example:
      'is the index that indicates the position of the card in the rows of the column (array)',
  })
  rowIndex: number;

  @ApiProperty({
    example: 0,
    required: true,
    description: 'the id of the column the card is part of',
  })
  columnId: number;

  @ApiProperty({
    example: '/path/to/card-cover.png',
    required: false,
    description: 'path to the card cover',
  })
  cover?: string;

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
    example: 2,
    description: 'the amount of attachments on this card',
  })
  amountOfAttachments: number;

  @ApiProperty({
    example: 12,
    description: 'the number of comments on this card',
  })
  numberOfComments: number;

  @ApiProperty({
    isArray: true,
    description: 'the card labels',
    example: [
      {
        id: 930,
        name: 'Feature',
        color: '#9AE19D',
      },
    ],
  })
  labels: LabelDto[];

  @ApiProperty({
    description: 'the date this card was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'the date when the last update was made to this card.',
  })
  updateAt: Date;

  constructor(card: CardPrismaType) {
    this.id = card.id;
    this.title = card.title;
    this.cover = card.cover;
    this.rowIndex = card.rowIndex;
    this.columnId = card.columnId;
    this.updateAt = card.updateAt;
    this.createdAt = card.createdAt;
    this.numberOfComments = card.comments.length;
    this.amountOfAttachments = card.attachments.length;
    this.labels = card.labels.map(({ label }) => new LabelDto(label));
    this.assignees = card.assignees.map(({ user }) => UserDto.fromUser(user));
  }
}
