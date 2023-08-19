import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class BoardInviteDto {
  @ApiProperty({
    example: 'member.to.join@example.com',
    description: 'the email of the user you want to add',
  })
  @IsEmail(undefined, {
    message: 'the e-mail entered is not a valid entry.',
  })
  @IsNotEmpty({
    message: 'an email must be informed to invite',
  })
  @IsString({ message: 'the e-mail should be a string entry.' })
  email: string;

  @ApiProperty({
    description: 'the id of the board you want the member to join.',
  })
  @IsNumber(undefined, {
    message: 'the board id must be a number',
  })
  @IsNotEmpty({
    message: 'board id cannot be undefined',
  })
  boardId: number;
}
