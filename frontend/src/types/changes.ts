import type { RiskTag } from './feedbacks'

export type ChangeType = '提前返回' | '更改集合点' | '其他'

export interface TravelChange {
  id: string
  planId: string
  elderName: string
  changeType: ChangeType
  oldValue: string
  newValue: string
  changeReason: string
  changeTime: string
  impactNotes: string
  routeId?: string
  routeVersionName?: string
  consensusScore?: number
  riskTagsAtChange?: RiskTag[]
  isForcedRoute?: boolean
}

export interface TravelChangeForm {
  planId: string
  elderName: string
  changeType: ChangeType
  oldValue: string
  newValue: string
  changeReason: string
  changeTime?: string
  impactNotes: string
  routeId?: string
  routeVersionName?: string
  consensusScore?: number
  riskTagsAtChange?: RiskTag[]
  isForcedRoute?: boolean
}
