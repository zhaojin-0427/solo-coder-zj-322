import { request } from './request'
import type {
  HealthWeatherConfig,
  ElderHealthCheckin,
  ElderTravelAdvice,
  PlanHealthWeatherSummary,
  HealthStatistics,
  CreateHealthWeatherConfigParams,
  UpdateHealthWeatherConfigParams,
  CreateElderHealthCheckinParams,
  ConfirmCheckinParams,
  UnconfirmedElderItem,
} from '@/types'

const BASE_URL = '/health-weather'

export function getAllConfigs() {
  return request<HealthWeatherConfig[]>({
    url: `${BASE_URL}/configs`,
    method: 'get'
  })
}

export function getConfigByPlanId(planId: string) {
  return request<HealthWeatherConfig>({
    url: `${BASE_URL}/configs/plan/${planId}`,
    method: 'get'
  })
}

export function getConfig(id: string) {
  return request<HealthWeatherConfig>({
    url: `${BASE_URL}/configs/${id}`,
    method: 'get'
  })
}

export function createConfig(params: CreateHealthWeatherConfigParams) {
  return request<HealthWeatherConfig>({
    url: `${BASE_URL}/configs`,
    method: 'post',
    data: params
  })
}

export function updateConfig(id: string, params: UpdateHealthWeatherConfigParams) {
  return request<HealthWeatherConfig>({
    url: `${BASE_URL}/configs/${id}`,
    method: 'put',
    data: params
  })
}

export function deleteConfig(id: string) {
  return request<boolean>({
    url: `${BASE_URL}/configs/${id}`,
    method: 'delete'
  })
}

export function getAllCheckins(planId?: string) {
  const params = planId ? { planId } : {}
  return request<ElderHealthCheckin[]>({
    url: `${BASE_URL}/checkins`,
    method: 'get',
    params
  })
}

export function getCheckin(id: string) {
  return request<ElderHealthCheckin>({
    url: `${BASE_URL}/checkins/${id}`,
    method: 'get'
  })
}

export function createCheckin(params: CreateElderHealthCheckinParams) {
  return request<ElderHealthCheckin>({
    url: `${BASE_URL}/checkins`,
    method: 'post',
    data: params
  })
}

export function confirmCheckin(id: string, params: ConfirmCheckinParams) {
  return request<ElderHealthCheckin>({
    url: `${BASE_URL}/checkins/${id}/confirm`,
    method: 'post',
    data: params
  })
}

export function confirmBatchCheckins(planId: string, params: ConfirmCheckinParams) {
  return request<ElderHealthCheckin[]>({
    url: `${BASE_URL}/checkins/confirm-plan/${planId}`,
    method: 'post',
    data: params
  })
}

export function deleteCheckin(id: string) {
  return request<boolean>({
    url: `${BASE_URL}/checkins/${id}`,
    method: 'delete'
  })
}

export function getAdviceByPlanId(planId: string) {
  return request<ElderTravelAdvice[]>({
    url: `${BASE_URL}/advices/plan/${planId}`,
    method: 'get'
  })
}

export function getPlanSummary(planId: string) {
  return request<PlanHealthWeatherSummary>({
    url: `${BASE_URL}/summary/plan/${planId}`,
    method: 'get'
  })
}

export function getAllPlanSummaries() {
  return request<PlanHealthWeatherSummary[]>({
    url: `${BASE_URL}/summaries`,
    method: 'get'
  })
}

export function getHealthStatistics() {
  return request<HealthStatistics>({
    url: `${BASE_URL}/statistics`,
    method: 'get'
  })
}

export function getUnconfirmedElders(planId?: string) {
  const params = planId ? { planId } : {}
  return request<UnconfirmedElderItem[]>({
    url: `${BASE_URL}/unconfirmed`,
    method: 'get',
    params
  })
}
