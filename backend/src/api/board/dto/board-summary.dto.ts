export class BoardSummaryDto {
  id: number;
  name: string;
  description: string;
  cardsQuantity: number;
  isPinned: boolean;
  createdAt: Date;
  updateAt: Date;
}
