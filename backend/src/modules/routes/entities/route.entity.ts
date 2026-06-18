import { ApiProperty } from '@nestjs/swagger';

export class Waypoint {
  @ApiProperty({ description: '途经点名称' })
  name: string;

  @ApiProperty({ description: '纬度' })
  latitude: number;

  @ApiProperty({ description: '经度' })
  longitude: number;

  @ApiProperty({ description: '休息时长（分钟）' })
  restMinutes: number;

  @ApiProperty({ description: '停留原因' })
  reason: string;
}

export type Difficulty = 'easy' | 'moderate' | 'hard';

export class Route {
  @ApiProperty({ description: '路线ID' })
  id: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '版本名称' })
  versionName: string;

  @ApiProperty({ type: [Waypoint], description: '途经点数组' })
  waypoints: Waypoint[];

  @ApiProperty({ description: '总步行时间（分钟）' })
  totalWalkMinutes: number;

  @ApiProperty({ description: '总休息时间（分钟）' })
  totalRestMinutes: number;

  @ApiProperty({ description: '难度等级', enum: ['easy', 'moderate', 'hard'] })
  difficulty: Difficulty;

  @ApiProperty({ type: [String], description: '建议事项' })
  recommendations: string[];

  @ApiProperty({ description: '是否选中为最终路线', required: false })
  isSelected?: boolean;
}
