import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsIn, IsOptional, IsEnum } from 'class-validator';
import type { CareTaskType, CareTaskPriority, CareTaskStatus, AssigneeRole } from '../entities/care-task.entity';

export class CreateCareTaskDto {
  @ApiProperty({ description: '关联的出行计划ID' })
  @IsString()
  planId: string;

  @ApiProperty({ description: '任务类型' })
  @IsIn(['medication_reminder', 'water_supply', 'sun_protection', 'cold_protection', 'wheelchair_assist', 'cane_assist', 'emergency_contact', 'meeting_point_check', 'other'])
  taskType: CareTaskType;

  @ApiProperty({ description: '任务名称' })
  @IsString()
  taskName: string;

  @ApiPropertyOptional({ description: '任务描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({ description: '重要等级' })
  @IsIn(['low', 'medium', 'high', 'critical'])
  priority: CareTaskPriority;

  @ApiProperty({ description: '负责人姓名' })
  @IsString()
  assigneeName: string;

  @ApiProperty({ description: '负责人角色' })
  @IsIn(['elder', 'companion'])
  assigneeRole: AssigneeRole;

  @ApiProperty({ description: '任务完成时限' })
  @IsString()
  deadline: string;

  @ApiProperty({ description: '创建者ID' })
  @IsString()
  creatorId: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class UpdateCareTaskDto {
  @ApiPropertyOptional({ description: '任务类型' })
  @IsIn(['medication_reminder', 'water_supply', 'sun_protection', 'cold_protection', 'wheelchair_assist', 'cane_assist', 'emergency_contact', 'meeting_point_check', 'other'])
  @IsOptional()
  taskType?: CareTaskType;

  @ApiPropertyOptional({ description: '任务名称' })
  @IsString()
  @IsOptional()
  taskName?: string;

  @ApiPropertyOptional({ description: '任务描述' })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional({ description: '重要等级' })
  @IsIn(['low', 'medium', 'high', 'critical'])
  @IsOptional()
  priority?: CareTaskPriority;

  @ApiPropertyOptional({ description: '负责人姓名' })
  @IsString()
  @IsOptional()
  assigneeName?: string;

  @ApiPropertyOptional({ description: '负责人角色' })
  @IsIn(['elder', 'companion'])
  @IsOptional()
  assigneeRole?: AssigneeRole;

  @ApiPropertyOptional({ description: '任务完成时限' })
  @IsString()
  @IsOptional()
  deadline?: string;

  @ApiPropertyOptional({ description: '备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class ClaimTaskDto {
  @ApiProperty({ description: '领取人姓名' })
  @IsString()
  claimantName: string;

  @ApiProperty({ description: '领取人角色' })
  @IsIn(['elder', 'companion'])
  claimantRole: AssigneeRole;
}

export class CompleteTaskDto {
  @ApiPropertyOptional({ description: '完成备注' })
  @IsString()
  @IsOptional()
  remark?: string;
}

export class FailTaskDto {
  @ApiProperty({ description: '未完成原因' })
  @IsString()
  failureReason: string;
}
