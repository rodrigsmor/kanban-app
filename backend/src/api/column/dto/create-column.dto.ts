import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateColumnDto {
  @IsString({
    message: 'the title must be a string',
  })
  title?: string;

  @IsNumber(undefined, {
    message: 'the column index should be a number',
  })
  @IsNotEmpty({
    message: 'the column index is required.',
  })
  columnIndex: number;
}
