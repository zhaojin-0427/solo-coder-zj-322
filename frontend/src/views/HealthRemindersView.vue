<template>
  <div>
    <h2 class="page-title">出行前健康与天气适配提醒</h2>

    <div class="toolbar">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
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
      <div style="display: flex; gap: 12px; flex-wrap: wrap">
        <el-button :icon="RefreshLeft" size="large" @click="fetchAllData">
          刷新数据
        </el-button>
        <el-button
          type="primary"
          :icon="Plus"
          size="large"
          :disabled="!selectedPlanId"
          @click="openConfigDialog"
        >
          {{ currentConfig ? '编辑配置' : '新建配置' }}
        </el-button>
        <el-button
          type="success"
          :icon="EditPen"
          size="large"
          :disabled="!selectedPlanId"
          @click="openCheckinDialog"
        >
          新增健康登记
        </el-button>
        <el-button
          type="warning"
          :icon="Check"
          size="large"
          :disabled="!selectedPlanId || unconfirmedCount === 0"
          @click="handleBatchConfirm"
        >
          批量确认 ({{ unconfirmedCount }})
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px" v-loading="loading">
      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div style="display: flex; justify-content: space-between; align-items: center">
              <div style="font-size: 17px; font-weight: 700; color: #5A4A42">
                <el-icon :size="20" color="#4A9B8C" style="margin-right: 6px"><Sunny /></el-icon>
                健康天气配置
              </div>
              <el-tag v-if="currentConfig" :type="weatherTagType[currentConfig.weatherRiskLevel]" effect="dark" size="large">
                {{ weatherText[currentConfig.weatherRiskLevel] }}
              </el-tag>
            </div>
          </template>
          <div v-if="!selectedPlanId" style="text-align: center; padding: 20px 0; color: #909399">
            请先选择出行计划
          </div>
          <div v-else-if="!currentConfig" style="text-align: center; padding: 20px 0; color: #909399">
            <el-empty description="暂无配置，点击右上角'新建配置'按钮" :image-size="100">
              <el-button type="primary" size="large" @click="openConfigDialog">立即创建</el-button>
            </el-empty>
          </div>
          <div v-else>
            <el-descriptions :column="2" border size="default">
              <el-descriptions-item label="出行日期">
                <b>{{ currentConfig.travelDate }}</b>
              </el-descriptions-item>
              <el-descriptions-item label="预计时段">
                {{ currentConfig.startTimeSlot }} - {{ currentConfig.endTimeSlot }}
              </el-descriptions-item>
              <el-descriptions-item label="天气情况">
                <el-tag :type="weatherTagType[currentConfig.weatherRiskLevel]" effect="light" size="large">
                  {{ currentConfig.weatherDescription }}
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="温度/湿度">
                🌡️ {{ currentConfig.temperature }}°C / 💧 {{ currentConfig.humidity }}%
              </el-descriptions-item>
              <el-descriptions-item label="空气质量">
                <el-tag :type="airTagType[currentConfig.airQualityLevel]" effect="light" size="large">
                  {{ airText[currentConfig.airQualityLevel] }} (AQI:{{ currentConfig.aqiValue }})
                </el-tag>
              </el-descriptions-item>
              <el-descriptions-item label="配置更新时间">
                {{ formatDateTime(currentConfig.updatedAt) }}
              </el-descriptions-item>
            </el-descriptions>
            <div style="margin-top: 16px">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #5A4A42">
                <el-icon color="#E8855A" style="margin-right: 4px"><Bell /></el-icon>
                健康提醒项
              </div>
              <div style="display: flex; gap: 6px; flex-wrap: wrap">
                <el-tag
                  v-for="(h, i) in currentConfig.healthReminders"
                  :key="i"
                  type="warning"
                  effect="plain"
                  size="large"
                  style="margin-bottom: 4px"
                >
                  {{ h }}
                </el-tag>
                <span v-if="currentConfig.healthReminders.length === 0" style="color: #909399; font-size: 13px">暂未设置</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>

      <el-col :xs="24" :sm="24" :md="12" :lg="12">
        <el-card shadow="hover">
          <template #header>
            <div style="font-size: 17px; font-weight: 700; color: #5A4A42">
              <el-icon :size="20" color="#E8855A" style="margin-right: 6px"><DataAnalysis /></el-icon>
              本计划风险汇总
            </div>
          </template>
          <div v-if="!summary" style="text-align: center; padding: 20px 0; color: #909399">
            请先选择出行计划
          </div>
          <div v-else>
            <el-row :gutter="12">
              <el-col :span="8">
                <div class="mini-stat" style="background: #F0FAF7">
                  <div class="mini-stat-label">登记率</div>
                  <div class="mini-stat-value" style="color: #4A9B8C">{{ summary.checkinRate }}%</div>
                  <div class="mini-stat-sub">{{ summary.actualCheckinCount }}/{{ summary.expectedCheckinCount }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="mini-stat" style="background: #FFF8F2">
                  <div class="mini-stat-label">确认率</div>
                  <div class="mini-stat-value" style="color: #E8855A">{{ summary.confirmationRate }}%</div>
                  <div class="mini-stat-sub">{{ summary.confirmedCheckinCount }}/{{ summary.actualCheckinCount }}</div>
                </div>
              </el-col>
              <el-col :span="8">
                <div class="mini-stat" :style="{ background: summary.hasExtremeRisk ? '#FEF0F0' : '#FFF3CD' }">
                  <div class="mini-stat-label">高风险</div>
                  <div class="mini-stat-value" :style="{ color: summary.hasExtremeRisk ? '#F56C6C' : '#E6A23C' }">
                    {{ summary.highRiskCount }}人
                  </div>
                  <div class="mini-stat-sub">建议改短{{ summary.suggestShortenCount }}人</div>
                </div>
              </el-col>
            </el-row>

            <div style="margin-top: 16px">
              <el-progress
                v-if="summary.expectedCheckinCount > 0"
                :percentage="summary.checkinRate"
                :color="summary.checkinRate >= 80 ? '#67C23A' : summary.checkinRate >= 50 ? '#E6A23C' : '#F56C6C'"
                :stroke-width="12"
              >
                <template #default="{ percentage }">
                  <span style="font-size: 14px; font-weight: 600">{{ percentage }}% 已登记</span>
                </template>
              </el-progress>
            </div>

            <div style="margin-top: 16px" v-if="summary.summarySuggestions && summary.summarySuggestions.length > 0">
              <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #5A4A42">
                <el-icon color="#F56C6C" style="margin-right: 4px"><Warning /></el-icon>
                汇总出行建议
              </div>
              <div style="background: #FFF8F2; border-radius: 10px; padding: 12px">
                <ul style="margin: 0; padding-left: 18px; color: #5A4A42; line-height: 2">
                  <li v-for="(s, i) in summary.summarySuggestions" :key="i" style="font-size: 13px">{{ s }}</li>
                </ul>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card v-loading="loading" style="margin-bottom: 20px">
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px">
        <div style="font-size: 17px; font-weight: 700; color: #5A4A42">
          <el-icon :size="20" color="#409EFF" style="margin-right: 6px"><UserFilled /></el-icon>
          长辈健康登记与出行建议
          <el-tag type="info" effect="light" size="large" style="margin-left: 10px">
            共 {{ advices.length }} 位长辈
          </el-tag>
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap; align-items: center">
          <span style="font-size: 14px; color: #8B7B73">风险筛选：</span>
          <el-checkbox-group v-model="riskFilter">
            <el-checkbox-button value="all" size="large">全部</el-checkbox-button>
            <el-checkbox-button value="high" size="large">
              <span style="color: #F56C6C">高风险</span>
            </el-checkbox-button>
            <el-checkbox-button value="medium" size="large">
              <span style="color: #E6A23C">中风险</span>
            </el-checkbox-button>
            <el-checkbox-button value="low" size="large">
              <span style="color: #67C23A">低风险</span>
            </el-checkbox-button>
            <el-checkbox-button value="shorten" size="large">
              <span style="color: #409EFF">建议改短</span>
            </el-checkbox-button>
          </el-checkbox-group>
        </div>
      </div>

      <div v-if="!selectedPlanId" style="text-align: center; padding: 40px 0">
        <el-empty description="请先选择出行计划查看长辈登记" :image-size="140" />
      </div>

      <div v-else-if="filteredAdvices.length === 0" style="text-align: center; padding: 40px 0">
        <el-empty description="当前筛选条件下暂无数据" :image-size="100" />
      </div>

      <div v-else>
        <el-row :gutter="20">
          <el-col
            v-for="advice in filteredAdvices"
            :key="advice.elderName"
            :xs="24"
            :sm="24"
            :md="12"
            :lg="8"
            style="margin-bottom: 20px"
          >
            <div
              class="elder-card"
              :class="{
                'danger-border': advice.healthRiskLevel === 'danger',
                'warning-border': advice.healthRiskLevel === 'warning',
                'caution-border': advice.healthRiskLevel === 'caution',
              }"
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px">
                <div>
                  <div style="font-size: 19px; font-weight: 700; color: #5A4A42; margin-bottom: 6px">
                    {{ advice.elderName }}
                  </div>
                  <div style="display: flex; gap: 6px; flex-wrap: wrap; align-items: center">
                    <el-tag type="info" effect="light" size="large">
                      体力{{ advice.staminaLevel }}
                    </el-tag>
                    <el-tag
                      :type="riskTagType[advice.healthRiskLevel]"
                      effect="dark"
                      size="large"
                    >
                      {{ riskText[advice.healthRiskLevel] }} · {{ advice.riskScore }}分
                    </el-tag>
                    <el-tag
                      v-if="advice.shouldShortenRoute"
                      type="primary"
                      effect="plain"
                      size="large"
                    >
                      建议减约{{ advice.suggestedShortenMinutes }}分钟
                    </el-tag>
                  </div>
                </div>
                <div>
                  <el-tag
                    v-if="getCheckinByElder(advice.elderName)?.isConfirmed"
                    type="success"
                    effect="dark"
                    size="large"
                  >
                    <el-icon style="margin-right: 2px"><CircleCheckFilled /></el-icon>
                    已确认
                  </el-tag>
                  <el-tag
                    v-else-if="getCheckinByElder(advice.elderName)"
                    type="warning"
                    effect="light"
                    size="large"
                  >
                    待确认
                  </el-tag>
                  <el-tag
                    v-else
                    type="info"
                    effect="plain"
                    size="large"
                  >
                    未登记
                  </el-tag>
                </div>
              </div>

              <div v-if="advice.riskTags && advice.riskTags.length > 0" style="margin-bottom: 12px">
                <div style="display: flex; gap: 4px; flex-wrap: wrap">
                  <el-tag
                    v-for="(t, i) in advice.riskTags"
                    :key="i"
                    type="danger"
                    effect="light"
                    size="small"
                  >
                    ⚠️ {{ t }}
                  </el-tag>
                </div>
              </div>

              <div
                v-if="getCheckinByElder(advice.elderName)"
                style="background: #FBF5EF; border-radius: 10px; padding: 10px 12px; margin-bottom: 12px"
              >
                <div style="font-size: 13px; font-weight: 600; color: #5A4A42; margin-bottom: 6px">
                  当日健康数据
                </div>
                <el-row :gutter="8">
                  <el-col :span="12" v-if="getCheckinByElder(advice.elderName)!.systolicBloodPressure">
                    <div class="data-chip">
                      <span class="chip-label">血压</span>
                      <span class="chip-value" :class="{
                        'value-danger': (getCheckinByElder(advice.elderName)!.systolicBloodPressure || 0) >= 140,
                      }">
                        {{ getCheckinByElder(advice.elderName)!.systolicBloodPressure }}/{{ getCheckinByElder(advice.elderName)!.diastolicBloodPressure }}
                      </span>
                    </div>
                  </el-col>
                  <el-col :span="12" v-if="getCheckinByElder(advice.elderName)!.fastingBloodSugar">
                    <div class="data-chip">
                      <span class="chip-label">血糖</span>
                      <span class="chip-value" :class="{
                        'value-danger': (getCheckinByElder(advice.elderName)!.fastingBloodSugar || 0) >= 7,
                      }">
                        {{ getCheckinByElder(advice.elderName)!.fastingBloodSugar }}mmol
                      </span>
                    </div>
                  </el-col>
                  <el-col :span="12" v-if="getCheckinByElder(advice.elderName)!.sleepHours">
                    <div class="data-chip">
                      <span class="chip-label">睡眠</span>
                      <span class="chip-value">
                        {{ getCheckinByElder(advice.elderName)!.sleepHours }}h ({{ getCheckinByElder(advice.elderName)!.sleepQuality }}/5)
                      </span>
                    </div>
                  </el-col>
                  <el-col :span="12">
                    <div class="data-chip">
                      <span class="chip-label">药物</span>
                      <span class="chip-value" :class="{
                        'value-danger': !getCheckinByElder(advice.elderName)!.hasMedicationReady,
                      }">
                        {{ getCheckinByElder(advice.elderName)!.hasMedicationReady ? '✓已备' : '✗未齐' }}
                      </span>
                    </div>
                  </el-col>
                </el-row>
                <div style="margin-top: 6px" v-if="getCheckinByElder(advice.elderName)!.hasJointDiscomfort">
                  <el-tag size="small" type="warning" effect="light">🦴 {{ getCheckinByElder(advice.elderName)!.jointDiscomfortDetail || '关节不适' }}</el-tag>
                </div>
              </div>

              <div style="border-top: 1px dashed #F0D9C7; padding-top: 10px; margin-bottom: 10px">
                <div style="font-size: 13px; font-weight: 600; margin-bottom: 6px; color: #4A9B8C">
                  <el-icon style="margin-right: 2px"><View /></el-icon>
                  出行建议
                </div>
                <ul style="margin: 0; padding-left: 18px; line-height: 1.7; max-height: 120px; overflow-y: auto">
                  <li
                    v-for="(s, i) in advice.suggestions.slice(0, 5)"
                    :key="i"
                    style="font-size: 12.5px; color: #5A4A42"
                  >
                    {{ s }}
                  </li>
                </ul>
              </div>

              <div style="display: flex; gap: 6px; flex-wrap: wrap">
                <el-button
                  size="small"
                  type="success"
                  :disabled="!getCheckinByElder(advice.elderName) || getCheckinByElder(advice.elderName)?.isConfirmed"
                  @click="handleConfirmCheckin(advice)"
                >
                  确认登记
                </el-button>
                <el-button
                  size="small"
                  type="primary"
                  @click="viewElderDetail(advice)"
                >
                  查看详情
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-card v-loading="loading" v-if="selectedPlanId">
      <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center">
        <div style="font-size: 17px; font-weight: 700; color: #5A4A42">
          <el-icon :size="20" color="#F56C6C" style="margin-right: 6px"><WarningFilled /></el-icon>
          未确认 / 未登记人员列表
        </div>
        <el-tag type="danger" effect="light" size="large">
          共 {{ unconfirmedList.length }} 人需处理
        </el-tag>
      </div>

      <el-table
        v-if="unconfirmedList.length > 0"
        :data="unconfirmedList"
        stripe
        border
        size="large"
      >
        <el-table-column prop="planTitle" label="所属计划" min-width="180" />
        <el-table-column prop="elderName" label="长辈姓名" min-width="160">
          <template #default="{ row }">
            <span style="font-weight: 600">
              <el-icon style="color: #F56C6C; margin-right: 4px"><UserFilled /></el-icon>
              {{ row.elderName }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="状态" width="140" align="center">
          <template #default="{ row }">
            <el-tag
              :type="row.checkinTime ? 'warning' : 'info'"
              effect="light"
              size="large"
            >
              {{ row.checkinTime ? '已登记·待确认' : '尚未登记' }}
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="checkinTime" label="登记时间" min-width="160">
          <template #default="{ row }">
            {{ row.checkinTime ? formatDateTime(row.checkinTime) : '-' }}
          </template>
        </el-table-column>
      </el-table>
      <el-empty v-else description="所有长辈均已完成登记与确认，状态良好！" :image-size="120">
        <template #image>
          <el-icon :size="100" color="#67C23A"><CircleCheckFilled /></el-icon>
        </template>
      </el-empty>
    </el-card>

    <el-dialog
      v-model="configDialogVisible"
      :title="currentConfig ? '编辑健康天气配置' : '新建健康天气配置'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="configFormRef"
        :model="configForm"
        :rules="configFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="出行日期" prop="travelDate">
          <el-date-picker
            v-model="configForm.travelDate"
            type="date"
            value-format="YYYY-MM-DD"
            placeholder="选择出行日期"
            size="large"
            style="width: 100%"
          />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="开始时段" prop="startTimeSlot">
              <el-time-picker
                v-model="configForm.startTimeSlot"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="开始时间"
                size="large"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="结束时段" prop="endTimeSlot">
              <el-time-picker
                v-model="configForm.endTimeSlot"
                format="HH:mm"
                value-format="HH:mm"
                placeholder="结束时间"
                size="large"
                style="width: 100%"
              />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="天气风险" prop="weatherRiskLevel">
              <el-radio-group v-model="configForm.weatherRiskLevel" size="large">
                <el-radio-button value="low">低</el-radio-button>
                <el-radio-button value="medium">中</el-radio-button>
                <el-radio-button value="high">高</el-radio-button>
                <el-radio-button value="extreme">极高</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="天气描述" prop="weatherDescription">
              <el-input v-model="configForm.weatherDescription" placeholder="例：晴转多云" size="large" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-row :gutter="12">
          <el-col :span="8">
            <el-form-item label="温度(°C)" prop="temperature">
              <el-input-number v-model="configForm.temperature" size="large" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="湿度(%)" prop="humidity">
              <el-input-number v-model="configForm.humidity" :min="0" :max="100" size="large" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="8">
            <el-form-item label="AQI指数" prop="aqiValue">
              <el-input-number v-model="configForm.aqiValue" :min="0" size="large" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="空气质量" prop="airQualityLevel">
          <el-select v-model="configForm.airQualityLevel" placeholder="选择等级" size="large" style="width: 100%">
            <el-option label="优" value="excellent" />
            <el-option label="良" value="good" />
            <el-option label="轻度污染" value="moderate" />
            <el-option label="中度污染(敏感人群不适)" value="unhealthy-sensitive" />
            <el-option label="重度污染" value="unhealthy" />
            <el-option label="严重污染" value="hazardous" />
          </el-select>
        </el-form-item>
        <el-form-item label="健康提醒项">
          <div style="width: 100%">
            <el-tag
              v-for="(t, i) in tempReminders"
              :key="i"
              closable
              type="warning"
              size="large"
              style="margin-right: 6px; margin-bottom: 6px"
              @close="tempReminders.splice(i, 1)"
            >
              {{ t }}
            </el-tag>
            <el-input
              v-model="newReminderInput"
              size="small"
              style="width: 200px"
              placeholder="输入后回车添加"
              @keyup.enter="addReminder"
            />
          </div>
        </el-form-item>
        <el-form-item label="创建者ID" prop="creatorId" v-if="!currentConfig">
          <el-input v-model="configForm.creatorId" placeholder="user-001" size="large" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="configDialogVisible = false" size="large">取消</el-button>
        <el-button type="primary" :loading="configSubmitting" size="large" @click="submitConfig">
          {{ currentConfig ? '保存修改' : '创建配置' }}
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="checkinDialogVisible"
      title="新增长辈健康登记"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="checkinFormRef"
        :model="checkinForm"
        :rules="checkinFormRules"
        label-width="130px"
        label-position="right"
      >
        <el-form-item label="所属计划">
          <el-tag type="primary" size="large">{{ currentPlan?.title }}</el-tag>
        </el-form-item>
        <el-form-item label="长者姓名" prop="elderName">
          <el-select
            v-model="checkinForm.elderName"
            placeholder="选择或输入长者姓名"
            size="large"
            filterable
            allow-create
            style="width: 100%"
          >
            <el-option
              v-for="p in eldersOfPlan"
              :key="p.elderName"
              :label="p.elderName + (p.staminaLevel ? ` · 体力${p.staminaLevel}` : '')"
              :value="p.elderName"
            />
          </el-select>
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="收缩压(mmHg)">
              <el-input-number v-model="checkinForm.systolicBloodPressure" :min="60" :max="250" size="large" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="舒张压(mmHg)">
              <el-input-number v-model="checkinForm.diastolicBloodPressure" :min="40" :max="160" size="large" style="width: 100%" />
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="空腹血糖(mmol/L)">
          <el-input-number v-model="checkinForm.fastingBloodSugar" :min="2" :max="20" :step="0.1" size="large" style="width: 100%" />
        </el-form-item>
        <el-row :gutter="12">
          <el-col :span="12">
            <el-form-item label="睡眠时长(h)">
              <el-input-number v-model="checkinForm.sleepHours" :min="0" :max="16" :step="0.5" size="large" style="width: 100%" />
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="睡眠质量(1-5)">
              <el-radio-group v-model="checkinForm.sleepQuality" size="large">
                <el-radio-button :value="1">很差</el-radio-button>
                <el-radio-button :value="2">较差</el-radio-button>
                <el-radio-button :value="3">一般</el-radio-button>
                <el-radio-button :value="4">良好</el-radio-button>
                <el-radio-button :value="5">很好</el-radio-button>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="关节不适" prop="hasJointDiscomfort">
          <el-radio-group v-model="checkinForm.hasJointDiscomfort" size="large">
            <el-radio :value="false">无</el-radio>
            <el-radio :value="true">有</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="不适详细描述" v-if="checkinForm.hasJointDiscomfort">
          <el-input v-model="checkinForm.jointDiscomfortDetail" type="textarea" :rows="2" size="large" placeholder="例：膝盖酸痛、腰部僵硬" />
        </el-form-item>
        <el-form-item label="药物已备齐" prop="hasMedicationReady">
          <el-radio-group v-model="checkinForm.hasMedicationReady" size="large">
            <el-radio :value="true">已备齐</el-radio>
            <el-radio :value="false">未备齐</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="携带药物">
          <div style="width: 100%">
            <el-tag
              v-for="(t, i) in tempMeds"
              :key="i"
              closable
              type="success"
              size="large"
              style="margin-right: 6px; margin-bottom: 6px"
              @close="tempMeds.splice(i, 1)"
            >
              {{ t }}
            </el-tag>
            <el-input
              v-model="newMedInput"
              size="small"
              style="width: 200px"
              placeholder="输入药物名回车添加"
              @keyup.enter="addMed"
            />
          </div>
        </el-form-item>
        <el-form-item label="当日健康顾虑">
          <div style="width: 100%">
            <el-tag
              v-for="(t, i) in tempConcerns"
              :key="i"
              closable
              type="warning"
              effect="light"
              size="large"
              style="margin-right: 6px; margin-bottom: 6px"
              @close="tempConcerns.splice(i, 1)"
            >
              {{ t }}
            </el-tag>
            <el-input
              v-model="newConcernInput"
              size="small"
              style="width: 200px"
              placeholder="输入顾虑回车添加"
              @keyup.enter="addConcern"
            />
          </div>
          <div style="margin-top: 6px">
            <span style="font-size: 12px; color: #909399; margin-right: 8px">快捷选择：</span>
            <el-checkbox-group v-model="quickConcerns">
              <el-checkbox value="怕热中暑" size="small">怕热中暑</el-checkbox>
              <el-checkbox value="怕冷受凉" size="small">怕冷受凉</el-checkbox>
              <el-checkbox value="怕走路多" size="small">怕走路多</el-checkbox>
              <el-checkbox value="担心人多" size="small">担心人多</el-checkbox>
              <el-checkbox value="空气不好" size="small">空气不好</el-checkbox>
            </el-checkbox-group>
          </div>
        </el-form-item>
        <el-form-item label="备注">
          <el-input v-model="checkinForm.notes" type="textarea" :rows="2" size="large" placeholder="其他需要说明的情况" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="checkinDialogVisible = false" size="large">取消</el-button>
        <el-button type="primary" :loading="checkinSubmitting" size="large" @click="submitCheckin">
          提交登记
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      :title="`${currentAdviceDetail?.elderName || ''} - 出行建议详情`"
      width="720px"
    >
      <div v-if="currentAdviceDetail">
        <div style="margin-bottom: 16px; padding: 16px; background: linear-gradient(135deg, #FFF8F2 0%, #F0FAF7 100%); border-radius: 12px">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px">
            <div style="font-size: 22px; font-weight: 700; color: #5A4A42">
              {{ currentAdviceDetail.elderName }}
            </div>
            <div>
              <el-tag
                :type="riskTagType[currentAdviceDetail.healthRiskLevel]"
                effect="dark"
                size="large"
              >
                风险分：{{ currentAdviceDetail.riskScore }} · {{ riskText[currentAdviceDetail.healthRiskLevel] }}
              </el-tag>
            </div>
          </div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap">
            <el-tag type="info" effect="light" size="large">体力{{ currentAdviceDetail.staminaLevel }}</el-tag>
            <el-tag v-if="currentAdviceDetail.shouldShortenRoute" type="primary" effect="dark" size="large">
              建议缩短{{ currentAdviceDetail.suggestedShortenMinutes }}分钟
            </el-tag>
          </div>
        </div>

        <div v-if="currentAdviceDetail.riskTags && currentAdviceDetail.riskTags.length > 0" style="margin-bottom: 16px">
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px; color: #F56C6C">
            <el-icon style="margin-right: 4px"><Warning /></el-icon>
            风险因素
          </div>
          <div style="display: flex; gap: 6px; flex-wrap: wrap">
            <el-tag
              v-for="(t, i) in currentAdviceDetail.riskTags"
              :key="i"
              type="danger"
              effect="light"
              size="large"
            >
              {{ t }}
            </el-tag>
          </div>
        </div>

        <div style="margin-bottom: 16px">
          <div style="font-size: 15px; font-weight: 600; margin-bottom: 8px; color: #4A9B8C">
            <el-icon style="margin-right: 4px"><List /></el-icon>
            完整出行建议
          </div>
          <div style="background: #FBF5EF; border-radius: 10px; padding: 16px">
            <ol style="margin: 0; padding-left: 22px; line-height: 2">
              <li v-for="(s, i) in currentAdviceDetail.suggestions" :key="i" style="font-size: 14px; color: #5A4A42">
                {{ s }}
              </li>
            </ol>
          </div>
        </div>
      </div>
      <template #footer>
        <el-button type="primary" size="large" @click="detailDialogVisible = false">我知道了</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, watch, onMounted, type FormInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  RefreshLeft,
  Plus,
  Check,
  Sunny,
  DataAnalysis,
  Bell,
  Warning,
  UserFilled,
  CircleCheckFilled,
  View,
  List,
  EditPen,
  WarningFilled
} from '@element-plus/icons-vue'
import {
  getAllPlans
} from '@/api/plans'
import {
  getPreferenceList
} from '@/api/preferences'
import {
  getConfigByPlanId,
  createConfig,
  updateConfig,
  getAllCheckins,
  createCheckin,
  confirmCheckin,
  confirmBatchCheckins,
  getAdviceByPlanId,
  getPlanSummary,
  getUnconfirmedElders
} from '@/api/health-weather'
import type {
  TravelPlan,
  ElderPreference,
  HealthWeatherConfig,
  ElderHealthCheckin,
  ElderTravelAdvice,
  PlanHealthWeatherSummary,
  CreateHealthWeatherConfigParams,
  CreateElderHealthCheckinParams,
  UnconfirmedElderItem,
  WeatherRiskLevel,
  AirQualityLevel,
  HealthRiskLevel,
} from '@/types'

const loading = ref(false)
const planOptions = ref<TravelPlan[]>([])
const selectedPlanId = ref('')
const currentConfig = ref<HealthWeatherConfig | null>(null)
const checkins = ref<ElderHealthCheckin[]>([])
const advices = ref<ElderTravelAdvice[]>([])
const summary = ref<PlanHealthWeatherSummary | null>(null)
const unconfirmedList = ref<UnconfirmedElderItem[]>([])
const riskFilter = ref<string[]>(['all'])

const configDialogVisible = ref(false)
const configFormRef = ref<FormInstance>()
const configSubmitting = ref(false)
const newReminderInput = ref('')
const tempReminders = ref<string[]>([])

const checkinDialogVisible = ref(false)
const checkinFormRef = ref<FormInstance>()
const checkinSubmitting = ref(false)
const newMedInput = ref('')
const tempMeds = ref<string[]>([])
const newConcernInput = ref('')
const tempConcerns = ref<string[]>([])
const quickConcerns = ref<string[]>([])
const eldersOfPlan = ref<ElderPreference[]>([])

const detailDialogVisible = ref(false)
const currentAdviceDetail = ref<ElderTravelAdvice | null>(null)

const weatherText: Record<WeatherRiskLevel, string> = {
  low: '天气良好',
  medium: '天气一般',
  high: '天气风险高',
  extreme: '极端天气警告'
}

const weatherTagType: Record<WeatherRiskLevel, 'success' | 'info' | 'warning' | 'danger'> = {
  low: 'success',
  medium: 'info',
  high: 'warning',
  extreme: 'danger'
}

const airText: Record<AirQualityLevel, string> = {
  excellent: '优',
  good: '良',
  moderate: '轻度污染',
  'unhealthy-sensitive': '中度污染',
  unhealthy: '重度污染',
  hazardous: '严重污染'
}

const airTagType: Record<AirQualityLevel, 'success' | 'success' | 'warning' | 'warning' | 'danger' | 'danger'> = {
  excellent: 'success',
  good: 'success',
  moderate: 'warning',
  'unhealthy-sensitive': 'warning',
  unhealthy: 'danger',
  hazardous: 'danger'
}

const riskText: Record<HealthRiskLevel, string> = {
  safe: '安全',
  caution: '注意',
  warning: '高风险',
  danger: '极高风险'
}

const riskTagType: Record<HealthRiskLevel, 'success' | 'info' | 'warning' | 'danger'> = {
  safe: 'success',
  caution: 'info',
  warning: 'warning',
  danger: 'danger'
}

const configForm = reactive<CreateHealthWeatherConfigParams>({
  planId: '',
  travelDate: '',
  startTimeSlot: '08:00',
  endTimeSlot: '12:00',
  weatherRiskLevel: 'low',
  weatherDescription: '',
  airQualityLevel: 'good',
  aqiValue: 50,
  temperature: 25,
  humidity: 60,
  healthReminders: [],
  creatorId: 'user-001'
})

const configFormRules = {
  travelDate: [{ required: true, message: '请选择出行日期', trigger: 'change' }],
  startTimeSlot: [{ required: true, message: '请选择开始时段', trigger: 'change' }],
  endTimeSlot: [{ required: true, message: '请选择结束时段', trigger: 'change' }],
  weatherRiskLevel: [{ required: true, message: '请选择天气风险等级', trigger: 'change' }],
  weatherDescription: [{ required: true, message: '请输入天气描述', trigger: 'blur' }],
  airQualityLevel: [{ required: true, message: '请选择空气质量', trigger: 'change' }],
}

const checkinForm = reactive<CreateElderHealthCheckinParams>({
  planId: '',
  elderName: '',
  systolicBloodPressure: undefined,
  diastolicBloodPressure: undefined,
  fastingBloodSugar: undefined,
  sleepQuality: undefined,
  sleepHours: undefined,
  hasJointDiscomfort: false,
  hasMedicationReady: true,
})

const checkinFormRules = {
  elderName: [{ required: true, message: '请选择或输入长者姓名', trigger: 'change' }],
  hasJointDiscomfort: [{ required: true, message: '请选择', trigger: 'change' }],
  hasMedicationReady: [{ required: true, message: '请选择', trigger: 'change' }],
}

const currentPlan = computed<TravelPlan | undefined>(() => {
  return planOptions.value.find((p) => p.id === selectedPlanId.value)
})

const unconfirmedCount = computed(() => unconfirmedList.value.length)

const filteredAdvices = computed(() => {
  const showAll = riskFilter.value.includes('all') || riskFilter.value.length === 0
  if (showAll) return advices.value
  return advices.value.filter((a) => {
    if (riskFilter.value.includes('high') && (a.healthRiskLevel === 'warning' || a.healthRiskLevel === 'danger')) return true
    if (riskFilter.value.includes('medium') && a.healthRiskLevel === 'caution') return true
    if (riskFilter.value.includes('low') && a.healthRiskLevel === 'safe') return true
    if (riskFilter.value.includes('shorten') && a.shouldShortenRoute) return true
    return false
  })
})

watch(riskFilter, (v) => {
  if (v.includes('all') && v.length > 1) {
    riskFilter.value = ['all']
  }
})

function formatDateTime(dateStr: string | undefined) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${hh}:${mm}`
}

function getCheckinByElder(name: string): ElderHealthCheckin | undefined {
  return checkins.value.find((c) => c.elderName === name)
}

async function fetchPlans() {
  try {
    const res = await getAllPlans()
    planOptions.value = (res.data as TravelPlan[]) || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchEldersOfPlan() {
  if (!selectedPlanId.value) {
    eldersOfPlan.value = []
    return
  }
  try {
    const res = await getPreferenceList({ planId: selectedPlanId.value })
    eldersOfPlan.value = (res.data as ElderPreference[]) || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchAllData() {
  if (!selectedPlanId.value) return
  loading.value = true
  try {
    await fetchEldersOfPlan()
    const [cfgRes, ckiRes, advRes, sumRes, uncRes] = await Promise.all([
      getConfigByPlanId(selectedPlanId.value).catch(() => ({ data: undefined })),
      getAllCheckins(selectedPlanId.value).catch(() => ({ data: [] })),
      getAdviceByPlanId(selectedPlanId.value).catch(() => ({ data: [] })),
      getPlanSummary(selectedPlanId.value).catch(() => ({ data: null })),
      getUnconfirmedElders(selectedPlanId.value).catch(() => ({ data: [] })),
    ])
    currentConfig.value = (cfgRes.data as HealthWeatherConfig) || null
    checkins.value = (ckiRes.data as ElderHealthCheckin[]) || []
    advices.value = (advRes.data as ElderTravelAdvice[]) || []
    summary.value = (sumRes.data as PlanHealthWeatherSummary) || null
    unconfirmedList.value = (uncRes.data as UnconfirmedElderItem[]) || []
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handlePlanChange() {
  currentConfig.value = null
  checkins.value = []
  advices.value = []
  summary.value = null
  unconfirmedList.value = []
  fetchAllData()
}

function openConfigDialog() {
  if (currentConfig.value) {
    Object.assign(configForm, {
      planId: selectedPlanId.value,
      travelDate: currentConfig.value.travelDate,
      startTimeSlot: currentConfig.value.startTimeSlot,
      endTimeSlot: currentConfig.value.endTimeSlot,
      weatherRiskLevel: currentConfig.value.weatherRiskLevel,
      weatherDescription: currentConfig.value.weatherDescription,
      airQualityLevel: currentConfig.value.airQualityLevel,
      aqiValue: currentConfig.value.aqiValue,
      temperature: currentConfig.value.temperature,
      humidity: currentConfig.value.humidity,
      creatorId: currentConfig.value.creatorId,
    })
    tempReminders.value = [...currentConfig.value.healthReminders]
  } else {
    Object.assign(configForm, {
      planId: selectedPlanId.value,
      travelDate: '',
      startTimeSlot: '08:00',
      endTimeSlot: '12:00',
      weatherRiskLevel: 'low',
      weatherDescription: '',
      airQualityLevel: 'good',
      aqiValue: 50,
      temperature: 25,
      humidity: 60,
      creatorId: 'user-001',
    })
    tempReminders.value = []
  }
  newReminderInput.value = ''
  configDialogVisible.value = true
}

function addReminder() {
  if (newReminderInput.value.trim()) {
    tempReminders.value.push(newReminderInput.value.trim())
    newReminderInput.value = ''
  }
}

async function submitConfig() {
  if (!configFormRef.value) return
  await configFormRef.value.validate(async (valid) => {
    if (!valid) return
    configSubmitting.value = true
    try {
      if (currentConfig.value) {
        await updateConfig(currentConfig.value.id, {
          travelDate: configForm.travelDate,
          startTimeSlot: configForm.startTimeSlot,
          endTimeSlot: configForm.endTimeSlot,
          weatherRiskLevel: configForm.weatherRiskLevel,
          weatherDescription: configForm.weatherDescription,
          airQualityLevel: configForm.airQualityLevel,
          aqiValue: configForm.aqiValue,
          temperature: configForm.temperature,
          humidity: configForm.humidity,
          healthReminders: [...tempReminders.value],
        })
        ElMessage.success('配置更新成功')
      } else {
        await createConfig({
          ...configForm,
          planId: selectedPlanId.value,
          healthReminders: [...tempReminders.value],
        })
        ElMessage.success('配置创建成功')
      }
      configDialogVisible.value = false
      fetchAllData()
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '保存失败')
      console.error(e)
    } finally {
      configSubmitting.value = false
    }
  })
}

function openCheckinDialog() {
  Object.assign(checkinForm, {
    planId: selectedPlanId.value,
    elderName: '',
    systolicBloodPressure: undefined,
    diastolicBloodPressure: undefined,
    fastingBloodSugar: undefined,
    sleepQuality: undefined,
    sleepHours: undefined,
    hasJointDiscomfort: false,
    jointDiscomfortDetail: undefined,
    hasMedicationReady: true,
    notes: undefined,
  })
  tempMeds.value = []
  tempConcerns.value = []
  quickConcerns.value = []
  newMedInput.value = ''
  newConcernInput.value = ''
  checkinDialogVisible.value = true
}

function addMed() {
  if (newMedInput.value.trim()) {
    tempMeds.value.push(newMedInput.value.trim())
    newMedInput.value = ''
  }
}

function addConcern() {
  if (newConcernInput.value.trim()) {
    tempConcerns.value.push(newConcernInput.value.trim())
    newConcernInput.value = ''
  }
}

watch(quickConcerns, (v) => {
  for (const item of v) {
    if (!tempConcerns.value.includes(item)) {
      tempConcerns.value.push(item)
    }
  }
})

async function submitCheckin() {
  if (!checkinFormRef.value) return
  await checkinFormRef.value.validate(async (valid) => {
    if (!valid) return
    checkinSubmitting.value = true
    try {
      const matchedPref = eldersOfPlan.value.find((p) => p.elderName === checkinForm.elderName)
      await createCheckin({
        ...checkinForm,
        planId: selectedPlanId.value,
        preferenceId: matchedPref?.id,
        medicationsReady: [...tempMeds.value],
        healthConcerns: [...tempConcerns.value],
      })
      ElMessage.success('登记提交成功')
      checkinDialogVisible.value = false
      fetchAllData()
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '提交失败')
      console.error(e)
    } finally {
      checkinSubmitting.value = false
    }
  })
}

async function handleConfirmCheckin(advice: ElderTravelAdvice) {
  const cki = getCheckinByElder(advice.elderName)
  if (!cki) return
  try {
    await ElMessageBox.confirm(
      `确认已审核「${advice.elderName}」的健康登记信息？`,
      '确认登记',
      { confirmButtonText: '确认审核通过', cancelButtonText: '取消', type: 'info' }
    )
    await confirmCheckin(cki.id, { confirmerId: 'admin' })
    ElMessage.success('已确认登记')
    fetchAllData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

async function handleBatchConfirm() {
  try {
    await ElMessageBox.confirm(
      `将批量确认 ${unconfirmedCount.value} 条未确认登记，确认操作？`,
      '批量确认',
      { confirmButtonText: '确认全部', cancelButtonText: '取消', type: 'warning' }
    )
    await confirmBatchCheckins(selectedPlanId.value, { confirmerId: 'admin' })
    ElMessage.success('批量确认完成')
    fetchAllData()
  } catch (e) {
    if (e !== 'cancel') console.error(e)
  }
}

function viewElderDetail(advice: ElderTravelAdvice) {
  currentAdviceDetail.value = advice
  detailDialogVisible.value = true
}

onMounted(async () => {
  await fetchPlans()
})
</script>

<style scoped>
.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  padding: 16px 20px;
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #F0D9C7;
  flex-wrap: wrap;
  gap: 12px;
}

.page-title {
  font-size: 26px;
  font-weight: 700;
  color: #5A4A42;
  margin: 0 0 20px 0;
  padding-left: 14px;
  border-left: 5px solid #E8855A;
  line-height: 1.3;
}

.mini-stat {
  border-radius: 12px;
  padding: 14px 10px;
  text-align: center;
}

.mini-stat-label {
  font-size: 13px;
  color: #8B7B73;
  margin-bottom: 4px;
}

.mini-stat-value {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.2;
}

.mini-stat-sub {
  font-size: 12px;
  color: #8B7B73;
  margin-top: 2px;
}

.elder-card {
  background: #FFFFFF;
  border-radius: 14px;
  border: 1px solid #F0D9C7;
  padding: 16px;
  height: 100%;
  box-sizing: border-box;
  transition: all 0.2s;
}

.elder-card:hover {
  box-shadow: 0 6px 20px rgba(232, 133, 90, 0.12);
  transform: translateY(-2px);
}

.danger-border {
  border-color: #F56C6C;
  box-shadow: 0 0 0 2px rgba(245, 108, 108, 0.08);
}

.warning-border {
  border-color: #E6A23C;
}

.caution-border {
  border-color: #409EFF;
}

.data-chip {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #FFFFFF;
  border-radius: 6px;
  padding: 4px 8px;
  margin: 3px 0;
  font-size: 12.5px;
}

.chip-label {
  color: #8B7B73;
}

.chip-value {
  font-weight: 600;
  color: #5A4A42;
}

.value-danger {
  color: #F56C6C !important;
  font-weight: 700;
}
</style>
