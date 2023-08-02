import { ColumnType } from '../../../utils/@types/column.type';

export class BoardDto {
  id: number;
  name: string;
  background?: string;
  isPinned: boolean;
  createdAt: Date;
  updateAt: Date;
  columns: ColumnType[];
}
