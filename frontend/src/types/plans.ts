export interface ToiletPoint {
  id?: string
  name: string
  longitude: number
  latitude: number
}

export interface TravelPlan {
  id: string
  title: string
  destination: string
  estimatedWalkMinutes: number
  stepSlope: number
  toiletPoints: ToiletPoint[]
  creatorId?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
  createdAt?: string
  updatedAt?: string
}

export interface TravelPlanForm {
  id?: string
  title: string
  destination: string
  estimatedWalkMinutes: number
  stepSlope: number
  toiletPoints: ToiletPoint[]
  creatorId?: string
  status?: 'draft' | 'active' | 'completed' | 'cancelled'
}
