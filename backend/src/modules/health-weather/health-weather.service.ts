import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  HealthWeatherConfig,
  ElderHealthCheckin,
  ElderTravelAdvice,
  PlanHealthWeatherSummary,
  HealthStatistics,
  HealthConcernItem,
  WeatherRiskChangeItem,
  WeatherRiskLevel,
  HealthRiskLevel,
  SuggestionType,
} from './entities/health-weather.entity';
import {
  CreateHealthWeatherConfigDto,
  UpdateHealthWeatherConfigDto,
  CreateElderHealthCheckinDto,
  ConfirmCheckinDto,
} from './dto/health-weather.dto';
import { PlansService } from '../plans/plans.service';
import { PreferencesService } from '../preferences/preferences.service';
import { ChangesService } from '../changes/changes.service';
import { StaminaLevel } from '../preferences/entities/preference.entity';

const generateId = () => Math.random().toString(36).substring(2, 10);

const STAMINA_RISK_WEIGHT: Record<StaminaLevel, number> = { '低': 30, '中': 15, '高': 5 };
const WEATHER_RISK_WEIGHT: Record<WeatherRiskLevel, number> = { low: 5, medium: 15, high: 30, extreme: 45 };
const AQI_RISK_WEIGHT: Record<string, number> = {
  excellent: 0, good: 5, moderate: 15, 'unhealthy-sensitive': 25, unhealthy: 35, hazardous: 45,
};
const RISK_LEVEL_THRESHOLDS = { safe: 25, caution: 50, warning: 75, danger: 100 };
const SHORTEN_ROUTE_THRESHOLD = 50;

const mockConfigs: HealthWeatherConfig[] = [
  {
    id: 'hwc-001',
    planId: 'plan-001',
    travelDate: '2024-06-01',
    startTimeSlot: '08:00',
    endTimeSlot: '11:00',
    weatherRiskLevel: 'low',
    weatherDescription: '多云转晴，微风',
    airQualityLevel: 'good',
    aqiValue: 52,
    temperature: 24,
    humidity: 60,
    healthReminders: ['记得带防晒用品', '出发前服用降压药', '携带充足饮用水'],
    creatorId: 'user-001',
    createdAt: '2024-05-30T10:00:00.000Z',
    updatedAt: '2024-05-30T10:00:00.000Z',
  },
  {
    id: 'hwc-002',
    planId: 'plan-002',
    travelDate: '2024-06-05',
    startTimeSlot: '07:00',
    endTimeSlot: '12:00',
    weatherRiskLevel: 'medium',
    weatherDescription: '晴，午后气温偏高',
    airQualityLevel: 'moderate',
    aqiValue: 98,
    temperature: 30,
    humidity: 70,
    healthReminders: ['上午出发避开高温', '携带遮阳伞和藿香正气水', '增加休息频率'],
    creatorId: 'user-001',
    createdAt: '2024-06-03T14:00:00.000Z',
    updatedAt: '2024-06-04T09:20:00.000Z',
  },
  {
    id: 'hwc-003',
    planId: 'plan-003',
    travelDate: '2024-06-10',
    startTimeSlot: '09:00',
    endTimeSlot: '15:00',
    weatherRiskLevel: 'high',
    weatherDescription: '高温橙色预警，最高37度',
    airQualityLevel: 'unhealthy-sensitive',
    aqiValue: 145,
    temperature: 37,
    humidity: 80,
    healthReminders: ['高温天气减少户外时间', '必须携带防暑药品', '优先室内阴凉处活动', '老人佩戴遮阳帽'],
    creatorId: 'user-002',
    createdAt: '2024-06-08T16:00:00.000Z',
    updatedAt: '2024-06-09T20:00:00.000Z',
  },
  {
    id: 'hwc-004',
    planId: 'plan-006',
    travelDate: '2024-06-15',
    startTimeSlot: '08:00',
    endTimeSlot: '16:00',
    weatherRiskLevel: 'medium',
    weatherDescription: '阴有小雨，下午转多云',
    airQualityLevel: 'good',
    aqiValue: 45,
    temperature: 26,
    humidity: 85,
    healthReminders: ['携带雨具', '穿防滑鞋', '雨天路滑注意安全', '备用更换衣物'],
    creatorId: 'user-003',
    createdAt: '2024-06-13T11:00:00.000Z',
    updatedAt: '2024-06-14T18:00:00.000Z',
  },
];

const mockCheckins: ElderHealthCheckin[] = [
  {
    id: 'hci-001',
    planId: 'plan-001',
    elderName: '王奶奶',
    preferenceId: 'pref-001',
    systolicBloodPressure: 145,
    diastolicBloodPressure: 92,
    fastingBloodSugar: 6.8,
    sleepQuality: 4,
    sleepHours: 7,
    hasJointDiscomfort: false,
    hasMedicationReady: true,
    medicationsReady: ['降压药缬沙坦', '阿司匹林肠溶片'],
    healthConcerns: ['天气稍热担心出汗多'],
    notes: '昨晚睡眠不错，今早血压略高，已服药',
    checkinTime: '2024-06-01T06:30:00.000Z',
    isConfirmed: true,
    confirmerId: 'user-001',
    confirmedAt: '2024-06-01T06:45:00.000Z',
  },
  {
    id: 'hci-002',
    planId: 'plan-001',
    elderName: '李爷爷',
    preferenceId: 'pref-002',
    systolicBloodPressure: 128,
    diastolicBloodPressure: 82,
    fastingBloodSugar: 5.6,
    sleepQuality: 2,
    sleepHours: 4.5,
    hasJointDiscomfort: true,
    jointDiscomfortDetail: '右膝盖晨起僵硬，活动后稍有缓解',
    hasMedicationReady: true,
    medicationsReady: ['骨关节炎药膏', '止痛药备用'],
    healthConcerns: ['膝盖怕走路多疼痛', '担心台阶多'],
    notes: '昨晚失眠，膝盖不适但可坚持',
    checkinTime: '2024-06-01T06:40:00.000Z',
    isConfirmed: true,
    confirmerId: 'user-001',
    confirmedAt: '2024-06-01T06:50:00.000Z',
  },
  {
    id: 'hci-003',
    planId: 'plan-002',
    elderName: '张奶奶',
    preferenceId: 'pref-003',
    systolicBloodPressure: 118,
    diastolicBloodPressure: 76,
    fastingBloodSugar: 5.2,
    sleepQuality: 5,
    sleepHours: 8,
    hasJointDiscomfort: false,
    hasMedicationReady: true,
    medicationsReady: ['复合维生素'],
    healthConcerns: [],
    notes: '身体状况良好，准备充分',
    checkinTime: '2024-06-05T05:45:00.000Z',
    isConfirmed: true,
    confirmerId: 'user-001',
    confirmedAt: '2024-06-05T05:55:00.000Z',
  },
  {
    id: 'hci-004',
    planId: 'plan-003',
    elderName: '陈爷爷',
    preferenceId: 'pref-004',
    systolicBloodPressure: 152,
    diastolicBloodPressure: 96,
    fastingBloodSugar: 7.9,
    sleepQuality: 3,
    sleepHours: 5.5,
    hasJointDiscomfort: true,
    jointDiscomfortDetail: '双足后跟疼痛，穿软垫鞋',
    hasMedicationReady: false,
    medicationsReady: ['降压药'],
    healthConcerns: ['高温担心中暑', '担心忘记吃药'],
    notes: '今早血压偏高，降糖药好像漏在桌上了',
    checkinTime: '2024-06-10T07:20:00.000Z',
    isConfirmed: false,
  },
  {
    id: 'hci-005',
    planId: 'plan-003',
    elderName: '刘奶奶',
    preferenceId: 'pref-005',
    systolicBloodPressure: 168,
    diastolicBloodPressure: 104,
    fastingBloodSugar: 9.2,
    sleepQuality: 1,
    sleepHours: 3.5,
    hasJointDiscomfort: true,
    jointDiscomfortDetail: '全身关节酸痛，天气热更难受',
    hasMedicationReady: true,
    medicationsReady: ['降压药', '降糖药二甲双胍', '外用激素软膏'],
    healthConcerns: ['皮肤怕晒起红疹', '高温怕头晕', '怕走路太多体力不支'],
    notes: '非常担心今天的高温天气，昨晚几乎没睡好',
    checkinTime: '2024-06-10T07:10:00.000Z',
    isConfirmed: false,
  },
  {
    id: 'hci-006',
    planId: 'plan-006',
    elderName: '赵爷爷',
    preferenceId: 'pref-006',
    systolicBloodPressure: 132,
    diastolicBloodPressure: 84,
    fastingBloodSugar: 6.1,
    sleepQuality: 4,
    sleepHours: 7.5,
    hasJointDiscomfort: false,
    hasMedicationReady: true,
    medicationsReady: ['日常保健药'],
    healthConcerns: ['雨天担心滑倒', '景区石板路怕积水'],
    notes: '整体状态不错，带了雨具和防滑鞋套',
    checkinTime: '2024-06-15T06:30:00.000Z',
    isConfirmed: true,
    confirmerId: 'user-003',
    confirmedAt: '2024-06-15T06:40:00.000Z',
  },
];

@Injectable()
export class HealthWeatherService {
  private configs: HealthWeatherConfig[] = [...mockConfigs];
  private checkins: ElderHealthCheckin[] = [...mockCheckins];

  constructor(
    private readonly plansService: PlansService,
    private readonly preferencesService: PreferencesService,
    private readonly changesService: ChangesService,
  ) {}

  findAllConfigs(): HealthWeatherConfig[] {
    return this.configs;
  }

  findConfigByPlanId(planId: string): HealthWeatherConfig | undefined {
    return this.configs.find((c) => c.planId === planId);
  }

  findOneConfig(id: string): HealthWeatherConfig {
    const config = this.configs.find((c) => c.id === id);
    if (!config) throw new NotFoundException(`健康天气配置 ${id} 不存在`);
    return config;
  }

  createConfig(dto: CreateHealthWeatherConfigDto): HealthWeatherConfig {
    try {
      this.plansService.findOne(dto.planId);
    } catch (_e) {
      throw new BadRequestException(`关联计划 ${dto.planId} 不存在`);
    }
    const existing = this.configs.findIndex((c) => c.planId === dto.planId);
    if (existing !== -1) {
      throw new BadRequestException(`计划 ${dto.planId} 已有健康天气配置，请使用更新接口`);
    }
    const now = new Date().toISOString();
    const config: HealthWeatherConfig = {
      id: 'hwc-' + generateId(),
      planId: dto.planId,
      travelDate: dto.travelDate,
      startTimeSlot: dto.startTimeSlot,
      endTimeSlot: dto.endTimeSlot,
      weatherRiskLevel: dto.weatherRiskLevel,
      weatherDescription: dto.weatherDescription,
      airQualityLevel: dto.airQualityLevel,
      aqiValue: dto.aqiValue,
      temperature: dto.temperature,
      humidity: dto.humidity,
      healthReminders: dto.healthReminders || [],
      creatorId: dto.creatorId,
      createdAt: now,
      updatedAt: now,
    };
    this.configs.push(config);
    return config;
  }

  updateConfig(id: string, dto: UpdateHealthWeatherConfigDto): HealthWeatherConfig {
    const idx = this.configs.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`健康天气配置 ${id} 不存在`);
    this.configs[idx] = { ...this.configs[idx], ...dto, updatedAt: new Date().toISOString() };
    return this.configs[idx];
  }

  removeConfig(id: string): boolean {
    const idx = this.configs.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`健康天气配置 ${id} 不存在`);
    this.configs.splice(idx, 1);
    return true;
  }

  findAllCheckins(): ElderHealthCheckin[] {
    return this.checkins;
  }

  findCheckinsByPlanId(planId: string): ElderHealthCheckin[] {
    return this.checkins.filter((c) => c.planId === planId);
  }

  findOneCheckin(id: string): ElderHealthCheckin {
    const checkin = this.checkins.find((c) => c.id === id);
    if (!checkin) throw new NotFoundException(`健康登记 ${id} 不存在`);
    return checkin;
  }

  createCheckin(dto: CreateElderHealthCheckinDto): ElderHealthCheckin {
    const checkin: ElderHealthCheckin = {
      id: 'hci-' + generateId(),
      planId: dto.planId,
      elderName: dto.elderName,
      preferenceId: dto.preferenceId,
      systolicBloodPressure: dto.systolicBloodPressure,
      diastolicBloodPressure: dto.diastolicBloodPressure,
      fastingBloodSugar: dto.fastingBloodSugar,
      sleepQuality: dto.sleepQuality,
      sleepHours: dto.sleepHours,
      hasJointDiscomfort: dto.hasJointDiscomfort,
      jointDiscomfortDetail: dto.jointDiscomfortDetail,
      hasMedicationReady: dto.hasMedicationReady,
      medicationsReady: dto.medicationsReady || [],
      healthConcerns: dto.healthConcerns || [],
      notes: dto.notes,
      checkinTime: new Date().toISOString(),
      isConfirmed: false,
    };
    this.checkins.push(checkin);
    return checkin;
  }

  confirmCheckin(id: string, dto: ConfirmCheckinDto): ElderHealthCheckin {
    const idx = this.checkins.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`健康登记 ${id} 不存在`);
    this.checkins[idx] = {
      ...this.checkins[idx],
      isConfirmed: true,
      confirmerId: dto.confirmerId,
      confirmedAt: new Date().toISOString(),
    };
    return this.checkins[idx];
  }

  confirmBatchCheckins(planId: string, dto: ConfirmCheckinDto): ElderHealthCheckin[] {
    const planCheckins = this.checkins.filter((c) => c.planId === planId && !c.isConfirmed);
    const now = new Date().toISOString();
    planCheckins.forEach((c) => {
      c.isConfirmed = true;
      c.confirmerId = dto.confirmerId;
      c.confirmedAt = now;
    });
    return this.findCheckinsByPlanId(planId);
  }

  removeCheckin(id: string): boolean {
    const idx = this.checkins.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`健康登记 ${id} 不存在`);
    this.checkins.splice(idx, 1);
    return true;
  }

  private calculateHealthRiskFromCheckin(checkin: ElderHealthCheckin): number {
    let risk = 0;
    if (checkin.systolicBloodPressure !== undefined) {
      const sys = checkin.systolicBloodPressure;
      if (sys >= 160) risk += 25;
      else if (sys >= 140) risk += 15;
      else if (sys >= 130) risk += 8;
    }
    if (checkin.diastolicBloodPressure !== undefined) {
      const dia = checkin.diastolicBloodPressure;
      if (dia >= 100) risk += 15;
      else if (dia >= 90) risk += 8;
    }
    if (checkin.fastingBloodSugar !== undefined) {
      const bs = checkin.fastingBloodSugar;
      if (bs >= 9) risk += 20;
      else if (bs >= 7) risk += 12;
      else if (bs >= 6.1) risk += 5;
    }
    if (checkin.sleepQuality !== undefined) {
      if (checkin.sleepQuality <= 1) risk += 15;
      else if (checkin.sleepQuality <= 2) risk += 10;
      else if (checkin.sleepQuality <= 3) risk += 5;
    }
    if (checkin.sleepHours !== undefined) {
      if (checkin.sleepHours < 4) risk += 12;
      else if (checkin.sleepHours < 5) risk += 8;
      else if (checkin.sleepHours < 6) risk += 4;
    }
    if (checkin.hasJointDiscomfort) risk += 10;
    if (!checkin.hasMedicationReady) risk += 20;
    if (checkin.healthConcerns && checkin.healthConcerns.length > 0) {
      risk += Math.min(checkin.healthConcerns.length * 5, 20);
    }
    return Math.min(risk, 70);
  }

  private generateAdviceForElder(
    elderName: string,
    planId: string,
    stamina: StaminaLevel,
    config: HealthWeatherConfig | undefined,
    checkin: ElderHealthCheckin | undefined,
    planWalkMinutes: number,
    planSlope: number,
  ): ElderTravelAdvice {
    const riskTags: string[] = [];
    const suggestions: string[] = [];
    let totalRisk = 0;

    const staminaRisk = STAMINA_RISK_WEIGHT[stamina];
    totalRisk += staminaRisk;
    if (stamina === '低') {
      riskTags.push('体力较弱');
      suggestions.push(`体力等级为${stamina}，建议控制步行节奏，每15分钟安排休息`);
    } else if (stamina === '中') {
      suggestions.push(`体力等级为${stamina}，按正常节奏行进即可，注意及时休息`);
    } else {
      suggestions.push(`体力等级为${stamina}，可适当加快节奏，但仍需照顾同行长者`);
    }

    let weatherRisk = 0;
    if (config) {
      weatherRisk = WEATHER_RISK_WEIGHT[config.weatherRiskLevel];
      totalRisk += weatherRisk;
      if (config.weatherRiskLevel === 'extreme') {
        riskTags.push('极端天气');
        suggestions.push('极端天气警告：强烈建议取消或大幅缩短出行计划');
      } else if (config.weatherRiskLevel === 'high') {
        riskTags.push('天气风险高');
        if (config.temperature >= 35) {
          riskTags.push('高温');
          suggestions.push(`当日最高温度${config.temperature}度，务必携带防暑药品，增加阴凉处休息时间`);
        }
        if (config.aqiValue >= 150) {
          riskTags.push('空气污染');
          suggestions.push(`AQI=${config.aqiValue}，建议佩戴口罩减少户外活动`);
        }
      } else if (config.weatherRiskLevel === 'medium') {
        if (config.temperature >= 30) suggestions.push(`气温偏高(${config.temperature}°C)，注意补水防晒`);
        if (config.humidity >= 80) suggestions.push(`湿度较大(${config.humidity}%)，体感闷热，适当减少运动量`);
      }
      totalRisk += AQI_RISK_WEIGHT[config.airQualityLevel];
      if (config.airQualityLevel === 'unhealthy' || config.airQualityLevel === 'hazardous') {
        riskTags.push('空气质量差');
        suggestions.push(`空气质量${config.airQualityLevel}，建议佩戴防护口罩`);
      }
    }

    let healthRisk = 0;
    if (checkin) {
      healthRisk = this.calculateHealthRiskFromCheckin(checkin);
      totalRisk += healthRisk;

      if (checkin.systolicBloodPressure !== undefined) {
        if (checkin.systolicBloodPressure >= 160) {
          riskTags.push('血压严重偏高');
          suggestions.push(`收缩压${checkin.systolicBloodPressure}mmHg偏高，活动量减半，随时监测血压`);
        } else if (checkin.systolicBloodPressure >= 140) {
          riskTags.push('血压偏高');
          suggestions.push(`收缩压${checkin.systolicBloodPressure}mmHg略高，避免剧烈运动，按时服药`);
        }
      }
      if (checkin.fastingBloodSugar !== undefined) {
        if (checkin.fastingBloodSugar >= 9) {
          riskTags.push('血糖过高');
          suggestions.push(`空腹血糖${checkin.fastingBloodSugar}mmol/L偏高，避免高糖饮食，随身携带糖果防低血糖`);
        } else if (checkin.fastingBloodSugar >= 7) {
          riskTags.push('血糖偏高');
          suggestions.push(`空腹血糖${checkin.fastingBloodSugar}mmol/L，注意控制饮食摄入`);
        }
      }
      if (checkin.sleepQuality !== undefined && checkin.sleepQuality <= 2) {
        riskTags.push('睡眠不足');
        suggestions.push(`昨晚睡眠质量差，建议减少整体活动量，多安排静坐休息`);
      }
      if (checkin.hasJointDiscomfort) {
        riskTags.push('关节不适');
        suggestions.push('关节不适，选择平缓路线少走台阶，必要时携带拐杖或轮椅');
      }
      if (!checkin.hasMedicationReady) {
        riskTags.push('药物未备齐');
        suggestions.push('必要药物尚未备齐，请务必出发前确认或回家取药');
      }
      if (checkin.healthConcerns && checkin.healthConcerns.length > 0) {
        suggestions.push(`本人顾虑：${checkin.healthConcerns.join('；')}`);
      }
    } else {
      totalRisk += 15;
      riskTags.push('未完成健康登记');
      suggestions.push('尚未完成出行前健康登记，请尽快补充登记以便评估风险');
    }

    const difficultyFactor = (planWalkMinutes / 60) * planSlope;
    const difficultyRisk = Math.min(Math.round(difficultyFactor * 3), 25);
    totalRisk += difficultyRisk;
    if (planWalkMinutes >= 120) {
      suggestions.push(`路线预计步行${planWalkMinutes}分钟，行程较长，建议预留缓冲时间`);
    }
    if (planSlope >= 4) {
      riskTags.push('路线坡度大');
      suggestions.push(`路线坡度等级${planSlope}较高，对体力和关节要求大，考虑改短或选轻松版路线`);
    }

    totalRisk = Math.min(Math.max(totalRisk, 0), 100);

    let healthRiskLevel: HealthRiskLevel;
    if (totalRisk <= RISK_LEVEL_THRESHOLDS.safe) healthRiskLevel = 'safe';
    else if (totalRisk <= RISK_LEVEL_THRESHOLDS.caution) healthRiskLevel = 'caution';
    else if (totalRisk <= RISK_LEVEL_THRESHOLDS.warning) healthRiskLevel = 'warning';
    else healthRiskLevel = 'danger';

    let suggestionType: SuggestionType = 'normal';
    let shouldShortenRoute = false;
    let suggestedShortenMinutes: number | undefined;

    if (healthRiskLevel === 'danger') {
      suggestionType = config?.weatherRiskLevel === 'extreme' ? 'cancel' : 'shortened-route';
      shouldShortenRoute = true;
      suggestedShortenMinutes = Math.max(Math.round(planWalkMinutes * 0.5), 30);
      suggestions.push(`综合风险极高，强烈建议将路线缩短${suggestedShortenMinutes}分钟以上，或考虑改期出行`);
    } else if (healthRiskLevel === 'warning') {
      suggestionType = 'shortened-route';
      shouldShortenRoute = true;
      suggestedShortenMinutes = Math.max(Math.round(planWalkMinutes * 0.3), 15);
      suggestions.push(`综合风险较高，建议将路线缩短约${suggestedShortenMinutes}分钟，减少户外活动`);
    } else if (totalRisk >= SHORTEN_ROUTE_THRESHOLD && (stamina === '低' || planWalkMinutes >= 90)) {
      shouldShortenRoute = true;
      suggestedShortenMinutes = Math.round(planWalkMinutes * 0.2);
      suggestionType = 'shortened-route';
      suggestions.push(`建议将路线缩短${suggestedShortenMinutes}分钟以降低疲劳风险`);
    }

    if (config && config.healthReminders && config.healthReminders.length > 0) {
      suggestions.push(...config.healthReminders.map((h) => `[通用提醒] ${h}`));
    }

    return {
      planId,
      elderName,
      staminaLevel: stamina,
      healthRiskLevel,
      riskScore: totalRisk,
      suggestions,
      suggestionType,
      shouldShortenRoute,
      suggestedShortenMinutes,
      riskTags,
      checkinId: checkin?.id,
      generatedAt: new Date().toISOString(),
    };
  }

  generateAdviceByPlanId(planId: string): ElderTravelAdvice[] {
    const plan = this.plansService.findOne(planId);
    const prefs = this.preferencesService.findByPlanId(planId);
    const config = this.findConfigByPlanId(planId);
    const checkins = this.findCheckinsByPlanId(planId);

    if (prefs.length === 0) {
      throw new BadRequestException(`计划 ${planId} 还没有设置同行长者偏好，无法生成建议`);
    }

    return prefs.map((pref) => {
      const checkin = checkins.find((c) => c.preferenceId === pref.id) || checkins.find((c) => c.elderName === pref.elderName);
      return this.generateAdviceForElder(
        pref.elderName,
        planId,
        pref.staminaLevel,
        config,
        checkin,
        plan.estimatedWalkMinutes,
        plan.stepSlope,
      );
    });
  }

  getPlanSummary(planId: string): PlanHealthWeatherSummary {
    const plan = this.plansService.findOne(planId);
    const config = this.findConfigByPlanId(planId);
    const prefs = this.preferencesService.findByPlanId(planId);
    const checkins = this.findCheckinsByPlanId(planId);
    let advices: ElderTravelAdvice[] = [];
    try {
      advices = this.generateAdviceByPlanId(planId);
    } catch (_e) { /* ignore if no prefs */ }

    const expectedCount = prefs.length > 0 ? prefs.length : checkins.length;
    const actualCount = checkins.length;
    const confirmedCount = checkins.filter((c) => c.isConfirmed).length;
    const checkinRate = expectedCount > 0 ? Math.round((actualCount / expectedCount) * 100) : 0;
    const confirmationRate = actualCount > 0 ? Math.round((confirmedCount / actualCount) * 100) : 0;

    const highRiskCount = advices.filter((a) => a.healthRiskLevel === 'warning' || a.healthRiskLevel === 'danger').length;
    const mediumRiskCount = advices.filter((a) => a.healthRiskLevel === 'caution').length;
    const lowRiskCount = advices.filter((a) => a.healthRiskLevel === 'safe').length;
    const suggestShortenCount = advices.filter((a) => a.shouldShortenRoute).length;
    const hasExtremeRisk = advices.some((a) => a.healthRiskLevel === 'danger');

    const summarySuggestions: string[] = [];
    if (hasExtremeRisk) {
      summarySuggestions.push('⚠️ 存在极高风险长辈，需重点关注或考虑改期');
    }
    if (suggestShortenCount > 0) {
      summarySuggestions.push(`共有 ${suggestShortenCount} 位长辈建议改短路线，建议选择轻松版路线`);
    }
    if (checkinRate < 100) {
      summarySuggestions.push(`登记率仅 ${checkinRate}%，请催促未登记的长辈完成健康登记`);
    }
    if (confirmationRate < 100 && actualCount > 0) {
      summarySuggestions.push(`确认率 ${confirmationRate}%，请发起人逐一确认登记信息`);
    }
    if (config && advices.length > 0) {
      const avgRisk = Math.round(advices.reduce((s, a) => s + a.riskScore, 0) / advices.length);
      summarySuggestions.push(`本计划群体平均风险分数：${avgRisk}分`);
    }

    return {
      planId,
      planTitle: plan.title,
      config,
      expectedCheckinCount: expectedCount,
      actualCheckinCount: actualCount,
      confirmedCheckinCount: confirmedCount,
      checkinRate,
      confirmationRate,
      highRiskCount,
      mediumRiskCount,
      lowRiskCount,
      suggestShortenCount,
      hasExtremeRisk,
      summarySuggestions,
      generatedAt: new Date().toISOString(),
    };
  }

  getAllPlanSummaries(): PlanHealthWeatherSummary[] {
    const plans = this.plansService.findAll();
    return plans.map((p) => this.getPlanSummary(p.id));
  }

  private getTopHealthConcerns(): HealthConcernItem[] {
    const concernCount: Record<string, number> = {};
    for (const c of this.checkins) {
      if (c.healthConcerns && c.healthConcerns.length > 0) {
        for (const concern of c.healthConcerns) {
          const key = concern.trim();
          if (key) concernCount[key] = (concernCount[key] || 0) + 1;
        }
      }
      if (c.hasJointDiscomfort) {
        const k = '关节不适';
        concernCount[k] = (concernCount[k] || 0) + 1;
      }
      if (!c.hasMedicationReady) {
        const k = '药物未备齐';
        concernCount[k] = (concernCount[k] || 0) + 1;
      }
      if (c.sleepQuality !== undefined && c.sleepQuality <= 2) {
        const k = '睡眠质量差';
        concernCount[k] = (concernCount[k] || 0) + 1;
      }
    }
    const total = Object.values(concernCount).reduce((s, v) => s + v, 0);
    return Object.entries(concernCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([concern, count]) => ({
        concern,
        count,
        percentage: total > 0 ? Math.round((count / total) * 100) : 0,
      }));
  }

  private getWeatherRiskChangeDistribution(): WeatherRiskChangeItem[] {
    const levels: WeatherRiskLevel[] = ['low', 'medium', 'high', 'extreme'];
    const allChanges = this.changesService.findAll();
    const result: WeatherRiskChangeItem[] = [];

    for (const level of levels) {
      const configsOfLevel = this.configs.filter((c) => c.weatherRiskLevel === level);
      const planIdsOfLevel = configsOfLevel.map((c) => c.planId);
      const changesOfLevel = allChanges.filter((c) => planIdsOfLevel.includes(c.planId));
      const planCount = planIdsOfLevel.length;
      result.push({
        weatherRiskLevel: level,
        changeCount: changesOfLevel.length,
        planCount,
        avgChangesPerPlan: planCount > 0 ? Number((changesOfLevel.length / planCount).toFixed(2)) : 0,
      });
    }
    return result;
  }

  getHealthStatistics(): HealthStatistics {
    const totalConfigs = this.configs.length;
    const totalCheckins = this.checkins.length;
    const confirmed = this.checkins.filter((c) => c.isConfirmed).length;
    const overallConfirmationRate = totalCheckins > 0 ? Math.round((confirmed / totalCheckins) * 100) : 0;

    let totalHighRisk = 0;
    let totalMediumRisk = 0;
    let totalLowRisk = 0;
    let totalShorten = 0;

    const plans = this.plansService.findAll();
    for (const plan of plans) {
      try {
        const advices = this.generateAdviceByPlanId(plan.id);
        totalHighRisk += advices.filter((a) => a.healthRiskLevel === 'warning' || a.healthRiskLevel === 'danger').length;
        totalMediumRisk += advices.filter((a) => a.healthRiskLevel === 'caution').length;
        totalLowRisk += advices.filter((a) => a.healthRiskLevel === 'safe').length;
        totalShorten += advices.filter((a) => a.shouldShortenRoute).length;
      } catch (_e) { /* ignore */ }
    }

    const activePlansCount = plans.filter((p) => p.status === 'active' || p.status === 'completed').length;
    const configCoverageRate = activePlansCount > 0 ? Math.round((totalConfigs / activePlansCount) * 100) : 0;

    return {
      totalConfigs,
      totalCheckins,
      overallConfirmationRate,
      totalHighRiskElders: totalHighRisk,
      totalMediumRiskElders: totalMediumRisk,
      totalLowRiskElders: totalLowRisk,
      topHealthConcerns: this.getTopHealthConcerns(),
      weatherRiskChangeDistribution: this.getWeatherRiskChangeDistribution(),
      totalShortenRouteSuggestions: totalShorten,
      configCoverageRate,
    };
  }

  getUnconfirmedElders(planId?: string): Array<{ planId: string; planTitle: string; elderName: string; checkinTime?: string }> {
    const unconfirmed = planId
      ? this.checkins.filter((c) => c.planId === planId && !c.isConfirmed)
      : this.checkins.filter((c) => !c.isConfirmed);

    const plans = this.plansService.findAll();
    const planTitleMap: Record<string, string> = {};
    plans.forEach((p) => { planTitleMap[p.id] = p.title; });

    const unconfirmedPrefs: Array<{ planId: string; planTitle: string; elderName: string; checkinTime?: string }> = [];

    for (const c of unconfirmed) {
      unconfirmedPrefs.push({
        planId: c.planId,
        planTitle: planTitleMap[c.planId] || c.planId,
        elderName: c.elderName,
        checkinTime: c.checkinTime,
      });
    }

    const plansWithPrefs = planId ? [planId] : plans.map((p) => p.id);
    for (const pid of plansWithPrefs) {
      const prefs = this.preferencesService.findByPlanId(pid);
      const pCheckins = this.checkins.filter((c) => c.planId === pid);
      for (const pref of prefs) {
        const hasCheckin = pCheckins.some((c) => c.preferenceId === pref.id || c.elderName === pref.elderName);
        if (!hasCheckin) {
          unconfirmedPrefs.push({
            planId: pid,
            planTitle: planTitleMap[pid] || pid,
            elderName: pref.elderName + '（未登记）',
          });
        }
      }
    }
    return unconfirmedPrefs;
  }
}
