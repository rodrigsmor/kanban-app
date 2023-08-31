import { IsArray, IsNotEmpty, IsNumber } from 'class-validator';

export class DeleteLabelsDto {
  @IsArray({
    message: 'the labelsIds must be an array of numbers',
  })
  @IsNumber(
    {},
    { each: true, message: 'Each item in labelsIds should be a number' },
  )
  @IsNotEmpty({
    message: 'labelsIds can not be empty',
  })
  labelsIds: number[];
}
