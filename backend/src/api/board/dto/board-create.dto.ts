import { IsOptional, IsString } from 'class-validator';

export class BoardCreateDto {
  @IsString({
    message: 'the name must be a string value',
  })
  name: string;

  @IsString({
    message: 'the description must be a string value',
  })
  @IsOptional()
  description?: string;
}
