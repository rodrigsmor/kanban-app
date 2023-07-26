import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthDto, SignupDto } from './dto';
import { Tokens } from './types';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('signup')
  @HttpCode(HttpStatus.CREATED)
  async signup(@Body() signupDto: SignupDto): Promise<Tokens> {
    return this.authService.signup(signupDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.ACCEPTED)
  async login(@Body() loginDto: AuthDto): Promise<Tokens> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.ACCEPTED)
  async refresh(@Body('refreshToken') refreshToken: string): Promise<Tokens> {
    return this.authService.validateRefreshTokens(refreshToken);
  }

  @Post('logout')
  @HttpCode(HttpStatus.ACCEPTED)
  async logout(@Body('refreshToken') refreshToken: string) {
    return this.authService.logout(refreshToken);
  }
}
