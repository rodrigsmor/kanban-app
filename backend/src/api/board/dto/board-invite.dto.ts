import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BoardInviteDto {
  @IsEmail(undefined, {
    message: 'the e-mail entered is not a valid entry.',
  })
  @IsNotEmpty({
    message: 'an email must be informed to invite',
  })
  @IsString({ message: 'the e-mail should be a string entry.' })
  email: string;

  @IsNumber(undefined, {
    message: 'the board id must be a number',
  })
  @IsNotEmpty({
    message: 'board id cannot be undefined',
  })
  boardId: number;
}
