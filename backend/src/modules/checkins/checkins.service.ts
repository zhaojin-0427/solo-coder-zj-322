import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import {
  WaypointCheckinConfig,
  CheckinRecord,
  FamilyNotification,
  CheckinSummary,
  CheckinType,
  CheckinStatus,
  CheckinExceptionType,
  NotificationStatus,
  TimeoutStatus,
  FamilyContact,
} from './entities/checkins.entity';
import {
  CreateWaypointCheckinConfigDto,
  UpdateWaypointCheckinConfigDto,
  CreateCheckinRecordDto,
  RegisterTimeoutDto,
  UpdateNotificationStatusDto,
  BatchCreateConfigsDto,
} from './dto/checkins.dto';
import { PlansService } from '../plans/plans.service';
import { RoutesService } from '../routes/routes.service';
import { PreferencesService } from '../preferences/preferences.service';

const generateId = () => Math.random().toString(36).substring(2, 10);

function parseHHmmToMinutes(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return h * 60 + m;
}

function minutesToHHmm(minutes: number): string {
  const h = Math.floor(minutes / 60) % 24;
  const m = minutes % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
}

const mockConfigs: WaypointCheckinConfig[] = [
  {
    id: 'wcc-001',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 0,
    waypointName: '人民公园正门',
    requireArrivalCheckin: true,
    requireDepartureCheckin: true,
    expectedArrivalTime: '08:30',
    expectedDepartureTime: '08:45',
    arrivalToleranceMinutes: 10,
    departureToleranceMinutes: 5,
    familyContacts: [
      { name: '王小明', phone: '13811110001', relation: '王奶奶儿子' },
      { name: '李大强', phone: '13922220002', relation: '李爷爷儿子' },
    ],
    creatorId: 'user-001',
    createdAt: '2024-05-30T10:00:00.000Z',
    updatedAt: '2024-05-30T10:00:00.000Z',
  },
  {
    id: 'wcc-002',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 1,
    waypointName: '荷花池休息亭',
    requireArrivalCheckin: true,
    requireDepartureCheckin: true,
    expectedArrivalTime: '09:00',
    expectedDepartureTime: '09:20',
    arrivalToleranceMinutes: 15,
    departureToleranceMinutes: 10,
    familyContacts: [
      { name: '王小明', phone: '13811110001', relation: '王奶奶儿子' },
    ],
    creatorId: 'user-001',
    createdAt: '2024-05-30T10:00:00.000Z',
    updatedAt: '2024-05-30T10:00:00.000Z',
  },
  {
    id: 'wcc-003',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 2,
    waypointName: '美术馆前广场',
    requireArrivalCheckin: true,
    requireDepartureCheckin: true,
    expectedArrivalTime: '09:40',
    expectedDepartureTime: '09:55',
    arrivalToleranceMinutes: 10,
    departureToleranceMinutes: 5,
    familyContacts: [
      { name: '李大强', phone: '13922220002', relation: '李爷爷儿子' },
    ],
    creatorId: 'user-001',
    createdAt: '2024-05-30T10:00:00.000Z',
    updatedAt: '2024-05-30T10:00:00.000Z',
  },
  {
    id: 'wcc-004',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 3,
    waypointName: '人民公园北门',
    requireArrivalCheckin: true,
    requireDepartureCheckin: false,
    expectedArrivalTime: '10:15',
    expectedDepartureTime: '10:20',
    arrivalToleranceMinutes: 15,
    departureToleranceMinutes: 5,
    familyContacts: [
      { name: '王小明', phone: '13811110001', relation: '王奶奶儿子' },
      { name: '李大强', phone: '13922220002', relation: '李爷爷儿子' },
    ],
    creatorId: 'user-001',
    createdAt: '2024-05-30T10:00:00.000Z',
    updatedAt: '2024-05-30T10:00:00.000Z',
  },
  {
    id: 'wcc-005',
    planId: 'plan-003',
    routeId: 'route-003',
    waypointIndex: 0,
    waypointName: '豫园商城入口',
    requireArrivalCheckin: true,
    requireDepartureCheckin: true,
    expectedArrivalTime: '09:30',
    expectedDepartureTime: '09:45',
    arrivalToleranceMinutes: 15,
    departureToleranceMinutes: 5,
    familyContacts: [
      { name: '陈晓峰', phone: '13733330003', relation: '陈爷爷孙子' },
      { name: '刘小美', phone: '13644440004', relation: '刘奶奶孙女' },
    ],
    creatorId: 'user-002',
    createdAt: '2024-06-08T16:00:00.000Z',
    updatedAt: '2024-06-08T16:00:00.000Z',
  },
  {
    id: 'wcc-006',
    planId: 'plan-003',
    routeId: 'route-003',
    waypointIndex: 1,
    waypointName: '九曲桥',
    requireArrivalCheckin: true,
    requireDepartureCheckin: true,
    expectedArrivalTime: '10:00',
    expectedDepartureTime: '10:25',
    arrivalToleranceMinutes: 20,
    departureToleranceMinutes: 10,
    familyContacts: [
      { name: '刘小美', phone: '13644440004', relation: '刘奶奶孙女' },
    ],
    creatorId: 'user-002',
    createdAt: '2024-06-08T16:00:00.000Z',
    updatedAt: '2024-06-08T16:00:00.000Z',
  },
];

const baseTime = '2024-06-01T00:00:00.000Z';
function makeActualTime(hoursFromBase: number, extraMinutes = 0): string {
  const d = new Date(baseTime);
  d.setHours(d.getHours() + hoursFromBase);
  d.setMinutes(d.getMinutes() + extraMinutes);
  return d.toISOString();
}

const mockCheckinRecords: CheckinRecord[] = [
  {
    id: 'cr-001',
    configId: 'wcc-001',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 0,
    waypointName: '人民公园正门',
    checkinType: 'arrival',
    elderName: '王奶奶',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '08:30',
    actualCheckinTime: makeActualTime(8, 28),
    delayMinutes: -2,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-002',
    configId: 'wcc-001',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 0,
    waypointName: '人民公园正门',
    checkinType: 'arrival',
    elderName: '李爷爷',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '08:30',
    actualCheckinTime: makeActualTime(8, 42),
    delayMinutes: 12,
    status: 'checked',
    exceptionType: 'late',
    exceptionReason: '早上堵车，公交延误12分钟',
    timeoutStatus: 'warning',
  },
  {
    id: 'cr-003',
    configId: 'wcc-001',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 0,
    waypointName: '人民公园正门',
    checkinType: 'departure',
    elderName: '王奶奶',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '08:45',
    actualCheckinTime: makeActualTime(8, 44),
    delayMinutes: -1,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-004',
    configId: 'wcc-001',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 0,
    waypointName: '人民公园正门',
    checkinType: 'departure',
    elderName: '李爷爷',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '08:45',
    actualCheckinTime: makeActualTime(8, 46),
    delayMinutes: 1,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-005',
    configId: 'wcc-002',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 1,
    waypointName: '荷花池休息亭',
    checkinType: 'arrival',
    elderName: '王奶奶',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '09:00',
    actualCheckinTime: makeActualTime(9, 0),
    delayMinutes: 0,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-006',
    configId: 'wcc-002',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 1,
    waypointName: '荷花池休息亭',
    checkinType: 'arrival',
    elderName: '李爷爷',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '09:00',
    actualCheckinTime: makeActualTime(9, 2),
    delayMinutes: 2,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-007',
    configId: 'wcc-002',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 1,
    waypointName: '荷花池休息亭',
    checkinType: 'departure',
    elderName: '王奶奶',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '09:20',
    actualCheckinTime: makeActualTime(9, 8),
    delayMinutes: -12,
    status: 'checked',
    exceptionType: 'early_leave',
    exceptionReason: '王奶奶感觉疲劳，想提前走',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-008',
    configId: 'wcc-002',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 1,
    waypointName: '荷花池休息亭',
    checkinType: 'departure',
    elderName: '李爷爷',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '09:20',
    actualCheckinTime: makeActualTime(9, 20),
    delayMinutes: 0,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-009',
    configId: 'wcc-003',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 2,
    waypointName: '美术馆前广场',
    checkinType: 'arrival',
    elderName: '李爷爷',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '09:40',
    actualCheckinTime: makeActualTime(9, 40),
    delayMinutes: 0,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
  {
    id: 'cr-010',
    configId: 'wcc-003',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointIndex: 2,
    waypointName: '美术馆前广场',
    checkinType: 'departure',
    elderName: '李爷爷',
    operatorId: 'user-001',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    expectedTime: '09:55',
    actualCheckinTime: makeActualTime(9, 55),
    delayMinutes: 0,
    status: 'checked',
    exceptionType: null,
    exceptionReason: '',
    timeoutStatus: 'normal',
  },
];

const mockNotifications: FamilyNotification[] = [
  {
    id: 'fn-001',
    checkinRecordId: 'cr-002',
    configId: 'wcc-001',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointName: '人民公园正门',
    checkinType: 'arrival',
    elderName: '李爷爷',
    triggerType: 'late',
    reason: '李爷爷在人民公园正门集合点迟到12分钟，原因：早上堵车，公交延误12分钟',
    recipient: { name: '李大强', phone: '13922220002', relation: '李爷爷儿子' },
    status: 'confirmed',
    notifiedAt: makeActualTime(8, 42),
    confirmedAt: makeActualTime(8, 50),
    confirmNote: '已收到，父亲稍后到，辛苦陪同',
    createdAt: makeActualTime(8, 42),
  },
  {
    id: 'fn-002',
    checkinRecordId: 'cr-007',
    configId: 'wcc-002',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointName: '荷花池休息亭',
    checkinType: 'departure',
    elderName: '王奶奶',
    triggerType: 'early_leave',
    reason: '王奶奶在荷花池休息亭提前12分钟离开，原因：感觉疲劳想提前走',
    recipient: { name: '王小明', phone: '13811110001', relation: '王奶奶儿子' },
    status: 'notified',
    notifiedAt: makeActualTime(9, 8),
    confirmedAt: null,
    confirmNote: '',
    createdAt: makeActualTime(9, 8),
  },
  {
    id: 'fn-003',
    checkinRecordId: null,
    configId: 'wcc-003',
    planId: 'plan-001',
    routeId: 'route-001',
    waypointName: '美术馆前广场',
    checkinType: 'arrival',
    elderName: '王奶奶',
    triggerType: 'timeout_arrival',
    reason: '王奶奶未在美术馆前广场的预计到达时间(09:40)后的10分钟宽容期内签到，已超时',
    recipient: { name: '王小明', phone: '13811110001', relation: '王奶奶儿子' },
    status: 'pending',
    notifiedAt: null,
    confirmedAt: null,
    confirmNote: '',
    createdAt: makeActualTime(9, 51),
  },
  {
    id: 'fn-004',
    checkinRecordId: null,
    configId: 'wcc-005',
    planId: 'plan-003',
    routeId: 'route-003',
    waypointName: '豫园商城入口',
    checkinType: 'arrival',
    elderName: '刘奶奶',
    triggerType: 'multiple_missing',
    reason: '豫园商城入口集合点多位长辈未按时到，已登记超时',
    recipient: { name: '刘小美', phone: '13644440004', relation: '刘奶奶孙女' },
    status: 'pending',
    notifiedAt: null,
    confirmedAt: null,
    confirmNote: '',
    createdAt: makeActualTime(9, 46),
  },
];

@Injectable()
export class CheckinsService {
  private configs: WaypointCheckinConfig[] = [...mockConfigs];
  private checkinRecords: CheckinRecord[] = [...mockCheckinRecords];
  private notifications: FamilyNotification[] = [...mockNotifications];

  constructor(
    private readonly plansService: PlansService,
    private readonly routesService: RoutesService,
    private readonly preferencesService: PreferencesService,
  ) {}

  findAllConfigs(planId?: string, routeId?: string): WaypointCheckinConfig[] {
    let result = this.configs;
    if (planId) result = result.filter((c) => c.planId === planId);
    if (routeId) result = result.filter((c) => c.routeId === routeId);
    return result.sort((a, b) => a.waypointIndex - b.waypointIndex);
  }

  findOneConfig(id: string): WaypointCheckinConfig {
    const cfg = this.configs.find((c) => c.id === id);
    if (!cfg) throw new NotFoundException(`签到配置 ${id} 不存在`);
    return cfg;
  }

  createConfig(dto: CreateWaypointCheckinConfigDto): WaypointCheckinConfig {
    const plan = this.plansService.findOne(dto.planId);
    if (plan.status === 'cancelled') {
      throw new BadRequestException('已取消的计划无法创建签到配置');
    }
    const route = this.routesService.findOne(dto.routeId);
    if (route.planId !== dto.planId) {
      throw new BadRequestException('路线与计划不匹配');
    }
    if (dto.waypointIndex < 0 || dto.waypointIndex >= route.waypoints.length) {
      throw new BadRequestException(`途经点索引超出范围 (0 - ${route.waypoints.length - 1})`);
    }
    const exists = this.configs.find(
      (c) => c.planId === dto.planId && c.routeId === dto.routeId && c.waypointIndex === dto.waypointIndex,
    );
    if (exists) {
      throw new BadRequestException('该路线该节点已存在签到配置，请编辑现有配置');
    }
    const waypoint = route.waypoints[dto.waypointIndex];
    const config: WaypointCheckinConfig = {
      id: 'wcc-' + generateId(),
      planId: dto.planId,
      routeId: dto.routeId,
      waypointIndex: dto.waypointIndex,
      waypointName: waypoint.name,
      requireArrivalCheckin: dto.requireArrivalCheckin ?? true,
      requireDepartureCheckin: dto.requireDepartureCheckin ?? true,
      expectedArrivalTime: dto.expectedArrivalTime,
      expectedDepartureTime: dto.expectedDepartureTime,
      arrivalToleranceMinutes: dto.arrivalToleranceMinutes ?? 10,
      departureToleranceMinutes: dto.departureToleranceMinutes ?? 5,
      familyContacts: dto.familyContacts || [],
      creatorId: dto.creatorId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.configs.push(config);
    return config;
  }

  batchCreateConfigs(dto: BatchCreateConfigsDto): WaypointCheckinConfig[] {
    const plan = this.plansService.findOne(dto.planId);
    if (plan.status === 'cancelled') {
      throw new BadRequestException('已取消的计划无法创建签到配置');
    }
    const route = this.routesService.findOne(dto.routeId);
    if (route.planId !== dto.planId) {
      throw new BadRequestException('路线与计划不匹配');
    }
    const created: WaypointCheckinConfig[] = [];
    for (const nc of dto.nodeConfigs) {
      if (nc.waypointIndex < 0 || nc.waypointIndex >= route.waypoints.length) continue;
      const exists = this.configs.find(
        (c) => c.planId === dto.planId && c.routeId === dto.routeId && c.waypointIndex === nc.waypointIndex,
      );
      if (exists) continue;
      const waypoint = route.waypoints[nc.waypointIndex];
      const config: WaypointCheckinConfig = {
        id: 'wcc-' + generateId(),
        planId: dto.planId,
        routeId: dto.routeId,
        waypointIndex: nc.waypointIndex,
        waypointName: waypoint.name,
        requireArrivalCheckin: nc.requireArrivalCheckin ?? true,
        requireDepartureCheckin: nc.requireDepartureCheckin ?? true,
        expectedArrivalTime: nc.expectedArrivalTime,
        expectedDepartureTime: nc.expectedDepartureTime,
        arrivalToleranceMinutes: nc.arrivalToleranceMinutes ?? 10,
        departureToleranceMinutes: nc.departureToleranceMinutes ?? 5,
        familyContacts: nc.familyContacts || [],
        creatorId: dto.creatorId,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.configs.push(config);
      created.push(config);
    }
    return created;
  }

  updateConfig(id: string, dto: UpdateWaypointCheckinConfigDto): WaypointCheckinConfig {
    const idx = this.configs.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`签到配置 ${id} 不存在`);
    this.configs[idx] = { ...this.configs[idx], ...dto, updatedAt: new Date().toISOString() };
    return this.configs[idx];
  }

  removeConfig(id: string): boolean {
    const idx = this.configs.findIndex((c) => c.id === id);
    if (idx === -1) throw new NotFoundException(`签到配置 ${id} 不存在`);
    this.configs.splice(idx, 1);
    return true;
  }

  findAllRecords(planId?: string, configId?: string, elderName?: string, exceptionOnly?: boolean): CheckinRecord[] {
    let result = this.checkinRecords;
    if (planId) result = result.filter((r) => r.planId === planId);
    if (configId) result = result.filter((r) => r.configId === configId);
    if (elderName) result = result.filter((r) => r.elderName === elderName);
    if (exceptionOnly) result = result.filter((r) => r.exceptionType !== null || r.timeoutStatus !== 'normal');
    return result.sort((a, b) => (a.actualCheckinTime > b.actualCheckinTime ? -1 : 1));
  }

  private createNotificationsForCheckin(record: CheckinRecord, config: WaypointCheckinConfig): FamilyNotification[] {
    if (!record.exceptionType && record.timeoutStatus !== 'overdue') return [];
    const created: FamilyNotification[] = [];
    let triggerType: FamilyNotification['triggerType'];
    let reasonPrefix: string;
    if (record.exceptionType === 'late') {
      triggerType = 'late';
      reasonPrefix = `${record.elderName}在${config.waypointName}${record.checkinType === 'arrival' ? '到达' : '离开'}时迟到${record.delayMinutes}分钟`;
    } else if (record.exceptionType === 'no_show') {
      triggerType = 'no_show';
      reasonPrefix = `${record.elderName}未到${config.waypointName}${record.checkinType === 'arrival' ? '达' : '离'}`;
    } else if (record.exceptionType === 'early_leave') {
      triggerType = 'early_leave';
      reasonPrefix = `${record.elderName}在${config.waypointName}提前${Math.abs(record.delayMinutes)}分钟离开`;
    } else if (record.timeoutStatus === 'overdue') {
      triggerType = record.checkinType === 'arrival' ? 'timeout_arrival' : 'timeout_departure';
      reasonPrefix = `${record.elderName}在${config.waypointName}${record.checkinType === 'arrival' ? '到达' : '离开'}超时未签到`;
    } else {
      return [];
    }
    for (const contact of config.familyContacts) {
      const notification: FamilyNotification = {
        id: 'fn-' + generateId(),
        checkinRecordId: record.id,
        configId: config.id,
        planId: record.planId,
        routeId: record.routeId,
        waypointName: config.waypointName,
        checkinType: record.checkinType,
        elderName: record.elderName,
        triggerType,
        reason: record.exceptionReason ? `${reasonPrefix}，原因：${record.exceptionReason}` : reasonPrefix,
        recipient: contact,
        status: 'pending',
        notifiedAt: null,
        confirmedAt: null,
        confirmNote: '',
        createdAt: new Date().toISOString(),
      };
      this.notifications.push(notification);
      created.push(notification);
    }
    return created;
  }

  createCheckinRecord(dto: CreateCheckinRecordDto): { record: CheckinRecord; notifications: FamilyNotification[] } {
    const config = this.findOneConfig(dto.configId);
    const plan = this.plansService.findOne(config.planId);
    if (plan.status === 'cancelled') {
      throw new BadRequestException('已取消的计划无法签到');
    }
    const expectedTime =
      dto.checkinType === 'arrival' ? config.expectedArrivalTime : config.expectedDepartureTime;
    const tolerance =
      dto.checkinType === 'arrival' ? config.arrivalToleranceMinutes : config.departureToleranceMinutes;
    const required = dto.checkinType === 'arrival' ? config.requireArrivalCheckin : config.requireDepartureCheckin;
    if (!required) {
      throw new BadRequestException(`该节点${dto.checkinType === 'arrival' ? '到达' : '离开'}签到未启用`);
    }

    const actualNow = new Date();
    const actualHHmm = `${String(actualNow.getHours()).padStart(2, '0')}:${String(actualNow.getMinutes()).padStart(2, '0')}`;
    const delayMinutes = parseHHmmToMinutes(actualHHmm) - parseHHmmToMinutes(expectedTime);

    let status: CheckinStatus = 'checked';
    let exceptionType: CheckinExceptionType = null;
    let timeoutStatus: TimeoutStatus = 'normal';

    if (dto.hasException) {
      exceptionType = dto.exceptionType || null;
      if (exceptionType === 'late' && delayMinutes <= 0) {
        exceptionType = 'late';
      }
      if (delayMinutes > tolerance) {
        timeoutStatus = 'overdue';
        if (!exceptionType) exceptionType = 'late';
      } else if (delayMinutes > 0) {
        timeoutStatus = 'warning';
        if (!exceptionType && dto.hasException) exceptionType = 'late';
      } else if (delayMinutes < 0 && exceptionType !== 'early_leave' && dto.checkinType === 'departure') {
        if (dto.hasException && !exceptionType) exceptionType = 'early_leave';
      }
    } else {
      if (delayMinutes > tolerance) {
        timeoutStatus = 'overdue';
        exceptionType = 'late';
      } else if (delayMinutes > tolerance * 0.5) {
        timeoutStatus = 'warning';
      } else if (delayMinutes < 0 && dto.checkinType === 'departure' && Math.abs(delayMinutes) > tolerance) {
        timeoutStatus = 'warning';
        exceptionType = 'early_leave';
      }
    }

    const record: CheckinRecord = {
      id: 'cr-' + generateId(),
      configId: config.id,
      planId: config.planId,
      routeId: config.routeId,
      waypointIndex: config.waypointIndex,
      waypointName: config.waypointName,
      checkinType: dto.checkinType,
      elderName: dto.elderName,
      operatorId: dto.operatorId,
      operatorName: dto.operatorName,
      operatorRole: dto.operatorRole,
      expectedTime,
      actualCheckinTime: actualNow.toISOString(),
      delayMinutes,
      status,
      exceptionType,
      exceptionReason: dto.exceptionReason || '',
      timeoutStatus,
    };
    this.checkinRecords.push(record);
    const notifications = this.createNotificationsForCheckin(record, config);
    return { record, notifications };
  }

  registerTimeout(dto: RegisterTimeoutDto): { record: CheckinRecord; notifications: FamilyNotification[] } {
    const config = this.findOneConfig(dto.configId);
    const expectedTime =
      dto.checkinType === 'arrival' ? config.expectedArrivalTime : config.expectedDepartureTime;
    const tolerance =
      dto.checkinType === 'arrival' ? config.arrivalToleranceMinutes : config.departureToleranceMinutes;

    const now = new Date();
    const nowMinutes = now.getHours() * 60 + now.getMinutes();
    const delayMinutes = Math.max(nowMinutes - parseHHmmToMinutes(expectedTime), tolerance + 1);

    const elderName = dto.missingElderNames.join('、');
    const exceptionType: CheckinExceptionType = dto.missingElderNames.length > 1 ? 'no_show' : 'no_show';

    const record: CheckinRecord = {
      id: 'cr-' + generateId(),
      configId: config.id,
      planId: config.planId,
      routeId: config.routeId,
      waypointIndex: config.waypointIndex,
      waypointName: config.waypointName,
      checkinType: dto.checkinType,
      elderName,
      operatorId: dto.operatorId,
      operatorName: dto.operatorName,
      operatorRole: 'companion',
      expectedTime,
      actualCheckinTime: now.toISOString(),
      delayMinutes,
      status: 'missed',
      exceptionType,
      exceptionReason: `${elderName}未按时到达/离开`,
      timeoutStatus: 'overdue',
    };
    this.checkinRecords.push(record);

    const triggerType: FamilyNotification['triggerType'] =
      dto.missingElderNames.length > 1
        ? 'multiple_missing'
        : dto.checkinType === 'arrival'
        ? 'timeout_arrival'
        : 'timeout_departure';
    const created: FamilyNotification[] = [];
    for (const contact of config.familyContacts) {
      const notification: FamilyNotification = {
        id: 'fn-' + generateId(),
        checkinRecordId: record.id,
        configId: config.id,
        planId: record.planId,
        routeId: record.routeId,
        waypointName: config.waypointName,
        checkinType: dto.checkinType,
        elderName,
        triggerType,
        reason:
          dto.missingElderNames.length > 1
            ? `${config.waypointName}${dto.checkinType === 'arrival' ? '到达' : '离开'}时${dto.missingElderNames.length}位长辈未签到：${elderName}`
            : `${elderName}在${config.waypointName}${dto.checkinType === 'arrival' ? '到达' : '离开'}超时未签到（已超过宽容期${tolerance}分钟）`,
        recipient: contact,
        status: 'pending',
        notifiedAt: null,
        confirmedAt: null,
        confirmNote: '',
        createdAt: now.toISOString(),
      };
      this.notifications.push(notification);
      created.push(notification);
    }
    return { record, notifications: created };
  }

  findAllNotifications(planId?: string, status?: NotificationStatus, elderName?: string): FamilyNotification[] {
    let result = this.notifications;
    if (planId) result = result.filter((n) => n.planId === planId);
    if (status) result = result.filter((n) => n.status === status);
    if (elderName) result = result.filter((n) => n.elderName.includes(elderName));
    return result.sort((a, b) => (a.createdAt > b.createdAt ? -1 : 1));
  }

  updateNotificationStatus(id: string, dto: UpdateNotificationStatusDto): FamilyNotification {
    const idx = this.notifications.findIndex((n) => n.id === id);
    if (idx === -1) throw new NotFoundException(`通知记录 ${id} 不存在`);
    const n = this.notifications[idx];
    n.status = dto.status;
    if (dto.status === 'notified' && !n.notifiedAt) {
      n.notifiedAt = new Date().toISOString();
    }
    if (dto.status === 'confirmed') {
      if (!n.notifiedAt) n.notifiedAt = new Date().toISOString();
      n.confirmedAt = new Date().toISOString();
      n.confirmNote = dto.confirmNote || '';
    }
    this.notifications[idx] = { ...n };
    return this.notifications[idx];
  }

  getCheckinSummaryByPlan(planId: string): CheckinSummary[] {
    const configs = this.findAllConfigs(planId);
    const prefs = this.preferencesService.findByPlanId(planId);
    const elderNames = prefs.map((p) => p.elderName);
    const totalExpected = Math.max(elderNames.length, 1);

    return configs.map((cfg) => {
      const recordsOfCfg = this.checkinRecords.filter((r) => r.configId === cfg.id);
      const arrivalRecords = recordsOfCfg.filter((r) => r.checkinType === 'arrival');
      const departureRecords = recordsOfCfg.filter((r) => r.checkinType === 'departure');
      const arrivalExpected = cfg.requireArrivalCheckin ? totalExpected : 0;
      const departureExpected = cfg.requireDepartureCheckin ? totalExpected : 0;
      const arrivalCheckedCount = new Set(arrivalRecords.map((r) => r.elderName)).size;
      const departureCheckedCount = new Set(departureRecords.map((r) => r.elderName)).size;
      const exceptions = recordsOfCfg.filter(
        (r) => r.exceptionType !== null || r.timeoutStatus !== 'normal',
      );
      const timeoutCount = recordsOfCfg.filter((r) => r.timeoutStatus === 'overdue').length;
      const notificationCount = this.notifications.filter((n) => n.configId === cfg.id).length;
      const exceptionTypes = Array.from(new Set(exceptions.map((r) => r.exceptionType).filter(Boolean)));

      return {
        configId: cfg.id,
        waypointName: cfg.waypointName,
        waypointIndex: cfg.waypointIndex,
        totalArrivalExpected: arrivalExpected,
        arrivalCheckedCount,
        arrivalCompletionRate: arrivalExpected > 0 ? Number((arrivalCheckedCount / arrivalExpected).toFixed(2)) : 1,
        totalDepartureExpected: departureExpected,
        departureCheckedCount,
        departureCompletionRate:
          departureExpected > 0 ? Number((departureCheckedCount / departureExpected).toFixed(2)) : 1,
        totalExceptions: exceptions.length,
        timeoutCount,
        notificationCount,
        exceptionTypes: exceptionTypes as CheckinExceptionType[],
      };
    });
  }

  getPlanExceptionSummary(planId: string) {
    const records = this.findAllRecords(planId);
    const exceptions = records.filter(
      (r) => r.exceptionType !== null || r.timeoutStatus !== 'normal',
    );
    const notifications = this.findAllNotifications(planId);
    const pendingNotifications = notifications.filter((n) => n.status === 'pending').length;
    const unconfirmedNotifications = notifications.filter((n) => n.status === 'notified').length;
    const eldersWithExceptions = Array.from(new Set(exceptions.map((r) => r.elderName)));
    return {
      planId,
      totalExceptions: exceptions.length,
      timeoutCount: exceptions.filter((r) => r.timeoutStatus === 'overdue').length,
      lateCount: exceptions.filter((r) => r.exceptionType === 'late').length,
      noShowCount: exceptions.filter((r) => r.exceptionType === 'no_show').length,
      earlyLeaveCount: exceptions.filter((r) => r.exceptionType === 'early_leave').length,
      totalNotifications: notifications.length,
      pendingNotifications,
      unconfirmedNotifications,
      eldersWithExceptions,
    };
  }

  getCheckinStatistics() {
    const allRecords = this.checkinRecords;
    const totalChecked = allRecords.filter((r) => r.status === 'checked').length;
    const totalMissed = allRecords.filter((r) => r.status === 'missed').length;
    const onTimeCount = allRecords.filter(
      (r) => r.status === 'checked' && r.timeoutStatus === 'normal' && r.exceptionType !== 'late' && r.exceptionType !== 'early_leave',
    ).length;
    const onTimeRate = totalChecked > 0 ? Math.round((onTimeCount / totalChecked) * 100) : 0;

    const lateCount = allRecords.filter((r) => r.exceptionType === 'late').length;
    const noShowCount = allRecords.filter((r) => r.exceptionType === 'no_show').length;
    const earlyLeaveCount = allRecords.filter((r) => r.exceptionType === 'early_leave').length;

    const nodeExceptionMap: Record<string, { name: string; count: number; planId: string }> = {};
    for (const r of allRecords) {
      if (r.exceptionType === null && r.timeoutStatus === 'normal') continue;
      const key = `${r.planId}-${r.waypointName}`;
      if (!nodeExceptionMap[key]) {
        nodeExceptionMap[key] = { name: r.waypointName, count: 0, planId: r.planId };
      }
      nodeExceptionMap[key].count++;
    }
    const topTimeoutNodes = Object.values(nodeExceptionMap)
      .sort((a, b) => b.count - a.count)
      .slice(0, 10)
      .map((n, i) => ({ rank: i + 1, ...n }));

    const allNotifications = this.notifications;
    const totalNotifications = allNotifications.length;
    const confirmedCount = allNotifications.filter((n) => n.status === 'confirmed').length;
    const notifiedCount = allNotifications.filter((n) => n.status === 'notified').length;
    const pendingCount = allNotifications.filter((n) => n.status === 'pending').length;
    const notificationConfirmRate =
      totalNotifications > 0 ? Math.round((confirmedCount / totalNotifications) * 100) : 0;
    const notificationSentRate =
      totalNotifications > 0 ? Math.round(((confirmedCount + notifiedCount) / totalNotifications) * 100) : 0;

    const planIds = Array.from(new Set(allRecords.map((r) => r.planId)));
    const exceptionByPlan = planIds.map((pid) => {
      const planRecords = allRecords.filter((r) => r.planId === pid);
      const plan = this.plansService.findAll().find((p) => p.id === pid);
      return {
        planId: pid,
        planTitle: plan?.title || pid,
        totalCheckins: planRecords.length,
        lateCount: planRecords.filter((r) => r.exceptionType === 'late').length,
        noShowCount: planRecords.filter((r) => r.exceptionType === 'no_show').length,
        earlyLeaveCount: planRecords.filter((r) => r.exceptionType === 'early_leave').length,
        timeoutCount: planRecords.filter((r) => r.timeoutStatus === 'overdue').length,
        totalExceptions: planRecords.filter(
          (r) => r.exceptionType !== null || r.timeoutStatus !== 'normal',
        ).length,
      };
    }).sort((a, b) => b.totalExceptions - a.totalExceptions);

    return {
      totalChecked,
      totalMissed,
      onTimeCount,
      onTimeRate,
      lateCount,
      noShowCount,
      earlyLeaveCount,
      topTimeoutNodes,
      totalNotifications,
      confirmedCount,
      notifiedCount,
      pendingCount,
      notificationConfirmRate,
      notificationSentRate,
      exceptionByPlan,
    };
  }
}
