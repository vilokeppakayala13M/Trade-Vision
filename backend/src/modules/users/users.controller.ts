import { Controller, Get, Patch, Post, Delete, Body, Param, UseGuards, Res, UseInterceptors, UploadedFile, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { Response } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { FileUploadInterceptor } from '../../common/interceptors/file-upload.interceptor';
import { CsrfGuard } from '../../common/guards/csrf.guard';

@ApiTags('Users')
@UseGuards(JwtAuthGuard, CsrfGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getProfile(@CurrentUserId() userId: string) {
    return this.usersService.getFullProfile(userId);
  }

  @Patch('me')
  async updateProfile(@CurrentUserId() userId: string, @Body() dto: any) {
    if (dto.preferences) {
      return this.usersService.updatePreferences(userId, dto.preferences);
    }
    return this.usersService.update(userId, dto);
  }

  @Get('me/watchlist')
  async getWatchlist(@CurrentUserId() userId: string) {
    return this.usersService.getWatchlist(userId);
  }

  @Post('me/watchlist')
  async addToWatchlist(@CurrentUserId() userId: string, @Body() body: { symbol: string }) {
    await this.usersService.addToWatchlist(userId, body.symbol);
    return { success: true };
  }

  @Delete('me/watchlist/:symbol')
  async removeFromWatchlist(@CurrentUserId() userId: string, @Param('symbol') symbol: string) {
    await this.usersService.removeFromWatchlist(userId, symbol);
    return { success: true };
  }

  @Get('me/export')
  async exportData(@CurrentUserId() userId: string, @Res() res: Response) {
    const data = await this.usersService.exportUserData(userId);
    res.setHeader('Content-Type', 'application/json');
    res.setHeader('Content-Disposition', 'attachment; filename="tradevision-data.json"');
    res.send(JSON.stringify(data, null, 2));
  }

  @Post('me/avatar')
  @UseInterceptors(new FileUploadInterceptor('file'))
  @ApiConsumes('multipart/form-data')
  async uploadAvatar(@CurrentUserId() userId: string, @UploadedFile() file: any) {
    if (!file) {
      throw new BadRequestException('No file uploaded');
    }
    // We pass the validated buffer to the service to upload to S3
    const avatarUrl = await this.usersService.uploadAvatar(userId, file.buffer, file.mimetype);
    return { success: true, avatarUrl };
  }
}
