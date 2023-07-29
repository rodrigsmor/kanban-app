import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';

import * as fs from 'fs';

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

    const newPicturePath = `${picture.path}`;

    if (user.profilePicture && fs.existsSync(user.profilePicture)) {
      await this.deleteFile(user.profilePicture);
    }

    const userUpdated = await this.prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: newPicturePath },
    });

    return UserDto.fromUser(userUpdated);
  }

  async deleteFile(filePath: string): Promise<void> {
    try {
      fs.unlinkSync(filePath);
      console.log('it was deleted :)');
    } catch (err) {
      console.log('Was not possible to delete your file');
    }
  }
}
