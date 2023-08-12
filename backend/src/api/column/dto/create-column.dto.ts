import { IsNotEmpty, IsNumber } from 'class-validator';

export class CreateColumnDto {
  title?: string;

  @IsNumber(undefined, {
    message: 'the column index should be a number',
  })
  @IsNotEmpty({
    message: 'the column index is required.',
  })
  columnIndex: number;
}
