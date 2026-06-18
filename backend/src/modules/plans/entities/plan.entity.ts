import { ApiProperty } from '@nestjs/swagger';

export type PlanStatus = 'draft' | 'active' | 'completed' | 'cancelled';

export class ToiletPoint {
  @ApiProperty({ description: '名称' })
  name: string;

  @ApiProperty({ description: '纬度' })
  latitude: number;

  @ApiProperty({ description: '经度' })
  longitude: number;
}

export class Plan {
  @ApiProperty({ description: '计划ID' })
  id: string;

  @ApiProperty({ description: '标题' })
  title: string;

  @ApiProperty({ description: '目的地' })
  destination: string;

  @ApiProperty({ description: '预估步行时间（分钟）' })
  estimatedWalkMinutes: number;

  @ApiProperty({ description: '坡度等级 1-5' })
  stepSlope: number;

  @ApiProperty({ type: [ToiletPoint], description: '卫生间点' })
  toiletPoints: ToiletPoint[];

  @ApiProperty({ description: '创建者ID' })
  creatorId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '状态', enum: ['draft', 'active', 'completed', 'cancelled'] })
  status: PlanStatus;
}
