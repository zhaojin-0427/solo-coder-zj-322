import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNumber, IsArray, IsIn, Min, Max, IsOptional, IsBoolean, IsDateString } from 'class-validator';
import { WeatherRiskLevel, AirQualityLevel } from '../entities/health-weather.entity';

export class CreateHealthWeatherConfigDto {
  @ApiProperty({ description: '关联计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '出行日期 (YYYY-MM-DD)' })
  @IsString()
  travelDate: string;

  @ApiProperty({ description: '预计开始时段 (HH:mm)' })
  @IsString()
  startTimeSlot: string;

  @ApiProperty({ description: '预计结束时段 (HH:mm)' })
  @IsString()
  endTimeSlot: string;

  @ApiProperty({ description: '天气风险等级', enum: ['low', 'medium', 'high', 'extreme'] })
  @IsIn(['low', 'medium', 'high', 'extreme'])
  weatherRiskLevel: WeatherRiskLevel;

  @ApiProperty({ description: '天气描述' })
  @IsString()
  weatherDescription: string;

  @ApiProperty({ description: '空气质量等级', enum: ['excellent', 'good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'hazardous'] })
  @IsIn(['excellent', 'good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'hazardous'])
  airQualityLevel: AirQualityLevel;

  @ApiProperty({ description: '空气质量指数 AQI' })
  @IsNumber()
  @Min(0)
  aqiValue: number;

  @ApiProperty({ description: '温度（摄氏度）' })
  @IsNumber()
  temperature: number;

  @ApiProperty({ description: '湿度（百分比）' })
  @IsNumber()
  @Min(0)
  @Max(100)
  humidity: number;

  @ApiProperty({ type: [String], description: '健康提醒项列表' })
  @IsArray()
  @IsOptional()
  healthReminders?: string[];

  @ApiProperty({ description: '创建者ID' })
  @IsString()
  creatorId: string;
}

export class UpdateHealthWeatherConfigDto {
  @ApiPropertyOptional({ description: '出行日期 (YYYY-MM-DD)' })
  @IsString()
  @IsOptional()
  travelDate?: string;

  @ApiPropertyOptional({ description: '预计开始时段 (HH:mm)' })
  @IsString()
  @IsOptional()
  startTimeSlot?: string;

  @ApiPropertyOptional({ description: '预计结束时段 (HH:mm)' })
  @IsString()
  @IsOptional()
  endTimeSlot?: string;

  @ApiPropertyOptional({ description: '天气风险等级', enum: ['low', 'medium', 'high', 'extreme'] })
  @IsIn(['low', 'medium', 'high', 'extreme'])
  @IsOptional()
  weatherRiskLevel?: WeatherRiskLevel;

  @ApiPropertyOptional({ description: '天气描述' })
  @IsString()
  @IsOptional()
  weatherDescription?: string;

  @ApiPropertyOptional({ description: '空气质量等级', enum: ['excellent', 'good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'hazardous'] })
  @IsIn(['excellent', 'good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'hazardous'])
  @IsOptional()
  airQualityLevel?: AirQualityLevel;

  @ApiPropertyOptional({ description: '空气质量指数 AQI' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  aqiValue?: number;

  @ApiPropertyOptional({ description: '温度（摄氏度）' })
  @IsNumber()
  @IsOptional()
  temperature?: number;

  @ApiPropertyOptional({ description: '湿度（百分比）' })
  @IsNumber()
  @Min(0)
  @Max(100)
  @IsOptional()
  humidity?: number;

  @ApiPropertyOptional({ type: [String], description: '健康提醒项列表' })
  @IsArray()
  @IsOptional()
  healthReminders?: string[];
}

export class CreateElderHealthCheckinDto {
  @ApiProperty({ description: '关联计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  @IsString()
  elderName: string;

  @ApiPropertyOptional({ description: '关联偏好ID' })
  @IsString()
  @IsOptional()
  preferenceId?: string;

  @ApiPropertyOptional({ description: '收缩压（mmHg）' })
  @IsNumber()
  @IsOptional()
  systolicBloodPressure?: number;

  @ApiPropertyOptional({ description: '舒张压（mmHg）' })
  @IsNumber()
  @IsOptional()
  diastolicBloodPressure?: number;

  @ApiPropertyOptional({ description: '空腹血糖（mmol/L）' })
  @IsNumber()
  @IsOptional()
  fastingBloodSugar?: number;

  @ApiPropertyOptional({ description: '睡眠质量 1-5' })
  @IsNumber()
  @Min(1)
  @Max(5)
  @IsOptional()
  sleepQuality?: number;

  @ApiPropertyOptional({ description: '睡眠时长（小时）' })
  @IsNumber()
  @Min(0)
  @IsOptional()
  sleepHours?: number;

  @ApiProperty({ description: '是否有关节不适' })
  @IsBoolean()
  hasJointDiscomfort: boolean;

  @ApiPropertyOptional({ description: '关节不适描述' })
  @IsString()
  @IsOptional()
  jointDiscomfortDetail?: string;

  @ApiProperty({ description: '是否已携带必要药物' })
  @IsBoolean()
  hasMedicationReady: boolean;

  @ApiProperty({ type: [String], description: '已携带药物列表' })
  @IsArray()
  @IsOptional()
  medicationsReady?: string[];

  @ApiProperty({ type: [String], description: '长者当天健康顾虑' })
  @IsArray()
  @IsOptional()
  healthConcerns?: string[];

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  notes?: string;
}

export class ConfirmCheckinDto {
  @ApiProperty({ description: '确认人ID' })
  @IsString()
  confirmerId: string;
}
