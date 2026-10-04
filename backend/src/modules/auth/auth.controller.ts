import { Controller, Post, Get, Body, Req, Res, UseGuards, Query, Delete, Ip } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Request, Response } from 'express';
import { AuthService } from './auth.service';
import { RegisterDto, LoginDto, ForgotPasswordDto, ResetPasswordDto, DeleteAccountDto } from './dto';
import { Public, CurrentUser } from '../../common/decorators/current-user.decorator';
import { LocalAuthGuard } from '../../common/guards/local-auth.guard';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { GoogleAuthGuard } from '../../common/guards/google-auth.guard';
import { AuthThrottlerGuard } from '../../common/guards/auth-throttler.guard';
import { Throttle } from '@nestjs/throttler';
import { CsrfService } from './csrf.service';

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly csrfService: CsrfService
  ) {}

  @Public()
  @Post('register')
  async register(@Body() dto: RegisterDto, @Res({ passthrough: true }) res: Response) {
    const { user, tokens } = await this.authService.register(dto);
    res.cookie('token', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth', maxAge: 7 * 24 * 60 * 60 * 1000 });
    const csrfToken = this.csrfService.generateCsrfToken(user._id.toString());
    res.cookie('csrfToken', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', maxAge: 86400000 });
    return { user, accessToken: tokens.accessToken };
  }

  @Public()
  @UseGuards(LocalAuthGuard, AuthThrottlerGuard)
  @Throttle({ login: { limit: 5, ttl: 900000 } })
  @Post('login')
  async login(@CurrentUser() user: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const { user: safeUser, tokens } = await this.authService.login(user, req.ip, req.headers['user-agent']);
    res.cookie('token', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth', maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    // CSRF implementation
    const csrfToken = this.csrfService.generateCsrfToken(safeUser._id.toString() || safeUser.id);
    res.cookie('csrfToken', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', maxAge: 86400000 });
    
    return { user: safeUser, accessToken: tokens.accessToken };
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  async logout(@Req() req: Request, @CurrentUser() user: any, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    await this.authService.logout(refreshToken, accessToken, user.userId);
    res.clearCookie('token', { path: '/auth' });
    res.clearCookie('csrfToken');
    return { success: true };
  }

  @Public()
  @Post('refresh')
  async refreshTokens(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.token;
    const tokens = await this.authService.refreshTokens(refreshToken, req.ip);
    res.cookie('token', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth', maxAge: 7 * 24 * 60 * 60 * 1000 });
    return { accessToken: tokens.accessToken };
  }

  @Public()
  @Get('verify-email')
  async verifyEmail(@Query('token') token: string, @Query('email') email: string) {
    await this.authService.verifyEmail(token, email);
    return { success: true };
  }

  @Public()
  @Throttle({ strict: { limit: 3, ttl: 3600000 } }) // 3 per hour per IP
  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    await this.authService.forgotPassword(dto.email);
    return { success: true, message: 'If an account exists with this email, a reset link has been sent.' };
  }

  @Public()
  @Throttle({ strict: { limit: 3, ttl: 3600000 } })
  @Post('reset-password')
  async resetPassword(@Body() dto: ResetPasswordDto) {
    await this.authService.resetPassword(dto.token, dto.email, dto.password);
    return { success: true };
  }

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google')
  googleAuth() {}

  @Public()
  @UseGuards(GoogleAuthGuard)
  @Get('google/callback')
  async googleAuthRedirect(@CurrentUser() user: any, @Req() req: Request, @Res() res: Response) {
    const { tokens, user: safeUser } = await this.authService.login(user, req.ip, req.headers['user-agent']);
    res.cookie('token', tokens.refreshToken, { httpOnly: true, secure: true, sameSite: 'strict', path: '/auth', maxAge: 7 * 24 * 60 * 60 * 1000 });
    
    const csrfToken = this.csrfService.generateCsrfToken(safeUser._id.toString() || safeUser.id);
    res.cookie('csrfToken', csrfToken, { httpOnly: false, secure: true, sameSite: 'strict', maxAge: 86400000 });

    res.redirect(`${process.env.NEXT_PUBLIC_APP_URL}/auth/callback?token=${tokens.accessToken}`);
  }

  @UseGuards(JwtAuthGuard)
  @Delete('account')
  async deleteAccount(@Body() dto: DeleteAccountDto, @CurrentUser() user: any, @Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies?.token;
    const authHeader = req.headers.authorization;
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.substring(7) : undefined;
    await this.authService.logout(refreshToken, accessToken, user.userId);
    res.clearCookie('token', { path: '/auth' });
    res.clearCookie('csrfToken');
    return { success: true };
  }

  @UseGuards(JwtAuthGuard)
  @Get('profile')
  getProfile(@CurrentUser() user: any) {
    return user;
  }
}
