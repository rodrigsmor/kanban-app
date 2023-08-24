import { LabelDto } from './';
import { ApiProperty } from '@nestjs/swagger';
import { UserDto } from '../../user/dto/user.dto';
import { CardPrismaType } from '../../../utils/@types/payloads.type';

export class CardDto {
  @ApiProperty({
    required: true,
    example: 'the id of the card',
  })
  id: number;

  @ApiProperty({
    required: true,
    example:
      'is the index that indicates the position of the card in the rows of the column (array)',
  })
  rowIndex: number;

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
    example: '/path/to/cover-card.png',
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
    type: [UserDto],
    example: [
      {
        email: 'ana.julia@example.com',
        firstName: 'Ana Júlia',
        lastName: 'Carvalho Santana',
        id: 2193,
        profilePicture: '/path/to/julia.profile.png',
      },
    ],
    description: 'members who are assignees of this card',
  })
  assignees: UserDto[];

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
    description: 'the date this board was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'the date when the last update was made to this column.',
  })
  updateAt: Date;

  constructor(card: CardPrismaType) {
    this.id = card.id;
    this.cover = card.cover;
    this.title = card.title;
    this.rowIndex = card.rowIndex;
    this.columnId = card.columnId;
    this.updateAt = card.updateAt;
    this.createdAt = card.createdAt;
    this.labels = card.labels.map(({ label }) => new LabelDto(label));
    this.assignees = card.assignees.map(({ user }) => UserDto.fromUser(user));
  }
}
