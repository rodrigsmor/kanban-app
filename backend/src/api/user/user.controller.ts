import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { UserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @HttpCode(HttpStatus.ACCEPTED)
  async getCurrentUser(@UserId() userId: number): Promise<UserDto> {
    return this.userService.getCurrentUser(userId);
  }

  @Patch('/profilePicture')
  @HttpCode(HttpStatus.CREATED)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @UserId() userId: number,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userService.updateProfilePicture(userId, profilePicture);
  }
}
