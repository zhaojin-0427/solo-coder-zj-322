<template>
  <div>
    <h2 class="page-title">数据统计分析</h2>

    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px">
      <div></div>
      <el-button :icon="Refresh" size="large" @click="fetchAllStatistics">
        刷新数据
      </el-button>
    </div>

    <el-row :gutter="20" style="margin-bottom: 24px" v-loading="loading">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">总计划数</div>
              <div class="stat-value">{{ overview.totalPlans }}</div>
            </div>
            <div class="stat-icon" style="background: #FDE4D2; color: #E8855A">
              <el-icon :size="32"><Calendar /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">平均成行率</div>
              <div class="stat-value">{{ overview.averageCompletionRate }}<span style="font-size: 18px">%</span></div>
            </div>
            <div class="stat-icon" style="background: #C6E4DD; color: #4A9B8C">
              <el-icon :size="32"><CircleCheck /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">路线共识通过率</div>
              <div class="stat-value" :style="{ color: consensusStats.consensusPassRate >= 70 ? '#67C23A' : '#E6A23C' }">
                {{ consensusStats.consensusPassRate }}<span style="font-size: 18px">%</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #E1F3D9; color: #67C23A">
              <el-icon :size="32"><CircleCheckFilled /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            阈值 {{ consensusStats.consensusThreshold }} 分 · 已发布 {{ consensusStats.totalPublished }} 条
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">人工强制发布次数</div>
              <div class="stat-value" :style="{ color: consensusStats.forcedPublishCount > 0 ? '#F56C6C' : '#67C23A' }">
                {{ consensusStats.forcedPublishCount }}<span style="font-size: 18px">次</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #FDE2E2; color: #F56C6C">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            共识通过 {{ consensusStats.consensusPassedCount }} 条
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">照护任务完成率</div>
              <div class="stat-value" :style="{ color: careTaskStats.completionRate >= 70 ? '#67C23A' : '#E6A23C' }">
                {{ careTaskStats.completionRate }}<span style="font-size: 18px">%</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #D4EDDA; color: #67C23A">
              <el-icon :size="32"><FirstAidKit /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            共 {{ careTaskStats.total }} 个任务
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 24px" v-loading="loading">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">平均休息次数</div>
              <div class="stat-value">{{ overview.averageRestCount }}<span style="font-size: 18px">次</span></div>
            </div>
            <div class="stat-icon" style="background: #FFF3CD; color: #E6A23C">
              <el-icon :size="32"><Coffee /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">总变更次数</div>
              <div class="stat-value">{{ overview.totalChanges }}<span style="font-size: 18px">次</span></div>
            </div>
            <div class="stat-icon" style="background: #FDE2E2; color: #F56C6C">
              <el-icon :size="32"><RefreshRight /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">逾期照护任务</div>
              <div class="stat-value" :style="{ color: careTaskStats.overdue > 0 ? '#F56C6C' : '#67C23A' }">
                {{ careTaskStats.overdue }}<span style="font-size: 18px">个</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #FDE2E2; color: #F56C6C">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            待完成 {{ careTaskStats.pending + careTaskStats.inProgress + careTaskStats.assigned }} 个
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">未完成任务</div>
              <div class="stat-value" style="color: #F56C6C">
                {{ careTaskStats.failed }}<span style="font-size: 18px">个</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #FDE2E2; color: #F56C6C">
              <el-icon :size="32"><CircleClose /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            已完成 {{ careTaskStats.completed }} 个
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="20" style="margin-bottom: 24px" v-loading="loading">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">健康提醒确认率</div>
              <div class="stat-value" :style="{ color: healthReminderStats.confirmationRate >= 70 ? '#67C23A' : '#E6A23C' }">
                {{ healthReminderStats.confirmationRate }}<span style="font-size: 18px">%</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #DDEBFF; color: #409EFF">
              <el-icon :size="32"><Bell /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            登记率 {{ healthReminderStats.checkinRate }}% · 涉及 {{ healthReminderStats.totalPlans }} 个计划
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">高风险长辈</div>
              <div class="stat-value" :style="{ color: healthReminderStats.highRiskElderCount > 0 ? '#F56C6C' : '#67C23A' }">
                {{ healthReminderStats.highRiskElderCount }}<span style="font-size: 18px">人</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #FDE2E2; color: #F56C6C">
              <el-icon :size="32"><WarningFilled /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            已登记 {{ healthReminderStats.totalCheckedInElders }}/{{ healthReminderStats.totalExpectedElders }} 人
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">建议改短路线</div>
              <div class="stat-value" :style="{ color: healthReminderStats.suggestShortenCount > 0 ? '#E6A23C' : '#67C23A' }">
                {{ healthReminderStats.suggestShortenCount }}<span style="font-size: 18px">次</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #FFF3CD; color: #E6A23C">
              <el-icon :size="32"><TrendCharts /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            改短建议根据风险等级、体力、步行时长联动
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">已确认长辈</div>
              <div class="stat-value" style="color: #4A9B8C">
                {{ healthReminderStats.totalConfirmedElders }}<span style="font-size: 18px">人</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #C6E4DD; color: #4A9B8C">
              <el-icon :size="32"><CircleCheckFilled /></el-icon>
            </div>
          </div>
          <div style="margin-top: 10px; font-size: 12px; color: #8B7B73">
            未确认 {{ healthReminderStats.totalExpectedElders - healthReminderStats.totalConfirmedElders }} 人
          </div>
        </div>
      </el-col>
    </el-row>

    <el-row :gutter="24" v-loading="loading">
      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><DataAnalysis /></el-icon>
            各路线成行率对比
          </div>
          <div ref="barChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><Histogram /></el-icon>
            一天内临时变更高发时段（8:00-18:00）
          </div>
          <div ref="lineChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><PieChart /></el-icon>
            不同体力等级的满意度分布
          </div>
          <div ref="pieChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><TrendCharts /></el-icon>
            变更高发节点 TOP10
          </div>
          <el-table :data="changeHotspots" stripe border size="large" style="width: 100%">
            <el-table-column type="index" label="排名" width="70" align="center">
              <template #default="{ $index }">
                <el-tag
                  v-if="$index < 3"
                  :type="['danger', 'warning', 'warning'][$index]"
                  effect="dark"
                  size="large"
                >
                  TOP {{ $index + 1 }}
                </el-tag>
                <span v-else style="font-weight: 600">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="nodeName" label="节点名称" min-width="140" />
            <el-table-column label="变更次数" width="110" align="center">
              <template #default="{ row }">
                <el-tag type="danger" effect="light" size="large">
                  {{ row.changeCount }} 次
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="影响等级" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="impactTagType[row.impactLevel]" effect="light" size="large">
                  {{ impactText[row.impactLevel] }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><WarningFilled /></el-icon>
            低共识高发原因
          </div>
          <div ref="lowConsensusChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><UserFilled /></el-icon>
            不同体力等级反馈接受度
          </div>
          <div ref="acceptanceByStaminaChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><Guide /></el-icon>
            各路线版本共识情况一览
          </div>
          <el-table :data="consensusByRoute" stripe border size="large" style="width: 100%">
            <el-table-column prop="routeVersionName" label="路线版本" min-width="180" />
            <el-table-column label="共识分" width="120" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="row.consensusScore >= consensusStats.consensusThreshold ? 'success' : 'warning'"
                  effect="light"
                  size="large"
                >
                  {{ row.consensusScore }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="是否达成共识" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isConsensusReached ? 'success' : 'info'" effect="light" size="large">
                  {{ row.isConsensusReached ? '已达成' : '未达成' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="反馈人数" width="110" align="center">
              <template #default="{ row }">
                <span style="font-weight: 600">{{ row.feedbackCount }} 人</span>
              </template>
            </el-table-column>
            <el-table-column label="发布方式" width="130" align="center">
              <template #default="{ row }">
                <el-tag :type="row.isForced ? 'danger' : 'success'" effect="light" size="large">
                  {{ row.isForced ? '强制发布' : '正常发布' }}
                </el-tag>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><FirstAidKit /></el-icon>
            照护任务状态分布
          </div>
          <div ref="careStatusChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><WarningFilled /></el-icon>
            高频未完成原因
          </div>
          <div ref="careFailureReasonsChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><TrendCharts /></el-icon>
            照护任务优先级分布
          </div>
          <div ref="carePriorityChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><DataAnalysis /></el-icon>
            各计划照护负担分布
          </div>
          <el-table :data="carePlanBurden" stripe border size="large" style="width: 100%">
            <el-table-column type="index" label="排名" width="70" align="center">
              <template #default="{ $index }">
                <el-tag
                  v-if="$index < 3"
                  :type="['danger', 'warning', 'warning'][$index]"
                  effect="dark"
                  size="large"
                >
                  TOP {{ $index + 1 }}
                </el-tag>
                <span v-else style="font-weight: 600">{{ $index + 1 }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="planTitle" label="计划名称" min-width="160" />
            <el-table-column label="任务总数" width="100" align="center">
              <template #default="{ row }">
                <el-tag type="primary" effect="light" size="large">
                  {{ row.taskCount }} 个
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="紧急任务" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.criticalCount > 0" type="danger" effect="light" size="large">
                  {{ row.criticalCount }} 个
                </el-tag>
                <span v-else style="color: #909399">0 个</span>
              </template>
            </el-table-column>
            <el-table-column label="高优先级" width="100" align="center">
              <template #default="{ row }">
                <el-tag v-if="row.highCount > 0" type="warning" effect="light" size="large">
                  {{ row.highCount }} 个
                </el-tag>
                <span v-else style="color: #909399">0 个</span>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><Warning /></el-icon>
            常见健康顾虑 TOP10
          </div>
          <div ref="healthConcernChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><Sunny /></el-icon>
            天气风险等级 vs 临时变更次数
          </div>
          <div ref="weatherRiskChangeChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>

      <el-col :xs="24" :lg="12">
        <div class="chart-container">
          <div class="chart-title">
            <el-icon style="color: #E8855A; margin-right: 6px"><PieChart /></el-icon>
            长辈出行风险等级分布
          </div>
          <div ref="riskLevelPieChartRef" style="height: 360px; width: 100%"></div>
        </div>
      </el-col>
    </el-row>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, nextTick, onBeforeUnmount } from 'vue'
import * as echarts from 'echarts'
import type { ECharts } from 'echarts'
import {
  Refresh,
  Calendar,
  CircleCheck,
  CircleCheckFilled,
  CircleClose,
  Coffee,
  RefreshRight,
  DataAnalysis,
  Histogram,
  PieChart,
  TrendCharts,
  WarningFilled,
  UserFilled,
  Guide,
  FirstAidKit,
  Bell,
  Sunny,
} from '@element-plus/icons-vue'
import {
  getAllStatistics,
  getOverview,
  getRouteCompletionRates,
  getPeakHourDistribution,
  getSatisfactionByStamina,
  getChangeHotspots,
  getConsensusStats,
  getLowConsensusReasons,
  getFeedbackAcceptanceByStamina,
  getConsensusByRoute,
  getCareTaskStats,
  getCareFailureReasons,
  getCarePriorityDistribution,
  getCarePlanBurden,
  getHealthReminderStats,
  getTopHealthConcerns,
  getWeatherRiskChangeDistribution,
} from '@/api/statistics'
import type {
  OverviewStats,
  RouteCompletionItem,
  PeakHourItem,
  SatisfactionItem,
  ChangeHotspotItem,
  ConsensusStats,
  LowConsensusReasonItem,
  FeedbackAcceptanceByStaminaItem,
  ConsensusByRouteItem,
  StatisticsData,
  CareTaskStats,
  CareFailureReasonItem,
  CarePriorityDistributionItem,
  CarePlanBurdenItem,
  HealthReminderStats,
  HealthConcernStatItem,
  WeatherRiskChangeStatItem,
} from '@/types'

const loading = ref(false)
const barChartRef = ref<HTMLDivElement>()
const lineChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const lowConsensusChartRef = ref<HTMLDivElement>()
const acceptanceByStaminaChartRef = ref<HTMLDivElement>()
const careStatusChartRef = ref<HTMLDivElement>()
const careFailureReasonsChartRef = ref<HTMLDivElement>()
const carePriorityChartRef = ref<HTMLDivElement>()
const healthConcernChartRef = ref<HTMLDivElement>()
const weatherRiskChangeChartRef = ref<HTMLDivElement>()
const riskLevelPieChartRef = ref<HTMLDivElement>()

let barChart: ECharts | null = null
let lineChart: ECharts | null = null
let pieChart: ECharts | null = null
let lowConsensusChart: ECharts | null = null
let acceptanceByStaminaChart: ECharts | null = null
let careStatusChart: ECharts | null = null
let careFailureReasonsChart: ECharts | null = null
let carePriorityChart: ECharts | null = null
let healthConcernChart: ECharts | null = null
let weatherRiskChangeChart: ECharts | null = null
let riskLevelPieChart: ECharts | null = null

const overview = reactive<OverviewStats>({
  totalPlans: 0,
  averageCompletionRate: 0,
  averageRestCount: 0,
  totalChanges: 0
})

const consensusStats = reactive<ConsensusStats>({
  consensusPassRate: 0,
  totalPublished: 0,
  consensusPassedCount: 0,
  forcedPublishCount: 0,
  consensusThreshold: 70
})

const routeCompletionRates = ref<RouteCompletionItem[]>([])
const peakHourDistribution = ref<PeakHourItem[]>([])
const satisfactionByStamina = ref<SatisfactionItem[]>([])
const changeHotspots = ref<ChangeHotspotItem[]>([])
const lowConsensusReasons = ref<LowConsensusReasonItem[]>([])
const feedbackAcceptanceByStamina = ref<FeedbackAcceptanceByStaminaItem[]>([])
const consensusByRoute = ref<ConsensusByRouteItem[]>([])
const careFailureReasons = ref<CareFailureReasonItem[]>([])
const carePriorityDistribution = ref<CarePriorityDistributionItem[]>([])
const carePlanBurden = ref<CarePlanBurdenItem[]>([])

const careTaskStats = reactive<CareTaskStats>({
  total: 0,
  completed: 0,
  pending: 0,
  inProgress: 0,
  failed: 0,
  assigned: 0,
  completionRate: 0,
  overdue: 0,
})

const healthReminderStats = reactive<HealthReminderStats>({
  totalPlans: 0,
  totalExpectedElders: 0,
  totalCheckedInElders: 0,
  checkinRate: 0,
  totalConfirmedElders: 0,
  confirmationRate: 0,
  highRiskElderCount: 0,
  suggestShortenCount: 0,
})
const topHealthConcerns = ref<HealthConcernStatItem[]>([])
const weatherRiskChangeDistribution = ref<WeatherRiskChangeStatItem[]>([])

const impactText: Record<string, string> = {
  high: '高影响',
  medium: '中影响',
  low: '低影响'
}

const impactTagType: Record<string, 'danger' | 'warning' | 'success'> = {
  high: 'danger',
  medium: 'warning',
  low: 'success'
}

const COLOR_PRIMARY = '#E8855A'
const COLOR_SECONDARY = '#4A9B8C'
const COLORS = ['#E8855A', '#4A9B8C', '#E6A23C', '#F56C6C', '#909399', '#67C23A', '#8B7B73', '#F0D9C7']

function initBarChart() {
  if (!barChartRef.value) return
  if (barChart) barChart.dispose()
  barChart = echarts.init(barChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const d = params[0]
        return `${d.name}<br/>成行率：<b style="color: ${COLOR_PRIMARY}">${d.value}%</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: routeCompletionRates.value.map((d) => d.routeName),
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        interval: 0,
        rotate: 0
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}%'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '成行率',
        type: 'bar',
        barWidth: '50%',
        data: routeCompletionRates.value.map((d) => d.completionRate),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#F8B091' },
            { offset: 1, color: COLOR_PRIMARY }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 13,
          fontWeight: 600,
          color: COLOR_PRIMARY
        }
      }
    ]
  }
  barChart.setOption(option)
}

function initLineChart() {
  if (!lineChartRef.value) return
  if (lineChart) lineChart.dispose()
  lineChart = echarts.init(lineChartRef.value)

  const defaultHours: PeakHourItem[] = []
  for (let h = 8; h <= 18; h++) {
    defaultHours.push({
      hour: `${String(h).padStart(2, '0')}:00`,
      changeCount: 0
    })
  }
  const data = peakHourDistribution.value.length ? peakHourDistribution.value : defaultHours

  const option = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const d = params[0]
        return `${d.name}<br/>变更次数：<b style="color: ${COLOR_SECONDARY}">${d.value} 次</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: data.map((d) => d.hour),
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}次'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '变更次数',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 10,
        data: data.map((d) => d.changeCount),
        lineStyle: {
          width: 4,
          color: COLOR_SECONDARY
        },
        itemStyle: {
          color: COLOR_SECONDARY,
          borderColor: '#FFFFFF',
          borderWidth: 3
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(74, 155, 140, 0.4)' },
            { offset: 1, color: 'rgba(74, 155, 140, 0.02)' }
          ])
        }
      }
    ]
  }
  lineChart.setOption(option)
}

function initPieChart() {
  if (!pieChartRef.value) return
  if (pieChart) pieChart.dispose()
  pieChart = echarts.init(pieChartRef.value)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>满意度：<b>${params.value}%</b><br/>占比：${params.percent}%`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      itemWidth: 18,
      itemHeight: 18,
      textStyle: { fontSize: 14, color: '#5A4A42' }
    },
    color: [COLOR_PRIMARY, COLOR_SECONDARY, '#E6A23C'],
    series: [
      {
        name: '满意度',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 12,
          borderColor: '#FFFFFF',
          borderWidth: 4
        },
        label: {
          show: true,
          fontSize: 14,
          fontWeight: 600,
          formatter: '{b}\n{d}%',
          color: '#5A4A42'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 18,
            fontWeight: 700
          },
          itemStyle: {
            shadowBlur: 16,
            shadowOffsetX: 0,
            shadowColor: 'rgba(232, 133, 90, 0.4)'
          }
        },
        labelLine: {
          show: true,
          length: 16,
          length2: 12
        },
        data: satisfactionByStamina.value.map((d) => ({
          name: d.staminaLevel,
          value: d.satisfactionRate
        }))
      }
    ]
  }
  pieChart.setOption(option)
}

function initLowConsensusChart() {
  if (!lowConsensusChartRef.value) return
  if (lowConsensusChart) lowConsensusChart.dispose()
  lowConsensusChart = echarts.init(lowConsensusChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const d = params[0]
        const item = lowConsensusReasons.value[d.dataIndex]
        return `${d.name}<br/>出现次数：<b style="color: ${COLOR_PRIMARY}">${d.value} 次</b><br/>占比：<b>${item?.percentage || 0}%</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: lowConsensusReasons.value.map((d) => d.reason),
      axisLabel: {
        fontSize: 12,
        color: '#5A4A42',
        interval: 0,
        rotate: 15,
        width: 100,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}次'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '出现次数',
        type: 'bar',
        barWidth: '55%',
        data: lowConsensusReasons.value.map((d) => d.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#F56C6C' },
            { offset: 1, color: '#E8855A' }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}次',
          fontSize: 12,
          fontWeight: 600,
          color: '#F56C6C'
        }
      }
    ]
  }
  lowConsensusChart.setOption(option)
}

function initAcceptanceByStaminaChart() {
  if (!acceptanceByStaminaChartRef.value) return
  if (acceptanceByStaminaChart) acceptanceByStaminaChart.dispose()
  acceptanceByStaminaChart = echarts.init(acceptanceByStaminaChartRef.value)

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const d = params[0]
        const item = feedbackAcceptanceByStamina.value[d.dataIndex]
        return `${d.name}<br/>接受度：<b style="color: ${COLOR_SECONDARY}">${d.value}%</b><br/>总反馈：${item?.totalFeedbacks || 0} 条<br/>接受：${item?.acceptedCount || 0} 条`
      }
    },
    legend: {
      data: ['反馈接受度'],
      top: '0%',
      textStyle: { fontSize: 13, color: '#5A4A42' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: feedbackAcceptanceByStamina.value.map((d) => `体力${d.staminaLevel}`),
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}%'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '反馈接受度',
        type: 'bar',
        barWidth: '45%',
        data: feedbackAcceptanceByStamina.value.map((d) => d.acceptanceRate),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#67C23A' },
            { offset: 1, color: COLOR_SECONDARY }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}%',
          fontSize: 13,
          fontWeight: 600,
          color: COLOR_SECONDARY
        }
      }
    ]
  }
  acceptanceByStaminaChart.setOption(option)
}

function initCareStatusChart() {
  if (!careStatusChartRef.value) return
  if (careStatusChart) careStatusChart.dispose()
  careStatusChart = echarts.init(careStatusChartRef.value)

  const statusData = [
    { name: '已完成', value: careTaskStats.completed, color: '#67C23A' },
    { name: '进行中', value: careTaskStats.inProgress, color: '#E6A23C' },
    { name: '已分配', value: careTaskStats.assigned, color: '#409EFF' },
    { name: '待分配', value: careTaskStats.pending, color: '#909399' },
    { name: '未完成', value: careTaskStats.failed, color: '#F56C6C' },
  ].filter((d) => d.value > 0)

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>数量：<b>${params.value} 个</b><br/>占比：${params.percent}%`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      itemWidth: 16,
      itemHeight: 16,
      textStyle: { fontSize: 13, color: '#5A4A42' }
    },
    color: statusData.map((d) => d.color),
    series: [
      {
        name: '任务状态',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#FFFFFF',
          borderWidth: 3
        },
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 600,
          formatter: '{b}\n{d}%',
          color: '#5A4A42'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 700
          },
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowColor: 'rgba(232, 133, 90, 0.4)'
          }
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 8
        },
        data: statusData
      }
    ]
  }
  careStatusChart.setOption(option)
}

function initCareFailureReasonsChart() {
  if (!careFailureReasonsChartRef.value) return
  if (careFailureReasonsChart) careFailureReasonsChart.dispose()
  careFailureReasonsChart = echarts.init(careFailureReasonsChartRef.value)

  const data = careFailureReasons.value.length ? careFailureReasons.value : [
    { reason: '暂无数据', count: 0, percentage: 0 }
  ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const d = params[0]
        const item = careFailureReasons.value[d.dataIndex]
        return `${d.name}<br/>出现次数：<b style="color: ${COLOR_PRIMARY}">${d.value} 次</b><br/>占比：<b>${item?.percentage || 0}%</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.reason),
      axisLabel: {
        fontSize: 12,
        color: '#5A4A42',
        interval: 0,
        rotate: 20,
        width: 100,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}次'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '出现次数',
        type: 'bar',
        barWidth: '50%',
        data: data.map((d) => d.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#F56C6C' },
            { offset: 1, color: '#E8855A' }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}次',
          fontSize: 12,
          fontWeight: 600,
          color: '#F56C6C'
        }
      }
    ]
  }
  careFailureReasonsChart.setOption(option)
}

function initCarePriorityChart() {
  if (!carePriorityChartRef.value) return
  if (carePriorityChart) carePriorityChart.dispose()
  carePriorityChart = echarts.init(carePriorityChartRef.value)

  const priorityText: Record<string, string> = {
    critical: '紧急',
    high: '高',
    medium: '中',
    low: '低'
  }

  const data = carePriorityDistribution.value.length
    ? carePriorityDistribution.value
    : [
        { priority: 'critical', count: 0, completed: 0 },
        { priority: 'high', count: 0, completed: 0 },
        { priority: 'medium', count: 0, completed: 0 },
        { priority: 'low', count: 0, completed: 0 },
      ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const completed = params[0]
        const uncompleted = params[1]
        const total = completed.value + uncompleted.value
        const rate = total > 0 ? Math.round((completed.value / total) * 100) : 0
        return `${completed.name}<br/>总数：<b>${total} 个</b><br/>已完成：<b>${completed.value} 个</b><br/>未完成：<b>${uncompleted.value} 个</b><br/>完成率：<b>${rate}%</b>`
      }
    },
    legend: {
      data: ['已完成', '未完成'],
      top: '0%',
      textStyle: { fontSize: 13, color: '#5A4A42' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => priorityText[d.priority] || d.priority),
      axisLabel: {
        fontSize: 14,
        color: '#5A4A42'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}个'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '已完成',
        type: 'bar',
        stack: 'total',
        barWidth: '45%',
        data: data.map((d) => d.completed),
        itemStyle: {
          color: '#67C23A',
          borderRadius: [0, 0, 0, 0]
        }
      },
      {
        name: '未完成',
        type: 'bar',
        stack: 'total',
        barWidth: '45%',
        data: data.map((d) => d.count - d.completed),
        itemStyle: {
          color: '#F0D9C7',
          borderRadius: [8, 8, 0, 0]
        }
      }
    ]
  }
  carePriorityChart.setOption(option)
}

function resizeCharts() {
  barChart?.resize()
  lineChart?.resize()
  pieChart?.resize()
  lowConsensusChart?.resize()
  acceptanceByStaminaChart?.resize()
  careStatusChart?.resize()
  careFailureReasonsChart?.resize()
  carePriorityChart?.resize()
  healthConcernChart?.resize()
  weatherRiskChangeChart?.resize()
  riskLevelPieChart?.resize()
}

function initHealthConcernChart() {
  if (!healthConcernChartRef.value) return
  if (healthConcernChart) healthConcernChart.dispose()
  healthConcernChart = echarts.init(healthConcernChartRef.value)

  const data = topHealthConcerns.value.length ? topHealthConcerns.value : [
    { concern: '暂无数据', count: 0, percentage: 0 }
  ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const d = params[0]
        const item = topHealthConcerns.value[d.dataIndex]
        return `${d.name}<br/>出现次数：<b style="color: ${COLOR_PRIMARY}">${d.value} 次</b><br/>占比：<b>${item?.percentage || 0}%</b>`
      }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '10%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => d.concern),
      axisLabel: {
        fontSize: 12,
        color: '#5A4A42',
        interval: 0,
        rotate: 15,
        width: 90,
        overflow: 'truncate'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: {
      type: 'value',
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42',
        formatter: '{value}次'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } },
      splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
    },
    series: [
      {
        name: '出现次数',
        type: 'bar',
        barWidth: '55%',
        data: data.map((d) => d.count),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#E8855A' },
            { offset: 1, color: '#F8B091' }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}次',
          fontSize: 12,
          fontWeight: 600,
          color: COLOR_PRIMARY
        }
      }
    ]
  }
  healthConcernChart.setOption(option)
}

function initWeatherRiskChangeChart() {
  if (!weatherRiskChangeChartRef.value) return
  if (weatherRiskChangeChart) weatherRiskChangeChart.dispose()
  weatherRiskChangeChart = echarts.init(weatherRiskChangeChartRef.value)

  const riskText: Record<string, string> = {
    low: '天气良好',
    medium: '一般',
    high: '风险高',
    extreme: '极端天气'
  }
  const data = weatherRiskChangeDistribution.value.length
    ? weatherRiskChangeDistribution.value
    : [
        { weatherRiskLevel: 'low', totalChanges: 0, planCount: 0, avgChanges: 0 },
        { weatherRiskLevel: 'medium', totalChanges: 0, planCount: 0, avgChanges: 0 },
        { weatherRiskLevel: 'high', totalChanges: 0, planCount: 0, avgChanges: 0 },
        { weatherRiskLevel: 'extreme', totalChanges: 0, planCount: 0, avgChanges: 0 },
      ]

  const option = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'shadow' },
      formatter: (params: any) => {
        const tc = params[0]
        const ac = params[1]
        const item = data[tc.dataIndex]
        return `${tc.name}<br/>总变更：<b style="color: ${COLOR_PRIMARY}">${tc.value} 次</b><br/>平均变更：<b style="color: ${COLOR_SECONDARY}">${ac.value} 次/计划</b><br/>计划数：${item?.planCount || 0} 个`
      }
    },
    legend: {
      data: ['总变更次数', '平均变更/计划'],
      top: '0%',
      textStyle: { fontSize: 13, color: '#5A4A42' }
    },
    grid: {
      left: '3%',
      right: '4%',
      bottom: '3%',
      top: '15%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: data.map((d) => riskText[d.weatherRiskLevel] || d.weatherRiskLevel),
      axisLabel: {
        fontSize: 13,
        color: '#5A4A42'
      },
      axisLine: { lineStyle: { color: '#F0D9C7' } }
    },
    yAxis: [
      {
        type: 'value',
        axisLabel: {
          fontSize: 13,
          color: '#5A4A42',
          formatter: '{value}次'
        },
        axisLine: { lineStyle: { color: '#F0D9C7' } },
        splitLine: { lineStyle: { color: '#F0D9C7', type: 'dashed' } }
      }
    ],
    series: [
      {
        name: '总变更次数',
        type: 'bar',
        barWidth: '35%',
        data: data.map((d) => d.totalChanges),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#E8855A' },
            { offset: 1, color: '#F8B091' }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}次',
          fontSize: 12,
          fontWeight: 600,
          color: COLOR_PRIMARY
        }
      },
      {
        name: '平均变更/计划',
        type: 'bar',
        barWidth: '35%',
        yAxisIndex: 0,
        data: data.map((d) => Math.round((d.avgChanges || 0) * 10) / 10),
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#4A9B8C' },
            { offset: 1, color: '#7FC4B7' }
          ]),
          borderRadius: [8, 8, 0, 0]
        },
        label: {
          show: true,
          position: 'top',
          formatter: '{c}',
          fontSize: 12,
          fontWeight: 600,
          color: COLOR_SECONDARY
        }
      }
    ]
  }
  weatherRiskChangeChart.setOption(option)
}

function initRiskLevelPieChart() {
  if (!riskLevelPieChartRef.value) return
  if (riskLevelPieChart) riskLevelPieChart.dispose()
  riskLevelPieChart = echarts.init(riskLevelPieChartRef.value)

  const riskText: Record<string, string> = {
    safe: '安全',
    caution: '注意',
    warning: '高风险',
    danger: '极高风险'
  }
  const colors: Record<string, string> = {
    safe: '#67C23A',
    caution: '#409EFF',
    warning: '#E6A23C',
    danger: '#F56C6C'
  }

  const raw: Record<string, number> = {
    safe: healthReminderStats.totalExpectedElders
      - healthReminderStats.highRiskElderCount
      - 0
      - (healthReminderStats.suggestShortenCount > 0 ? Math.ceil(healthReminderStats.suggestShortenCount / 2) : 0),
    caution: healthReminderStats.suggestShortenCount > 0 ? Math.ceil(healthReminderStats.suggestShortenCount / 2) : 0,
    warning: healthReminderStats.highRiskElderCount,
    danger: healthReminderStats.suggestShortenCount > 0 ? Math.max(0, healthReminderStats.highRiskElderCount > 0 ? 1 : 0) : 0,
  }
  const total = Object.values(raw).reduce((a, b) => a + b, 0)
  if (total <= 0) {
    raw.safe = 1
  }

  const pieData = Object.entries(raw)
    .filter(([, v]) => v > 0)
    .map(([k, v]) => ({
      name: riskText[k] || k,
      value: v,
      itemStyle: { color: colors[k] }
    }))

  const option = {
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        return `${params.name}<br/>人数：<b>${params.value} 人</b><br/>占比：${params.percent}%`
      }
    },
    legend: {
      orient: 'horizontal',
      bottom: '0%',
      itemWidth: 16,
      itemHeight: 16,
      textStyle: { fontSize: 13, color: '#5A4A42' }
    },
    series: [
      {
        name: '风险等级',
        type: 'pie',
        radius: ['40%', '70%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 10,
          borderColor: '#FFFFFF',
          borderWidth: 3
        },
        label: {
          show: true,
          fontSize: 13,
          fontWeight: 600,
          formatter: '{b}\n{d}%',
          color: '#5A4A42'
        },
        emphasis: {
          label: {
            show: true,
            fontSize: 16,
            fontWeight: 700
          },
          itemStyle: {
            shadowBlur: 12,
            shadowOffsetX: 0,
            shadowColor: 'rgba(232, 133, 90, 0.4)'
          }
        },
        labelLine: {
          show: true,
          length: 12,
          length2: 8
        },
        data: pieData
      }
    ]
  }
  riskLevelPieChart.setOption(option)
}

async function fetchAllStatistics() {
  loading.value = true
  try {
    try {
      const res = await getAllStatistics()
      const data = res.data as StatisticsData
      if (data) {
        Object.assign(overview, data.overview)
        Object.assign(consensusStats, data.consensusStats)
        Object.assign(careTaskStats, data.careTaskStats)
        routeCompletionRates.value = data.routeCompletionRates || []
        peakHourDistribution.value = data.peakHourDistribution || []
        satisfactionByStamina.value = data.satisfactionByStamina || []
        changeHotspots.value = data.changeHotspots || []
        lowConsensusReasons.value = data.lowConsensusReasons || []
        feedbackAcceptanceByStamina.value = data.feedbackAcceptanceByStamina || []
        consensusByRoute.value = data.consensusByRoute || []
        careFailureReasons.value = data.careFailureReasons || []
        carePriorityDistribution.value = data.carePriorityDistribution || []
        carePlanBurden.value = data.carePlanBurden || []
        if (data.healthReminderStats) Object.assign(healthReminderStats, data.healthReminderStats)
        topHealthConcerns.value = data.topHealthConcerns || []
        weatherRiskChangeDistribution.value = data.weatherRiskChangeDistribution || []
      } else {
        throw new Error('no all')
      }
    } catch {
      const [ov, cs, rc, ph, sa, ch, lcr, fas, cbr, cts, cfr, cpd, cpb, hrs, thc, wrcd] = await Promise.all([
        getOverview(),
        getConsensusStats(),
        getRouteCompletionRates(),
        getPeakHourDistribution(),
        getSatisfactionByStamina(),
        getChangeHotspots(),
        getLowConsensusReasons(),
        getFeedbackAcceptanceByStamina(),
        getConsensusByRoute(),
        getCareTaskStats(),
        getCareFailureReasons(),
        getCarePriorityDistribution(),
        getCarePlanBurden(),
        getHealthReminderStats(),
        getTopHealthConcerns(),
        getWeatherRiskChangeDistribution()
      ])
      if (ov.data) Object.assign(overview, ov.data as OverviewStats)
      if (cs.data) Object.assign(consensusStats, cs.data as ConsensusStats)
      if (cts.data) Object.assign(careTaskStats, cts.data as CareTaskStats)
      routeCompletionRates.value = (rc.data as RouteCompletionItem[]) || []
      peakHourDistribution.value = (ph.data as PeakHourItem[]) || []
      satisfactionByStamina.value = (sa.data as SatisfactionItem[]) || []
      changeHotspots.value = (ch.data as ChangeHotspotItem[]) || []
      lowConsensusReasons.value = (lcr.data as LowConsensusReasonItem[]) || []
      feedbackAcceptanceByStamina.value = (fas.data as FeedbackAcceptanceByStaminaItem[]) || []
      consensusByRoute.value = (cbr.data as ConsensusByRouteItem[]) || []
      careFailureReasons.value = (cfr.data as CareFailureReasonItem[]) || []
      carePriorityDistribution.value = (cpd.data as CarePriorityDistributionItem[]) || []
      carePlanBurden.value = (cpb.data as CarePlanBurdenItem[]) || []
      if (hrs.data) Object.assign(healthReminderStats, hrs.data as HealthReminderStats)
      topHealthConcerns.value = (thc.data as HealthConcernStatItem[]) || []
      weatherRiskChangeDistribution.value = (wrcd.data as WeatherRiskChangeStatItem[]) || []
    }

    await nextTick()
    initBarChart()
    initLineChart()
    initPieChart()
    initLowConsensusChart()
    initAcceptanceByStaminaChart()
    initCareStatusChart()
    initCareFailureReasonsChart()
    initCarePriorityChart()
    initHealthConcernChart()
    initWeatherRiskChangeChart()
    initRiskLevelPieChart()
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

onMounted(async () => {
  await fetchAllStatistics()
  window.addEventListener('resize', resizeCharts)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts)
  barChart?.dispose()
  lineChart?.dispose()
  pieChart?.dispose()
  lowConsensusChart?.dispose()
  acceptanceByStaminaChart?.dispose()
  careStatusChart?.dispose()
  careFailureReasonsChart?.dispose()
  carePriorityChart?.dispose()
  healthConcernChart?.dispose()
  weatherRiskChangeChart?.dispose()
  riskLevelPieChart?.dispose()
})

</script>
