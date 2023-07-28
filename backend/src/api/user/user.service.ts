import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
} from '@nestjs/common';
import { UserDto } from './dto';
import { PrismaService } from 'src/prisma/prisma.service';

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
}
