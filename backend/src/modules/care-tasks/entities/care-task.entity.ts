import { ApiProperty } from '@nestjs/swagger';

export type CareTaskType =
  | 'medication_reminder'
  | 'water_supply'
  | 'sun_protection'
  | 'cold_protection'
  | 'wheelchair_assist'
  | 'cane_assist'
  | 'emergency_contact'
  | 'meeting_point_check'
  | 'other';

export type CareTaskPriority = 'low' | 'medium' | 'high' | 'critical';

export type CareTaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed';

export type AssigneeRole = 'elder' | 'companion';

export class CareTask {
  @ApiProperty({ description: '任务ID' })
  id: string;

  @ApiProperty({ description: '关联的出行计划ID' })
  planId: string;

  @ApiProperty({ description: '任务类型' })
  taskType: CareTaskType;

  @ApiProperty({ description: '任务名称' })
  taskName: string;

  @ApiProperty({ description: '任务描述' })
  description: string;

  @ApiProperty({ description: '重要等级' })
  priority: CareTaskPriority;

  @ApiProperty({ description: '任务状态' })
  status: CareTaskStatus;

  @ApiProperty({ description: '负责人姓名' })
  assigneeName: string;

  @ApiProperty({ description: '负责人角色' })
  assigneeRole: AssigneeRole;

  @ApiProperty({ description: '任务完成时限' })
  deadline: string;

  @ApiProperty({ description: '创建者ID' })
  creatorId: string;

  @ApiProperty({ description: '创建时间' })
  createdAt: string;

  @ApiProperty({ description: '领取时间' })
  claimedAt?: string;

  @ApiProperty({ description: '完成时间' })
  completedAt?: string;

  @ApiProperty({ description: '未完成原因' })
  failureReason?: string;

  @ApiProperty({ description: '备注' })
  remark?: string;
}
