import { Card } from '@prisma/client';
import { ColumnPrismaType } from './';
import { ApiProperty } from '@nestjs/swagger';

export class ColumnType {
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
    example: '/images/column-cover-example.png',
    description: 'the path to the card cover',
  })
  cover: string;

  @ApiProperty({
    description: 'the date this board was created.',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'the date when the last update was made to this board.',
  })
  updateAt: Date;

  @ApiProperty({
    description: '',
  })
  cards: Array<Card>;

  @ApiProperty({
    example: 1,
    description: 'the column index of the column',
  })
  columnIndex: number;

  constructor(column: ColumnPrismaType) {
    this.id = column.id;
    this.title = column.title;
    this.cover = column.cover;
    this.cards = column.cards;
    this.updateAt = column.updateAt;
    this.createdAt = column.createdAt;
    this.columnIndex = column.columnIndex;
  }
}
