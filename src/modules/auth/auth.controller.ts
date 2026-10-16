import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import { AuthService } from '@modules/auth/auth.service';
import { LoginDto } from '@modules/auth/dto/login.dto';
import { RefreshTokenDto } from '@modules/auth/dto/refresh-token.dto';
import { JwtAuthGuard } from '@modules/auth/guards/jwt-auth.guard';
import type { AuthenticatedRequest } from '@modules/auth/guards/jwt-auth.guard';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @ApiOperation({ summary: 'Login with email and password' })
  @ApiResponse({ status: 200, description: 'Returns a JWT access token' })
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Post('refresh')
  @ApiOperation({ summary: 'Rotate the access and refresh tokens' })
  @ApiResponse({ status: 200, description: 'Returns a new token pair' })
  refresh(@Body() dto: RefreshTokenDto) {
    return this.authService.refresh(dto.refreshToken);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: 'Logout the current user' })
  @ApiResponse({ status: 200, description: 'Logout acknowledged' })
  logout(@Req() request: AuthenticatedRequest) {
    return this.authService.logout(request.user.sub);
  }
}
