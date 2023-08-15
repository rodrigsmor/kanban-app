import { Card } from '@prisma/client';
import { ColumnPrismaType } from './';

export class ColumnType {
  id: number;
  title: string;
  cover: string;
  createdAt: Date;
  updateAt: Date;
  cards: Array<Card>;
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
