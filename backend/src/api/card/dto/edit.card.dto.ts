import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber, IsOptional, IsString } from 'class-validator';

export class EditCardDto {
  @IsNotEmpty({
    message:
      'it is not possible to edit a card without indicating which card you want to edit',
  })
  @IsNumber(undefined, {
    message: 'the id must to be a number',
  })
  @ApiProperty({
    required: true,
    example: 82729,
    description: 'is the ID of the card the user wants to edit',
  })
  cardId: number;

  @IsOptional()
  @IsString({
    message: 'the title must to be a string',
  })
  @ApiProperty({
    required: false,
    example: '💭 new ideas to the project',
    description: 'the new title of the card',
  })
  title?: string;

  @IsOptional()
  @IsString({
    message: 'the description must to be a string',
  })
  @ApiProperty({
    required: false,
    description:
      'is the new description for the card, considering that the text is a markdown that you can provide more information about the task.',
    example:
      '💡 the new idea for the project is to enable offline editing. What do you think?',
  })
  description?: string;

  @IsOptional()
  @ApiProperty({
    example: 6,
    required: false,
    description: 'the column in which the card is located',
  })
  @IsNumber(undefined, {
    message: 'the columnId must to be a number',
  })
  columnId?: number;

  @IsOptional()
  @IsNumber(undefined, {
    message: 'the rowIndex must to be a number',
  })
  @ApiProperty({
    example: 12,
    required: false,
    description:
      'it indicates the position of the card in the column, i.e. which row in the array your card is in.',
  })
  rowIndex?: number;
}
