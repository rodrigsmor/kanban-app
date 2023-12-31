import { Prisma } from '@prisma/client';

export type BoardPrismaType = Prisma.BoardGetPayload<{
  include: {
    columns: {
      include: {
        cards: {
          include: {
            assignees: {
              include: {
                user: true;
              };
            };
            comments: {
              include: {
                attachments: true;
                author: true;
              };
            };
            labels: {
              include: {
                label: true;
              };
            };
            column: true;
            attachments: true;
          };
        };
      };
    };
    owner: true;
    members: { select: { user: true; role: true } };
  };
}>;

export type ColumnPrismaType = Prisma.ColumnGetPayload<{
  include: {
    cards: {
      include: {
        assignees: {
          include: {
            user: true;
          };
        };
        comments: {
          include: {
            attachments: true;
            author: true;
          };
        };
        labels: {
          include: {
            label: true;
          };
        };
        column: true;
        attachments: true;
      };
    };
  };
}>;

export type BoardMembershipType = Prisma.BoardMembershipGetPayload<{
  include: {
    board: {
      include: {
        columns: {
          include: {
            cards: {
              include: {
                assignees: {
                  include: {
                    user: true;
                  };
                };
                comments: {
                  include: {
                    attachments: true;
                    author: true;
                  };
                };
                labels: {
                  include: {
                    label: true;
                  };
                };
                column: true;
                attachments: true;
              };
            };
          };
        };
        owner: true;
        members: { select: { user: true; role: true } };
      };
    };
    user: true;
  };
}>;

export type InvitePrismaType = Prisma.BoardInviteGetPayload<{
  include: {
    board: {
      include: {
        columns: {
          include: {
            cards: {
              include: {
                assignees: {
                  include: {
                    user: true;
                  };
                };
                column: true;
                attachments: true;
                comments: true;
                labels: {
                  include: {
                    label: true;
                  };
                };
              };
            };
          };
        };
        owner: true;
        members: { select: { user: true; role: true } };
      };
    };
  };
}>;

export type CardPrismaType = Prisma.CardGetPayload<{
  include: {
    assignees: {
      include: {
        user: true;
      };
    };
    comments: {
      include: {
        attachments: true;
        author: true;
      };
    };
    labels: {
      include: {
        label: true;
      };
    };
    column: true;
    attachments: true;
  };
}>;

export type CommentPrismaType = Prisma.CommentGetPayload<{
  include: {
    author: true;
    attachments: true;
  };
}>;
