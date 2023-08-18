import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'Ana Júlia',
    required: true,
    description: 'the first name of the user',
  })
  @IsString({ message: 'your first name should be a string entry.' })
  @IsNotEmpty({ message: 'you must enter your name in order to register.' })
  firstName: string;

  @ApiProperty({
    example: 'Menezes Machado',
    required: true,
    description: 'the last name of the user',
  })
  @IsString({ message: 'your last name should be a string entry.' })
  @IsNotEmpty({ message: 'your last name is required to register.' })
  lastName: string;

  @ApiProperty({
    required: true,
    example: 'ana.julia@example.com',
    description: 'the e-mail address of the user',
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
    required: true,
    description: 'the password of the user account',
  })
  @IsString({ message: 'your password should be a string entry.' })
  @IsNotEmpty({ message: 'it is not possible to use an empty password.' })
  password: string;
}
