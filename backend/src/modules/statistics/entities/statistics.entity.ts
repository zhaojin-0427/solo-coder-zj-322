import { ApiProperty } from '@nestjs/swagger';
import { StaminaLevel } from '../../preferences/entities/preference.entity';

export class TopChangeNode {
  @ApiProperty({ description: '变更节点/位置' })
  node: string;

  @ApiProperty({ description: '变更次数' })
  count: number;
}

export class SatisfactionByStamina {
  @ApiProperty({ description: '低体力满意度' })
  低: number;

  @ApiProperty({ description: '中体力满意度' })
  中: number;

  @ApiProperty({ description: '高体力满意度' })
  高: number;
}

export class OverviewStatistics {
  @ApiProperty({ description: '计划完成率 0-1' })
  planCompletionRate: number;

  @ApiProperty({ description: '平均休息次数' })
  avgRestCount: number;

  @ApiProperty({ type: [TopChangeNode], description: '变更高发节点TOP' })
  topChangeNodes: TopChangeNode[];

  @ApiProperty({ description: '按体力等级满意度分布' })
  satisfactionByStamina: SatisfactionByStamina;

  @ApiProperty({ description: '总计划数' })
  totalPlans: number;

  @ApiProperty({ description: '总变更数' })
  totalChanges: number;
}

export class PlanRateItem {
  @ApiProperty({ description: '计划ID' })
  planId: string;

  @ApiProperty({ description: '计划标题' })
  title: string;

  @ApiProperty({ description: '路线总数' })
  totalRoutes: number;

  @ApiProperty({ description: '完成路线数' })
  completedRoutes: number;

  @ApiProperty({ description: '成行率 0-1' })
  completionRate: number;
}

export class HeatmapItem {
  @ApiProperty({ description: '计划ID' })
  planId: string;

  @ApiProperty({ description: '变更类型' })
  changeType: string;

  @ApiProperty({ description: '位置/节点' })
  location: string;

  @ApiProperty({ description: '发生次数' })
  count: number;

  @ApiProperty({ description: '发生时间' })
  time: string;
}

export class ConsensusStats {
  @ApiProperty({ description: '共识通过率（0-100）' })
  consensusPassRate: number;

  @ApiProperty({ description: '已发布路线总数' })
  totalPublished: number;

  @ApiProperty({ description: '共识通过数量' })
  consensusPassedCount: number;

  @ApiProperty({ description: '人工强制发布次数' })
  forcedPublishCount: number;

  @ApiProperty({ description: '共识分阈值' })
  consensusThreshold: number;
}

export class LowConsensusReasonItem {
  @ApiProperty({ description: '原因内容' })
  reason: string;

  @ApiProperty({ description: '出现次数' })
  count: number;

  @ApiProperty({ description: '占比（0-100）' })
  percentage: number;
}

export class FeedbackAcceptanceByStaminaItem {
  @ApiProperty({ description: '体力等级', enum: ['低', '中', '高'] })
  staminaLevel: StaminaLevel;

  @ApiProperty({ description: '反馈总数' })
  totalFeedbacks: number;

  @ApiProperty({ description: '接受反馈数（完全接受+基本接受）' })
  acceptedCount: number;

  @ApiProperty({ description: '接受率（0-100）' })
  acceptanceRate: number;
}

export class ConsensusByRouteItem {
  @ApiProperty({ description: '路线ID' })
  routeId: string;

  @ApiProperty({ description: '路线版本名称' })
  routeVersionName: string;

  @ApiProperty({ description: '共识分数' })
  consensusScore: number;

  @ApiProperty({ description: '是否达成共识' })
  isConsensusReached: boolean;

  @ApiProperty({ description: '参与反馈人数' })
  feedbackCount: number;

  @ApiProperty({ description: '是否强制发布' })
  isForced: boolean;
}

export class CareTaskStats {
  @ApiProperty({ description: '任务总数' })
  total: number;

  @ApiProperty({ description: '已完成数量' })
  completed: number;

  @ApiProperty({ description: '待分配数量' })
  pending: number;

  @ApiProperty({ description: '进行中数量' })
  inProgress: number;

  @ApiProperty({ description: '未完成数量' })
  failed: number;

  @ApiProperty({ description: '已分配数量' })
  assigned: number;

  @ApiProperty({ description: '完成率（0-100）' })
  completionRate: number;

  @ApiProperty({ description: '逾期任务数量' })
  overdue: number;
}

export class CareFailureReasonItem {
  @ApiProperty({ description: '未完成原因' })
  reason: string;

  @ApiProperty({ description: '出现次数' })
  count: number;

  @ApiProperty({ description: '占比（0-100）' })
  percentage: number;
}

export class CarePriorityDistributionItem {
  @ApiProperty({ description: '优先级' })
  priority: string;

  @ApiProperty({ description: '任务数量' })
  count: number;

  @ApiProperty({ description: '已完成数量' })
  completed: number;
}

export class CarePlanBurdenItem {
  @ApiProperty({ description: '计划ID' })
  planId: string;

  @ApiProperty({ description: '计划标题' })
  planTitle: string;

  @ApiProperty({ description: '任务总数' })
  taskCount: number;

  @ApiProperty({ description: '紧急任务数' })
  criticalCount: number;

  @ApiProperty({ description: '高优先级任务数' })
  highCount: number;
}

export class HealthReminderStats {
  @ApiProperty({ description: '总健康天气配置数' })
  totalConfigs: number;

  @ApiProperty({ description: '总登记数' })
  totalCheckins: number;

  @ApiProperty({ description: '整体健康提醒确认率（0-100）' })
  overallConfirmationRate: number;

  @ApiProperty({ description: '高风险长辈总数' })
  totalHighRiskElders: number;

  @ApiProperty({ description: '中风险长辈总数' })
  totalMediumRiskElders: number;

  @ApiProperty({ description: '低风险长辈总数' })
  totalLowRiskElders: number;

  @ApiProperty({ description: '建议改短路线累计次数' })
  totalShortenRouteSuggestions: number;

  @ApiProperty({ description: '健康提醒配置覆盖率（配置数/活跃计划数）' })
  configCoverageRate: number;
}

export class HealthConcernStatItem {
  @ApiProperty({ description: '顾虑名称' })
  concern: string;

  @ApiProperty({ description: '出现次数' })
  count: number;

  @ApiProperty({ description: '占比（0-100）' })
  percentage: number;
}

export class WeatherRiskChangeStatItem {
  @ApiProperty({ description: '天气风险等级' })
  weatherRiskLevel: string;

  @ApiProperty({ description: '该天气风险下的临时变更次数' })
  changeCount: number;

  @ApiProperty({ description: '该天气风险下的计划数' })
  planCount: number;

  @ApiProperty({ description: '平均变更次数/计划' })
  avgChangesPerPlan: number;
}

export class TopTimeoutNode {
  @ApiProperty({ description: '排名' })
  rank: number;

  @ApiProperty({ description: '节点名称' })
  name: string;

  @ApiProperty({ description: '异常发生次数' })
  count: number;

  @ApiProperty({ description: '所属计划ID' })
  planId: string;
}

export class PlanExceptionDistribution {
  @ApiProperty({ description: '计划ID' })
  planId: string;

  @ApiProperty({ description: '计划标题' })
  planTitle: string;

  @ApiProperty({ description: '总签到数' })
  totalCheckins: number;

  @ApiProperty({ description: '迟到次数' })
  lateCount: number;

  @ApiProperty({ description: '未到次数' })
  noShowCount: number;

  @ApiProperty({ description: '提前离开次数' })
  earlyLeaveCount: number;

  @ApiProperty({ description: '超时次数' })
  timeoutCount: number;

  @ApiProperty({ description: '总异常数' })
  totalExceptions: number;
}

export class CheckinStatistics {
  @ApiProperty({ description: '总成功签到数' })
  totalChecked: number;

  @ApiProperty({ description: '总漏签到数' })
  totalMissed: number;

  @ApiProperty({ description: '准时签到数' })
  onTimeCount: number;

  @ApiProperty({ description: '准时签到率（0-100）' })
  onTimeRate: number;

  @ApiProperty({ description: '迟到次数' })
  lateCount: number;

  @ApiProperty({ description: '未到次数' })
  noShowCount: number;

  @ApiProperty({ description: '提前离开次数' })
  earlyLeaveCount: number;

  @ApiProperty({ type: [TopTimeoutNode], description: '超时/异常高发节点TOP' })
  topTimeoutNodes: TopTimeoutNode[];

  @ApiProperty({ description: '家属通知总数' })
  totalNotifications: number;

  @ApiProperty({ description: '已确认收到通知数' })
  confirmedCount: number;

  @ApiProperty({ description: '已发送通知数' })
  notifiedCount: number;

  @ApiProperty({ description: '待发送通知数' })
  pendingCount: number;

  @ApiProperty({ description: '家属通知确认率（0-100）' })
  notificationConfirmRate: number;

  @ApiProperty({ description: '家属通知发送率（0-100）' })
  notificationSentRate: number;

  @ApiProperty({ type: [PlanExceptionDistribution], description: '不同计划的签到异常分布' })
  exceptionByPlan: PlanExceptionDistribution[];
}
