import { ApiProperty } from '@nestjs/swagger';
import { i18nPaths } from '../../utils/constants/i18n.paths';
import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AuthDto {
  @ApiProperty({
    required: true,
    example: 'ana.julia@example.com',
    description: 'the email address of the user.',
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
    description: 'the password of the user account',
    required: true,
  })
  @IsNotEmpty({ message: i18nPaths.dto.auth.password.IS_NOT_EMPTY })
  @IsString({ message: i18nPaths.dto.auth.password.IS_STRING })
  @MinLength(8, {
    message: i18nPaths.dto.auth.password.MIN,
  })
  password: string;
}
