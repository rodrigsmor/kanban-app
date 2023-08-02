import { ColumnsWithCards } from '../@types';

export function getAmountOfCards(boardColumns: ColumnsWithCards[]): number {
  let numberOfCardsInBoard = 0;

  boardColumns.forEach((column) => {
    numberOfCardsInBoard += column.cards.length;
  });

  return numberOfCardsInBoard;
}
