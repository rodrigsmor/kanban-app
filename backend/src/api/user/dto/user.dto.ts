import { User } from '@prisma/client';
import { BoardRolesEnum } from '../../../utils/enums/board-roles.enum';
import {
  IsEmail,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
} from 'class-validator';

export class UserDto {
  @IsNumber()
  @IsNotEmpty()
  id: number;

  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  firstName: string;

  @IsString()
  @IsNotEmpty()
  lastName: string;

  @IsString()
  @IsOptional()
  profilePicture: string;

  role?: BoardRolesEnum;

  constructor(partial: Partial<User>, role?: BoardRolesEnum) {
    Object.assign(this, partial, { role });
  }

  static fromUser(user: User, role?: BoardRolesEnum): UserDto {
    delete user.password;
    return new UserDto(user, role);
  }
}
