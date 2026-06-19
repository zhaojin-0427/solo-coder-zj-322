export type WeatherRiskLevel = 'low' | 'medium' | 'high' | 'extreme'
export type AirQualityLevel = 'excellent' | 'good' | 'moderate' | 'unhealthy-sensitive' | 'unhealthy' | 'hazardous'
export type HealthRiskLevel = 'safe' | 'caution' | 'warning' | 'danger'
export type SuggestionType = 'normal' | 'shortened-route' | 'cancel'

export interface HealthWeatherConfig {
  id: string
  planId: string
  travelDate: string
  startTimeSlot: string
  endTimeSlot: string
  weatherRiskLevel: WeatherRiskLevel
  weatherDescription: string
  airQualityLevel: AirQualityLevel
  aqiValue: number
  temperature: number
  humidity: number
  healthReminders: string[]
  creatorId: string
  createdAt: string
  updatedAt: string
}

export interface ElderHealthCheckin {
  id: string
  planId: string
  elderName: string
  preferenceId?: string
  systolicBloodPressure?: number
  diastolicBloodPressure?: number
  fastingBloodSugar?: number
  sleepQuality?: number
  sleepHours?: number
  hasJointDiscomfort: boolean
  jointDiscomfortDetail?: string
  hasMedicationReady: boolean
  medicationsReady: string[]
  healthConcerns: string[]
  notes?: string
  checkinTime: string
  isConfirmed: boolean
  confirmerId?: string
  confirmedAt?: string
}

export interface ElderTravelAdvice {
  planId: string
  elderName: string
  staminaLevel: string
  healthRiskLevel: HealthRiskLevel
  riskScore: number
  suggestions: string[]
  suggestionType: SuggestionType
  shouldShortenRoute: boolean
  suggestedShortenMinutes?: number
  riskTags: string[]
  checkinId?: string
  generatedAt: string
}

export interface PlanHealthWeatherSummary {
  planId: string
  planTitle: string
  config?: HealthWeatherConfig
  expectedCheckinCount: number
  actualCheckinCount: number
  confirmedCheckinCount: number
  checkinRate: number
  confirmationRate: number
  highRiskCount: number
  mediumRiskCount: number
  lowRiskCount: number
  suggestShortenCount: number
  hasExtremeRisk: boolean
  summarySuggestions: string[]
  generatedAt: string
}

export interface HealthConcernStatItem {
  concern: string
  count: number
  percentage: number
}

export interface WeatherRiskChangeStatItem {
  weatherRiskLevel: string
  changeCount: number
  planCount: number
  avgChangesPerPlan: number
}

export interface HealthReminderStats {
  totalConfigs: number
  totalCheckins: number
  overallConfirmationRate: number
  totalHighRiskElders: number
  totalMediumRiskElders: number
  totalLowRiskElders: number
  totalShortenRouteSuggestions: number
  configCoverageRate: number
}

export interface CreateHealthWeatherConfigParams {
  planId: string
  travelDate: string
  startTimeSlot: string
  endTimeSlot: string
  weatherRiskLevel: WeatherRiskLevel
  weatherDescription: string
  airQualityLevel: AirQualityLevel
  aqiValue: number
  temperature: number
  humidity: number
  healthReminders?: string[]
  creatorId: string
}

export interface UpdateHealthWeatherConfigParams {
  travelDate?: string
  startTimeSlot?: string
  endTimeSlot?: string
  weatherRiskLevel?: WeatherRiskLevel
  weatherDescription?: string
  airQualityLevel?: AirQualityLevel
  aqiValue?: number
  temperature?: number
  humidity?: number
  healthReminders?: string[]
}

export interface CreateElderHealthCheckinParams {
  planId: string
  elderName: string
  preferenceId?: string
  systolicBloodPressure?: number
  diastolicBloodPressure?: number
  fastingBloodSugar?: number
  sleepQuality?: number
  sleepHours?: number
  hasJointDiscomfort: boolean
  jointDiscomfortDetail?: string
  hasMedicationReady: boolean
  medicationsReady?: string[]
  healthConcerns?: string[]
  notes?: string
}

export interface ConfirmCheckinParams {
  confirmerId: string
}

export interface UnconfirmedElderItem {
  planId: string
  planTitle: string
  elderName: string
  checkinTime?: string
}

export interface HealthStatistics {
  totalConfigs: number
  totalCheckins: number
  overallConfirmationRate: number
  totalHighRiskElders: number
  totalMediumRiskElders: number
  totalLowRiskElders: number
  topHealthConcerns: HealthConcernStatItem[]
  weatherRiskChangeDistribution: WeatherRiskChangeStatItem[]
  totalShortenRouteSuggestions: number
  configCoverageRate: number
}
