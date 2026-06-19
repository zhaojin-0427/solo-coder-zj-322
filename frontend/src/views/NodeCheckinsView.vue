<template>
  <div class="node-checkins">
    <div class="page-header">
      <h2 class="page-title">节点签到与家属安心通知</h2>
      <div class="page-desc">
        按路线节点进行到达/离开签到登记，异常情况自动触发家属通知，确保长者出行全程安心
      </div>
    </div>

    <div class="filter-bar">
      <div class="filter-item">
        <label class="filter-label">选择计划</label>
        <el-select
          v-model="selectedPlanId"
          placeholder="请选择出行计划"
          style="width: 320px"
          clearable
          @change="onPlanChange"
        >
          <el-option
            v-for="p in activePlans"
            :key="p.id"
            :label="`${p.title}（${p.status}）`"
            :value="p.id"
          />
        </el-select>
      </div>
      <div class="filter-item" v-if="selectedPlanId && eldersInPlan.length > 0">
        <label class="filter-label">长辈姓名</label>
        <el-select
          v-model="filterElderName"
          placeholder="全部长辈"
          style="width: 180px"
          clearable
        >
          <el-option v-for="e in eldersInPlan" :key="e" :label="e" :value="e" />
        </el-select>
      </div>
      <div class="filter-item">
        <label class="filter-label">异常筛选</label>
        <el-select v-model="exceptionFilter" placeholder="全部记录" style="width: 180px">
          <el-option label="全部记录" value="" />
          <el-option label="仅显示异常" value="exception" />
          <el-option label="迟到/未到" value="late" />
          <el-option label="超时未签到" value="timeout" />
          <el-option label="提前离开" value="early" />
        </el-select>
      </div>
    </div>

    <el-tabs v-model="activeTab" class="main-tabs" type="card">
      <el-tab-pane label="签到进度与登记" name="progress">
        <div v-if="!selectedPlanId" class="empty-tip">
          <el-empty description="请先选择计划查看签到进度" />
        </div>
        <template v-else>
          <div class="summary-cards" v-if="checkinSummary.length > 0">
            <el-card class="summary-card">
              <div class="card-label">总节点数</div>
              <div class="card-value">{{ checkinSummary.length }}</div>
            </el-card>
            <el-card class="summary-card">
              <div class="card-label">签到异常总数</div>
              <div class="card-value danger">
                {{ checkinSummary.reduce((s, c) => s + c.totalExceptions, 0) }}
              </div>
            </el-card>
            <el-card class="summary-card">
              <div class="card-label">超时未签到</div>
              <div class="card-value warning">
                {{ checkinSummary.reduce((s, c) => s + c.timeoutCount, 0) }}
              </div>
            </el-card>
            <el-card class="summary-card">
              <div class="card-label">家属通知数</div>
              <div class="card-value primary">
                {{ checkinSummary.reduce((s, c) => s + c.notificationCount, 0) }}
              </div>
            </el-card>
          </div>

          <el-card class="progress-section" v-for="sum in checkinSummary" :key="sum.configId">
            <div class="section-header">
              <div class="node-title">
                <el-icon color="#E8855A" :size="22"><Location /></el-icon>
                <span>{{ sum.waypointName }}</span>
                <el-tag size="small" type="info" style="margin-left: 8px">
                  节点 #{{ sum.waypointIndex + 1 }}
                </el-tag>
                <div class="exception-tags" v-if="sum.exceptionTypes.length > 0">
                  <el-tag
                    size="small"
                    v-for="et in sum.exceptionTypes"
                    :key="et"
                    :type="et === 'early_leave' ? 'warning' : 'danger'"
                    effect="light"
                    style="margin-left: 6px"
                  >
                    {{ exceptionTypeLabel(et) }}
                  </el-tag>
                </div>
              </div>
              <div class="section-actions">
                <el-button
                  size="default"
                  type="primary"
                  :icon="Check"
                  @click="openCheckinDialog(sum, 'arrival')"
                >
                  到达签到
                </el-button>
                <el-button
                  size="default"
                  type="success"
                  :icon="SwitchButton"
                  @click="openCheckinDialog(sum, 'departure')"
                >
                  离开签到
                </el-button>
                <el-button
                  size="default"
                  type="danger"
                  plain
                  :icon="Warning"
                  @click="openTimeoutDialog(sum)"
                >
                  登记超时
                </el-button>
              </div>
            </div>

            <div class="progress-info">
              <div class="progress-block" v-if="sum.totalArrivalExpected > 0">
                <div class="progress-title">到达签到</div>
                <el-progress
                  :percentage="Math.round(sum.arrivalCompletionRate * 100)"
                  :color="sum.arrivalCompletionRate >= 1 ? '#67C23A' : sum.arrivalCompletionRate >= 0.6 ? '#409EFF' : '#F56C6C'"
                  :stroke-width="14"
                />
                <div class="progress-detail">
                  已签到 {{ sum.arrivalCheckedCount }} / {{ sum.totalArrivalExpected }} 人
                </div>
              </div>
              <div class="progress-block" v-if="sum.totalDepartureExpected > 0">
                <div class="progress-title">离开签到</div>
                <el-progress
                  :percentage="Math.round(sum.departureCompletionRate * 100)"
                  :color="sum.departureCompletionRate >= 1 ? '#67C23A' : sum.departureCompletionRate >= 0.6 ? '#409EFF' : '#F56C6C'"
                  :stroke-width="14"
                />
                <div class="progress-detail">
                  已签到 {{ sum.departureCheckedCount }} / {{ sum.totalDepartureExpected }} 人
                </div>
              </div>
            </div>

            <div class="config-info" v-if="getConfig(sum.configId)">
              <el-descriptions :column="4" size="small" border>
                <el-descriptions-item label="预计到达时间">
                  {{ getConfig(sum.configId)!.expectedArrivalTime }}
                  <el-tag size="small" style="margin-left: 6px">
                    容差 {{ getConfig(sum.configId)!.arrivalToleranceMinutes }}分钟
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="预计离开时间">
                  {{ getConfig(sum.configId)!.expectedDepartureTime }}
                  <el-tag size="small" style="margin-left: 6px">
                    容差 {{ getConfig(sum.configId)!.departureToleranceMinutes }}分钟
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="到达签到">
                  <el-tag :type="getConfig(sum.configId)!.requireArrivalCheckin ? 'success' : 'info'" effect="light">
                    {{ getConfig(sum.configId)!.requireArrivalCheckin ? '启用' : '关闭' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="离开签到">
                  <el-tag :type="getConfig(sum.configId)!.requireDepartureCheckin ? 'success' : 'info'" effect="light">
                    {{ getConfig(sum.configId)!.requireDepartureCheckin ? '启用' : '关闭' }}
                  </el-tag>
                </el-descriptions-item>
                <el-descriptions-item label="需通知家属" :span="4">
                  <span v-if="getConfig(sum.configId)!.familyContacts.length === 0" style="color: #999">
                    未配置家属联系人
                  </span>
                  <template v-else>
                    <el-tag
                      v-for="fc in getConfig(sum.configId)!.familyContacts"
                      :key="fc.phone"
                      effect="light"
                      type="warning"
                      style="margin-right: 8px"
                    >
                      {{ fc.relation }} · {{ fc.name }} · {{ fc.phone }}
                    </el-tag>
                  </template>
                </el-descriptions-item>
              </el-descriptions>
            </div>

            <div class="records-list">
              <div class="list-title">签到记录</div>
              <el-table
                :data="getRecordsByConfig(sum.configId)"
                size="default"
                stripe
                empty-text="该节点暂无签到记录"
              >
                <el-table-column label="类型" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="row.checkinType === 'arrival' ? 'primary' : 'success'" effect="dark" size="small">
                      {{ row.checkinType === 'arrival' ? '到达' : '离开' }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="长辈姓名" prop="elderName" width="110" />
                <el-table-column label="预计时间" prop="expectedTime" width="100" />
                <el-table-column label="实际时间" width="170">
                  <template #default="{ row }">{{ formatTime(row.actualCheckinTime) }}</template>
                </el-table-column>
                <el-table-column label="时长差" width="100" align="center">
                  <template #default="{ row }">
                    <span :class="{
                      'text-danger': row.delayMinutes > 0,
                      'text-success': row.delayMinutes < 0,
                      'text-muted': row.delayMinutes === 0
                    }">
                      {{ row.delayMinutes > 0 ? '+' : '' }}{{ row.delayMinutes }}分
                    </span>
                  </template>
                </el-table-column>
                <el-table-column label="状态" width="100" align="center">
                  <template #default="{ row }">
                    <el-tag :type="statusTagType(row)" size="small" effect="light">
                      {{ statusLabel(row) }}
                    </el-tag>
                  </template>
                </el-table-column>
                <el-table-column label="异常原因" min-width="180">
                  <template #default="{ row }">
                    <span v-if="row.exceptionReason" class="text-danger">{{ row.exceptionReason }}</span>
                    <span v-else class="text-muted">—</span>
                  </template>
                </el-table-column>
                <el-table-column label="签到人" min-width="160">
                  <template #default="{ row }">
                    {{ row.operatorName }}
                    <el-tag size="small" type="info" effect="plain" style="margin-left: 6px">
                      {{ row.operatorRole === 'elder' ? '长辈本人' : '陪同人' }}
                    </el-tag>
                  </template>
                </el-table-column>
              </el-table>
            </div>
          </el-card>

          <div class="empty-tip" v-if="checkinSummary.length === 0">
            <el-empty description="该计划尚未配置节点签到，请先在路线协商中确定最终路线并配置签到" />
          </div>
        </template>
      </el-tab-pane>

      <el-tab-pane label="签到记录总览" name="records">
        <el-card>
          <el-table
            :data="filteredRecords"
            v-loading="loadingRecords"
            style="width: 100%"
            stripe
            empty-text="暂无签到记录"
          >
            <el-table-column label="所属计划" width="160">
              <template #default="{ row }">{{ getPlanTitle(row.planId) }}</template>
            </el-table-column>
            <el-table-column label="节点" prop="waypointName" width="160" />
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.checkinType === 'arrival' ? 'primary' : 'success'" size="small" effect="dark">
                  {{ row.checkinType === 'arrival' ? '到' : '离' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="长辈" prop="elderName" width="100" />
            <el-table-column label="预计" prop="expectedTime" width="80" />
            <el-table-column label="实际签到" width="160">
              <template #default="{ row }">{{ formatTime(row.actualCheckinTime) }}</template>
            </el-table-column>
            <el-table-column label="偏差" width="80" align="center">
              <template #default="{ row }">
                <span :class="{
                  'text-danger': row.delayMinutes > 0,
                  'text-success': row.delayMinutes < 0,
                }">
                  {{ row.delayMinutes > 0 ? '+' : '' }}{{ row.delayMinutes }}分
                </span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="statusTagType(row)" size="small" effect="light">
                  {{ statusLabel(row) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="异常详情" min-width="200">
              <template #default="{ row }">
                <span v-if="row.exceptionReason" class="text-danger">{{ row.exceptionReason }}</span>
                <span v-else class="text-muted">正常</span>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>

      <el-tab-pane label="家属通知明细" name="notifications">
        <div class="notify-filter">
          <el-radio-group v-model="notifyStatusFilter" size="default">
            <el-radio-button value="">全部状态</el-radio-button>
            <el-radio-button value="pending">待通知</el-radio-button>
            <el-radio-button value="notified">已通知</el-radio-button>
            <el-radio-button value="confirmed">家属已确认</el-radio-button>
          </el-radio-group>
        </div>
        <el-card>
          <el-table
            :data="filteredNotifications"
            v-loading="loadingNotifications"
            style="width: 100%"
            stripe
            empty-text="暂无家属通知记录"
          >
            <el-table-column label="所属计划" width="150">
              <template #default="{ row }">{{ getPlanTitle(row.planId) }}</template>
            </el-table-column>
            <el-table-column label="节点" prop="waypointName" width="140" />
            <el-table-column label="到/离" width="60" align="center">
              <template #default="{ row }">
                <el-tag :type="row.checkinType === 'arrival' ? 'primary' : 'success'" size="small">
                  {{ row.checkinType === 'arrival' ? '到' : '离' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="触发类型" width="110" align="center">
              <template #default="{ row }">
                <el-tag :type="triggerTypeColor(row.triggerType)" effect="light" size="small">
                  {{ triggerTypeLabel(row.triggerType) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="涉及长辈" prop="elderName" width="110" />
            <el-table-column label="通知原因" min-width="220">
              <template #default="{ row }">{{ row.reason }}</template>
            </el-table-column>
            <el-table-column label="接收家属" width="200">
              <template #default="{ row }">
                {{ row.recipient.relation }} · {{ row.recipient.name }}
                <span class="text-muted" style="margin-left: 4px">{{ row.recipient.phone }}</span>
              </template>
            </el-table-column>
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="notifyStatusColor(row.status)" effect="dark" size="small">
                  {{ notifyStatusLabel(row.status) }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="触发时间" width="160">
              <template #default="{ row }">{{ formatTime(row.createdAt) }}</template>
            </el-table-column>
            <el-table-column label="确认备注" width="140">
              <template #default="{ row }">
                <span v-if="row.confirmNote" class="text-primary">{{ row.confirmNote }}</span>
                <span v-else class="text-muted">—</span>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="180" fixed="right" align="center">
              <template #default="{ row }">
                <el-button
                  v-if="row.status === 'pending'"
                  link
                  type="primary"
                  size="small"
                  @click="markNotified(row.id)"
                >标记已通知</el-button>
                <el-button
                  v-if="row.status === 'notified'"
                  link
                  type="success"
                  size="small"
                  @click="openConfirmDialog(row.id)"
                >家属确认收到</el-button>
                <el-button
                  v-if="row.status === 'confirmed'"
                  link
                  type="info"
                  size="small"
                  @click="viewNotifyDetail(row)"
                >查看</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-tab-pane>
    </el-tabs>

    <el-dialog
      v-model="checkinDialogVisible"
      :title="checkinDialogTitle"
      width="560px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="checkinFormRef"
        :model="checkinForm"
        :rules="checkinFormRules"
        label-width="110px"
      >
        <el-descriptions :column="1" size="small" border style="margin-bottom: 20px">
          <el-descriptions-item label="节点名称">
            {{ activeSummary?.waypointName }}
          </el-descriptions-item>
          <el-descriptions-item label="签到类型">
            {{ currentCheckinType === 'arrival' ? '到达签到' : '离开签到' }}
            <el-tag size="small" style="margin-left: 6px">
              预计时间：{{ activeConfig?.[currentCheckinType === 'arrival' ? 'expectedArrivalTime' : 'expectedDepartureTime'] }}
            </el-tag>
          </el-descriptions-item>
        </el-descriptions>
        <el-form-item label="长辈姓名" prop="elderName">
          <el-select v-model="checkinForm.elderName" placeholder="请选择长辈" style="width: 100%">
            <el-option v-for="e in eldersInPlan" :key="e" :label="e" :value="e" />
          </el-select>
        </el-form-item>
        <el-form-item label="签到人姓名" prop="operatorName">
          <el-input v-model="checkinForm.operatorName" placeholder="请输入签到人姓名（陪同人或长辈本人）" />
        </el-form-item>
        <el-form-item label="签到身份" prop="operatorRole">
          <el-radio-group v-model="checkinForm.operatorRole">
            <el-radio-button value="companion">陪同人</el-radio-button>
            <el-radio-button value="elder">长辈本人</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="是否有异常">
          <el-switch v-model="checkinForm.hasException" />
        </el-form-item>
        <template v-if="checkinForm.hasException">
          <el-form-item label="异常类型" prop="exceptionType">
            <el-radio-group v-model="checkinForm.exceptionType">
              <el-radio-button value="late">迟到</el-radio-button>
              <el-radio-button value="no_show">未到</el-radio-button>
              <el-radio-button value="early_leave" v-if="currentCheckinType === 'departure'">提前离开</el-radio-button>
            </el-radio-group>
          </el-form-item>
          <el-form-item label="异常原因" prop="exceptionReason">
            <el-input
              v-model="checkinForm.exceptionReason"
              type="textarea"
              :rows="3"
              placeholder="请详细说明异常原因，系统将自动通知家属"
            />
          </el-form-item>
          <el-alert
            type="warning"
            show-icon
            :closable="false"
            title="异常登记后将自动为该节点配置的每位家属生成安心通知记录"
            style="margin-bottom: 0"
          />
        </template>
      </el-form>
      <template #footer>
        <el-button @click="checkinDialogVisible = false">取消</el-button>
        <el-button type="primary" :loading="submittingCheckin" @click="submitCheckin">
          确认签到
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="timeoutDialogVisible"
      title="登记超时未签到"
      width="540px"
      :close-on-click-modal="false"
    >
      <el-descriptions :column="1" size="small" border style="margin-bottom: 20px">
        <el-descriptions-item label="节点名称">{{ activeSummary?.waypointName }}</el-descriptions-item>
      </el-descriptions>
      <el-form label-width="100px">
        <el-form-item label="超时类型">
          <el-radio-group v-model="timeoutForm.checkinType">
            <el-radio-button value="arrival">到达超时</el-radio-button>
            <el-radio-button value="departure">离开超时</el-radio-button>
          </el-radio-group>
        </el-form-item>
        <el-form-item label="未到长辈">
          <el-select
            v-model="timeoutForm.missingElderNames"
            multiple
            placeholder="选择多位未按时到/离的长辈"
            style="width: 100%"
          >
            <el-option v-for="e in eldersInPlan" :key="e" :label="e" :value="e" />
          </el-select>
        </el-form-item>
        <el-form-item label="登记人">
          <el-input v-model="timeoutForm.operatorName" placeholder="请输入登记人姓名" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="timeoutDialogVisible = false">取消</el-button>
        <el-button type="danger" :loading="submittingTimeout" @click="submitTimeout">确认并通知家属</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="confirmNoteDialogVisible"
      title="家属确认收到通知"
      width="480px"
    >
      <el-form label-width="100px">
        <el-form-item label="确认备注">
          <el-input
            v-model="confirmNoteForm.note"
            type="textarea"
            :rows="3"
            placeholder="家属回复的消息，如'已收到，谢谢照顾'等"
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="confirmNoteDialogVisible = false">取消</el-button>
        <el-button type="success" @click="submitConfirm">确认已收到</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { ElMessage, ElMessageBox, type FormInstance, type FormRules } from 'element-plus'
import {
  Check,
  SwitchButton,
  Warning,
  Location,
} from '@element-plus/icons-vue'
import { checkinsApi } from '@/api'
import { getAllPlans, getPreferencesByPlanId } from '@/api'
import type {
  Plan,
  WaypointCheckinConfig,
  CheckinRecord,
  FamilyNotification,
  CheckinSummary,
  CheckinType,
  NotificationStatus,
  CheckinExceptionType,
} from '@/types'

const plans = ref<Plan[]>([])
const allConfigs = ref<WaypointCheckinConfig[]>([])
const allRecords = ref<CheckinRecord[]>([])
const allNotifications = ref<FamilyNotification[]>([])
const checkinSummary = ref<CheckinSummary[]>([])
const loadingRecords = ref(false)
const loadingNotifications = ref(false)

const selectedPlanId = ref<string>('')
const filterElderName = ref<string>('')
const exceptionFilter = ref<string>('')
const activeTab = ref('progress')
const notifyStatusFilter = ref<NotificationStatus | ''>('')

const activePlans = computed(() => plans.value.filter((p) => p.status !== 'cancelled'))

const eldersInPlan = computed<string[]>(() => {
  if (!selectedPlanId.value) return []
  return (window as any).__planElders?.[selectedPlanId.value] || []
})

const getPlanTitle = (planId: string) => plans.value.find((p) => p.id === planId)?.title || planId
const getConfig = (configId: string) => allConfigs.value.find((c) => c.id === configId)

const getRecordsByConfig = (configId: string) => {
  let list = allRecords.value.filter((r) => r.configId === configId)
  if (filterElderName.value) list = list.filter((r) => r.elderName === filterElderName.value)
  return list
}

const filteredRecords = computed(() => {
  let list = allRecords.value
  if (selectedPlanId.value) list = list.filter((r) => r.planId === selectedPlanId.value)
  if (filterElderName.value) list = list.filter((r) => r.elderName === filterElderName.value)
  if (exceptionFilter.value === 'exception') {
    list = list.filter((r) => r.exceptionType !== null || r.timeoutStatus !== 'normal')
  } else if (exceptionFilter.value === 'late') {
    list = list.filter((r) => r.exceptionType === 'late' || r.exceptionType === 'no_show')
  } else if (exceptionFilter.value === 'timeout') {
    list = list.filter((r) => r.timeoutStatus === 'overdue')
  } else if (exceptionFilter.value === 'early') {
    list = list.filter((r) => r.exceptionType === 'early_leave')
  }
  return list
})

const filteredNotifications = computed(() => {
  let list = allNotifications.value
  if (selectedPlanId.value) list = list.filter((n) => n.planId === selectedPlanId.value)
  if (filterElderName.value) list = list.filter((n) => n.elderName.includes(filterElderName.value))
  if (notifyStatusFilter.value) list = list.filter((n) => n.status === notifyStatusFilter.value)
  return list
})

const exceptionTypeLabel = (et: CheckinExceptionType) => {
  if (!et) return '正常'
  return { late: '迟到', no_show: '未到', early_leave: '提前离开' }[et] || et
}

const statusTagType = (r: CheckinRecord) => {
  if (r.status === 'missed') return 'danger'
  if (r.timeoutStatus === 'overdue') return 'danger'
  if (r.exceptionType === 'late') return 'warning'
  if (r.exceptionType === 'early_leave') return 'warning'
  if (r.timeoutStatus === 'warning') return 'warning'
  return 'success'
}
const statusLabel = (r: CheckinRecord) => {
  if (r.status === 'missed') return '漏签到'
  if (r.timeoutStatus === 'overdue') return '超时'
  if (r.exceptionType === 'late') return '迟到'
  if (r.exceptionType === 'no_show') return '未到'
  if (r.exceptionType === 'early_leave') return '提前离'
  if (r.timeoutStatus === 'warning') return '临期'
  return '准时'
}

const notifyStatusColor = (s: NotificationStatus) => {
  return { pending: 'danger', notified: 'warning', confirmed: 'success' }[s] || 'info'
}
const notifyStatusLabel = (s: NotificationStatus) => {
  return { pending: '待通知', notified: '已通知', confirmed: '已确认' }[s] || s
}

const triggerTypeColor = (t: string) => {
  if (t === 'late' || t === 'early_leave') return 'warning'
  return 'danger'
}
const triggerTypeLabel = (t: string) => {
  const map: Record<string, string> = {
    late: '迟到',
    no_show: '未到',
    early_leave: '提前离开',
    timeout_arrival: '到达超时',
    timeout_departure: '离开超时',
    multiple_missing: '多人未到',
  }
  return map[t] || t
}

const formatTime = (iso: string) => {
  if (!iso) return ''
  const d = new Date(iso)
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}`
}

const checkinDialogVisible = ref(false)
const checkinFormRef = ref<FormInstance>()
const activeSummary = ref<CheckinSummary | null>(null)
const activeConfig = computed(() => activeSummary.value ? getConfig(activeSummary.value.configId) : null)
const currentCheckinType = ref<CheckinType>('arrival')
const checkinDialogTitle = computed(() => {
  const type = currentCheckinType.value === 'arrival' ? '到达' : '离开'
  return `${type}签到登记 · ${activeSummary.value?.waypointName || ''}`
})
const checkinForm = ref({
  elderName: '',
  operatorName: '小张(陪同)',
  operatorRole: 'companion' as 'elder' | 'companion',
  hasException: false,
  exceptionType: null as CheckinExceptionType,
  exceptionReason: '',
})
const checkinFormRules: FormRules = {
  elderName: [{ required: true, message: '请选择长辈', trigger: 'change' }],
  operatorName: [{ required: true, message: '请输入签到人姓名', trigger: 'blur' }],
  operatorRole: [{ required: true, message: '请选择签到身份', trigger: 'change' }],
}
const submittingCheckin = ref(false)

const openCheckinDialog = (sum: CheckinSummary, type: CheckinType) => {
  activeSummary.value = sum
  currentCheckinType.value = type
  checkinForm.value = {
    elderName: '',
    operatorName: '小张(陪同)',
    operatorRole: 'companion',
    hasException: false,
    exceptionType: null,
    exceptionReason: '',
  }
  const cfg = getConfig(sum.configId)
  if (cfg) {
    const isArrival = type === 'arrival'
    const required = isArrival ? cfg.requireArrivalCheckin : cfg.requireDepartureCheckin
    if (!required) {
      ElMessage.warning(`该节点${isArrival ? '到达' : '离开'}签到未启用`)
      return
    }
  }
  checkinDialogVisible.value = true
}

const submitCheckin = async () => {
  await checkinFormRef.value?.validate()
  if (!activeSummary.value) return
  submittingCheckin.value = true
  try {
    const res = await checkinsApi.createCheckinRecord({
      configId: activeSummary.value.configId,
      checkinType: currentCheckinType.value,
      elderName: checkinForm.value.elderName,
      operatorId: 'user-001',
      operatorName: checkinForm.value.operatorName,
      operatorRole: checkinForm.value.operatorRole,
      hasException: checkinForm.value.hasException,
      exceptionType: checkinForm.value.exceptionType,
      exceptionReason: checkinForm.value.exceptionReason,
    })
    allRecords.value.unshift(res.data.record)
    if (res.data.notifications.length > 0) {
      allNotifications.value = [...res.data.notifications, ...allNotifications.value]
    }
    ElMessage.success(`签到成功，已自动生成${res.data.notifications.length}条家属通知`)
    checkinDialogVisible.value = false
    await refreshSummary()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '签到失败')
  } finally {
    submittingCheckin.value = false
  }
}

const timeoutDialogVisible = ref(false)
const timeoutForm = ref({
  checkinType: 'arrival' as CheckinType,
  missingElderNames: [] as string[],
  operatorName: '小张(陪同)',
})
const submittingTimeout = ref(false)

const openTimeoutDialog = (sum: CheckinSummary) => {
  activeSummary.value = sum
  timeoutForm.value = {
    checkinType: 'arrival',
    missingElderNames: [],
    operatorName: '小张(陪同)',
  }
  timeoutDialogVisible.value = true
}

const submitTimeout = async () => {
  if (!activeSummary.value) return
  if (timeoutForm.value.missingElderNames.length === 0) {
    ElMessage.warning('请选择至少一位未签到的长辈')
    return
  }
  submittingTimeout.value = true
  try {
    const res = await checkinsApi.registerTimeout({
      configId: activeSummary.value.configId,
      checkinType: timeoutForm.value.checkinType,
      missingElderNames: timeoutForm.value.missingElderNames,
      operatorId: 'user-001',
      operatorName: timeoutForm.value.operatorName,
    })
    allRecords.value.unshift(res.data.record)
    allNotifications.value = [...res.data.notifications, ...allNotifications.value]
    ElMessage.success(`超时登记成功，已通知${res.data.notifications.length}位家属`)
    timeoutDialogVisible.value = false
    await refreshSummary()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '登记失败')
  } finally {
    submittingTimeout.value = false
  }
}

const confirmNoteDialogVisible = ref(false)
const activeNotifyId = ref<string>('')
const confirmNoteForm = ref({ note: '' })

const markNotified = async (id: string) => {
  try {
    const res = await checkinsApi.updateNotificationStatus(id, {
      status: 'notified',
      operatorId: 'user-001',
    })
    const idx = allNotifications.value.findIndex((n) => n.id === id)
    if (idx !== -1) allNotifications.value[idx] = res.data
    ElMessage.success('已标记为已通知')
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  }
}

const openConfirmDialog = (id: string) => {
  activeNotifyId.value = id
  confirmNoteForm.value = { note: '' }
  confirmNoteDialogVisible.value = true
}

const submitConfirm = async () => {
  try {
    const res = await checkinsApi.updateNotificationStatus(activeNotifyId.value, {
      status: 'confirmed',
      operatorId: 'user-001',
      confirmNote: confirmNoteForm.value.note,
    })
    const idx = allNotifications.value.findIndex((n) => n.id === activeNotifyId.value)
    if (idx !== -1) allNotifications.value[idx] = res.data
    ElMessage.success('家属已确认收到')
    confirmNoteDialogVisible.value = false
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败')
  }
}

const viewNotifyDetail = (row: FamilyNotification) => {
  ElMessageBox.alert(
    `接收家属：${row.recipient.relation} ${row.recipient.name} ${row.recipient.phone}\n通知时间：${row.notifiedAt ? formatTime(row.notifiedAt) : '—'}\n确认时间：${row.confirmedAt ? formatTime(row.confirmedAt) : '—'}\n确认备注：${row.confirmNote || '无'}`,
    '通知详情',
    { confirmButtonText: '关闭' },
  )
}

const refreshSummary = async () => {
  if (!selectedPlanId.value) return
  try {
    const sumRes = await checkinsApi.getCheckinSummaryByPlan(selectedPlanId.value)
    checkinSummary.value = sumRes.data
  } catch (_e) {
    checkinSummary.value = []
  }
}

const onPlanChange = async () => {
  checkinSummary.value = []
  await refreshSummary()
  if (selectedPlanId.value) {
    try {
      const prefs = await getPreferencesByPlanId(selectedPlanId.value)
      ;(window as any).__planElders = (window as any).__planElders || {}
      ;(window as any).__planElders[selectedPlanId.value] = (prefs.data as any).map((p: any) => p.elderName)
    } catch (_e) {}
    try {
      const cfgRes = await checkinsApi.findAllConfigs({ planId: selectedPlanId.value })
      allConfigs.value = cfgRes.data
    } catch (_e) {}
  }
}

onMounted(async () => {
  try {
    const plansRes = await getAllPlans()
    plans.value = plansRes.data as Plan[]
    const active = plans.value.find((p) => p.status === 'active') || plans.value[0]
    if (active) selectedPlanId.value = active.id
  } catch (_e) {}

  try {
    const recordsRes = await checkinsApi.findAllRecords()
    allRecords.value = recordsRes.data
  } catch (_e) {}

  try {
    const notifyRes = await checkinsApi.findAllNotifications()
    allNotifications.value = notifyRes.data
  } catch (_e) {}

  try {
    const cfgRes = await checkinsApi.findAllConfigs()
    allConfigs.value = cfgRes.data
  } catch (_e) {}

  if (selectedPlanId.value) {
    try {
      const prefs = await getPreferencesByPlanId(selectedPlanId.value)
      ;(window as any).__planElders = {}
      ;(window as any).__planElders[selectedPlanId.value] = (prefs.data as any).map((p: any) => p.elderName)
    } catch (_e) {}
    await refreshSummary()
  }
})

watch(
  () => activeTab.value,
  async (tab) => {
    if (tab === 'records' && allRecords.value.length === 0) {
      loadingRecords.value = true
      try {
        const r = await checkinsApi.findAllRecords()
        allRecords.value = r.data
      } finally { loadingRecords.value = false }
    }
    if (tab === 'notifications' && allNotifications.value.length === 0) {
      loadingNotifications.value = true
      try {
        const n = await checkinsApi.findAllNotifications()
        allNotifications.value = n.data
      } finally { loadingNotifications.value = false }
    }
  },
)
</script>

<style scoped>
.node-checkins {
  min-height: 600px;
}
.page-header {
  margin-bottom: 20px;
}
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #5A4A42;
  margin: 0 0 8px 0;
}
.page-desc {
  color: #8a7a72;
  font-size: 14px;
}
.filter-bar {
  display: flex;
  gap: 24px;
  align-items: flex-end;
  background: #fff;
  padding: 18px 22px;
  border-radius: 12px;
  margin-bottom: 18px;
  border: 1px solid #F0D9C7;
  flex-wrap: wrap;
}
.filter-item {
  display: flex;
  flex-direction: column;
  gap: 6px;
}
.filter-label {
  font-size: 13px;
  color: #8a7a72;
  font-weight: 500;
}
.main-tabs :deep(.el-tabs__item) {
  font-size: 15px;
  font-weight: 600;
  padding: 0 22px;
  height: 46px;
}
.summary-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  margin-bottom: 18px;
}
.summary-card {
  border: 1px solid #F0D9C7 !important;
}
.summary-card :deep(.el-card__body) {
  padding: 16px 20px;
}
.card-label {
  color: #8a7a72;
  font-size: 13px;
  margin-bottom: 8px;
}
.card-value {
  font-size: 28px;
  font-weight: 700;
  color: #5A4A42;
}
.card-value.danger { color: #F56C6C; }
.card-value.warning { color: #E6A23C; }
.card-value.primary { color: #409EFF; }

.progress-section {
  margin-bottom: 18px;
  border: 1px solid #F0D9C7 !important;
}
.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 18px;
  flex-wrap: wrap;
  gap: 12px;
}
.node-title {
  display: flex;
  align-items: center;
  font-size: 17px;
  font-weight: 600;
  color: #5A4A42;
  gap: 8px;
  flex-wrap: wrap;
}
.exception-tags {
  display: inline-flex;
}
.section-actions {
  display: flex;
  gap: 10px;
}
.progress-info {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 18px;
}
.progress-block {
  background: #FBF5EF;
  padding: 16px 20px;
  border-radius: 10px;
}
.progress-title {
  font-weight: 600;
  color: #5A4A42;
  margin-bottom: 10px;
}
.progress-detail {
  margin-top: 8px;
  font-size: 13px;
  color: #8a7a72;
}
.config-info {
  margin-bottom: 20px;
}
.records-list .list-title {
  font-weight: 600;
  color: #5A4A42;
  margin-bottom: 10px;
  padding-left: 4px;
  border-left: 3px solid #E8855A;
}
.empty-tip {
  background: #fff;
  border-radius: 10px;
  padding: 40px;
  border: 1px dashed #F0D9C7;
}
.notify-filter {
  margin-bottom: 14px;
}
.text-danger { color: #F56C6C; }
.text-warning { color: #E6A23C; }
.text-success { color: #67C23A; }
.text-primary { color: #409EFF; }
.text-muted { color: #999; }
</style>
