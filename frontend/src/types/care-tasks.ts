export type CareTaskType =
  | 'medication_reminder'
  | 'water_supply'
  | 'sun_protection'
  | 'cold_protection'
  | 'wheelchair_assist'
  | 'cane_assist'
  | 'emergency_contact'
  | 'meeting_point_check'
  | 'other'

export type CareTaskPriority = 'low' | 'medium' | 'high' | 'critical'

export type CareTaskStatus = 'pending' | 'assigned' | 'in_progress' | 'completed' | 'failed'

export type AssigneeRole = 'elder' | 'companion'

export interface CareTask {
  id: string
  planId: string
  taskType: CareTaskType
  taskName: string
  description: string
  priority: CareTaskPriority
  status: CareTaskStatus
  assigneeName: string
  assigneeRole: AssigneeRole
  deadline: string
  creatorId: string
  createdAt: string
  claimedAt?: string
  completedAt?: string
  failureReason?: string
  remark?: string
}

export interface CreateCareTaskParams {
  planId: string
  taskType: CareTaskType
  taskName: string
  description?: string
  priority: CareTaskPriority
  assigneeName: string
  assigneeRole: AssigneeRole
  deadline: string
  creatorId: string
  remark?: string
}

export interface UpdateCareTaskParams {
  taskType?: CareTaskType
  taskName?: string
  description?: string
  priority?: CareTaskPriority
  assigneeName?: string
  assigneeRole?: AssigneeRole
  deadline?: string
  remark?: string
}

export interface ClaimTaskParams {
  claimantName: string
  claimantRole: AssigneeRole
}

export interface CompleteTaskParams {
  remark?: string
}

export interface FailTaskParams {
  failureReason: string
}

export interface CareTaskStats {
  total: number
  completed: number
  pending: number
  inProgress: number
  failed: number
  assigned: number
  completionRate: number
  overdue: number
}

export interface CareFailureReasonItem {
  reason: string
  count: number
  percentage: number
}

export interface CarePriorityDistributionItem {
  priority: string
  count: number
  completed: number
}

export interface CarePlanBurdenItem {
  planId: string
  planTitle: string
  taskCount: number
  criticalCount: number
  highCount: number
}
