import { Tokens } from './types';
import { AuthDto, SignupDto } from './dto';
import { AuthService } from './auth.service';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';

@ApiTags('Authentication')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    description:
      'This endpoint will register the user in the application, then provide tokens to access the application’s features.',
  })
  @ApiResponse({
    status: 201,
    type: Tokens,
    description:
      'Upon account creation, this API endpoint will provide authentication tokens, both refresh and access tokens.',
  })
  async signup(@Body() signupDto: SignupDto): Promise<Tokens> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    description:
      'This endpoint will check that the data provided is correct and then provide tokens to allow the user access to the application. ',
  })
  @ApiResponse({
    status: 202,
    type: Tokens,
    description:
      'If the data is correct, it will provide the authentication tokens, both refresh and access tokens.',
  })
  async login(@Body() loginDto: AuthDto): Promise<Tokens> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    description:
      'This endpoint will renew its authentication tokens if the refresb token is valid.',
  })
  @ApiResponse({
    status: 202,
    type: Tokens,
    description:
      'After check if refresh token is valid, it will return new authentication tokens.',
  })
  async refresh(@Body('refreshToken') refreshToken: string): Promise<Tokens> {
    return this.authService.validateRefreshTokens(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.ACCEPTED)
  @ApiOperation({
    description:
      'This endpoint will make it impossible to access resources using the inserted token and those related to it.',
  })
  @ApiResponse({
    status: 202,
    type: null,
    description:
      'This endpoint has no response body, it just disables access by the related tokens.',
  })
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
