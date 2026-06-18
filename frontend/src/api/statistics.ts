import { request } from './request'
import type { StatisticsData, OverviewStats } from '@/types'

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

export function getAllStatistics() {
  return request<StatisticsData>({
    url: `${BASE_URL}/all`,
    method: 'get'
  })
}
