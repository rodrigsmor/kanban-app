import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditColumnDto {
  @ApiProperty({
    description: 'the id of the column',
  })
  @IsNotEmpty({
    message: 'the column id cannot be empty',
  })
  columnId: number;

  @ApiProperty({
    example: '✅ To-do',
    description: 'the title of this column',
  })
  @IsOptional()
  @IsString({
    message: 'the title must be a string',
  })
  title?: string;

  @ApiProperty({
    example: 1,
    description: 'the column index of the column',
  })
  @IsOptional()
  @IsNumber(undefined, {
    message: 'the column index should be a number',
  })
  columnIndex?: number;
}
