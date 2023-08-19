import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BoardCreateDto {
  @ApiProperty({
    description: 'the name of the board',
    example: 'My daily tasks',
  })
  @IsString({
    message: 'the name must be a string value',
  })
  name: string;

  @ApiProperty({
    description: 'A description of the board.',
    example:
      'A board where I organize my daily tasks and also plan myself to meet my main goals.',
  })
  @IsString({
    message: 'the description must be a string value',
  })
  @IsOptional()
  description?: string;
}
