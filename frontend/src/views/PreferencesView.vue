<template>
  <div>
    <h2 class="page-title">长辈节奏偏好登记</h2>

    <div class="toolbar">
      <div style="display: flex; gap: 12px; align-items: center">
        <span style="font-size: 16px; color: #5A4A42; font-weight: 500">选择计划：</span>
        <el-select
          v-model="selectedPlanId"
          placeholder="请选择出行计划"
          style="width: 320px"
          clearable
          @change="fetchGroupedData"
        >
          <el-option
            v-for="plan in planOptions"
            :key="plan.id"
            :label="`${plan.title} - ${plan.destination}`"
            :value="plan.id"
          />
        </el-select>
      </div>
      <el-button
        type="primary"
        :icon="Plus"
        size="large"
        :disabled="!selectedPlanId"
        @click="openRegisterDialog"
      >
        登记偏好
      </el-button>
    </div>

    <el-card v-loading="loading">
      <el-empty
        v-if="groupedData.length === 0"
        description="暂无数据，请先选择计划并登记长辈偏好"
        :image-size="120"
      />

      <el-collapse v-else v-model="activeNames">
        <el-collapse-item
          v-for="group in groupedData"
          :key="group.planId"
          :name="group.planId"
        >
          <template #title>
            <div style="display: flex; justify-content: space-between; align-items: center; width: 100%; padding-right: 20px">
              <div style="display: flex; align-items: center; gap: 12px">
                <el-icon :size="22" color="#E8855A"><Calendar /></el-icon>
                <span style="font-size: 17px; font-weight: 600">{{ group.planTitle }}</span>
                <el-tag type="success" effect="light">
                  目的地：{{ group.destination }}
                </el-tag>
              </div>
              <div>
                <el-tag type="warning" effect="dark">
                  <el-icon style="margin-right: 4px"><User /></el-icon>
                  已登记 {{ group.preferences.length }} 位长辈
                </el-tag>
              </div>
            </div>
          </template>

          <el-table
            :data="group.preferences"
            style="width: 100%; margin-top: 8px"
            stripe
            size="large"
            empty-text="该计划暂无登记的长辈，点击右上角'登记偏好'按钮添加"
          >
            <el-table-column prop="elderName" label="长辈姓名" width="130">
              <template #default="{ row }">
                <span style="font-weight: 600; font-size: 16px">{{ row.elderName }}</span>
              </template>
            </el-table-column>
            <el-table-column label="体力等级" width="130">
              <template #default="{ row }">
                <el-tag :type="staminaTagType[row.staminaLevel]" effect="light" size="large">
                  {{ staminaText[row.staminaLevel] }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="休息频率" width="160">
              <template #default="{ row }">
                {{ row.restFrequency }}
              </template>
            </el-table-column>
            <el-table-column label="怕晒" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.sunSensitive ? 'warning' : 'info'" effect="light">
                  {{ row.sunSensitive ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="怕冷" width="90" align="center">
              <template #default="{ row }">
                <el-tag :type="row.coldSensitive ? 'primary' : 'info'" effect="light">
                  {{ row.coldSensitive ? '是' : '否' }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="可接受集合时段" width="200">
              <template #default="{ row }">
                <span style="font-family: monospace; font-size: 15px">
                  {{ row.availableStartTime }} ~ {{ row.availableEndTime }}
                </span>
              </template>
            </el-table-column>
            <el-table-column prop="notes" label="备注" min-width="160" show-overflow-tooltip />
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <el-button link type="primary" :icon="Edit" @click="openEditDialog(group.planId, row)">
                  编辑
                </el-button>
                <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
                  删除
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-collapse-item>
      </el-collapse>
    </el-card>

    <el-dialog
      v-model="formDialogVisible"
      :title="isEditMode ? '编辑长辈偏好' : '登记长辈偏好'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="140px"
        label-position="right"
      >
        <el-form-item label="所属计划">
          <el-select v-model="formData.planId" placeholder="请选择计划" style="width: 100%" disabled>
            <el-option
              v-for="plan in planOptions"
              :key="plan.id"
              :label="plan.title"
              :value="plan.id"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="长辈姓名" prop="elderName">
          <el-input v-model="formData.elderName" placeholder="请输入长辈姓名" maxlength="20" />
        </el-form-item>

        <el-form-item label="体力等级" prop="staminaLevel">
          <el-radio-group v-model="formData.staminaLevel" size="large">
            <el-radio-button value="低">
              <el-icon style="margin-right: 4px"><Warning /></el-icon>
              低
            </el-radio-button>
            <el-radio-button value="中">
              <el-icon style="margin-right: 4px"><CircleCheck /></el-icon>
              中
            </el-radio-button>
            <el-radio-button value="高">
              <el-icon style="margin-right: 4px"><Lightning /></el-icon>
              高
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="休息频率" prop="restFrequency">
          <el-select v-model="formData.restFrequency" placeholder="请选择休息频率" style="width: 100%" size="large">
            <el-option label="每15分钟休息一次" value="每15分钟" />
            <el-option label="每30分钟休息一次" value="每30分钟" />
            <el-option label="每45分钟休息一次" value="每45分钟" />
            <el-option label="按需休息" value="按需" />
          </el-select>
        </el-form-item>

        <el-form-item label="怕晒" prop="sunSensitive">
          <el-switch
            v-model="formData.sunSensitive"
            size="large"
            active-text="是（需遮阳安排）"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="怕冷" prop="coldSensitive">
          <el-switch
            v-model="formData.coldSensitive"
            size="large"
            active-text="是（需保暖安排）"
            inactive-text="否"
          />
        </el-form-item>

        <el-form-item label="可接受集合时段" required>
          <el-time-picker
            v-model="timePickerValue"
            is-range
            range-separator="至"
            start-placeholder="开始时间"
            end-placeholder="结束时间"
            format="HH:mm"
            value-format="HH:mm"
            style="width: 100%"
            size="large"
          />
        </el-form-item>

        <el-form-item label="备注" prop="notes">
          <el-input
            v-model="formData.notes"
            type="textarea"
            :rows="3"
            placeholder="请输入其他需要注意的事项..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="form-actions" style="border-top: none; margin-top: 0; padding-top: 0">
          <el-button @click="formDialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" :loading="submitting" size="large" @click="handleSubmit">
            {{ isEditMode ? '保存修改' : '确认登记' }}
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted, watch, type FormInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Plus, Edit, Delete, Calendar, User, Warning, CircleCheck, Lightning } from '@element-plus/icons-vue'
import { getAllPlans } from '@/api/plans'
import {
  getPreferencesGroupedByPlan,
  getPreferencesByPlanId,
  createPreference,
  updatePreference,
  deletePreference
} from '@/api/preferences'
import type {
  TravelPlan,
  ElderPreference,
  ElderPreferenceForm,
  PlanWithPreferences,
  StaminaLevel
} from '@/types'

const loading = ref(false)
const submitting = ref(false)
const planOptions = ref<TravelPlan[]>([])
const selectedPlanId = ref('')
const groupedData = ref<PlanWithPreferences[]>([])
const activeNames = ref<string[]>([])

const formDialogVisible = ref(false)
const isEditMode = ref(false)
const editingId = ref('')
const formRef = ref<FormInstance>()
const timePickerValue = ref<[string, string] | null>(null)

const staminaText: Record<StaminaLevel, string> = {
  '低': '体力较低',
  '中': '体力中等',
  '高': '体力较好'
}

const staminaTagType: Record<StaminaLevel, 'danger' | 'warning' | 'success'> = {
  '低': 'danger',
  '中': 'warning',
  '高': 'success'
}

const formData = reactive<ElderPreferenceForm>({
  planId: '',
  elderName: '',
  staminaLevel: '中',
  restFrequency: '每30分钟',
  sunSensitive: false,
  coldSensitive: false,
  availableStartTime: '08:00',
  availableEndTime: '18:00',
  notes: ''
})

const formRules = {
  planId: [{ required: true, message: '请选择计划', trigger: 'change' }],
  elderName: [
    { required: true, message: '请输入长辈姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度2-20字符', trigger: 'blur' }
  ],
  staminaLevel: [{ required: true, message: '请选择体力等级', trigger: 'change' }],
  restFrequency: [{ required: true, message: '请选择休息频率', trigger: 'change' }]
}

async function fetchPlans() {
  try {
    const res = await getAllPlans()
    planOptions.value = (res.data as TravelPlan[]) || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchGroupedData() {
  loading.value = true
  try {
    if (selectedPlanId.value) {
      const plan = planOptions.value.find((p) => p.id === selectedPlanId.value)
      const res = await getPreferencesByPlanId(selectedPlanId.value)
      const prefs = (res.data as ElderPreference[]) || []
      groupedData.value = plan
        ? [
            {
              planId: plan.id,
              planTitle: plan.title,
              destination: plan.destination,
              preferences: prefs
            }
          ]
        : []
    } else {
      const res = await getPreferencesGroupedByPlan()
      groupedData.value = (res.data as PlanWithPreferences[]) || []
    }
    activeNames.value = groupedData.value.map((g) => g.planId)
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formData.planId = selectedPlanId.value || ''
  formData.elderName = ''
  formData.staminaLevel = '中'
  formData.restFrequency = '每30分钟'
  formData.sunSensitive = false
  formData.coldSensitive = false
  formData.availableStartTime = '08:00'
  formData.availableEndTime = '18:00'
  formData.notes = ''
  timePickerValue.value = ['08:00', '18:00']
  editingId.value = ''
  formRef.value?.resetFields()
}

function openRegisterDialog() {
  isEditMode.value = false
  resetForm()
  formDialogVisible.value = true
}

function openEditDialog(planId: string, row: ElderPreference) {
  isEditMode.value = true
  editingId.value = row.id
  formData.planId = planId
  formData.elderName = row.elderName
  formData.staminaLevel = row.staminaLevel
  formData.restFrequency = row.restFrequency
  formData.sunSensitive = row.sunSensitive
  formData.coldSensitive = row.coldSensitive
  formData.availableStartTime = row.availableStartTime
  formData.availableEndTime = row.availableEndTime
  formData.notes = row.notes
  timePickerValue.value = [row.availableStartTime, row.availableEndTime]
  formDialogVisible.value = true
}

async function handleSubmit() {
  if (timePickerValue.value) {
    formData.availableStartTime = timePickerValue.value[0]
    formData.availableEndTime = timePickerValue.value[1]
  }
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEditMode.value) {
        await updatePreference(editingId.value, { ...formData })
        ElMessage.success('偏好修改成功')
      } else {
        await createPreference({ ...formData })
        ElMessage.success('偏好登记成功')
      }
      formDialogVisible.value = false
      await fetchGroupedData()
    } catch (e) {
      console.error(e)
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row: ElderPreference) {
  try {
    await ElMessageBox.confirm(
      `确定要删除长辈"${row.elderName}"的偏好登记吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await deletePreference(row.id)
    ElMessage.success('删除成功')
    await fetchGroupedData()
  } catch (e: any) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

watch(selectedPlanId, () => {
  fetchGroupedData()
})

onMounted(async () => {
  await fetchPlans()
  await fetchGroupedData()
})
</script>
