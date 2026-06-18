export type StaminaLevel = '低' | '中' | '高'

export type RestFrequency = '每15分钟' | '每30分钟' | '每45分钟' | '按需'

export interface ElderPreference {
  id: string
  planId: string
  elderName: string
  staminaLevel: StaminaLevel
  restFrequency: RestFrequency
  sunSensitive: boolean
  coldSensitive: boolean
  availableStartTime: string
  availableEndTime: string
  notes: string
  createdAt?: string
}

export interface ElderPreferenceForm {
  id?: string
  planId: string
  elderName: string
  staminaLevel: StaminaLevel
  restFrequency: RestFrequency
  sunSensitive: boolean
  coldSensitive: boolean
  availableStartTime: string
  availableEndTime: string
  notes: string
}

export interface PlanWithPreferences {
  planId: string
  planTitle: string
  destination: string
  preferences: ElderPreference[]
}
