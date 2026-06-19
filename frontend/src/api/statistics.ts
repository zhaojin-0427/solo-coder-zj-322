import { request } from './request'
import type {
  StatisticsData,
  OverviewStats,
  ConsensusStats,
  LowConsensusReasonItem,
  FeedbackAcceptanceByStaminaItem,
  ConsensusByRouteItem,
  CareTaskStats,
  CareFailureReasonItem,
  CarePriorityDistributionItem,
  CarePlanBurdenItem,
} from '@/types'

const BASE_URL = '/statistics'

export function getOverview() {
  return request<OverviewStats>({
    url: `${BASE_URL}/overview`,
    method: 'get'
  })
}

export function getRouteCompletionRates() {
  return request<any[]>({
    url: `${BASE_URL}/route-completion`,
    method: 'get'
  })
}

export function getPeakHourDistribution() {
  return request<any[]>({
    url: `${BASE_URL}/peak-hours`,
    method: 'get'
  })
}

export function getSatisfactionByStamina() {
  return request<any[]>({
    url: `${BASE_URL}/satisfaction`,
    method: 'get'
  })
}

export function getChangeHotspots() {
  return request<any[]>({
    url: `${BASE_URL}/change-hotspots`,
    method: 'get'
  })
}

export function getConsensusStats() {
  return request<ConsensusStats>({
    url: `${BASE_URL}/consensus-stats`,
    method: 'get'
  })
}

export function getLowConsensusReasons() {
  return request<LowConsensusReasonItem[]>({
    url: `${BASE_URL}/low-consensus-reasons`,
    method: 'get'
  })
}

export function getFeedbackAcceptanceByStamina() {
  return request<FeedbackAcceptanceByStaminaItem[]>({
    url: `${BASE_URL}/feedback-acceptance-by-stamina`,
    method: 'get'
  })
}

export function getConsensusByRoute() {
  return request<ConsensusByRouteItem[]>({
    url: `${BASE_URL}/consensus-by-route`,
    method: 'get'
  })
}

export function getCareTaskStats() {
  return request<CareTaskStats>({
    url: `${BASE_URL}/care-task-stats`,
    method: 'get'
  })
}

export function getCareFailureReasons() {
  return request<CareFailureReasonItem[]>({
    url: `${BASE_URL}/care-failure-reasons`,
    method: 'get'
  })
}

export function getCarePriorityDistribution() {
  return request<CarePriorityDistributionItem[]>({
    url: `${BASE_URL}/care-priority-distribution`,
    method: 'get'
  })
}

export function getCarePlanBurden() {
  return request<CarePlanBurdenItem[]>({
    url: `${BASE_URL}/care-plan-burden`,
    method: 'get'
  })
}

export function getAllStatistics() {
  return request<StatisticsData>({
    url: `${BASE_URL}/all`,
    method: 'get'
  })
}
