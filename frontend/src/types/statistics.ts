import type { StaminaLevel } from './feedbacks'
import type { CareTaskStats, CareFailureReasonItem, CarePriorityDistributionItem, CarePlanBurdenItem } from './care-tasks'
import type { HealthReminderStats, HealthConcernStatItem, WeatherRiskChangeStatItem } from './health-weather'

export interface OverviewStats {
  totalPlans: number
  averageCompletionRate: number
  averageRestCount: number
  totalChanges: number
}

export interface RouteCompletionItem {
  routeName: string
  completionRate: number
}

export interface PeakHourItem {
  hour: string
  changeCount: number
}

export interface SatisfactionItem {
  staminaLevel: string
  satisfactionRate: number
}

export interface ChangeHotspotItem {
  rank: number
  nodeName: string
  changeCount: number
  impactLevel: 'high' | 'medium' | 'low'
}

export interface ConsensusStats {
  consensusPassRate: number
  totalPublished: number
  consensusPassedCount: number
  forcedPublishCount: number
  consensusThreshold: number
}

export interface LowConsensusReasonItem {
  reason: string
  count: number
  percentage: number
}

export interface FeedbackAcceptanceByStaminaItem {
  staminaLevel: StaminaLevel
  totalFeedbacks: number
  acceptedCount: number
  acceptanceRate: number
}

export interface ConsensusByRouteItem {
  routeId: string
  routeVersionName: string
  consensusScore: number
  isConsensusReached: boolean
  feedbackCount: number
  isForced: boolean
}

export interface StatisticsData {
  overview: OverviewStats
  routeCompletionRates: RouteCompletionItem[]
  peakHourDistribution: PeakHourItem[]
  satisfactionByStamina: SatisfactionItem[]
  changeHotspots: ChangeHotspotItem[]
  consensusStats: ConsensusStats
  lowConsensusReasons: LowConsensusReasonItem[]
  feedbackAcceptanceByStamina: FeedbackAcceptanceByStaminaItem[]
  consensusByRoute: ConsensusByRouteItem[]
  careTaskStats: CareTaskStats
  careFailureReasons: CareFailureReasonItem[]
  carePriorityDistribution: CarePriorityDistributionItem[]
  carePlanBurden: CarePlanBurdenItem[]
  healthReminderStats: HealthReminderStats
  topHealthConcerns: HealthConcernStatItem[]
  weatherRiskChangeDistribution: WeatherRiskChangeStatItem[]
}
