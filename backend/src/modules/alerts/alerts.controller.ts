import { Controller, Get, Post, Patch, Delete, Body, Param, UseGuards, SetMetadata } from '@nestjs/common';
import { ApiTags, ApiOperation } from '@nestjs/swagger';
import { AlertsService } from './alerts.service';
import { CreateAlertDto, UpdateAlertDto } from './dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CurrentUserId } from '../../common/decorators/current-user.decorator';
import { ResourceOwnerGuard, RESOURCE_MODEL_KEY } from '../../common/guards/resource-owner.guard';

@ApiTags('Alerts')
@UseGuards(JwtAuthGuard)
@Controller('alerts')
export class AlertsController {
  constructor(private readonly alertsService: AlertsService) {}

  @Post()
  @ApiOperation({ summary: 'Create price alert' })
  createAlert(@CurrentUserId() userId: string, @Body() dto: CreateAlertDto) {
    return this.alertsService.createAlert(userId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all user alerts' })
  getAlerts(@CurrentUserId() userId: string) {
    return this.alertsService.getAlerts(userId);
  }

  @Patch(':id')
  @UseGuards(ResourceOwnerGuard)
  @SetMetadata(RESOURCE_MODEL_KEY, 'Alert')
  @ApiOperation({ summary: 'Update alert' })
  updateAlert(@CurrentUserId() userId: string, @Param('id') id: string, @Body() dto: UpdateAlertDto) {
    return this.alertsService.updateAlert(userId, id, dto);
  }

  @Delete(':id')
  @UseGuards(ResourceOwnerGuard)
  @SetMetadata(RESOURCE_MODEL_KEY, 'Alert')
  @ApiOperation({ summary: 'Delete alert' })
  deleteAlert(@CurrentUserId() userId: string, @Param('id') id: string) {
    return this.alertsService.deleteAlert(userId, id);
  }
}
