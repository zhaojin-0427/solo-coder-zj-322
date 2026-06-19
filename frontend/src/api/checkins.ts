import request from './request'
import type {
  WaypointCheckinConfig,
  CheckinRecord,
  FamilyNotification,
  CheckinSummary,
  PlanExceptionSummary,
  CheckinStatistics,
  CreateCheckinRecordDto,
  RegisterTimeoutDto,
  UpdateNotificationStatusDto,
  CreateWaypointCheckinConfigDto,
  UpdateWaypointCheckinConfigDto,
  BatchCreateConfigsDto,
  NotificationStatus,
} from '@/types/checkins'

export const checkinsApi = {
  findAllConfigs: (params?: { planId?: string; routeId?: string }) =>
    request.get<WaypointCheckinConfig[]>('/checkins/configs', { params }),

  findOneConfig: (id: string) =>
    request.get<WaypointCheckinConfig>(`/checkins/configs/${id}`),

  createConfig: (data: CreateWaypointCheckinConfigDto) =>
    request.post<WaypointCheckinConfig>('/checkins/configs', data),

  batchCreateConfigs: (data: BatchCreateConfigsDto) =>
    request.post<WaypointCheckinConfig[]>('/checkins/configs/batch', data),

  updateConfig: (id: string, data: Partial<UpdateWaypointCheckinConfigDto>) =>
    request.put<WaypointCheckinConfig>(`/checkins/configs/${id}`, data),

  removeConfig: (id: string) =>
    request.delete<boolean>(`/checkins/configs/${id}`),

  findAllRecords: (params?: {
    planId?: string
    configId?: string
    elderName?: string
    exceptionOnly?: boolean
  }) =>
    request.get<CheckinRecord[]>('/checkins/records', { params }),

  createCheckinRecord: (data: CreateCheckinRecordDto) =>
    request.post<{ record: CheckinRecord; notifications: FamilyNotification[] }>(
      '/checkins/records',
      data,
    ),

  registerTimeout: (data: RegisterTimeoutDto) =>
    request.post<{ record: CheckinRecord; notifications: FamilyNotification[] }>(
      '/checkins/timeouts',
      data,
    ),

  findAllNotifications: (params?: {
    planId?: string
    status?: NotificationStatus
    elderName?: string
  }) =>
    request.get<FamilyNotification[]>('/checkins/notifications', { params }),

  updateNotificationStatus: (id: string, data: UpdateNotificationStatusDto) =>
    request.put<FamilyNotification>(`/checkins/notifications/${id}/status`, data),

  getCheckinSummaryByPlan: (planId: string) =>
    request.get<CheckinSummary[]>(`/checkins/summary/plan/${planId}`),

  getPlanExceptionSummary: (planId: string) =>
    request.get<PlanExceptionSummary>(`/checkins/summary/plan-exception/${planId}`),

  getCheckinStatistics: () =>
    request.get<CheckinStatistics>('/checkins/statistics'),
}
