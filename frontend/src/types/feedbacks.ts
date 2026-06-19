import type { StaminaLevel } from './preferences'
export type { StaminaLevel }

export type AcceptanceLevel = '完全接受' | '基本接受' | '有条件接受' | '难以接受'
export type RiskTag = '避晒' | '避冷' | '靠近厕所' | '需缩短步行' | '需延长步行' | '坡度较大' | '人流量大' | '休息不足'

export interface RouteFeedback {
  id: string
  routeId: string
  planId: string
  elderName: string
  staminaLevel: StaminaLevel
  acceptanceLevel: AcceptanceLevel
  concernReason: string
  suggestedWalkAdjustmentMinutes: number
  needSunProtection: boolean
  needColdProtection: boolean
  needNearToilet: boolean
  otherSuggestions: string
  feedbackTime: string
  feedbackWeight: number
}

export interface RouteConsensus {
  routeId: string
  consensusScore: number
  isConsensusReached: boolean
  feedbackCount: number
  riskTags: RiskTag[]
  lowConsensusReasons: string[]
  suggestedAdjustmentMinutes: number
  recommendedRank: number
  acceptanceByStamina: Record<StaminaLevel, { count: number; avgAcceptance: number }>
}

export interface CreateFeedbackParams {
  routeId: string
  planId: string
  elderName: string
  staminaLevel: StaminaLevel
  acceptanceLevel: AcceptanceLevel
  concernReason: string
  suggestedWalkAdjustmentMinutes: number
  needSunProtection: boolean
  needColdProtection: boolean
  needNearToilet: boolean
  otherSuggestions?: string
  feedbackTime?: string
}

export interface PublishRouteParams {
  routeId: string
  manualConfirmReason?: string
  publisher: string
}

export interface PublishRecord {
  isForced: boolean
  manualReason?: string
  publisher: string
  publishTime: string
  consensusScore: number
}
