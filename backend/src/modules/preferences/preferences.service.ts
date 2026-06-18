import { Injectable, NotFoundException } from '@nestjs/common';
import { Preference, StaminaLevel, RestFrequency } from './entities/preference.entity';
import { CreatePreferenceDto, UpdatePreferenceDto } from './dto/preference.dto';

const generateId = () => Math.random().toString(36).substring(2, 10);

const mockPreferences: Preference[] = [
  {
    id: 'pref-001',
    planId: 'plan-001',
    elderName: '王奶奶',
    staminaLevel: '中',
    restFrequency: '每30分钟',
    sunSensitive: true,
    coldSensitive: false,
    availableStartTime: '08:00',
    availableEndTime: '11:00',
    notes: '有高血压，需定时服药',
  },
  {
    id: 'pref-002',
    planId: 'plan-001',
    elderName: '李爷爷',
    staminaLevel: '低',
    restFrequency: '每15分钟',
    sunSensitive: false,
    coldSensitive: true,
    availableStartTime: '08:30',
    availableEndTime: '10:30',
    notes: '腿脚不便，需拐杖辅助',
  },
  {
    id: 'pref-003',
    planId: 'plan-002',
    elderName: '张奶奶',
    staminaLevel: '高',
    restFrequency: '每45分钟',
    sunSensitive: true,
    coldSensitive: false,
    availableStartTime: '07:00',
    availableEndTime: '12:00',
    notes: '喜欢拍照，需多留时间',
  },
  {
    id: 'pref-004',
    planId: 'plan-003',
    elderName: '陈爷爷',
    staminaLevel: '中',
    restFrequency: '按需',
    sunSensitive: false,
    coldSensitive: false,
    availableStartTime: '09:00',
    availableEndTime: '15:00',
    notes: '老街坊，对路线熟悉',
  },
  {
    id: 'pref-005',
    planId: 'plan-003',
    elderName: '刘奶奶',
    staminaLevel: '低',
    restFrequency: '每15分钟',
    sunSensitive: true,
    coldSensitive: true,
    availableStartTime: '10:00',
    availableEndTime: '14:00',
    notes: '皮肤敏感，必须走阴凉处',
  },
  {
    id: 'pref-006',
    planId: 'plan-006',
    elderName: '赵爷爷',
    staminaLevel: '中',
    restFrequency: '每30分钟',
    sunSensitive: false,
    coldSensitive: false,
    availableStartTime: '08:00',
    availableEndTime: '16:00',
    notes: '身体状况良好，可走全程',
  },
  {
    id: 'pref-007',
    planId: 'plan-004',
    elderName: '孙奶奶',
    staminaLevel: '高',
    restFrequency: '每45分钟',
    sunSensitive: false,
    coldSensitive: true,
    availableStartTime: '07:30',
    availableEndTime: '11:30',
    notes: '喜欢花卉，要仔细观赏',
  },
];

@Injectable()
export class PreferencesService {
  private preferences: Preference[] = [...mockPreferences];

  findAll(): Preference[] {
    return this.preferences;
  }

  findOne(id: string): Preference {
    const pref = this.preferences.find((p) => p.id === id);
    if (!pref) throw new NotFoundException(`偏好 ${id} 不存在`);
    return pref;
  }

  findByPlanId(planId: string): Preference[] {
    return this.preferences.filter((p) => p.planId === planId);
  }

  create(dto: CreatePreferenceDto): Preference {
    const pref: Preference = {
      id: 'pref-' + generateId(),
      planId: dto.planId,
      elderName: dto.elderName,
      staminaLevel: dto.staminaLevel,
      restFrequency: dto.restFrequency,
      sunSensitive: dto.sunSensitive,
      coldSensitive: dto.coldSensitive,
      availableStartTime: dto.availableStartTime,
      availableEndTime: dto.availableEndTime,
      notes: dto.notes || '',
    };
    this.preferences.push(pref);
    return pref;
  }

  update(id: string, dto: UpdatePreferenceDto): Preference {
    const idx = this.preferences.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`偏好 ${id} 不存在`);
    this.preferences[idx] = { ...this.preferences[idx], ...dto };
    return this.preferences[idx];
  }

  remove(id: string): boolean {
    const idx = this.preferences.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`偏好 ${id} 不存在`);
    this.preferences.splice(idx, 1);
    return true;
  }

  getStaminaStats() {
    return this.preferences.reduce(
      (acc, p) => {
        acc[p.staminaLevel] = (acc[p.staminaLevel] || 0) + 1;
        return acc;
      },
      {} as Record<StaminaLevel, number>,
    );
  }
}
