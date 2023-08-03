import { User } from '@prisma/client';

export class CardType {
  id: number;
  title: string;
  description: string;
  assignees: Array<User>;
  createdAt: Date;
  updateAt: Date;
}
