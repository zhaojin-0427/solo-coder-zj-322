import { ApiProperty } from '@nestjs/swagger';

export type WeatherRiskLevel = 'low' | 'medium' | 'high' | 'extreme';
export type AirQualityLevel = 'excellent' | 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'hazardous';
export type HealthRiskLevel = 'safe' | 'caution' | 'warning' | 'danger';
export type SuggestionType = 'normal' | 'shortened-route' | 'cancel';

export class HealthWeatherConfig {
  @ApiProperty({ description: '配置ID' })
  id: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '出行日期 (YYYY-MM-DD)' })
  travelDate: string;

  @ApiProperty({ description: '预计开始时段 (HH:mm)' })
  startTimeSlot: string;

  @ApiProperty({ description: '预计结束时段 (HH:mm)' })
  endTimeSlot: string;

  @ApiProperty({ description: '天气风险等级', enum: ['low', 'medium', 'high', 'extreme'] })
  weatherRiskLevel: WeatherRiskLevel;

  @ApiProperty({ description: '天气描述' })
  weatherDescription: string;

  @ApiProperty({ description: '空气质量等级', enum: ['excellent', 'good', 'moderate', 'unhealthy-sensitive', 'unhealthy', 'hazardous'] })
  airQualityLevel: AirQualityLevel;

  @ApiProperty({ description: '空气质量指数 AQI' })
  aqiValue: number;

  @ApiProperty({ description: '温度（摄氏度）' })
  temperature: number;

  @ApiProperty({ description: '湿度（百分比）' })
  humidity: number;

  @ApiProperty({ type: [String], description: '健康提醒项列表' })
  healthReminders: string[];

  @ApiProperty({ description: '创建者ID' })
  creatorId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class ElderHealthCheckin {
  @ApiProperty({ description: '登记ID' })
  id: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  elderName: string;

  @ApiProperty({ description: '关联偏好ID（如果有）' })
  preferenceId?: string;

  @ApiProperty({ description: '收缩压（mmHg）' })
  systolicBloodPressure?: number;

  @ApiProperty({ description: '舒张压（mmHg）' })
  diastolicBloodPressure?: number;

  @ApiProperty({ description: '空腹血糖（mmol/L）' })
  fastingBloodSugar?: number;

  @ApiProperty({ description: '睡眠质量 1-5（1很差，5很好）' })
  sleepQuality?: number;

  @ApiProperty({ description: '睡眠时长（小时）' })
  sleepHours?: number;

  @ApiProperty({ description: '是否有关节不适' })
  hasJointDiscomfort: boolean;

  @ApiProperty({ description: '关节不适描述' })
  jointDiscomfortDetail?: string;

  @ApiProperty({ description: '是否已携带必要药物' })
  hasMedicationReady: boolean;

  @ApiProperty({ type: [String], description: '已携带药物列表' })
  medicationsReady: string[];

  @ApiProperty({ type: [String], description: '长者当天健康顾虑' })
  healthConcerns: string[];

  @ApiProperty({ description: '备注' })
  notes?: string;

  @ApiProperty({ description: '登记时间' })
  checkinTime: string;

  @ApiProperty({ description: '发起人是否已确认此登记' })
  isConfirmed: boolean;

  @ApiProperty({ description: '确认人ID' })
  confirmerId?: string;

  @ApiProperty({ description: '确认时间' })
  confirmedAt?: string;
}

export class ElderTravelAdvice {
  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '长者姓名' })
  elderName: string;

  @ApiProperty({ description: '体力等级', enum: ['低', '中', '高'] })
  staminaLevel: string;

  @ApiProperty({ description: '健康风险等级', enum: ['safe', 'caution', 'warning', 'danger'] })
  healthRiskLevel: HealthRiskLevel;

  @ApiProperty({ description: '综合风险分数 0-100' })
  riskScore: number;

  @ApiProperty({ type: [String], description: '针对该长者的出行建议' })
  suggestions: string[];

  @ApiProperty({ description: '建议类型', enum: ['normal', 'shortened-route', 'cancel'] })
  suggestionType: SuggestionType;

  @ApiProperty({ description: '是否建议改短路线' })
  shouldShortenRoute: boolean;

  @ApiProperty({ description: '建议缩短的步行时间（分钟）' })
  suggestedShortenMinutes?: number;

  @ApiProperty({ type: [String], description: '风险因素标签' })
  riskTags: string[];

  @ApiProperty({ description: '关联健康登记ID' })
  checkinId?: string;

  @ApiProperty({ description: '生成时间' })
  generatedAt: string;
}

export class PlanHealthWeatherSummary {
  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '计划标题' })
  planTitle: string;

  @ApiProperty({ description: '健康天气配置' })
  config?: HealthWeatherConfig;

  @ApiProperty({ description: '应登记长辈人数' })
  expectedCheckinCount: number;

  @ApiProperty({ description: '已登记长辈人数' })
  actualCheckinCount: number;

  @ApiProperty({ description: '已确认登记数' })
  confirmedCheckinCount: number;

  @ApiProperty({ description: '登记率（0-100）' })
  checkinRate: number;

  @ApiProperty({ description: '确认率（0-100）' })
  confirmationRate: number;

  @ApiProperty({ description: '高风险长辈人数' })
  highRiskCount: number;

  @ApiProperty({ description: '中风险长辈人数' })
  mediumRiskCount: number;

  @ApiProperty({ description: '低风险长辈人数' })
  lowRiskCount: number;

  @ApiProperty({ description: '建议改短路线的长辈人数' })
  suggestShortenCount: number;

  @ApiProperty({ description: '是否存在极端风险' })
  hasExtremeRisk: boolean;

  @ApiProperty({ description: '汇总出行建议' })
  summarySuggestions: string[];

  @ApiProperty({ description: '生成时间' })
  generatedAt: string;
}

export class HealthConcernItem {
  @ApiProperty({ description: '顾虑名称' })
  concern: string;

  @ApiProperty({ description: '出现次数' })
  count: number;

  @ApiProperty({ description: '占比（0-100）' })
  percentage: number;
}

export class WeatherRiskChangeItem {
  @ApiProperty({ description: '天气风险等级', enum: ['low', 'medium', 'high', 'extreme'] })
  weatherRiskLevel: WeatherRiskLevel;

  @ApiProperty({ description: '该天气风险下的临时变更次数' })
  changeCount: number;

  @ApiProperty({ description: '该天气风险下的计划数' })
  planCount: number;

  @ApiProperty({ description: '平均变更次数/计划' })
  avgChangesPerPlan: number;
}

export class HealthStatistics {
  @ApiProperty({ description: '总健康天气配置数' })
  totalConfigs: number;

  @ApiProperty({ description: '总登记数' })
  totalCheckins: number;

  @ApiProperty({ description: '整体健康提醒确认率（0-100）' })
  overallConfirmationRate: number;

  @ApiProperty({ description: '高风险长辈总数' })
  totalHighRiskElders: number;

  @ApiProperty({ description: '中风险长辈总数' })
  totalMediumRiskElders: number;

  @ApiProperty({ description: '低风险长辈总数' })
  totalLowRiskElders: number;

  @ApiProperty({ type: [HealthConcernItem], description: '常见健康顾虑排行' })
  topHealthConcerns: HealthConcernItem[];

  @ApiProperty({ type: [WeatherRiskChangeItem], description: '天气风险与临时变更关联分布' })
  weatherRiskChangeDistribution: WeatherRiskChangeItem[];

  @ApiProperty({ description: '建议改短路线累计次数' })
  totalShortenRouteSuggestions: number;

  @ApiProperty({ description: '健康提醒配置覆盖率（配置数/活跃计划数）' })
  configCoverageRate: number;
}
