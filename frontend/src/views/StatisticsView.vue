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
  Coffee,
  RefreshRight,
  DataAnalysis,
  Histogram,
  PieChart,
  TrendCharts,
  WarningFilled,
  UserFilled,
  Guide
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
  getConsensusByRoute
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
  StatisticsData
} from '@/types'

const loading = ref(false)
const barChartRef = ref<HTMLDivElement>()
const lineChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()
const lowConsensusChartRef = ref<HTMLDivElement>()
const acceptanceByStaminaChartRef = ref<HTMLDivElement>()

let barChart: ECharts | null = null
let lineChart: ECharts | null = null
let pieChart: ECharts | null = null
let lowConsensusChart: ECharts | null = null
let acceptanceByStaminaChart: ECharts | null = null

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

function resizeCharts() {
  barChart?.resize()
  lineChart?.resize()
  pieChart?.resize()
  lowConsensusChart?.resize()
  acceptanceByStaminaChart?.resize()
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
        routeCompletionRates.value = data.routeCompletionRates || []
        peakHourDistribution.value = data.peakHourDistribution || []
        satisfactionByStamina.value = data.satisfactionByStamina || []
        changeHotspots.value = data.changeHotspots || []
        lowConsensusReasons.value = data.lowConsensusReasons || []
        feedbackAcceptanceByStamina.value = data.feedbackAcceptanceByStamina || []
        consensusByRoute.value = data.consensusByRoute || []
      } else {
        throw new Error('no all')
      }
    } catch {
      const [ov, cs, rc, ph, sa, ch, lcr, fas, cbr] = await Promise.all([
        getOverview(),
        getConsensusStats(),
        getRouteCompletionRates(),
        getPeakHourDistribution(),
        getSatisfactionByStamina(),
        getChangeHotspots(),
        getLowConsensusReasons(),
        getFeedbackAcceptanceByStamina(),
        getConsensusByRoute()
      ])
      if (ov.data) Object.assign(overview, ov.data as OverviewStats)
      if (cs.data) Object.assign(consensusStats, cs.data as ConsensusStats)
      routeCompletionRates.value = (rc.data as RouteCompletionItem[]) || []
      peakHourDistribution.value = (ph.data as PeakHourItem[]) || []
      satisfactionByStamina.value = (sa.data as SatisfactionItem[]) || []
      changeHotspots.value = (ch.data as ChangeHotspotItem[]) || []
      lowConsensusReasons.value = (lcr.data as LowConsensusReasonItem[]) || []
      feedbackAcceptanceByStamina.value = (fas.data as FeedbackAcceptanceByStaminaItem[]) || []
      consensusByRoute.value = (cbr.data as ConsensusByRouteItem[]) || []
    }

    await nextTick()
    initBarChart()
    initLineChart()
    initPieChart()
    initLowConsensusChart()
    initAcceptanceByStaminaChart()
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
})
</script>
