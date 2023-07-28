import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import path from 'path';
import { UserDto } from './dto';
import * as bcrypt from 'bcryptjs';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: number): Promise<UserDto> {
    try {
      const user = await this.prisma.user.findUnique({
        where: { id: userId },
      });

      const userDto = UserDto.fromUser(user);
      return userDto;
    } catch (error) {
      if (error instanceof BadRequestException) {
        throw new BadRequestException(
          'The entered account does not seem to exist.',
        );
      } else {
        throw new InternalServerErrorException(
          error?.message || 'Error getting your data.',
        );
      }
    }
  }

  async updateProfilePicture(
    userId: number,
    picture: Express.Multer.File,
  ): Promise<UserDto> {
    const user: UserDto = await this.getCurrentUser(userId);

    const mimetypeIndex = picture.originalname.lastIndexOf('.');
    const mimetype = picture.originalname.substring(mimetypeIndex + 1);

    const newPicturePath = `${picture.path}.${mimetype}`;

    const userUpdated = await this.prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: newPicturePath },
    });

    return UserDto.fromUser(userUpdated);
  }
}
