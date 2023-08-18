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
import {
  ApiBearerAuth,
  ApiBody,
  ApiConsumes,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { EditUserDto, UserDto } from './dto';
import { UserService } from './user.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserId } from '../../common/decorators/get-user-id.decorator';

@ApiTags('User')
@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'This endpoint will return the user’s main data based on the ID provided by the access token',
  })
  @ApiResponse({
    status: 202,
    type: UserDto,
    description:
      'It will return user’s data such as the ID, first and last name, email, profile picture and role',
  })
  async getCurrentUser(@UserId() userId: number): Promise<UserDto> {
    return this.userService.getCurrentUser(userId);
  }

  @Put('/')
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth()
  @ApiOperation({
    description:
      'This endpoint will update the user data provided via the request body and the hashed access token.',
  })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description: 'It will return user’s data updated according to request body',
  })
  async updateCurrentUser(
    @UserId() userId: number,
    @Body() newUserData: EditUserDto,
  ): Promise<UserDto> {
    return this.userService.updateUser(userId, newUserData);
  }

  @Patch('/profilePicture')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    description: 'This endpoint will update the user profile picture',
  })
  @ApiResponse({
    status: 200,
    type: UserDto,
    description:
      'It will return user’s data updated including the new profile picture',
  })
  @ApiConsumes('multipart/form-data')
  @ApiBearerAuth()
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        profilePicture: {
          type: 'string',
          format: 'binary',
          description: 'The new profile picture of user',
        },
      },
    },
  })
  @UseInterceptors(FileInterceptor('profilePicture'))
  async updateProfilePicture(
    @UserId() userId: number,
    @UploadedFile() profilePicture: Express.Multer.File,
  ): Promise<UserDto> {
    return this.userService.updateProfilePicture(userId, profilePicture);
  }
}
