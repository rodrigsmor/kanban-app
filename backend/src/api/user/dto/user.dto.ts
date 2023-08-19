import { User } from '@prisma/client';
import { BoardRolesEnum } from '../../../utils/enums/board-roles.enum';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UserDto {
  @ApiProperty({
    description: 'the id of the user',
  })
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @ApiProperty({
    example: 'ana.julia@example.com',
    description: 'the e-mail address of the user',
  })
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    example: 'Ana Júlia',
    description: 'The first name of the user',
  })
  @IsString()
  @IsNotEmpty()
  firstName: string;

  @ApiProperty({
    example: 'Menezes Machado',
    description: 'The last name of the user',
  })
  @IsString()
  @IsNotEmpty()
  lastName: string;

  @ApiProperty({
    example: '/examples/julia-EXAMPLE.png',
    description: 'a path to the profile picture',
  })
  @IsString()
  @IsOptional()
  profilePicture: string;

  @ApiProperty({
    example: 'ADMIN',
    description: 'the user role',
  })
  role?: BoardRolesEnum;

  constructor(partial: Partial<User>, role?: BoardRolesEnum) {
    Object.assign(this, partial, { role });
  }

  static fromUser(user: User, role?: BoardRolesEnum): UserDto {
    delete user.password;
    return new UserDto(user, role);
  }
}
