import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Alert, AlertDocument } from '../../schemas/alert.schema';
import { CreateAlertDto, UpdateAlertDto } from './dto';
import { UsersService } from '../users/users.service';

@Injectable()
export class AlertsService {
  constructor(
    @InjectModel(Alert.name) private alertModel: Model<AlertDocument>,
    private usersService: UsersService,
  ) {}

  async createAlert(userId: string, dto: CreateAlertDto) {
    const user = await this.usersService.findById(userId);
    const count = await this.alertModel.countDocuments({ userId, active: true });
    
    const limit = user.tier === 'pro' ? 100 : 10;
    if (count >= limit) {
      throw new ForbiddenException(`Active alert limit of ${limit} reached`);
    }

    const alert = new this.alertModel({
      userId,
      ...dto,
      displaySymbol: dto.symbol,
    });
    return alert.save();
  }

  async getAlerts(userId: string) {
    return this.alertModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async updateAlert(userId: string, alertId: string, dto: UpdateAlertDto) {
    const alert = await this.alertModel.findOneAndUpdate(
      { _id: alertId, userId },
      dto,
      { new: true }
    ).exec();
    if (!alert) throw new NotFoundException('Alert not found');
    return alert;
  }

  async deleteAlert(userId: string, alertId: string) {
    const result = await this.alertModel.deleteOne({ _id: alertId, userId }).exec();
    if (result.deletedCount === 0) throw new NotFoundException('Alert not found');
    return { success: true };
  }

  async getActiveAlertsForSymbol(symbol: string) {
    return this.alertModel.find({ symbol, active: true, triggered: false }).populate('userId', 'name email').exec();
  }
}
