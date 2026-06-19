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
