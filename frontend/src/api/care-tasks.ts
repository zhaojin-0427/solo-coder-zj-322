import { request } from './request'
import type {
  CareTask,
  CareTaskPriority,
  CareTaskStatus,
  CreateCareTaskParams,
  UpdateCareTaskParams,
  ClaimTaskParams,
  CompleteTaskParams,
  FailTaskParams,
  CareTaskStats,
  CareFailureReasonItem,
  CarePriorityDistributionItem,
  CarePlanBurdenItem,
} from '@/types'

const BASE_URL = '/care-tasks'

export function getCareTasks(params?: {
  planId?: string
  priority?: CareTaskPriority
  status?: CareTaskStatus
}) {
  return request<CareTask[]>({
    url: BASE_URL,
    method: 'get',
    params
  })
}

export function getCareTaskStats(planId?: string) {
  return request<CareTaskStats>({
    url: `${BASE_URL}/stats`,
    method: 'get',
    params: planId ? { planId } : {}
  })
}

export function getCarePlanBurden() {
  return request<CarePlanBurdenItem[]>({
    url: `${BASE_URL}/plan-burden`,
    method: 'get'
  })
}

export function getCareTask(id: string) {
  return request<CareTask>({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function getCareTasksByPlanId(planId: string) {
  return request<CareTask[]>({
    url: `${BASE_URL}/plan/${planId}`,
    method: 'get'
  })
}

export function createCareTask(data: CreateCareTaskParams) {
  return request<CareTask>({
    url: BASE_URL,
    method: 'post',
    data
  })
}

export function updateCareTask(id: string, data: UpdateCareTaskParams) {
  return request<CareTask>({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data
  })
}

export function deleteCareTask(id: string) {
  return request<boolean>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}

export function claimCareTask(id: string, data: ClaimTaskParams) {
  return request<CareTask>({
    url: `${BASE_URL}/${id}/claim`,
    method: 'post',
    data
  })
}

export function startCareTask(id: string) {
  return request<CareTask>({
    url: `${BASE_URL}/${id}/start`,
    method: 'post'
  })
}

export function completeCareTask(id: string, data: CompleteTaskParams) {
  return request<CareTask>({
    url: `${BASE_URL}/${id}/complete`,
    method: 'post',
    data
  })
}

export function failCareTask(id: string, data: FailTaskParams) {
  return request<CareTask>({
    url: `${BASE_URL}/${id}/fail`,
    method: 'post',
    data
  })
}
