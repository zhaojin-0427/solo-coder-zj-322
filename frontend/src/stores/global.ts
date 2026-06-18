import { defineStore } from 'pinia'
import { ref } from 'vue'
import type { TravelPlan } from '@/types'

export const useGlobalStore = defineStore('global', () => {
  const currentPlan = ref<TravelPlan | null>(null)
  const currentPlanId = ref<string>('')
  const loading = ref<boolean>(false)

  function setCurrentPlan(plan: TravelPlan | null) {
    currentPlan.value = plan
    currentPlanId.value = plan?.id || ''
  }

  function setCurrentPlanId(planId: string) {
    currentPlanId.value = planId
  }

  function setLoading(state: boolean) {
    loading.value = state
  }

  function clearCurrentPlan() {
    currentPlan.value = null
    currentPlanId.value = ''
  }

  return {
    currentPlan,
    currentPlanId,
    loading,
    setCurrentPlan,
    setCurrentPlanId,
    setLoading,
    clearCurrentPlan
  }
})
