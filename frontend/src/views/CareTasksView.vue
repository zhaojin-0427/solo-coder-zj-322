<template>
  <div>
    <h2 class="page-title">照护分工与物品确认</h2>

    <div class="toolbar">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
        <span style="font-size: 16px; color: #5A4A42; font-weight: 500">选择计划：</span>
        <el-select
          v-model="selectedPlanId"
          placeholder="请选择出行计划"
          style="width: 320px"
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
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
        <el-button
          :icon="RefreshLeft"
          size="large"
          @click="fetchTasks"
        >
          刷新
        </el-button>
        <el-button
          type="primary"
          :icon="Plus"
          size="large"
          :disabled="!selectedPlanId"
          @click="openCreateDialog"
        >
          新增任务
        </el-button>
      </div>
    </div>

    <el-row :gutter="20" style="margin-bottom: 20px" v-loading="loading">
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">总任务数</div>
              <div class="stat-value">{{ taskStats.total }}</div>
            </div>
            <div class="stat-icon" style="background: #FDE4D2; color: #E8855A">
              <el-icon :size="28"><List /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">完成率</div>
              <div class="stat-value" :style="{ color: taskStats.completionRate >= 70 ? '#67C23A' : '#E6A23C' }">
                {{ taskStats.completionRate }}<span style="font-size: 18px">%</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #C6E4DD; color: #4A9B8C">
              <el-icon :size="28"><CircleCheck /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">进行中</div>
              <div class="stat-value" style="color: #409EFF">
                {{ taskStats.inProgress + taskStats.assigned }}
              </div>
            </div>
            <div class="stat-icon" style="background: #D9ECFF; color: #409EFF">
              <el-icon :size="28"><Clock /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
      <el-col :xs="12" :sm="12" :md="6" :lg="6">
        <div class="stat-card">
          <div style="display: flex; justify-content: space-between; align-items: center">
            <div>
              <div class="stat-label">逾期任务</div>
              <div class="stat-value" :style="{ color: taskStats.overdue > 0 ? '#F56C6C' : '#67C23A' }">
                {{ taskStats.overdue }}<span style="font-size: 18px">个</span>
              </div>
            </div>
            <div class="stat-icon" style="background: #FDE2E2; color: #F56C6C">
              <el-icon :size="28"><WarningFilled /></el-icon>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <div class="filter-bar">
      <div style="display: flex; gap: 12px; flex-wrap: wrap; align-items: center">
        <span style="font-size: 14px; color: #8B7B73">优先级：</span>
        <el-radio-group v-model="filterPriority" size="large" @change="handleFilterChange">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="critical">紧急</el-radio-button>
          <el-radio-button value="high">高</el-radio-button>
          <el-radio-button value="medium">中</el-radio-button>
          <el-radio-button value="low">低</el-radio-button>
        </el-radio-group>

        <el-divider direction="vertical" style="height: 28px" />

        <span style="font-size: 14px; color: #8B7B73">状态：</span>
        <el-radio-group v-model="filterStatus" size="large" @change="handleFilterChange">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="pending">待分配</el-radio-button>
          <el-radio-button value="assigned">已分配</el-radio-button>
          <el-radio-button value="in_progress">进行中</el-radio-button>
          <el-radio-button value="completed">已完成</el-radio-button>
          <el-radio-button value="failed">未完成</el-radio-button>
        </el-radio-group>
      </div>
      <div style="font-size: 14px; color: #8B7B73">
        共 {{ filteredTasks.length }} 个任务
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="!selectedPlanId">
        <el-empty description="请先选择一个出行计划" :image-size="120" />
      </div>

      <div v-else-if="filteredTasks.length === 0 && !loading">
        <el-empty description="暂无照护任务，点击右上角'新增任务'按钮创建">
          <template #image>
            <el-icon :size="80" color="#E8855A"><FirstAidKit /></el-icon>
          </template>
          <el-button type="primary" :icon="Plus" size="large" @click="openCreateDialog">
            立即新增任务
          </el-button>
        </el-empty>
      </div>

      <div v-else>
        <el-table :data="filteredTasks" stripe border size="large" style="width: 100%">
          <el-table-column prop="taskName" label="任务名称" min-width="160">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 8px">
                <el-icon :size="18" :color="getTaskTypeColor(row.taskType)">{{ getTaskTypeIcon(row.taskType) }}</el-icon>
                <span style="font-weight: 600; color: #5A4A42">{{ row.taskName }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="优先级" width="100" align="center">
            <template #default="{ row }">
              <el-tag :type="priorityTagType[row.priority]" effect="light" size="large">
                {{ priorityText[row.priority] }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column label="状态" width="110" align="center">
            <template #default="{ row }">
              <el-tag :type="statusTagType[row.status]" effect="light" size="large">
                {{ statusText[row.status] }}
              </el-tag>
            </template>
          </el-table-column>

          <el-table-column prop="assigneeName" label="负责人" width="110">
            <template #default="{ row }">
              <div style="display: flex; align-items: center; gap: 6px">
                <el-avatar :size="24" :style="{ backgroundColor: '#FDE4D2', color: '#E8855A', fontSize: '12px' }">
                  {{ row.assigneeName?.charAt(0) || '?' }}
                </el-avatar>
                <span>{{ row.assigneeName || '-' }}</span>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="角色" width="90" align="center">
            <template #default="{ row }">
              <el-tag v-if="row.assigneeRole === 'elder'" type="info" effect="plain" size="small">长者</el-tag>
              <el-tag v-else-if="row.assigneeRole === 'companion'" type="success" effect="plain" size="small">陪同人</el-tag>
              <span v-else>-</span>
            </template>
          </el-table-column>

          <el-table-column label="完成时限" width="170">
            <template #default="{ row }">
              <div>
                <div :style="{ color: isOverdue(row) ? '#F56C6C' : '#5A4A42', fontWeight: isOverdue(row) ? '600' : 'normal' }">
                  {{ formatDateTime(row.deadline) }}
                </div>
                <div v-if="isOverdue(row) && row.status !== 'completed'" style="font-size: 12px; color: #F56C6C; margin-top: 2px">
                  <el-icon style="vertical-align: middle"><WarningFilled /></el-icon>
                  已逾期
                </div>
              </div>
            </template>
          </el-table-column>

          <el-table-column label="操作" width="220" fixed="right">
            <template #default="{ row }">
              <div style="display: flex; gap: 6px; flex-wrap: wrap">
                <el-button size="small" type="primary" link @click="viewTaskDetail(row)">
                  详情
                </el-button>
                <el-button
                  v-if="row.status === 'pending'"
                  size="small"
                  type="success"
                  link
                  @click="openClaimDialog(row)"
                >
                  领取
                </el-button>
                <el-button
                  v-if="row.status === 'assigned'"
                  size="small"
                  type="primary"
                  link
                  @click="handleStartTask(row)"
                >
                  开始
                </el-button>
                <el-button
                  v-if="row.status === 'in_progress' || row.status === 'assigned'"
                  size="small"
                  type="success"
                  link
                  @click="openCompleteDialog(row)"
                >
                  完成
                </el-button>
                <el-button
                  v-if="row.status !== 'completed' && row.status !== 'failed'"
                  size="small"
                  type="danger"
                  link
                  @click="openFailDialog(row)"
                >
                  未完成
                </el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
      </div>
    </el-card>

    <el-dialog
      v-model="createDialogVisible"
      title="新增照护任务"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="createFormRef"
        :model="createForm"
        :rules="createFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="任务名称" prop="taskName">
          <el-input v-model="createForm.taskName" placeholder="请输入任务名称" maxlength="50" />
        </el-form-item>

        <el-form-item label="任务类型" prop="taskType">
          <el-select v-model="createForm.taskType" placeholder="请选择任务类型" style="width: 100%">
            <el-option
              v-for="item in taskTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="优先级" prop="priority">
          <el-radio-group v-model="createForm.priority" size="large">
            <el-radio-button value="critical">紧急</el-radio-button>
            <el-radio-button value="high">高</el-radio-button>
            <el-radio-button value="medium">中</el-radio-button>
            <el-radio-button value="low">低</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="负责人" prop="assigneeName">
          <el-input v-model="createForm.assigneeName" placeholder="请输入负责人姓名" maxlength="20" />
        </el-form-item>

        <el-form-item label="负责人角色" prop="assigneeRole">
          <el-radio-group v-model="createForm.assigneeRole" size="large">
            <el-radio value="elder">长者</el-radio>
            <el-radio value="companion">陪同人</el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="完成时限" prop="deadline">
          <el-date-picker
            v-model="createForm.deadline"
            type="datetime"
            placeholder="选择完成时限"
            style="width: 100%"
            value-format="YYYY-MM-DDTHH:mm:ss.sssZ"
          />
        </el-form-item>

        <el-form-item label="任务描述">
          <el-input
            v-model="createForm.description"
            type="textarea"
            :rows="3"
            placeholder="请输入任务描述..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="备注">
          <el-input
            v-model="createForm.remark"
            type="textarea"
            :rows="2"
            placeholder="备注信息..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="form-actions" style="border-top: none; margin-top: 0; padding-top: 0">
          <el-button @click="createDialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" :loading="creating" size="large" @click="submitCreate">
            确认创建
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      title="任务详情"
      width="640px"
    >
      <div v-if="currentTask">
        <el-descriptions :column="2" border size="large">
          <el-descriptions-item label="任务名称" :span="2">
            <span style="font-weight: 600; font-size: 16px">{{ currentTask.taskName }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="任务类型">
            <el-tag :type="getTaskTypeTagType(currentTask.taskType)" effect="light">
              {{ getTaskTypeLabel(currentTask.taskType) }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="优先级">
            <el-tag :type="priorityTagType[currentTask.priority]" effect="light">
              {{ priorityText[currentTask.priority] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="状态">
            <el-tag :type="statusTagType[currentTask.status]" effect="light">
              {{ statusText[currentTask.status] }}
            </el-tag>
          </el-descriptions-item>
          <el-descriptions-item label="负责人">
            <div style="display: flex; align-items: center; gap: 8px">
              <el-avatar :size="28" :style="{ backgroundColor: '#FDE4D2', color: '#E8855A' }">
                {{ currentTask.assigneeName?.charAt(0) || '?' }}
              </el-avatar>
              <span>{{ currentTask.assigneeName }}</span>
              <el-tag v-if="currentTask.assigneeRole === 'elder'" type="info" effect="plain" size="small">长者</el-tag>
              <el-tag v-else type="success" effect="plain" size="small">陪同人</el-tag>
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="完成时限">
            <span :style="{ color: isOverdue(currentTask) && currentTask.status !== 'completed' ? '#F56C6C' : '#5A4A42', fontWeight: isOverdue(currentTask) ? '600' : 'normal' }">
              {{ formatDateTime(currentTask.deadline) }}
            </span>
            <div v-if="isOverdue(currentTask) && currentTask.status !== 'completed'" style="font-size: 12px; color: #F56C6C; margin-top: 4px">
              <el-icon style="vertical-align: middle"><WarningFilled /></el-icon>
              已逾期
            </div>
          </el-descriptions-item>
          <el-descriptions-item label="创建时间">
            {{ formatDateTime(currentTask.createdAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.claimedAt" label="领取时间">
            {{ formatDateTime(currentTask.claimedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.completedAt" label="完成时间">
            {{ formatDateTime(currentTask.completedAt) }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.description" label="任务描述" :span="2">
            {{ currentTask.description }}
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.failureReason" label="未完成原因" :span="2">
            <el-alert
              :title="currentTask.failureReason"
              type="error"
              :closable="false"
              show-icon
            />
          </el-descriptions-item>
          <el-descriptions-item v-if="currentTask.remark" label="备注" :span="2">
            {{ currentTask.remark }}
          </el-descriptions-item>
        </el-descriptions>
      </div>

      <template #footer>
        <div v-if="currentTask" style="display: flex; gap: 8px; justify-content: flex-end">
          <el-button v-if="currentTask.status === 'pending'" type="success" @click="openClaimDialog(currentTask)">
            领取任务
          </el-button>
          <el-button v-if="currentTask.status === 'assigned'" type="primary" @click="handleStartTask(currentTask)">
            开始执行
          </el-button>
          <el-button v-if="currentTask.status === 'in_progress' || currentTask.status === 'assigned'" type="success" @click="openCompleteDialog(currentTask)">
            标记完成
          </el-button>
          <el-button v-if="currentTask.status !== 'completed' && currentTask.status !== 'failed'" type="danger" @click="openFailDialog(currentTask)">
            标记未完成
          </el-button>
          <el-button @click="detailDialogVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="claimDialogVisible"
      title="领取任务"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="claimFormRef"
        :model="claimForm"
        :rules="claimFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="任务名称">
          <el-tag type="primary" size="large">{{ currentTask?.taskName }}</el-tag>
        </el-form-item>
        <el-form-item label="领取人" prop="claimantName">
          <el-input v-model="claimForm.claimantName" placeholder="请输入您的姓名" maxlength="20" />
        </el-form-item>
        <el-form-item label="身份" prop="claimantRole">
          <el-radio-group v-model="claimForm.claimantRole" size="large">
            <el-radio value="elder">长者</el-radio>
            <el-radio value="companion">陪同人</el-radio>
          </el-radio-group>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="claimDialogVisible = false" size="large">取消</el-button>
        <el-button type="primary" :loading="claiming" size="large" @click="submitClaim">
          确认领取
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="completeDialogVisible"
      title="标记任务完成"
      width="480px"
      :close-on-click-modal="false"
    >
      <el-form label-width="100px" label-position="right">
        <el-form-item label="任务名称">
          <el-tag type="success" size="large">{{ currentTask?.taskName }}</el-tag>
        </el-form-item>
        <el-form-item label="完成备注">
          <el-input
            v-model="completeRemark"
            type="textarea"
            :rows="3"
            placeholder="请输入完成备注（选填）..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="completeDialogVisible = false" size="large">取消</el-button>
        <el-button type="success" :loading="completing" size="large" @click="submitComplete">
          确认完成
        </el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="failDialogVisible"
      title="标记任务未完成"
      width="520px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="failFormRef"
        :model="failForm"
        :rules="failFormRules"
        label-width="100px"
        label-position="right"
      >
        <el-form-item label="任务名称">
          <el-tag type="danger" size="large">{{ currentTask?.taskName }}</el-tag>
        </el-form-item>
        <el-form-item label="未完成原因" prop="failureReason">
          <el-input
            v-model="failForm.failureReason"
            type="textarea"
            :rows="4"
            placeholder="请详细说明未完成的原因..."
            maxlength="500"
            show-word-limit
          />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="failDialogVisible = false" size="large">取消</el-button>
        <el-button type="danger" :loading="failing" size="large" @click="submitFail">
          确认提交
        </el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, type FormInstance } from 'vue'
import { ElMessage } from 'element-plus'
import {
  RefreshLeft,
  Plus,
  List,
  CircleCheck,
  Clock,
  WarningFilled,
  FirstAidKit,
  Sunny,
  Star,
  Suitcase,
  Phone,
  Location,
  MoreFilled,
  Food,
  ColdDrink,
  User
} from '@element-plus/icons-vue'
import { getAllPlans } from '@/api/plans'
import {
  getCareTasks,
  getCareTaskStats,
  createCareTask,
  claimCareTask,
  startCareTask,
  completeCareTask,
  failCareTask,
} from '@/api/care-tasks'
import type {
  TravelPlan,
  CareTask,
  CareTaskPriority,
  CareTaskStatus,
  CareTaskType,
  CreateCareTaskParams,
  ClaimTaskParams,
} from '@/types'

const loading = ref(false)
const creating = ref(false)
const claiming = ref(false)
const completing = ref(false)
const failing = ref(false)

const planOptions = ref<TravelPlan[]>([])
const selectedPlanId = ref('')
const careTasks = ref<CareTask[]>([])
const filterPriority = ref('')
const filterStatus = ref('')

const createDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const claimDialogVisible = ref(false)
const completeDialogVisible = ref(false)
const failDialogVisible = ref(false)

const currentTask = ref<CareTask | null>(null)
const completeRemark = ref('')

const createFormRef = ref<FormInstance>()
const claimFormRef = ref<FormInstance>()
const failFormRef = ref<FormInstance>()

const taskStats = reactive({
  total: 0,
  completed: 0,
  pending: 0,
  inProgress: 0,
  failed: 0,
  assigned: 0,
  completionRate: 0,
  overdue: 0,
})

const createForm = reactive<CreateCareTaskParams>({
  planId: '',
  taskType: 'medication_reminder',
  taskName: '',
  description: '',
  priority: 'medium',
  assigneeName: '',
  assigneeRole: 'companion',
  deadline: '',
  creatorId: 'user-current',
  remark: '',
})

const claimForm = reactive<ClaimTaskParams>({
  claimantName: '',
  claimantRole: 'companion',
})

const failForm = reactive({
  failureReason: '',
})

const createFormRules = {
  taskName: [
    { required: true, message: '请输入任务名称', trigger: 'blur' },
    { min: 2, max: 50, message: '任务名称长度2-50字符', trigger: 'blur' }
  ],
  taskType: [{ required: true, message: '请选择任务类型', trigger: 'change' }],
  priority: [{ required: true, message: '请选择优先级', trigger: 'change' }],
  assigneeName: [
    { required: true, message: '请输入负责人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度2-20字符', trigger: 'blur' }
  ],
  assigneeRole: [{ required: true, message: '请选择负责人角色', trigger: 'change' }],
  deadline: [{ required: true, message: '请选择完成时限', trigger: 'change' }],
}

const claimFormRules = {
  claimantName: [
    { required: true, message: '请输入领取人姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度2-20字符', trigger: 'blur' }
  ],
  claimantRole: [{ required: true, message: '请选择身份', trigger: 'change' }],
}

const failFormRules = {
  failureReason: [
    { required: true, message: '请填写未完成原因', trigger: 'blur' },
    { min: 5, max: 500, message: '原因长度5-500字符', trigger: 'blur' }
  ],
}

const taskTypeOptions = [
  { value: 'medication_reminder', label: '带药提醒' },
  { value: 'water_supply', label: '饮水补给' },
  { value: 'sun_protection', label: '遮阳物品' },
  { value: 'cold_protection', label: '保暖物品' },
  { value: 'wheelchair_assist', label: '轮椅辅助' },
  { value: 'cane_assist', label: '手杖辅助' },
  { value: 'emergency_contact', label: '紧急联系人确认' },
  { value: 'meeting_point_check', label: '集合点点名' },
  { value: 'other', label: '其他' },
]

const priorityText: Record<CareTaskPriority, string> = {
  critical: '紧急',
  high: '高',
  medium: '中',
  low: '低',
}

const priorityTagType: Record<CareTaskPriority, 'danger' | 'warning' | 'info' | 'success'> = {
  critical: 'danger',
  high: 'warning',
  medium: 'info',
  low: 'success',
}

const statusText: Record<CareTaskStatus, string> = {
  pending: '待分配',
  assigned: '已分配',
  in_progress: '进行中',
  completed: '已完成',
  failed: '未完成',
}

const statusTagType: Record<CareTaskStatus, 'info' | 'primary' | 'warning' | 'success' | 'danger'> = {
  pending: 'info',
  assigned: 'primary',
  in_progress: 'warning',
  completed: 'success',
  failed: 'danger',
}

const filteredTasks = computed(() => {
  let result = [...careTasks.value]
  if (filterPriority.value) {
    result = result.filter((t) => t.priority === filterPriority.value)
  }
  if (filterStatus.value) {
    result = result.filter((t) => t.status === filterStatus.value)
  }
  return result
})

function getTaskTypeIcon(type: CareTaskType) {
  const iconMap: Record<CareTaskType, any> = {
    medication_reminder: Food,
    water_supply: ColdDrink,
    sun_protection: Sunny,
    cold_protection: Star,
    wheelchair_assist: Suitcase,
    cane_assist: Suitcase,
    emergency_contact: Phone,
    meeting_point_check: Location,
    other: MoreFilled,
  }
  return iconMap[type] || MoreFilled
}

function getTaskTypeColor(type: CareTaskType): string {
  const colorMap: Record<CareTaskType, string> = {
    medication_reminder: '#F56C6C',
    water_supply: '#409EFF',
    sun_protection: '#E6A23C',
    cold_protection: '#909399',
    wheelchair_assist: '#E8855A',
    cane_assist: '#E8855A',
    emergency_contact: '#67C23A',
    meeting_point_check: '#4A9B8C',
    other: '#8B7B73',
  }
  return colorMap[type] || '#8B7B73'
}

function getTaskTypeLabel(type: CareTaskType): string {
  const option = taskTypeOptions.find((o) => o.value === type)
  return option?.label || type
}

function getTaskTypeTagType(type: CareTaskType): 'primary' | 'success' | 'warning' | 'danger' | 'info' {
  const tagMap: Record<CareTaskType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
    medication_reminder: 'danger',
    water_supply: 'primary',
    sun_protection: 'warning',
    cold_protection: 'info',
    wheelchair_assist: 'warning',
    cane_assist: 'warning',
    emergency_contact: 'success',
    meeting_point_check: 'success',
    other: 'info',
  }
  return tagMap[type] || 'info'
}

function isOverdue(task: CareTask): boolean {
  if (!task.deadline) return false
  const deadline = new Date(task.deadline)
  const now = new Date()
  return deadline < now
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${y}-${m}-${day} ${hh}:${mm}`
}

async function fetchPlans() {
  try {
    const res = await getAllPlans()
    planOptions.value = (res.data as TravelPlan[]) || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchTasks() {
  if (!selectedPlanId.value) return
  loading.value = true
  try {
    const [tasksRes, statsRes] = await Promise.all([
      getCareTasks({ planId: selectedPlanId.value }),
      getCareTaskStats(selectedPlanId.value),
    ])
    careTasks.value = (tasksRes.data as CareTask[]) || []
    const stats = statsRes.data as any
    if (stats) {
      Object.assign(taskStats, stats)
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handlePlanChange() {
  careTasks.value = []
  filterPriority.value = ''
  filterStatus.value = ''
  fetchTasks()
}

function handleFilterChange() {
}

function openCreateDialog() {
  if (!selectedPlanId.value) {
    ElMessage.warning('请先选择出行计划')
    return
  }
  createForm.planId = selectedPlanId.value
  createForm.taskName = ''
  createForm.taskType = 'medication_reminder'
  createForm.description = ''
  createForm.priority = 'medium'
  createForm.assigneeName = ''
  createForm.assigneeRole = 'companion'
  createForm.deadline = ''
  createForm.remark = ''
  createFormRef.value?.resetFields()
  createDialogVisible.value = true
}

async function submitCreate() {
  if (!createFormRef.value) return
  await createFormRef.value.validate(async (valid) => {
    if (!valid) return
    creating.value = true
    try {
      const res = await createCareTask({ ...createForm })
      if (res.data) {
        ElMessage.success('任务创建成功')
        createDialogVisible.value = false
        await fetchTasks()
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '创建失败，请重试')
      console.error(e)
    } finally {
      creating.value = false
    }
  })
}

function viewTaskDetail(task: CareTask) {
  currentTask.value = { ...task }
  detailDialogVisible.value = true
}

function openClaimDialog(task: CareTask) {
  currentTask.value = { ...task }
  claimForm.claimantName = ''
  claimForm.claimantRole = 'companion'
  detailDialogVisible.value = false
  claimDialogVisible.value = true
}

async function submitClaim() {
  if (!claimFormRef.value || !currentTask.value) return
  await claimFormRef.value.validate(async (valid) => {
    if (!valid) return
    claiming.value = true
    try {
      const res = await claimCareTask(currentTask.value!.id, { ...claimForm })
      if (res.data) {
        ElMessage.success('任务领取成功')
        claimDialogVisible.value = false
        await fetchTasks()
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '领取失败，请重试')
      console.error(e)
    } finally {
      claiming.value = false
    }
  })
}

async function handleStartTask(task: CareTask) {
  try {
    const res = await startCareTask(task.id)
    if (res.data) {
      ElMessage.success('任务已开始')
      detailDialogVisible.value = false
      await fetchTasks()
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败，请重试')
    console.error(e)
  }
}

function openCompleteDialog(task: CareTask) {
  currentTask.value = { ...task }
  completeRemark.value = ''
  detailDialogVisible.value = false
  completeDialogVisible.value = true
}

async function submitComplete() {
  if (!currentTask.value) return
  completing.value = true
  try {
    const res = await completeCareTask(currentTask.value.id, { remark: completeRemark.value })
    if (res.data) {
      ElMessage.success('任务已完成')
      completeDialogVisible.value = false
      await fetchTasks()
    }
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '操作失败，请重试')
    console.error(e)
  } finally {
    completing.value = false
  }
}

function openFailDialog(task: CareTask) {
  currentTask.value = { ...task }
  failForm.failureReason = ''
  detailDialogVisible.value = false
  failDialogVisible.value = true
}

async function submitFail() {
  if (!failFormRef.value || !currentTask.value) return
  await failFormRef.value.validate(async (valid) => {
    if (!valid) return
    failing.value = true
    try {
      const res = await failCareTask(currentTask.value!.id, { failureReason: failForm.failureReason })
      if (res.data) {
        ElMessage.success('已提交未完成原因')
        failDialogVisible.value = false
        await fetchTasks()
      }
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '提交失败，请重试')
      console.error(e)
    } finally {
      failing.value = false
    }
  })
}

onMounted(async () => {
  await fetchPlans()
})
</script>

<style scoped>
.page-title {
  font-size: 24px;
  font-weight: 700;
  color: #5A4A42;
  margin: 0 0 20px 0;
}

.toolbar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
  padding: 12px 16px;
  background: #FFF8F2;
  border-radius: 10px;
  flex-wrap: wrap;
  gap: 12px;
}

.stat-card {
  background: #FFFFFF;
  border-radius: 12px;
  padding: 18px 20px;
  box-shadow: 0 2px 8px rgba(232, 133, 90, 0.08);
  border: 1px solid #F0D9C7;
}

.stat-label {
  font-size: 14px;
  color: #8B7B73;
  margin-bottom: 6px;
}

.stat-value {
  font-size: 28px;
  font-weight: 700;
  color: #5A4A42;
}

.stat-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>
