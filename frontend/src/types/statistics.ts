export interface OverviewStats {
  totalPlans: number
  averageCompletionRate: number
  averageRestCount: number
  totalChanges: number
}

export interface RouteCompletionItem {
  routeName: string
  completionRate: number
}

export interface PeakHourItem {
  hour: string
  changeCount: number
}

export interface SatisfactionItem {
  staminaLevel: string
  satisfactionRate: number
}

export interface ChangeHotspotItem {
  rank: number
  nodeName: string
  changeCount: number
  impactLevel: 'high' | 'medium' | 'low'
}

export interface StatisticsData {
  overview: OverviewStats
  routeCompletionRates: RouteCompletionItem[]
  peakHourDistribution: PeakHourItem[]
  satisfactionByStamina: SatisfactionItem[]
  changeHotspots: ChangeHotspotItem[]
}
