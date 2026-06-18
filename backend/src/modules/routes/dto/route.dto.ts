import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsArray, IsNumber, IsIn, IsOptional, Min, Max } from 'class-validator';
import { Difficulty, Waypoint } from '../entities/route.entity';

export class CreateRouteDto {
  @ApiProperty({ description: '关联计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '版本名称' })
  @IsString()
  versionName: string;

  @ApiProperty({ type: [Object], description: '途经点数组' })
  @IsArray()
  waypoints: Waypoint[];

  @ApiProperty({ description: '总步行时间（分钟）' })
  @IsNumber()
  @Min(1)
  totalWalkMinutes: number;

  @ApiProperty({ description: '总休息时间（分钟）' })
  @IsNumber()
  @Min(0)
  totalRestMinutes: number;

  @ApiProperty({ description: '难度等级', enum: ['easy', 'moderate', 'hard'] })
  @IsIn(['easy', 'moderate', 'hard'])
  difficulty: Difficulty;

  @ApiPropertyOptional({ type: [String], description: '建议事项' })
  @IsArray()
  @IsOptional()
  recommendations?: string[];
}

export class UpdateRouteDto {
  @ApiPropertyOptional({ description: '版本名称' })
  @IsString()
  @IsOptional()
  versionName?: string;

  @ApiPropertyOptional({ type: [Object], description: '途经点数组' })
  @IsArray()
  @IsOptional()
  waypoints?: Waypoint[];

  @ApiPropertyOptional({ description: '总步行时间（分钟）' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  totalWalkMinutes?: number;

  @ApiPropertyOptional({ description: '总休息时间（分钟）' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  totalRestMinutes?: number;

  @ApiPropertyOptional({ description: '难度等级', enum: ['easy', 'moderate', 'hard'] })
  @IsIn(['easy', 'moderate', 'hard'])
  @IsOptional()
  difficulty?: Difficulty;

  @ApiPropertyOptional({ type: [String], description: '建议事项' })
  @IsArray()
  @IsOptional()
  recommendations?: string[];
}
