import { ApiProperty } from '@nestjs/swagger';
import { CardSummaryDto } from '../../card/dto/card-summary.dto';
import { ColumnPrismaType } from '../../../utils/@types/payloads.type';

export class ColumnDto {
  @ApiProperty({
    description: 'the id of the column',
  })
  id: number;

  @ApiProperty({
    example: '✅ To-do',
    description: 'the title of this column',
  })
  title: string;

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
    example: [
      {
        id: 1929129,
        columnId: 2,
        title: '🛍 do the monthly shopping',
        description: 'Do not forget to buy fruits and pasta.',
        updateAt: new Date(2024, 4, 12),
        createdAt: new Date(2024, 2, 8),
        assignees: [
          {
            email: 'juliana.silva@example.com',
            firstName: 'Juliana',
            id: 282,
            lastName: 'Silva Amaral Santana',
            profilePicture: 'path/to/juliana-silva.jpg',
          },
        ],
      },
    ],
    description: '',
  })
  cards: Array<CardSummaryDto>;

  @ApiProperty({
    example: 1,
    description: 'the column index of the column',
  })
  columnIndex: number;

  constructor(column: ColumnPrismaType) {
    this.id = column.id;
    this.title = column.title;
    this.cards = column.cards.map((card) => new CardSummaryDto(card));
    this.updateAt = column.updateAt;
    this.createdAt = column.createdAt;
    this.columnIndex = column.columnIndex;
  }
}
