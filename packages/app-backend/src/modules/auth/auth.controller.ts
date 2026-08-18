import { Controller, Post, Body, Inject, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { AuthService } from './auth.service.js';
import { LoginDto, RegisterDto, SocialLoginDto } from './dto/auth.dto.js';

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(@Inject(AuthService) private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate user with email and password' })
  @ApiResponse({ status: 200, description: 'Authentication token and user profile' })
  login(@Body() body: LoginDto) {
    return this.authService.login(body);
  }

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Register a new user account' })
  @ApiResponse({ status: 201, description: 'Created user profile with auth tokens' })
  register(@Body() body: RegisterDto) {
    return this.authService.register(body);
  }

  @Post('social')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Authenticate with OAuth social provider (Google, Apple, Facebook, Zalo)' })
  @ApiResponse({ status: 200, description: 'Authenticated user profile with tokens' })
  loginSocial(@Body() body: SocialLoginDto) {
    return this.authService.loginWithSocial(body);
  }
}
