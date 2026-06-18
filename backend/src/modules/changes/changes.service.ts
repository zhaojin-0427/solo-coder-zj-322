import { Injectable, NotFoundException } from '@nestjs/common';
import { Change, ChangeType } from './entities/change.entity';
import { CreateChangeDto, UpdateChangeDto } from './dto/change.dto';

const generateId = () => Math.random().toString(36).substring(2, 10);

const mockChanges: Change[] = [
  {
    id: 'change-001',
    planId: 'plan-001',
    elderName: '李爷爷',
    changeType: '提前返回',
    oldValue: '11:00返回',
    newValue: '10:00返回',
    changeReason: '腿脚酸痛，感觉疲劳',
    changeTime: '2024-06-01T09:30:00.000Z',
    impactNotes: '缩短行程约30分钟，跳过美术馆参观环节',
  },
  {
    id: 'change-002',
    planId: 'plan-002',
    elderName: '张奶奶',
    changeType: '更改集合点',
    oldValue: '十六铺码头',
    newValue: '外滩观景台A',
    changeReason: '住所离观景台更近，减少步行到起点距离',
    changeTime: '2024-06-05T06:45:00.000Z',
    impactNotes: '减少起点步行约15分钟，其他路线不变',
  },
  {
    id: 'change-003',
    planId: 'plan-003',
    elderName: '刘奶奶',
    changeType: '其他',
    oldValue: '户外游览',
    newValue: '增加湖心亭室内停留',
    changeReason: '当日气温超过35度，怕热怕晒',
    changeTime: '2024-06-10T11:00:00.000Z',
    impactNotes: '湖心亭多休息20分钟，减少户外逛街时间',
  },
  {
    id: 'change-004',
    planId: 'plan-003',
    elderName: '陈爷爷',
    changeType: '提前返回',
    oldValue: '15:00结束',
    newValue: '13:30返回',
    changeReason: '老街人太多，感到疲惫',
    changeTime: '2024-06-10T12:30:00.000Z',
    impactNotes: '提前离场，后续购物环节取消',
  },
  {
    id: 'change-005',
    planId: 'plan-006',
    elderName: '赵爷爷',
    changeType: '更改集合点',
    oldValue: '景区正门',
    newValue: '停车场入口',
    changeReason: '自驾前往，停车后直接集合更方便',
    changeTime: '2024-06-15T07:20:00.000Z',
    impactNotes: '无负面影响，仅调整集合位置',
  },
  {
    id: 'change-006',
    planId: 'plan-001',
    elderName: '王奶奶',
    changeType: '其他',
    oldValue: '休息时间15分钟',
    newValue: '休息时间25分钟',
    changeReason: '需按时服用降压药，多留缓冲时间',
    changeTime: '2024-06-01T09:00:00.000Z',
    impactNotes: '整体行程顺延10分钟，其他无影响',
  },
  {
    id: 'change-007',
    planId: 'plan-002',
    elderName: '张奶奶',
    changeType: '其他',
    oldValue: '走完全程',
    newValue: '中途乘观光车一段',
    changeReason: '脚底起了水泡，行走疼痛',
    changeTime: '2024-06-05T10:15:00.000Z',
    impactNotes: '陈毅广场到外白渡桥段改乘观光车',
  },
];

@Injectable()
export class ChangesService {
  private changes: Change[] = [...mockChanges];

  findAll(): Change[] {
    return this.changes;
  }

  findOne(id: string): Change {
    const change = this.changes.find((c) => c.id === id);
    if (!change) throw new NotFoundException(`变更 ${id} 不存在`);
    return change;
  }

  findByPlanId(planId: string): Change[] {
    return this.changes.filter((c) => c.planId === planId);
  }

  create(dto: CreateChangeDto): Change {
    const change: Change = {
      id: 'change-' + generateId(),
      planId: dto.planId,
      elderName: dto.elderName,
      changeType: dto.changeType,
      oldValue: dto.oldValue,
      newValue: dto.newValue,
      changeReason: dto.changeReason,
      changeTime: dto.changeTime || new Date().toISOString(),
      impactNotes: dto.impactNotes,
    };
    this.changes.push(change);
    return change;
  }

  update(id: string, dto: UpdateChangeDto): Change {
    const idx = this.changes.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`变更 ${id} 不存在`);
    this.changes[idx] = { ...this.changes[idx], ...dto };
    return this.changes[idx];
  }

  remove(id: string): boolean {
    const idx = this.changes.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`变更 ${id} 不存在`);
    this.changes.splice(idx, 1);
    return true;
  }

  getChangeStats() {
    const typeCount: Record<ChangeType, number> = { 提前返回: 0, 更改集合点: 0, 其他: 0 };
    const nodeCount: Record<string, number> = {};
    for (const c of this.changes) {
      typeCount[c.changeType] = (typeCount[c.changeType] || 0) + 1;
      const key = c.oldValue;
      nodeCount[key] = (nodeCount[key] || 0) + 1;
    }
    const topChangeNodes = Object.entries(nodeCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([node, count]) => ({ node, count }));

    const heatmap = this.changes.map((c) => ({
      planId: c.planId,
      changeType: c.changeType,
      location: c.oldValue,
      count: 1,
      time: c.changeTime,
    }));

    return { total: this.changes.length, typeCount, topChangeNodes, heatmap };
  }
}
