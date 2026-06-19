import { ApiProperty } from '@nestjs/swagger';

export type CheckinType = 'arrival' | 'departure';
export type CheckinStatus = 'pending' | 'checked' | 'missed';
export type CheckinExceptionType = 'late' | 'no_show' | 'early_leave' | null;
export type NotificationStatus = 'pending' | 'notified' | 'confirmed';
export type TimeoutStatus = 'normal' | 'overdue' | 'warning';

export class FamilyContact {
  @ApiProperty({ description: '家属姓名' })
  name: string;

  @ApiProperty({ description: '联系电话' })
  phone: string;

  @ApiProperty({ description: '关系，如儿子/女儿/配偶' })
  relation: string;
}

export class WaypointCheckinConfig {
  @ApiProperty({ description: '配置ID' })
  id: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '关联路线ID（选中的最终路线）' })
  routeId: string;

  @ApiProperty({ description: '途经点索引，从0开始，对应路线waypoints数组' })
  waypointIndex: number;

  @ApiProperty({ description: '途经点名称（冗余存储方便查询）' })
  waypointName: string;

  @ApiProperty({ description: '是否启用到达签到' })
  requireArrivalCheckin: boolean;

  @ApiProperty({ description: '是否启用离开签到' })
  requireDepartureCheckin: boolean;

  @ApiProperty({ description: '预计到达时间 (HH:mm)' })
  expectedArrivalTime: string;

  @ApiProperty({ description: '预计离开时间 (HH:mm)' })
  expectedDepartureTime: string;

  @ApiProperty({ description: '允许延迟到达分钟数' })
  arrivalToleranceMinutes: number;

  @ApiProperty({ description: '允许延迟离开分钟数' })
  departureToleranceMinutes: number;

  @ApiProperty({ type: [FamilyContact], description: '需通知的家属联系人列表' })
  familyContacts: FamilyContact[];

  @ApiProperty({ description: '创建者ID' })
  creatorId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '更新时间' })
  updatedAt: string;
}

export class CheckinRecord {
  @ApiProperty({ description: '签到记录ID' })
  id: string;

  @ApiProperty({ description: '关联配置ID' })
  configId: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '关联路线ID' })
  routeId: string;

  @ApiProperty({ description: '途经点索引' })
  waypointIndex: number;

  @ApiProperty({ description: '途经点名称' })
  waypointName: string;

  @ApiProperty({ description: '签到类型', enum: ['arrival', 'departure'] })
  checkinType: CheckinType;

  @ApiProperty({ description: '签到长辈姓名' })
  elderName: string;

  @ApiProperty({ description: '签到人ID（可以是长辈自己或陪同人）' })
  operatorId: string;

  @ApiProperty({ description: '签到人姓名' })
  operatorName: string;

  @ApiProperty({ description: '签到人身份（长辈/陪同人）' })
  operatorRole: 'elder' | 'companion';

  @ApiProperty({ description: '预计时间 (HH:mm)' })
  expectedTime: string;

  @ApiProperty({ description: '实际签到时间（ISO 8601）' })
  actualCheckinTime: string;

  @ApiProperty({ description: '延迟分钟数（正数表示延迟，负数表示提前）' })
  delayMinutes: number;

  @ApiProperty({ description: '签到状态', enum: ['pending', 'checked', 'missed'] })
  status: CheckinStatus;

  @ApiProperty({ description: '异常类型', enum: ['late', 'no_show', 'early_leave', null], nullable: true })
  exceptionType: CheckinExceptionType;

  @ApiProperty({ description: '异常原因详情' })
  exceptionReason: string;

  @ApiProperty({ description: '超时状态', enum: ['normal', 'overdue', 'warning'] })
  timeoutStatus: TimeoutStatus;
}

export class FamilyNotification {
  @ApiProperty({ description: '通知记录ID' })
  id: string;

  @ApiProperty({ description: '关联签到记录ID（可能为空，如果是超时自动触发）' })
  checkinRecordId: string | null;

  @ApiProperty({ description: '关联配置ID' })
  configId: string;

  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '关联路线ID' })
  routeId: string;

  @ApiProperty({ description: '途经点名称' })
  waypointName: string;

  @ApiProperty({ description: '签到类型（到/离）', enum: ['arrival', 'departure'] })
  checkinType: CheckinType;

  @ApiProperty({ description: '关联长辈姓名' })
  elderName: string;

  @ApiProperty({ description: '触发通知的原因类型', enum: ['late', 'no_show', 'early_leave', 'timeout_arrival', 'timeout_departure', 'multiple_missing'] })
  triggerType: 'late' | 'no_show' | 'early_leave' | 'timeout_arrival' | 'timeout_departure' | 'multiple_missing';

  @ApiProperty({ description: '通知原因详情描述' })
  reason: string;

  @ApiProperty({ type: FamilyContact, description: '接收通知的家属' })
  recipient: FamilyContact;

  @ApiProperty({ description: '通知状态', enum: ['pending', 'notified', 'confirmed'] })
  status: NotificationStatus;

  @ApiProperty({ description: '通知发送时间（若已发送）' })
  notifiedAt: string | null;

  @ApiProperty({ description: '家属确认收到时间' })
  confirmedAt: string | null;

  @ApiProperty({ description: '家属确认备注' })
  confirmNote: string;

  @ApiProperty({ description: '创建时间（触发通知时间）' })
  createdAt: string;
}

export class CheckinSummary {
  @ApiProperty({ description: '配置ID' })
  configId: string;

  @ApiProperty({ description: '途经点名称' })
  waypointName: string;

  @ApiProperty({ description: '途经点索引' })
  waypointIndex: number;

  @ApiProperty({ description: '到达签到总数' })
  totalArrivalExpected: number;

  @ApiProperty({ description: '已到达签到数' })
  arrivalCheckedCount: number;

  @ApiProperty({ description: '到达签到完成率 0-1' })
  arrivalCompletionRate: number;

  @ApiProperty({ description: '离开签到总数' })
  totalDepartureExpected: number;

  @ApiProperty({ description: '已离开签到数' })
  departureCheckedCount: number;

  @ApiProperty({ description: '离开签到完成率 0-1' })
  departureCompletionRate: number;

  @ApiProperty({ description: '总异常数' })
  totalExceptions: number;

  @ApiProperty({ description: '超时未签到数' })
  timeoutCount: number;

  @ApiProperty({ description: '家属通知数' })
  notificationCount: number;

  @ApiProperty({ description: '异常摘要类型列表' })
  exceptionTypes: CheckinExceptionType[];
}
