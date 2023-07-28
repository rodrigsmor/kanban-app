import { User } from '@prisma/client';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class UserDto {
  @IsString()
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
  profilePicture: string;

  constructor(partial: Partial<UserDto>) {
    Object.assign(this, partial);
  }

  static fromUser(user: User): UserDto {
    delete user.password;
    return new UserDto(user);
  }
}