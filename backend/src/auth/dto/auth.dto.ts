import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    required: true,
    example: 'ana.julia@example.com',
    description: 'the email address of the user.',
  })
  @IsEmail(undefined, {
    message: 'the e-mail entered is not a valid entry.',
  })
  @IsNotEmpty({
    message: 'to validate your data, your email address is required.',
  })
  @IsString({ message: 'the e-mail should be a string entry.' })
  email: string;

  @ApiProperty({
    description: 'the password of the user account',
    required: true,
  })
  @IsNotEmpty({ message: 'the password is required to log in' })
  @IsString({ message: 'the password should be a string entry' })
  password: string;
}
