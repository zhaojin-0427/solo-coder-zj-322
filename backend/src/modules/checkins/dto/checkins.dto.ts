import { ApiProperty, OmitType, PartialType } from '@nestjs/swagger';
import { FamilyContact } from '../entities/checkins.entity';

export class CreateWaypointCheckinConfigDto {
  @ApiProperty({ description: '关联计划ID' })
  planId: string;

  @ApiProperty({ description: '关联路线ID（选中的最终路线）' })
  routeId: string;

  @ApiProperty({ description: '途经点索引，从0开始' })
  waypointIndex: number;

  @ApiProperty({ description: '是否启用到达签到', default: true })
  requireArrivalCheckin?: boolean;

  @ApiProperty({ description: '是否启用离开签到', default: true })
  requireDepartureCheckin?: boolean;

  @ApiProperty({ description: '预计到达时间 (HH:mm)', example: '09:00' })
  expectedArrivalTime: string;

  @ApiProperty({ description: '预计离开时间 (HH:mm)', example: '09:30' })
  expectedDepartureTime: string;

  @ApiProperty({ description: '允许延迟到达分钟数', default: 10 })
  arrivalToleranceMinutes?: number;

  @ApiProperty({ description: '允许延迟离开分钟数', default: 5 })
  departureToleranceMinutes?: number;

  @ApiProperty({ type: [FamilyContact], description: '需通知的家属联系人列表' })
  familyContacts: FamilyContact[];

  @ApiProperty({ description: '创建者ID' })
  creatorId: string;
}

export class UpdateWaypointCheckinConfigDto extends PartialType(
  OmitType(CreateWaypointCheckinConfigDto, ['planId', 'routeId', 'waypointIndex', 'creatorId'] as const),
) {}

export class CreateCheckinRecordDto {
  @ApiProperty({ description: '配置ID' })
  configId: string;

  @ApiProperty({ description: '签到类型', enum: ['arrival', 'departure'] })
  checkinType: 'arrival' | 'departure';

  @ApiProperty({ description: '签到长辈姓名' })
  elderName: string;

  @ApiProperty({ description: '签到人ID' })
  operatorId: string;

  @ApiProperty({ description: '签到人姓名' })
  operatorName: string;

  @ApiProperty({ description: '签到人身份', enum: ['elder', 'companion'] })
  operatorRole: 'elder' | 'companion';

  @ApiProperty({ description: '是否有异常', default: false })
  hasException?: boolean;

  @ApiProperty({ description: '异常类型', enum: ['late', 'no_show', 'early_leave', null], required: false, nullable: true })
  exceptionType?: 'late' | 'no_show' | 'early_leave' | null;

  @ApiProperty({ description: '异常原因详情', required: false })
  exceptionReason?: string;
}

export class RegisterTimeoutDto {
  @ApiProperty({ description: '配置ID' })
  configId: string;

  @ApiProperty({ description: '签到类型', enum: ['arrival', 'departure'] })
  checkinType: 'arrival' | 'departure';

  @ApiProperty({ description: '超时的长辈姓名列表（多人未到时使用）', type: [String] })
  missingElderNames: string[];

  @ApiProperty({ description: '操作人ID（触发超时登记的人）' })
  operatorId: string;

  @ApiProperty({ description: '操作人姓名' })
  operatorName: string;
}

export class UpdateNotificationStatusDto {
  @ApiProperty({ description: '通知状态', enum: ['pending', 'notified', 'confirmed'] })
  status: 'pending' | 'notified' | 'confirmed';

  @ApiProperty({ description: '操作人ID', required: false })
  operatorId?: string;

  @ApiProperty({ description: '确认备注（status为confirmed时可填写）', required: false })
  confirmNote?: string;
}

export class BatchCreateConfigsDto {
  @ApiProperty({ description: '计划ID' })
  planId: string;

  @ApiProperty({ description: '路线ID' })
  routeId: string;

  @ApiProperty({
    type: [Object],
    description: '各节点配置数组',
    example: [{
      waypointIndex: 0,
      requireArrivalCheckin: true,
      requireDepartureCheckin: true,
      expectedArrivalTime: '08:30',
      expectedDepartureTime: '08:45',
      arrivalToleranceMinutes: 10,
      departureToleranceMinutes: 5,
      familyContacts: [{ name: '张儿子', phone: '13800001111', relation: '儿子' }],
    }],
  })
  nodeConfigs: Array<{
    waypointIndex: number;
    requireArrivalCheckin?: boolean;
    requireDepartureCheckin?: boolean;
    expectedArrivalTime: string;
    expectedDepartureTime: string;
    arrivalToleranceMinutes?: number;
    departureToleranceMinutes?: number;
    familyContacts: FamilyContact[];
  }>;

  @ApiProperty({ description: '创建者ID' })
  creatorId: string;
}
