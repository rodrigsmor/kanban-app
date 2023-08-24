import { ApiProperty } from '@nestjs/swagger';
import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class CardAssigneesDto {
  @IsNotEmpty({
    message: 'It is necessary to provide the ids of the members',
  })
  @IsArray({
    message: 'assigneesIds should be an array of numbers',
  })
  @IsNumber(
    {},
    { each: true, message: 'Each item in assigneesIds should be a number' },
  )
  @ApiProperty({
    isArray: true,
    required: true,
    example: [263, 98, 52762],
    description:
      'This field is an array of members who serves as the assignees for this card',
  })
  assigneesIds: number[];
}
