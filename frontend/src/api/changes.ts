import { request } from './request'
import type { TravelChange, TravelChangeForm } from '@/types'

const BASE_URL = '/changes'

export function getChangeList(params?: { planId?: string }) {
  return request<TravelChange[]>({
    url: BASE_URL,
    method: 'get',
    params
  })
}

export function getChangesByPlanId(planId: string) {
  return request<TravelChange[]>({
    url: BASE_URL,
    method: 'get',
    params: { planId }
  })
}

export function getChangeById(id: string) {
  return request<TravelChange>({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function createChange(data: TravelChangeForm) {
  const payload = {
    ...data,
    changeTime: data.changeTime || new Date().toISOString()
  }
  return request<TravelChange>({
    url: BASE_URL,
    method: 'post',
    data: payload
  })
}

export function updateChange(id: string, data: TravelChangeForm) {
  return request<TravelChange>({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data
  })
}

export function deleteChange(id: string) {
  return request<void>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}
