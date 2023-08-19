import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class EditUserDto {
  @ApiProperty({
    description: 'The first name of the user',
  })
  @IsString({
    message: 'the first name must be a valid string',
  })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'The last name of the user',
  })
  @IsString({
    message: 'the last name must be a valid string',
  })
  @IsOptional()
  lastName?: string;
}
