import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class AuthDto {
  @IsEmail(undefined, {
    message: 'the e-mail entered is not a valid entry.',
  })
  @IsNotEmpty({
    message: 'to validate your data, your email address is required.',
  })
  @IsString({ message: 'the e-mail should be a string entry.' })
  email: string;

  @IsNotEmpty({ message: 'the password is required to log in' })
  @IsString({ message: 'the password should be a string entry' })
  password: string;
}
