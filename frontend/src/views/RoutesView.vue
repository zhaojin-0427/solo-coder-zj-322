<template>
  <div>
    <h2 class="page-title">路线协商与推荐</h2>

    <div class="toolbar">
      <div style="display: flex; gap: 12px; align-items: center">
        <span style="font-size: 16px; color: #5A4A42; font-weight: 500">选择计划：</span>
        <el-select
          v-model="selectedPlanId"
          placeholder="请选择出行计划"
          style="width: 360px"
          clearable
          @change="handlePlanChange"
        >
          <el-option
            v-for="plan in planOptions"
            :key="plan.id"
            :label="`${plan.title} - ${plan.destination}`"
            :value="plan.id"
          />
        </el-select>
      </div>
      <div style="display: flex; gap: 12px">
        <el-button
          :icon="RefreshLeft"
          size="large"
          :disabled="!selectedPlanId || routeVersions.length === 0"
          @click="fetchRoutes"
        >
          刷新路线
        </el-button>
        <el-button
          type="primary"
          :icon="MagicStick"
          size="large"
          :disabled="!selectedPlanId"
          :loading="generating"
          @click="handleGenerateRoutes"
        >
          生成推荐路线
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="!selectedPlanId">
        <el-empty description="请先选择一个出行计划" :image-size="120" />
      </div>

      <div v-else-if="routeVersions.length === 0 && !loading">
        <el-empty description="暂无推荐路线，点击右上角'生成推荐路线'按钮">
          <template #image>
            <el-icon :size="80" color="#E8855A"><Guide /></el-icon>
          </template>
          <el-button type="primary" :icon="MagicStick" size="large" @click="handleGenerateRoutes">
            立即生成推荐路线
          </el-button>
        </el-empty>
      </div>

      <div v-else>
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center">
          <div style="font-size: 17px; font-weight: 600">
            <el-icon :size="22" color="#E8855A" style="margin-right: 8px"><Collection /></el-icon>
            共 {{ routeVersions.length }} 个推荐版本
            <span v-if="selectedRouteId" style="margin-left: 12px; font-weight: normal; color: #4A9B8C; font-size: 15px">
              <el-icon style="vertical-align: middle; margin-right: 4px"><CircleCheckFilled /></el-icon>
              已选中：{{ getSelectedRouteName }}
            </span>
          </div>
        </div>

        <el-row :gutter="24">
          <el-col
            v-for="route in routeVersions"
            :key="route.id"
            :xs="24"
            :sm="24"
            :md="12"
            :lg="8"
            :xl="8"
            style="margin-bottom: 24px"
          >
            <div
              class="route-card"
              :class="{ selected: selectedRouteId === route.id }"
              @click="handleSelectRoute(route)"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px">
                <div>
                  <div style="font-size: 20px; font-weight: 700; color: #5A4A42; margin-bottom: 4px">
                    {{ route.versionName }}
                  </div>
                  <el-tag
                    :type="difficultyTagType[route.difficulty]"
                    effect="light"
                    size="large"
                  >
                    <el-icon style="margin-right: 4px"><TrendCharts /></el-icon>
                    难度：{{ difficultyText[route.difficulty] }}
                  </el-tag>
                </div>
                <div v-if="selectedRouteId === route.id">
                  <el-tag type="success" effect="dark" size="large">
                    <el-icon style="margin-right: 4px"><CircleCheckFilled /></el-icon>
                    已选
                  </el-tag>
                </div>
              </div>

              <el-row :gutter="12" style="margin-bottom: 16px">
                <el-col :span="12">
                  <div style="background: #FFF8F2; border-radius: 10px; padding: 12px; text-align: center">
                    <div style="font-size: 13px; color: #8B7B73; margin-bottom: 4px">总步行</div>
                    <div style="font-size: 24px; font-weight: 700; color: #E8855A">
                      {{ route.totalWalkMinutes }}
                      <span style="font-size: 14px; font-weight: 400">分钟</span>
                    </div>
                  </div>
                </el-col>
                <el-col :span="12">
                  <div style="background: #F0FAF7; border-radius: 10px; padding: 12px; text-align: center">
                    <div style="font-size: 13px; color: #8B7B73; margin-bottom: 4px">总休息</div>
                    <div style="font-size: 24px; font-weight: 700; color: #4A9B8C">
                      {{ route.totalRestMinutes }}
                      <span style="font-size: 14px; font-weight: 400">分钟</span>
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div style="border-top: 1px dashed #F0D9C7; padding-top: 16px">
                <div style="font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #5A4A42">
                  <el-icon style="margin-right: 6px; color: #E8855A"><Location /></el-icon>
                  途经点（{{ route.waypoints.length }}个）
                </div>
                <div style="max-height: 260px; overflow-y: auto">
                  <div
                    v-for="(wp, idx) in route.waypoints"
                    :key="idx"
                    style="margin-bottom: 10px; padding: 10px 12px; background: #FBF5EF; border-radius: 10px"
                  >
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px">
                      <span style="font-weight: 600; font-size: 15px">
                        <el-tag type="primary" effect="plain" size="small" style="margin-right: 8px">
                          {{ idx + 1 }}
                        </el-tag>
                        {{ wp.name }}
                      </span>
                      <el-tag type="warning" effect="light">
                        停留 {{ wp.restMinutes }} 分钟
                      </el-tag>
                    </div>
                    <div style="font-size: 13px; color: #8B7B73; line-height: 1.5; padding-left: 34px">
                      💡 {{ wp.reason }}
                    </div>
                  </div>
                </div>
              </div>

              <div v-if="route.recommendations && route.recommendations.length" style="margin-top: 16px">
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #4A9B8C">
                  <el-icon style="margin-right: 4px"><Warning /></el-icon>
                  出行建议
                </div>
                <ul style="margin: 0; padding-left: 18px; color: #5A4A42; line-height: 1.8; font-size: 13px">
                  <li v-for="(rec, i) in route.recommendations" :key="i">{{ rec }}</li>
                </ul>
              </div>

              <div style="margin-top: 16px; display: flex; gap: 8px">
                <el-button
                  type="primary"
                  size="large"
                  style="flex: 1"
                  :icon="selectedRouteId === route.id ? CircleCheckFilled : Check"
                  @click.stop="handleSelectRoute(route)"
                >
                  {{ selectedRouteId === route.id ? '已选为最终路线' : '选为最终路线' }}
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  RefreshLeft,
  MagicStick,
  Guide,
  Collection,
  TrendCharts,
  CircleCheckFilled,
  Location,
  Check,
  Warning
} from '@element-plus/icons-vue'
import { getAllPlans } from '@/api/plans'
import {
  getRouteVersions,
  generateRoutes,
  selectRoute
} from '@/api/routes'
import type { TravelPlan, RouteVersion, DifficultyLevel } from '@/types'

const loading = ref(false)
const generating = ref(false)
const planOptions = ref<TravelPlan[]>([])
const selectedPlanId = ref('')
const routeVersions = ref<RouteVersion[]>([])
const selectedRouteId = ref('')

const difficultyText: Record<DifficultyLevel, string> = {
  easy: '轻松',
  moderate: '适中',
  hard: '挑战'
}

const difficultyTagType: Record<DifficultyLevel, 'success' | 'warning' | 'danger'> = {
  easy: 'success',
  moderate: 'warning',
  hard: 'danger'
}

const getSelectedRouteName = computed(() => {
  const route = routeVersions.value.find((r) => r.id === selectedRouteId.value)
  return route?.versionName || ''
})

async function fetchPlans() {
  try {
    const res = await getAllPlans()
    planOptions.value = (res.data as TravelPlan[]) || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchRoutes() {
  if (!selectedPlanId.value) return
  loading.value = true
  try {
    const res = await getRouteVersions(selectedPlanId.value)
    routeVersions.value = (res.data as RouteVersion[]) || []
    const selected = routeVersions.value.find((r) => r.isSelected)
    if (selected) selectedRouteId.value = selected.id
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handlePlanChange() {
  routeVersions.value = []
  selectedRouteId.value = ''
  fetchRoutes()
}

async function handleGenerateRoutes() {
  if (!selectedPlanId.value) {
    ElMessage.warning('请先选择出行计划')
    return
  }
  generating.value = true
  try {
    const res = await generateRoutes({ planId: selectedPlanId.value })
    const data = res.data as RouteVersion | RouteVersion[]
    if (Array.isArray(data)) {
      routeVersions.value = data
    } else if (data) {
      routeVersions.value = [data]
    }
    selectedRouteId.value = ''
    ElMessage.success(`成功生成 ${routeVersions.value.length} 个推荐路线版本`)
  } catch (e) {
    console.error(e)
  } finally {
    generating.value = false
  }
}

async function handleSelectRoute(route: RouteVersion) {
  if (selectedRouteId.value === route.id) {
    return
  }
  try {
    await ElMessageBox.confirm(
      `确定要将「${route.versionName}」选为最终路线吗？该版本将作为出行执行方案。`,
      '确认选择',
      {
        confirmButtonText: '确认选择',
        cancelButtonText: '取消',
        type: 'info'
      }
    )
    try {
      await selectRoute(route.id)
    } catch (_e) { /* ignore if endpoint doesn't exist */ }
    routeVersions.value.forEach((r) => { r.isSelected = false })
    const target = routeVersions.value.find((r) => r.id === route.id)
    if (target) target.isSelected = true
    selectedRouteId.value = route.id
    ElMessage.success(`已选择「${route.versionName}」作为最终路线`)
  } catch (e: any) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

onMounted(async () => {
  await fetchPlans()
})
</script>
