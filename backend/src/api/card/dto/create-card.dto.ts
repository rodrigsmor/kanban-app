import {
  IsArray,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCardDto {
  @ApiProperty({
    required: true,
    example: '🔜 Write the project README',
  })
  @IsString({
    message: 'the title needs to be a string',
  })
  @IsNotEmpty({
    message: 'the card needs a title to be created',
  })
  title: string;

  @ApiProperty({
    example: 0,
    required: true,
    description: 'the id of the column the card is part of',
  })
  @IsNotEmpty({
    message:
      'it is necessary to indicate which column the card is being created',
  })
  @IsNumber(undefined, {
    message: 'the column id needs to be a number',
  })
  columnId: number;

  @ApiProperty({
    required: false,
    description:
      'This field is the card’s description, allowing Markdown-formatted text.',
    example:
      'Create an informative and concise project README that outlines key features, installation steps, and usage instructions. Give users a clear roadmap to understand and engage with your project effectively.',
  })
  description?: string;

  @ApiProperty({
    isArray: true,
    required: false,
    example: [263, 98, 52762],
    description:
      'This field is an array of members who serves as the assignees for this card',
  })card
  @IsOptional()
  @IsArray({
    message: 'assigneesIds should be an array of numbers',
  })
  @IsNumber(
    {},
    { each: true, message: 'Each item in assigneesIds should be a number' },
  )
  assigneesIds?: number[];
}
