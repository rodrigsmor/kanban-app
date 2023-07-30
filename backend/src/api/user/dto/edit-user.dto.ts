import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @IsString({
    message: 'the first name must be a valid string',
  })
  @IsOptional()
  firstName?: string;

  @IsString({
    message: 'the last name must be a valid string',
  })
  @IsOptional()
  lastName?: string;
}
