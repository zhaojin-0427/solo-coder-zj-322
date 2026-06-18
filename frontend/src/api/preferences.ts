import { request } from './request'
import type { ElderPreference, ElderPreferenceForm, PlanWithPreferences } from '@/types'

const BASE_URL = '/preferences'

export function getPreferenceList(params?: { planId?: string }) {
  return request<ElderPreference[]>({
    url: BASE_URL,
    method: 'get',
    params
  })
}

export function getPreferencesGroupedByPlan() {
  return request<PlanWithPreferences[]>({
    url: `${BASE_URL}/grouped`,
    method: 'get'
  })
}

export function getPreferenceById(id: string) {
  return request<ElderPreference>({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function getPreferencesByPlanId(planId: string) {
  return request<ElderPreference[]>({
    url: BASE_URL,
    method: 'get',
    params: { planId }
  })
}

export function createPreference(data: ElderPreferenceForm) {
  return request<ElderPreference>({
    url: BASE_URL,
    method: 'post',
    data
  })
}

export function updatePreference(id: string, data: ElderPreferenceForm) {
  return request<ElderPreference>({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data
  })
}

export function deletePreference(id: string) {
  return request<void>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}
