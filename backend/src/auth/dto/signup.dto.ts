import { ApiProperty } from '@nestjs/swagger';
import { i18nPaths } from '../../utils/constants/i18n.paths';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class SignupDto {
  @ApiProperty({
    example: 'Ana Júlia',
    required: true,
    description: 'the first name of the user',
  })
  @IsString({
    message: i18nPaths.dto.auth.firstName.IS_STRING,
  })
  @IsNotEmpty({ message: i18nPaths.dto.auth.firstName.IS_NOT_EMPTY })
  firstName: string;

  @ApiProperty({
    example: 'Menezes Machado',
    required: true,
    description: 'the last name of the user',
  })
  @IsString({ message: i18nPaths.dto.auth.lastName.IS_STRING })
  @IsNotEmpty({ message: i18nPaths.dto.auth.lastName.IS_NOT_EMPTY })
  lastName: string;

  @ApiProperty({
    required: true,
    example: 'ana.julia@example.com',
    description: 'the e-mail address of the user',
  })
  @IsEmail(undefined, {
    message: i18nPaths.dto.auth.email.IS_EMAIL,
  })
  @IsNotEmpty({
    message: i18nPaths.dto.auth.email.IS_NOT_EMPTY,
  })
  @IsString({ message: i18nPaths.dto.auth.email.IS_STRING })
  email: string;

  @ApiProperty({
    required: true,
    description: 'the password of the user account',
  })
  @IsNotEmpty({ message: i18nPaths.dto.auth.password.IS_NOT_EMPTY })
  @IsString({ message: i18nPaths.dto.auth.password.IS_STRING })
  @MinLength(8, {
    message: i18nPaths.dto.auth.password.MIN,
  })
  password: string;
}
