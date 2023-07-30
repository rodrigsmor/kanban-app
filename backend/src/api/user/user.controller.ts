import {
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Patch,
  UseInterceptors,
  UploadedFile,
  Put,
  Body,
} from '@nestjs/common';
import { EditUserDto, UserDto } from './dto';
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

  @Put('/')
  @HttpCode(HttpStatus.OK)
  async updateCurrentUser(
    @UserId() userId: number,
    @Body() newUserData: EditUserDto,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, newUserData);
  }

  @Patch('/profilePicture')
  @HttpCode(HttpStatus.OK)
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @UserId() userId: number,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userService.updateProfilePicture(userId, profilePicture);
  }
}
