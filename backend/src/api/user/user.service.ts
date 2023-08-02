import { EditUserDto, UserDto } from './dto';
import { PrismaService } from '../../prisma/prisma.service';
import { BadRequestException, Injectable } from '@nestjs/common';

import * as fs from 'fs';

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async getCurrentUser(userId: number): Promise<UserDto> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user)
      throw new BadRequestException(
        'The entered account does not seem to exist.',
      );

    const userDto = UserDto.fromUser(user);
    return userDto;
  }

  async updateUser(userId: number, newUserData: EditUserDto): Promise<UserDto> {
    const user = this.getCurrentUser(userId);

    if (!user)
      throw new BadRequestException('cannot update a non-existent user');

    const userUpdated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(newUserData.firstName && { firstName: newUserData.firstName }),
        ...(newUserData.lastName && { lastName: newUserData.lastName }),
      },
    });

    return UserDto.fromUser(userUpdated);
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
