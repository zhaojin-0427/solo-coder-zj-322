import { Injectable, NotFoundException } from '@nestjs/common';
import { Plan, PlanStatus, ToiletPoint } from './entities/plan.entity';
import { CreatePlanDto, UpdatePlanDto } from './dto/plan.dto';

const generateId = () => Math.random().toString(36).substring(2, 10);

const initialToiletPoints = (destination: string): ToiletPoint[] => [
  { name: `${destination}入口卫生间`, latitude: 31.2304 + Math.random() * 0.01, longitude: 121.4737 + Math.random() * 0.01 },
  { name: `${destination}中段卫生间`, latitude: 31.2304 + Math.random() * 0.02, longitude: 121.4737 + Math.random() * 0.02 },
  { name: `${destination}出口卫生间`, latitude: 31.2304 + Math.random() * 0.03, longitude: 121.4737 + Math.random() * 0.03 },
];

const mockPlans: Plan[] = [
  {
    id: 'plan-001',
    title: '人民公园晨练游',
    destination: '上海人民公园',
    estimatedWalkMinutes: 60,
    stepSlope: 2,
    toiletPoints: initialToiletPoints('人民公园'),
    creatorId: 'user-001',
    createdAt: '2024-06-01T08:00:00.000Z',
    status: 'completed',
  },
  {
    id: 'plan-002',
    title: '外滩滨江漫步',
    destination: '上海外滩',
    estimatedWalkMinutes: 90,
    stepSlope: 1,
    toiletPoints: initialToiletPoints('外滩'),
    creatorId: 'user-001',
    createdAt: '2024-06-05T09:30:00.000Z',
    status: 'completed',
  },
  {
    id: 'plan-003',
    title: '豫园老街探访',
    destination: '上海豫园',
    estimatedWalkMinutes: 120,
    stepSlope: 3,
    toiletPoints: initialToiletPoints('豫园'),
    creatorId: 'user-002',
    createdAt: '2024-06-10T10:00:00.000Z',
    status: 'active',
  },
  {
    id: 'plan-004',
    title: '静安雕塑公园赏花',
    destination: '静安雕塑公园',
    estimatedWalkMinutes: 45,
    stepSlope: 1,
    toiletPoints: initialToiletPoints('静安雕塑公园'),
    creatorId: 'user-002',
    createdAt: '2024-06-12T07:30:00.000Z',
    status: 'draft',
  },
  {
    id: 'plan-005',
    title: '世纪公园环湖走',
    destination: '上海世纪公园',
    estimatedWalkMinutes: 150,
    stepSlope: 2,
    toiletPoints: initialToiletPoints('世纪公园'),
    creatorId: 'user-003',
    createdAt: '2024-06-14T08:15:00.000Z',
    status: 'cancelled',
  },
  {
    id: 'plan-006',
    title: '朱家角古镇一日游',
    destination: '上海朱家角古镇',
    estimatedWalkMinutes: 180,
    stepSlope: 2,
    toiletPoints: initialToiletPoints('朱家角'),
    creatorId: 'user-003',
    createdAt: '2024-06-15T06:45:00.000Z',
    status: 'active',
  },
];

@Injectable()
export class PlansService {
  private plans: Plan[] = [...mockPlans];

  findAll(): Plan[] {
    return this.plans;
  }

  findOne(id: string): Plan {
    const plan = this.plans.find((p) => p.id === id);
    if (!plan) throw new NotFoundException(`计划 ${id} 不存在`);
    return plan;
  }

  create(dto: CreatePlanDto): Plan {
    const plan: Plan = {
      id: 'plan-' + generateId(),
      title: dto.title,
      destination: dto.destination,
      estimatedWalkMinutes: dto.estimatedWalkMinutes,
      stepSlope: dto.stepSlope,
      toiletPoints: dto.toiletPoints || initialToiletPoints(dto.destination),
      creatorId: dto.creatorId,
      createdAt: new Date().toISOString(),
      status: dto.status || 'draft',
    };
    this.plans.push(plan);
    return plan;
  }

  update(id: string, dto: UpdatePlanDto): Plan {
    const idx = this.plans.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`计划 ${id} 不存在`);
    this.plans[idx] = { ...this.plans[idx], ...dto };
    return this.plans[idx];
  }

  remove(id: string): boolean {
    const idx = this.plans.findIndex((p) => p.id === id);
    if (idx === -1) throw new NotFoundException(`计划 ${id} 不存在`);
    this.plans.splice(idx, 1);
    return true;
  }

  getStats() {
    const total = this.plans.length;
    const completed = this.plans.filter((p) => p.status === 'completed').length;
    return { total, completed, plans: this.plans };
  }
}
