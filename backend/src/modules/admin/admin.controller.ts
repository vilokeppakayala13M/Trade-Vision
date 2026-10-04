import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { User, UserDocument } from '../../schemas/user.schema';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/current-user.decorator';

@ApiTags('Admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('admin') // We'd need an admin tier, or just use this as placeholder
@Controller('admin')
export class AdminController {
  constructor(@InjectModel(User.name) private userModel: Model<UserDocument>) {}

  @Get('users')
  @ApiOperation({ summary: 'Get all users (Admin only)' })
  async getUsers() {
    return this.userModel.find().select('-password').exec();
  }
}
