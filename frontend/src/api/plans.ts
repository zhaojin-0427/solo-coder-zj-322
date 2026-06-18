import { request } from './request'
import type { TravelPlan, TravelPlanForm, PaginatedResponse } from '@/types'

const BASE_URL = '/plans'

export function getPlanList(params?: { page?: number; pageSize?: number }) {
  return request<PaginatedResponse<TravelPlan> | TravelPlan[]>({
    url: BASE_URL,
    method: 'get',
    params
  })
}

export function getAllPlans() {
  return request<TravelPlan[]>({
    url: BASE_URL,
    method: 'get'
  })
}

export function getPlanById(id: string) {
  return request<TravelPlan>({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function createPlan(data: TravelPlanForm) {
  const payload = {
    ...data,
    creatorId: data.creatorId || 'user-default'
  }
  return request<TravelPlan>({
    url: BASE_URL,
    method: 'post',
    data: payload
  })
}

export function updatePlan(id: string, data: TravelPlanForm) {
  return request<TravelPlan>({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data
  })
}

export function deletePlan(id: string) {
  return request<void>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}
