import { ApiProperty } from '@nestjs/swagger';

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
