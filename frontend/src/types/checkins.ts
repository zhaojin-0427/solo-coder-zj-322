export type CheckinType = 'arrival' | 'departure'
export type CheckinStatus = 'pending' | 'checked' | 'missed'
export type CheckinExceptionType = 'late' | 'no_show' | 'early_leave' | null
export type NotificationStatus = 'pending' | 'notified' | 'confirmed'
export type TimeoutStatus = 'normal' | 'overdue' | 'warning'

export interface FamilyContact {
  name: string
  phone: string
  relation: string
}

export interface WaypointCheckinConfig {
  id: string
  planId: string
  routeId: string
  waypointIndex: number
  waypointName: string
  requireArrivalCheckin: boolean
  requireDepartureCheckin: boolean
  expectedArrivalTime: string
  expectedDepartureTime: string
  arrivalToleranceMinutes: number
  departureToleranceMinutes: number
  familyContacts: FamilyContact[]
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface CheckinRecord {
  id: string
  configId: string
  planId: string
  routeId: string
  waypointIndex: number
  waypointName: string
  checkinType: CheckinType
  elderName: string
  operatorId: string
  operatorName: string
  operatorRole: 'elder' | 'companion'
  expectedTime: string
  actualCheckinTime: string
  delayMinutes: number
  status: CheckinStatus
  exceptionType: CheckinExceptionType
  exceptionReason: string
  timeoutStatus: TimeoutStatus
}

export interface FamilyNotification {
  id: string
  checkinRecordId: string | null
  configId: string
  planId: string
  routeId: string
  waypointName: string
  checkinType: CheckinType
  elderName: string
  triggerType: 'late' | 'no_show' | 'early_leave' | 'timeout_arrival' | 'timeout_departure' | 'multiple_missing'
  reason: string
  recipient: FamilyContact
  status: NotificationStatus
  notifiedAt: string | null
  confirmedAt: string | null
  confirmNote: string
  createdAt: string
}

export interface CheckinSummary {
  configId: string
  waypointName: string
  waypointIndex: number
  totalArrivalExpected: number
  arrivalCheckedCount: number
  arrivalCompletionRate: number
  totalDepartureExpected: number
  departureCheckedCount: number
  departureCompletionRate: number
  totalExceptions: number
  timeoutCount: number
  notificationCount: number
  exceptionTypes: CheckinExceptionType[]
}

export interface PlanExceptionSummary {
  planId: string
  totalExceptions: number
  timeoutCount: number
  lateCount: number
  noShowCount: number
  earlyLeaveCount: number
  totalNotifications: number
  pendingNotifications: number
  unconfirmedNotifications: number
  eldersWithExceptions: string[]
}

export interface CheckinStatistics {
  totalChecked: number
  totalMissed: number
  onTimeCount: number
  onTimeRate: number
  lateCount: number
  noShowCount: number
  earlyLeaveCount: number
  topTimeoutNodes: Array<{
    rank: number
    name: string
    count: number
    planId: string
  }>
  totalNotifications: number
  confirmedCount: number
  notifiedCount: number
  pendingCount: number
  notificationConfirmRate: number
  notificationSentRate: number
  exceptionByPlan: Array<{
    planId: string
    planTitle: string
    totalCheckins: number
    lateCount: number
    noShowCount: number
    earlyLeaveCount: number
    timeoutCount: number
    totalExceptions: number
  }>
}

export interface CreateCheckinRecordDto {
  configId: string
  checkinType: CheckinType
  elderName: string
  operatorId: string
  operatorName: string
  operatorRole: 'elder' | 'companion'
  hasException?: boolean
  exceptionType?: CheckinExceptionType
  exceptionReason?: string
}

export interface RegisterTimeoutDto {
  configId: string
  checkinType: CheckinType
  missingElderNames: string[]
  operatorId: string
  operatorName: string
}

export interface UpdateNotificationStatusDto {
  status: NotificationStatus
  operatorId?: string
  confirmNote?: string
}

export interface CreateWaypointCheckinConfigDto {
  planId: string
  routeId: string
  waypointIndex: number
  requireArrivalCheckin?: boolean
  requireDepartureCheckin?: boolean
  expectedArrivalTime: string
  expectedDepartureTime: string
  arrivalToleranceMinutes?: number
  departureToleranceMinutes?: number
  familyContacts: FamilyContact[]
  creatorId: string
}

export interface BatchCreateConfigsDto {
  planId: string
  routeId: string
  nodeConfigs: Array<{
    waypointIndex: number
    requireArrivalCheckin?: boolean
    requireDepartureCheckin?: boolean
    expectedArrivalTime: string
    expectedDepartureTime: string
    arrivalToleranceMinutes?: number
    departureToleranceMinutes?: number
    familyContacts: FamilyContact[]
  }>
  creatorId: string
}
