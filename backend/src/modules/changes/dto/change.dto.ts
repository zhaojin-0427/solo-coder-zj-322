import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsArray, IsNumber, IsBoolean } from 'class-validator';
import { ChangeType } from '../entities/change.entity';
import { RiskTag } from '../../feedbacks/entities/feedback.entity';

export class CreateChangeDto {
  @ApiProperty({ description: '关联计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  @IsString()
  elderName: string;

  @ApiProperty({ description: '变更类型', enum: ['提前返回', '更改集合点', '其他'] })
  @IsIn(['提前返回', '更改集合点', '其他'])
  changeType: ChangeType;

  @ApiProperty({ description: '原值' })
  @IsString()
  oldValue: string;

  @ApiProperty({ description: '新值' })
  @IsString()
  newValue: string;

  @ApiProperty({ description: '变更原因' })
  @IsString()
  changeReason: string;

  @ApiProperty({ description: '影响说明' })
  @IsString()
  impactNotes: string;

  @ApiPropertyOptional({ description: '变更时间（ISO格式）' })
  @IsString()
  @IsOptional()
  changeTime?: string;

  @ApiPropertyOptional({ description: '关联路线ID' })
  @IsString()
  @IsOptional()
  routeId?: string;

  @ApiPropertyOptional({ description: '关联路线版本名称' })
  @IsString()
  @IsOptional()
  routeVersionName?: string;

  @ApiPropertyOptional({ description: '当时的共识分' })
  @IsNumber()
  @IsOptional()
  consensusScore?: number;

  @ApiPropertyOptional({ type: [String], description: '当时的风险标签' })
  @IsArray()
  @IsOptional()
  riskTagsAtChange?: RiskTag[];

  @ApiPropertyOptional({ description: '是否为强制发布的路线' })
  @IsBoolean()
  @IsOptional()
  isForcedRoute?: boolean;
}

export class UpdateChangeDto {
  @ApiPropertyOptional({ description: '长者姓名' })
  @IsString()
  @IsOptional()
  elderName?: string;

  @ApiPropertyOptional({ description: '变更类型', enum: ['提前返回', '更改集合点', '其他'] })
  @IsIn(['提前返回', '更改集合点', '其他'])
  @IsOptional()
  changeType?: ChangeType;

  @ApiPropertyOptional({ description: '原值' })
  @IsString()
  @IsOptional()
  oldValue?: string;

  @ApiPropertyOptional({ description: '新值' })
  @IsString()
  @IsOptional()
  newValue?: string;

  @ApiPropertyOptional({ description: '变更原因' })
  @IsString()
  @IsOptional()
  changeReason?: string;

  @ApiPropertyOptional({ description: '影响说明' })
  @IsString()
  @IsOptional()
  impactNotes?: string;
}
