import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditColumnDto {
  @IsNotEmpty({
    message: 'the column id cannot be empty',
  })
  columnId: number;

  @IsOptional()
  @IsString({
    message: 'the title must be a string',
  })
  title?: string;

  @IsOptional()
  @IsNumber(undefined, {
    message: 'the column index should be a number',
  })
  columnIndex?: number;
}
