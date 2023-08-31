import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditLabelDto {
  @IsString({
    message: 'the label name must to be a string.',
  })
  @IsOptional()
  @ApiProperty({
    required: true,
    example: '🎨 Design task',
    description: 'the name to identify the label.',
  })
  name: string;

  @IsString({
    message: 'the label color must be a string',
  })
  @IsOptional()
  @ApiProperty({
    required: false,
    example: '#c611f7',
    description: 'the color of the label',
  })
  color: string;
}
