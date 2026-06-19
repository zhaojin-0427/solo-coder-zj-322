import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiOkResponse } from '@nestjs/swagger';
import { StatisticsService } from './statistics.service';
import {
  OverviewStatistics,
  PlanRateItem,
  HeatmapItem,
  ConsensusStats,
  LowConsensusReasonItem,
  FeedbackAcceptanceByStaminaItem,
  ConsensusByRouteItem,
  CareTaskStats,
  CareFailureReasonItem,
  CarePriorityDistributionItem,
  CarePlanBurdenItem,
  HealthReminderStats,
  HealthConcernStatItem,
  WeatherRiskChangeStatItem,
  CheckinStatistics,
} from './entities/statistics.entity';

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

  @Get('consensus-stats')
  @ApiOperation({ summary: '获取路线共识统计（通过率、强制发布次数等）' })
  @ApiOkResponse({ type: ConsensusStats })
  getConsensusStats(): ConsensusStats {
    return this.statisticsService.getConsensusStats();
  }

  @Get('low-consensus-reasons')
  @ApiOperation({ summary: '获取低共识高发原因统计' })
  @ApiOkResponse({ type: [LowConsensusReasonItem] })
  getLowConsensusReasons(): LowConsensusReasonItem[] {
    return this.statisticsService.getLowConsensusReasons();
  }

  @Get('feedback-acceptance-by-stamina')
  @ApiOperation({ summary: '获取不同体力等级的反馈接受度' })
  @ApiOkResponse({ type: [FeedbackAcceptanceByStaminaItem] })
  getFeedbackAcceptanceByStamina(): FeedbackAcceptanceByStaminaItem[] {
    return this.statisticsService.getFeedbackAcceptanceByStamina();
  }

  @Get('consensus-by-route')
  @ApiOperation({ summary: '按路线获取共识情况' })
  @ApiOkResponse({ type: [ConsensusByRouteItem] })
  getConsensusByRoute(): ConsensusByRouteItem[] {
    return this.statisticsService.getConsensusByRoute();
  }

  @Get('care-task-stats')
  @ApiOperation({ summary: '获取照护任务统计数据' })
  @ApiOkResponse({ type: CareTaskStats })
  getCareTaskStats(): CareTaskStats {
    return this.statisticsService.getCareTaskStats();
  }

  @Get('care-failure-reasons')
  @ApiOperation({ summary: '获取照护任务未完成原因统计' })
  @ApiOkResponse({ type: [CareFailureReasonItem] })
  getCareFailureReasons(): CareFailureReasonItem[] {
    return this.statisticsService.getCareFailureReasons();
  }

  @Get('care-priority-distribution')
  @ApiOperation({ summary: '获取照护任务按优先级分布' })
  @ApiOkResponse({ type: [CarePriorityDistributionItem] })
  getCarePriorityDistribution(): CarePriorityDistributionItem[] {
    return this.statisticsService.getCarePriorityDistribution();
  }

  @Get('care-plan-burden')
  @ApiOperation({ summary: '获取各计划照护负担分布' })
  @ApiOkResponse({ type: [CarePlanBurdenItem] })
  getCarePlanBurden(): CarePlanBurdenItem[] {
    return this.statisticsService.getCarePlanBurden();
  }

  @Get('health-reminder-stats')
  @ApiOperation({ summary: '获取健康提醒确认率、高风险长辈数量等汇总统计' })
  @ApiOkResponse({ type: HealthReminderStats })
  getHealthReminderStats(): HealthReminderStats {
    return this.statisticsService.getHealthReminderStats();
  }

  @Get('top-health-concerns')
  @ApiOperation({ summary: '获取常见健康顾虑排行统计' })
  @ApiOkResponse({ type: [HealthConcernStatItem] })
  getTopHealthConcerns(): HealthConcernStatItem[] {
    return this.statisticsService.getTopHealthConcerns();
  }

  @Get('weather-risk-change-distribution')
  @ApiOperation({ summary: '获取天气风险等级与临时变更关联分布' })
  @ApiOkResponse({ type: [WeatherRiskChangeStatItem] })
  getWeatherRiskChangeDistribution(): WeatherRiskChangeStatItem[] {
    return this.statisticsService.getWeatherRiskChangeDistribution();
  }

  @Get('checkin-stats')
  @ApiOperation({ summary: '获取节点签到与家属通知统计（准时率、超时高发节点、通知确认率、异常分布等）' })
  @ApiOkResponse({ type: CheckinStatistics })
  getCheckinStats(): CheckinStatistics {
    return this.statisticsService.getCheckinStats();
  }

  @Get('all')
  @ApiOperation({ summary: '获取全部统计数据(聚合)' })
  getAll() {
    return this.statisticsService.getAll();
  }
}
