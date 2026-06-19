import { request } from './request'
import type {
  RouteFeedback,
  RouteConsensus,
  CreateFeedbackParams,
  PublishRouteParams,
  PublishRecord
} from '@/types'

const BASE_URL = '/feedbacks'

export function getFeedbackList(params?: { routeId?: string; planId?: string }) {
  return request<RouteFeedback[]>({
    url: BASE_URL,
    method: 'get',
    params
  })
}

export function getFeedbackById(id: string) {
  return request<RouteFeedback>({
    url: `${BASE_URL}/${id}`,
    method: 'get'
  })
}

export function getRouteConsensus(routeId: string) {
  return request<RouteConsensus>({
    url: `${BASE_URL}/consensus/${routeId}`,
    method: 'get'
  })
}

export function getPlanRoutesConsensus(planId: string) {
  return request<RouteConsensus[]>({
    url: `${BASE_URL}/plan-consensus/${planId}`,
    method: 'get'
  })
}

export function getConsensusThreshold() {
  return request<{ threshold: number }>({
    url: `${BASE_URL}/threshold`,
    method: 'get'
  })
}

export function createFeedback(data: CreateFeedbackParams) {
  return request<RouteFeedback>({
    url: BASE_URL,
    method: 'post',
    data
  })
}

export function updateFeedback(id: string, data: Partial<CreateFeedbackParams>) {
  return request<RouteFeedback>({
    url: `${BASE_URL}/${id}`,
    method: 'patch',
    data
  })
}

export function deleteFeedback(id: string) {
  return request<void>({
    url: `${BASE_URL}/${id}`,
    method: 'delete'
  })
}

export function publishRoute(data: PublishRouteParams) {
  return request<{
    route: any
    consensus: RouteConsensus
    isForced: boolean
  }>({
    url: `${BASE_URL}/publish`,
    method: 'post',
    data
  })
}

export function getPublishRecord(routeId: string) {
  return request<PublishRecord | null>({
    url: `${BASE_URL}/publish-record/${routeId}`,
    method: 'get'
  })
}
