import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import { OverviewStatistics, PlanRateItem, HeatmapItem } from './entities/statistics.entity';

@ApiTags('statistics')
@Controller('statistics')
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) {}

  @Get('overview')
  @ApiOperation({ summary: '获取总览统计数据' })
  @ApiOkResponse({ type: OverviewStatistics })
  getOverview(): OverviewStatistics {
    return this.statisticsService.getOverview();
  }

  @Get('plan-rate')
  @ApiOperation({ summary: '按计划统计成行率' })
  @ApiOkResponse({ type: [Object] })
  getPlanRate(): PlanRateItem[] {
    return this.statisticsService.getPlanRate();
  }

  @Get('heatmap')
  @ApiOperation({ summary: '获取变更高发热力图数据' })
  @ApiOkResponse({ type: [Object] })
  getHeatmap(): HeatmapItem[] {
    return this.statisticsService.getHeatmap();
  }

  @Get('route-completion')
  @ApiOperation({ summary: '各路线成行率对比' })
  getRouteCompletion() {
    return this.statisticsService.getRouteCompletion();
  }

  @Get('peak-hours')
  @ApiOperation({ summary: '一天内变更高发时段分布(8-18点)' })
  getPeakHours() {
    return this.statisticsService.getPeakHours();
  }

  @Get('satisfaction')
  @ApiOperation({ summary: '按体力等级满意度分布' })
  getSatisfaction() {
    return this.statisticsService.getSatisfaction();
  }

  @Get('change-hotspots')
  @ApiOperation({ summary: '变更高发节点TOP10' })
  getChangeHotspots() {
    return this.statisticsService.getChangeHotspots();
  }

  @Get('all')
  @ApiOperation({ summary: '获取全部统计数据(聚合)' })
  getAll() {
    return this.statisticsService.getAll();
  }
}
