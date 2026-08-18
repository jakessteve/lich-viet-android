import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, IsOptional, IsString, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({ description: 'User email address', example: 'user@lichviet.local' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'User password', example: 'SecurePassword123' })
  @IsOptional()
  @IsString()
  password?: string;
}

export class RegisterDto {
  @ApiProperty({ description: 'User email address', example: 'newuser@lichviet.local' })
  @IsEmail()
  email!: string;

  @ApiPropertyOptional({ description: 'User password (min 6 characters)', example: 'SecurePassword123' })
  @IsOptional()
  @IsString()
  @MinLength(6)
  password?: string;

  @ApiPropertyOptional({ description: 'Display name', example: 'Nguyễn Văn A' })
  @IsOptional()
  @IsString()
  name?: string;
}

export class SocialLoginDto {
  @ApiProperty({ description: 'Social OAuth access/identity token', example: 'oauth-token-xyz' })
  @IsNotEmpty()
  @IsString()
  token!: string;

  @ApiProperty({
    description: 'Social OAuth provider',
    enum: ['google', 'apple', 'facebook', 'zalo'],
    example: 'google',
  })
  @IsNotEmpty()
  @IsString()
  provider!: 'google' | 'apple' | 'facebook' | 'zalo';

  @ApiPropertyOptional({ description: 'PKCE Code Verifier' })
  @IsOptional()
  @IsString()
  codeVerifier?: string;

  @ApiPropertyOptional({ description: 'OAuth Redirect URI' })
  @IsOptional()
  @IsString()
  redirectUri?: string;
}
