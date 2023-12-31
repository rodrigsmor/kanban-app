import * as fs from 'fs';
import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { EditUserDto, UserDto } from './dto';
import { FileService } from '../../utils/config/file-service';
import { PrismaService } from '../../prisma/prisma.service';

@Injectable()
export class UserService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly fileService: FileService,
  ) {}

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
      try {
        await this.fileService.deleteFilePath(user.profilePicture);
      } catch (error) {
        throw new InternalServerErrorException(
          'It was not possible to update your profile picture. Try again later.',
        );
      }
    }

    const userUpdated = await this.prisma.user.update({
      where: { id: user.id },
      data: { profilePicture: newPicturePath },
    });

    return UserDto.fromUser(userUpdated);
  }
}
