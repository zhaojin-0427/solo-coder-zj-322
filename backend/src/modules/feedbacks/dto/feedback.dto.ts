import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsNumber, IsBoolean, IsOptional, Min, Max } from 'class-validator';
import { AcceptanceLevel } from '../entities/feedback.entity';
import { StaminaLevel } from '../../preferences/entities/preference.entity';

export class CreateFeedbackDto {
  @ApiProperty({ description: '关联路线ID' })
  @IsString()
  routeId: string;

  @ApiProperty({ description: '关联计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '反馈长者姓名' })
  @IsString()
  elderName: string;

  @ApiProperty({ description: '体力等级', enum: ['低', '中', '高'] })
  @IsIn(['低', '中', '高'])
  staminaLevel: StaminaLevel;

  @ApiProperty({ description: '可接受程度', enum: ['完全接受', '基本接受', '有条件接受', '难以接受'] })
  @IsIn(['完全接受', '基本接受', '有条件接受', '难以接受'])
  acceptanceLevel: AcceptanceLevel;

  @ApiProperty({ description: '担心原因' })
  @IsString()
  concernReason: string;

  @ApiProperty({ description: '建议调整步行分钟数（正数延长，负数缩短）' })
  @IsNumber()
  @Min(-120)
  @Max(120)
  suggestedWalkAdjustmentMinutes: number;

  @ApiProperty({ description: '是否需要避晒' })
  @IsBoolean()
  needSunProtection: boolean;

  @ApiProperty({ description: '是否需要避冷' })
  @IsBoolean()
  needColdProtection: boolean;

  @ApiProperty({ description: '是否需要靠近厕所' })
  @IsBoolean()
  needNearToilet: boolean;

  @ApiPropertyOptional({ description: '其他建议' })
  @IsString()
  @IsOptional()
  otherSuggestions?: string;

  @ApiPropertyOptional({ description: '反馈时间（ISO格式）' })
  @IsString()
  @IsOptional()
  feedbackTime?: string;
}

export class UpdateFeedbackDto {
  @ApiPropertyOptional({ description: '可接受程度', enum: ['完全接受', '基本接受', '有条件接受', '难以接受'] })
  @IsIn(['完全接受', '基本接受', '有条件接受', '难以接受'])
  @IsOptional()
  acceptanceLevel?: AcceptanceLevel;

  @ApiPropertyOptional({ description: '担心原因' })
  @IsString()
  @IsOptional()
  concernReason?: string;

  @ApiPropertyOptional({ description: '建议调整步行分钟数' })
  @IsNumber()
  @Min(-120)
  @Max(120)
  @IsOptional()
  suggestedWalkAdjustmentMinutes?: number;

  @ApiPropertyOptional({ description: '是否需要避晒' })
  @IsBoolean()
  @IsOptional()
  needSunProtection?: boolean;

  @ApiPropertyOptional({ description: '是否需要避冷' })
  @IsBoolean()
  @IsOptional()
  needColdProtection?: boolean;

  @ApiPropertyOptional({ description: '是否需要靠近厕所' })
  @IsBoolean()
  @IsOptional()
  needNearToilet?: boolean;

  @ApiPropertyOptional({ description: '其他建议' })
  @IsString()
  @IsOptional()
  otherSuggestions?: string;
}

export class PublishRouteDto {
  @ApiProperty({ description: '路线ID' })
  @IsString()
  routeId: string;

  @ApiPropertyOptional({ description: '人工确认原因（共识分未达阈值时必填）' })
  @IsString()
  @IsOptional()
  manualConfirmReason?: string;

  @ApiProperty({ description: '发布人' })
  @IsString()
  publisher: string;
}
