import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({
    example: '✅ To-do',
    description: 'the title of this column',
  })
  @IsString({
    message: 'the title must be a string',
  })
  title?: string;

  @ApiProperty({
    example: 1,
    description: 'the column index of the column',
  })
  @IsNumber(undefined, {
    message: 'the column index should be a number',
  })
  @IsNotEmpty({
    message: 'the column index is required.',
  })
  columnIndex: number;
}
