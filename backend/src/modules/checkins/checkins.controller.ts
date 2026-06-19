import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiQuery } from '@nestjs/swagger';
import { CheckinsService } from './checkins.service';
import {
  WaypointCheckinConfig,
  CheckinRecord,
  FamilyNotification,
  CheckinSummary,
  NotificationStatus,
} from './entities/checkins.entity';
import {
  CreateWaypointCheckinConfigDto,
  UpdateWaypointCheckinConfigDto,
  CreateCheckinRecordDto,
  RegisterTimeoutDto,
  UpdateNotificationStatusDto,
  BatchCreateConfigsDto,
} from './dto/checkins.dto';

@ApiTags('Checkins 节点签到与家属通知')
@Controller('checkins')
export class CheckinsController {
  constructor(private readonly checkinsService: CheckinsService) {}

  @Get('configs')
  @ApiOperation({ summary: '查询签到配置列表' })
  @ApiQuery({ name: 'planId', required: false })
  @ApiQuery({ name: 'routeId', required: false })
  findAllConfigs(
    @Query('planId') planId?: string,
    @Query('routeId') routeId?: string,
  ): WaypointCheckinConfig[] {
    return this.checkinsService.findAllConfigs(planId, routeId);
  }

  @Get('configs/:id')
  @ApiOperation({ summary: '查询单个签到配置' })
  findOneConfig(@Param('id') id: string): WaypointCheckinConfig {
    return this.checkinsService.findOneConfig(id);
  }

  @Post('configs')
  @ApiOperation({ summary: '创建单个节点签到配置' })
  createConfig(@Body() dto: CreateWaypointCheckinConfigDto): WaypointCheckinConfig {
    return this.checkinsService.createConfig(dto);
  }

  @Post('configs/batch')
  @ApiOperation({ summary: '批量创建路线各节点签到配置' })
  batchCreateConfigs(@Body() dto: BatchCreateConfigsDto): WaypointCheckinConfig[] {
    return this.checkinsService.batchCreateConfigs(dto);
  }

  @Put('configs/:id')
  @ApiOperation({ summary: '更新签到配置' })
  updateConfig(
    @Param('id') id: string,
    @Body() dto: UpdateWaypointCheckinConfigDto,
  ): WaypointCheckinConfig {
    return this.checkinsService.updateConfig(id, dto);
  }

  @Delete('configs/:id')
  @ApiOperation({ summary: '删除签到配置' })
  removeConfig(@Param('id') id: string): boolean {
    return this.checkinsService.removeConfig(id);
  }

  @Get('records')
  @ApiOperation({ summary: '查询签到记录列表' })
  @ApiQuery({ name: 'planId', required: false })
  @ApiQuery({ name: 'configId', required: false })
  @ApiQuery({ name: 'elderName', required: false })
  @ApiQuery({ name: 'exceptionOnly', required: false, type: Boolean })
  findAllRecords(
    @Query('planId') planId?: string,
    @Query('configId') configId?: string,
    @Query('elderName') elderName?: string,
    @Query('exceptionOnly') exceptionOnly?: string,
  ): CheckinRecord[] {
    return this.checkinsService.findAllRecords(planId, configId, elderName, exceptionOnly === 'true');
  }

  @Post('records')
  @ApiOperation({ summary: '登记到/离点签到（含异常情况）' })
  createCheckinRecord(@Body() dto: CreateCheckinRecordDto): {
    record: CheckinRecord;
    notifications: FamilyNotification[];
  } {
    return this.checkinsService.createCheckinRecord(dto);
  }

  @Post('timeouts')
  @ApiOperation({ summary: '登记超时未签到（可多人未到）' })
  registerTimeout(@Body() dto: RegisterTimeoutDto): {
    record: CheckinRecord;
    notifications: FamilyNotification[];
  } {
    return this.checkinsService.registerTimeout(dto);
  }

  @Get('notifications')
  @ApiOperation({ summary: '查询家属通知列表' })
  @ApiQuery({ name: 'planId', required: false })
  @ApiQuery({ name: 'status', required: false, enum: ['pending', 'notified', 'confirmed'] })
  @ApiQuery({ name: 'elderName', required: false })
  findAllNotifications(
    @Query('planId') planId?: string,
    @Query('status') status?: NotificationStatus,
    @Query('elderName') elderName?: string,
  ): FamilyNotification[] {
    return this.checkinsService.findAllNotifications(planId, status, elderName);
  }

  @Put('notifications/:id/status')
  @ApiOperation({ summary: '更新家属通知状态（待通知/已通知/已确认收到）' })
  updateNotificationStatus(
    @Param('id') id: string,
    @Body() dto: UpdateNotificationStatusDto,
  ): FamilyNotification {
    return this.checkinsService.updateNotificationStatus(id, dto);
  }

  @Get('summary/plan/:planId')
  @ApiOperation({ summary: '获取某计划的节点签到进度汇总' })
  getCheckinSummaryByPlan(@Param('planId') planId: string): CheckinSummary[] {
    return this.checkinsService.getCheckinSummaryByPlan(planId);
  }

  @Get('summary/plan-exception/:planId')
  @ApiOperation({ summary: '获取某计划的异常与通知摘要' })
  getPlanExceptionSummary(@Param('planId') planId: string) {
    return this.checkinsService.getPlanExceptionSummary(planId);
  }

  @Get('statistics')
  @ApiOperation({ summary: '获取签到与通知统计数据' })
  getCheckinStatistics() {
    return this.checkinsService.getCheckinStatistics();
  }
}
