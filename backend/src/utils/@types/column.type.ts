import { Card } from '@prisma/client';
import { ColumnPrismaType } from './';

export class ColumnType {
  id: number;
  index: number;
  title: string;
  cover: string;
  createdAt: Date;
  updateAt: Date;
  cards: Array<Card>;

  constructor(column: ColumnPrismaType) {
    this.id = column.id;
    this.index = column.columnIndex;
    this.title = column.title;
    this.cover = column.cover;
    this.createdAt = column.createdAt;
    this.updateAt = column.updateAt;
    this.cards = column.cards;
  }
}
