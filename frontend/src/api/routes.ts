import { request } from './request'
import type { RouteVersion, GenerateRouteParams } from '@/types'

const BASE_URL = '/routes'

export function getRouteVersions(planId: string) {
  return request<RouteVersion[]>({
    url: BASE_URL,
    method: 'get',
    params: { planId }
  })
}

export function generateRoutes(params: GenerateRouteParams) {
  return request<RouteVersion[]>({
    url: `${BASE_URL}/generate/${params.planId}`,
    method: 'post'
  })
}

export function selectRoute(routeId: string) {
  return request<RouteVersion>({
    url: `${BASE_URL}/${routeId}/select`,
    method: 'post'
  })
}

export function getSelectedRoute(planId: string) {
  return request<RouteVersion | null>({
    url: `${BASE_URL}/selected/${planId}`,
    method: 'get'
  })
}

export function deleteRoute(routeId: string) {
  return request<void>({
    url: `${BASE_URL}/${routeId}`,
    method: 'delete'
  })
}
