import { UserService } from './user.service';
import { UserId } from '../../common/decorators/get-user-id.decorator';
import { Controller, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { UserDto } from './dto';

@Controller('/api/user')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get('/')
  @HttpCode(HttpStatus.ACCEPTED)
  async getCurrentUser(@UserId() userId: number): Promise<UserDto> {
    return this.userService.getCurrentUser(userId);
  }
}
