import { Prisma } from '@prisma/client';

export type BoardPrismaType = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: { cards: true };
    };
    owner: true;
    members: { select: { user: true; role: true } };
  };
}>;

export type ColumnPrismaType = Prisma.ColumnGetPayload<{
  include: {
    cards: true;
  };
}>;

export type BoardMembershipType = Prisma.BoardMembershipGetPayload<{
  include: {
    board: {
      include: {
        columns: {
          include: { cards: true };
        };
        owner: true;
        members: { select: { user: true; role: true } };
      };
    };
    user: true;
  };
}>;
