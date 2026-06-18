export type DifficultyLevel = 'easy' | 'moderate' | 'hard'

export interface RouteWaypoint {
  id?: string
  name: string
  latitude?: number
  longitude?: number
  restMinutes: number
  reason: string
}

export interface RouteVersion {
  id: string
  planId: string
  versionName: string
  totalWalkMinutes: number
  totalRestMinutes: number
  difficulty: DifficultyLevel
  waypoints: RouteWaypoint[]
  recommendations: string[]
  isSelected?: boolean
  createdAt?: string
}

export interface GenerateRouteParams {
  planId: string
}
