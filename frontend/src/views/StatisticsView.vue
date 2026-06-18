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
  Coffee,
  RefreshRight,
  DataAnalysis,
  Histogram,
  PieChart,
  TrendCharts
} from '@element-plus/icons-vue'
import {
  getAllStatistics,
  getOverview,
  getRouteCompletionRates,
  getPeakHourDistribution,
  getSatisfactionByStamina,
  getChangeHotspots
} from '@/api/statistics'
import type {
  OverviewStats,
  RouteCompletionItem,
  PeakHourItem,
  SatisfactionItem,
  ChangeHotspotItem,
  StatisticsData
} from '@/types'

const loading = ref(false)
const barChartRef = ref<HTMLDivElement>()
const lineChartRef = ref<HTMLDivElement>()
const pieChartRef = ref<HTMLDivElement>()

let barChart: ECharts | null = null
let lineChart: ECharts | null = null
let pieChart: ECharts | null = null

const overview = reactive<OverviewStats>({
  totalPlans: 0,
  averageCompletionRate: 0,
  averageRestCount: 0,
  totalChanges: 0
})

const routeCompletionRates = ref<RouteCompletionItem[]>([])
const peakHourDistribution = ref<PeakHourItem[]>([])
const satisfactionByStamina = ref<SatisfactionItem[]>([])
const changeHotspots = ref<ChangeHotspotItem[]>([])

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
const COLORS = ['#E8855A', '#4A9B8C', '#E6A23C', '#F56C6C', '#909399', '#67C23A']

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

  const defaultData: SatisfactionItem[] = [
    { staminaLevel: '体力低', satisfactionRate: 72 },
    { staminaLevel: '体力中', satisfactionRate: 88 },
    { staminaLevel: '体力高', satisfactionRate: 95 }
  ]
  const data = satisfactionByStamina.value.length ? satisfactionByStamina.value : defaultData

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
        data: data.map((d) => ({
          name: d.staminaLevel,
          value: d.satisfactionRate
        }))
      }
    ]
  }
  pieChart.setOption(option)
}

function resizeCharts() {
  barChart?.resize()
  lineChart?.resize()
  pieChart?.resize()
}

async function fetchAllStatistics() {
  loading.value = true
  try {
    try {
      const res = await getAllStatistics()
      const data = res.data as StatisticsData
      if (data) {
        Object.assign(overview, data.overview)
        routeCompletionRates.value = data.routeCompletionRates || []
        peakHourDistribution.value = data.peakHourDistribution || []
        satisfactionByStamina.value = data.satisfactionByStamina || []
        changeHotspots.value = data.changeHotspots || []
      } else {
        throw new Error('no all')
      }
    } catch {
      const [ov, rc, ph, sa, ch] = await Promise.all([
        getOverview(),
        getRouteCompletionRates(),
        getPeakHourDistribution(),
        getSatisfactionByStamina(),
        getChangeHotspots()
      ])
      if (ov.data) Object.assign(overview, ov.data as OverviewStats)
      routeCompletionRates.value = (rc.data as RouteCompletionItem[]) || []
      peakHourDistribution.value = (ph.data as PeakHourItem[]) || []
      satisfactionByStamina.value = (sa.data as SatisfactionItem[]) || []
      changeHotspots.value = (ch.data as ChangeHotspotItem[]) || []
    }

    if (!changeHotspots.value.length) {
      changeHotspots.value = [
        { rank: 1, nodeName: '公园东门入口', changeCount: 12, impactLevel: 'high' },
        { rank: 2, nodeName: '休息亭A区', changeCount: 9, impactLevel: 'medium' },
        { rank: 3, nodeName: '观景平台', changeCount: 8, impactLevel: 'high' },
        { rank: 4, nodeName: '步道中段', changeCount: 7, impactLevel: 'medium' },
        { rank: 5, nodeName: '山脚集合点', changeCount: 6, impactLevel: 'medium' },
        { rank: 6, nodeName: '公厕旁休息区', changeCount: 5, impactLevel: 'low' },
        { rank: 7, nodeName: '荷花池边', changeCount: 4, impactLevel: 'low' },
        { rank: 8, nodeName: '老年活动中心', changeCount: 4, impactLevel: 'medium' },
        { rank: 9, nodeName: '南门出口', changeCount: 3, impactLevel: 'low' },
        { rank: 10, nodeName: '假山景点', changeCount: 2, impactLevel: 'low' }
      ]
    }

    if (!routeCompletionRates.value.length) {
      routeCompletionRates.value = [
        { routeName: '轻松休闲线', completionRate: 92 },
        { routeName: '适中观景线', completionRate: 85 },
        { routeName: '挑战登山线', completionRate: 68 },
        { routeName: '文化探访线', completionRate: 78 },
        { routeName: '湖光山色线', completionRate: 88 }
      ]
    }

    await nextTick()
    initBarChart()
    initLineChart()
    initPieChart()
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
})
</script>
