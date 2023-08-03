import { Board, Card, Column, User } from '@prisma/client';

type UserWithoutPassword = Omit<User, 'password'>;

export interface ColumnsWithCards extends Column {
  cards: Card[];
}

export interface BoardWithColumns extends Board {
  columns: ColumnsWithCards[];
  owner: UserWithoutPassword;
  members: UserWithoutPassword[];
}
