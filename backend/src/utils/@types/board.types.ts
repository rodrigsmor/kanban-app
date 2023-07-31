import { Board, Card, Column, User } from '@prisma/client';

export interface ColumnsWithCards extends Column {
  cards: Card[];
}

export interface BoardWithColumns extends Board {
  columns: ColumnsWithCards[];
  owner: User;
}
