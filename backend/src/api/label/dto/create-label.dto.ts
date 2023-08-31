import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString } from 'class-validator';

export class CreateLabelDto {
  @IsString({
    message: 'the label name must to be a string.',
  })
  @IsNotEmpty({
    message: 'the label can not be empty',
  })
  @ApiProperty({
    required: true,
    example: '🎨 Design task',
    description: 'the name to identify the label.',
  })
  name: string;

  @IsString({
    message: 'the label color must be a string',
  })
  @IsNotEmpty({
    message: 'the label color can not be empty',
  })
  @ApiProperty({
    required: true,
    example: '#c611f7',
    description: 'the color of the label',
  })
  color: string;
}
