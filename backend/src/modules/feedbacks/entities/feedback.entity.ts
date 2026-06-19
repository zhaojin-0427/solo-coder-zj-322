import { ApiProperty } from '@nestjs/swagger';
import { StaminaLevel } from '../../preferences/entities/preference.entity';

export type AcceptanceLevel = '完全接受' | '基本接受' | '有条件接受' | '难以接受';

export type RiskTag = '避晒' | '避冷' | '靠近厕所' | '需缩短步行' | '需延长步行' | '坡度较大' | '人流量大' | '休息不足';

export class RouteFeedback {
  @ApiProperty({ description: '反馈ID' })
  id: string;

  @ApiProperty({ description: '关联路线ID' })
  routeId: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '反馈长者姓名' })
  elderName: string;

  @ApiProperty({ description: '体力等级', enum: ['低', '中', '高'] })
  staminaLevel: StaminaLevel;

  @ApiProperty({ description: '可接受程度', enum: ['完全接受', '基本接受', '有条件接受', '难以接受'] })
  acceptanceLevel: AcceptanceLevel;

  @ApiProperty({ description: '担心原因' })
  concernReason: string;

  @ApiProperty({ description: '建议调整步行分钟数（正数表示延长，负数表示缩短）' })
  suggestedWalkAdjustmentMinutes: number;

  @ApiProperty({ description: '是否需要避晒' })
  needSunProtection: boolean;

  @ApiProperty({ description: '是否需要避冷' })
  needColdProtection: boolean;

  @ApiProperty({ description: '是否需要靠近厕所' })
  needNearToilet: boolean;

  @ApiProperty({ description: '其他建议' })
  otherSuggestions: string;

  @ApiProperty({ description: '反馈时间' })
  feedbackTime: string;

  @ApiProperty({ description: '反馈权重（根据体力等级和偏好计算）' })
  feedbackWeight: number;
}

export class RouteConsensus {
  @ApiProperty({ description: '路线ID' })
  routeId: string;

  @ApiProperty({ description: '共识分数 0-100' })
  consensusScore: number;

  @ApiProperty({ description: '是否达到共识阈值' })
  isConsensusReached: boolean;

  @ApiProperty({ description: '参与反馈人数' })
  feedbackCount: number;

  @ApiProperty({ type: [String], description: '风险标签' })
  riskTags: RiskTag[];

  @ApiProperty({ description: '低共识主要原因（如有）' })
  lowConsensusReasons: string[];

  @ApiProperty({ description: '建议调整步行分钟数' })
  suggestedAdjustmentMinutes: number;

  @ApiProperty({ description: '推荐排序（分数越高越靠前）' })
  recommendedRank: number;

  @ApiProperty({ description: '按体力等级的接受度分布' })
  acceptanceByStamina: Record<StaminaLevel, { count: number; avgAcceptance: number }>;
}
