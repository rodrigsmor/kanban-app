import { IsEmail, IsString } from 'class-validator';

export class EditUserDto {
  @IsEmail(undefined, {
    message: 'the email provided must be a valid address',
  })
  email: string;

  @IsString({
    message: 'the first name must be a valid string',
  })
  firstName: string;

  @IsString({
    message: 'the last name must be a valid string',
  })
  lastName: string;
}
