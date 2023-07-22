import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignupDto {
  @IsString({ message: 'your first name should be a string entry.' })
  @IsNotEmpty({ message: 'you must enter your name in order to register.' })
  firstName: string;

  @IsString({ message: 'your last name should be a string entry.' })
  @IsNotEmpty({ message: 'your last name is required to register.' })
  lastName: string;

  @IsEmail(undefined, {
    message: 'the e-mail entered is not a valid entry.',
  })
  @IsNotEmpty({
    message: 'to validate your data, your email address is required.',
  })
  @IsString({ message: 'the e-mail should be a string entry.' })
  email: string;

  @IsString({ message: 'your password should be a string entry.' })
  @IsNotEmpty({ message: 'it is not possible to use an empty password.' })
  password: string;
}
