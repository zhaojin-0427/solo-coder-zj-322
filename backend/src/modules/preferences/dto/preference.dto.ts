import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsBoolean, IsIn, IsOptional } from 'class-validator';
import { StaminaLevel, RestFrequency } from '../entities/preference.entity';

export class CreatePreferenceDto {
  @ApiProperty({ description: '关联计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  @IsString()
  elderName: string;

  @ApiProperty({ description: '体力等级', enum: ['低', '中', '高'] })
  @IsIn(['低', '中', '高'])
  staminaLevel: StaminaLevel;

  @ApiProperty({ description: '休息频率', enum: ['每15分钟', '每30分钟', '每45分钟', '按需'] })
  @IsIn(['每15分钟', '每30分钟', '每45分钟', '按需'])
  restFrequency: RestFrequency;

  @ApiProperty({ description: '是否怕晒' })
  @IsBoolean()
  sunSensitive: boolean;

  @ApiProperty({ description: '是否怕冷' })
  @IsBoolean()
  coldSensitive: boolean;

  @ApiProperty({ description: '可开始时间 (HH:mm)' })
  @IsString()
  availableStartTime: string;

  @ApiProperty({ description: '可结束时间 (HH:mm)' })
  @IsString()
  availableEndTime: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class UpdatePreferenceDto {
  @ApiPropertyOptional({ description: '长者姓名' })
  @IsString()
  @IsOptional()
  elderName?: string;

  @ApiPropertyOptional({ description: '体力等级', enum: ['低', '中', '高'] })
  @IsIn(['低', '中', '高'])
  @IsOptional()
  staminaLevel?: StaminaLevel;

  @ApiPropertyOptional({ description: '休息频率', enum: ['每15分钟', '每30分钟', '每45分钟', '按需'] })
  @IsIn(['每15分钟', '每30分钟', '每45分钟', '按需'])
  @IsOptional()
  restFrequency?: RestFrequency;

  @ApiPropertyOptional({ description: '是否怕晒' })
  @IsBoolean()
  @IsOptional()
  sunSensitive?: boolean;

  @ApiPropertyOptional({ description: '是否怕冷' })
  @IsBoolean()
  @IsOptional()
  coldSensitive?: boolean;

  @ApiPropertyOptional({ description: '可开始时间 (HH:mm)' })
  @IsString()
  @IsOptional()
  availableStartTime?: string;

  @ApiPropertyOptional({ description: '可结束时间 (HH:mm)' })
  @IsString()
  @IsOptional()
  availableEndTime?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}
