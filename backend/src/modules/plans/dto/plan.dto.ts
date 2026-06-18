import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsIn, Min, Max, IsOptional } from 'class-validator';

export class CreatePlanDto {
  @ApiProperty({ description: '标题' })
  @IsString()
  title: string;

  @ApiProperty({ description: '目的地' })
  @IsString()
  destination: string;

  @ApiProperty({ description: '预估步行时间（分钟）' })
  @IsNumber()
  @Min(1)
  estimatedWalkMinutes: number;

  @ApiProperty({ description: '坡度等级 1-5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  stepSlope: number;

  @ApiProperty({ type: [Object], description: '卫生间点数组', required: false })
  @IsArray()
  @IsOptional()
  toiletPoints?: Array<{ name: string; latitude: number; longitude: number }>;

  @ApiProperty({ description: '创建者ID' })
  @IsString()
  creatorId: string;

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'active', 'completed', 'cancelled'], default: 'draft' })
  @IsIn(['draft', 'active', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}

export class UpdatePlanDto {
  @ApiPropertyOptional({ description: '标题' })
  @IsString()
  @IsOptional()
  title?: string;

  @ApiPropertyOptional({ description: '目的地' })
  @IsString()
  @IsOptional()
  destination?: string;

  @ApiPropertyOptional({ description: '预估步行时间（分钟）' })
  @IsNumber()
  @Min(1)
  @IsOptional()
  estimatedWalkMinutes?: number;

  @ApiPropertyOptional({ description: '坡度等级 1-5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  stepSlope?: number;

  @ApiPropertyOptional({ type: [Object], description: '卫生间点数组' })
  @IsArray()
  @IsOptional()
  toiletPoints?: Array<{ name: string; latitude: number; longitude: number }>;

  @ApiPropertyOptional({ description: '状态', enum: ['draft', 'active', 'completed', 'cancelled'] })
  @IsIn(['draft', 'active', 'completed', 'cancelled'])
  @IsOptional()
  status?: 'draft' | 'active' | 'completed' | 'cancelled';
}
