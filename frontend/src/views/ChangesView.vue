<template>
  <div>
    <h2 class="page-title">途中变更登记与记录</h2>

    <div class="toolbar">
      <div style="display: flex; gap: 12px; align-items: center; flex-wrap: wrap">
        <span style="font-size: 16px; color: #5A4A42; font-weight: 500">选择计划：</span>
        <el-select
          v-model="selectedPlanId"
          placeholder="请选择出行计划"
          style="width: 320px"
          clearable
          @change="fetchChanges"
        >
          <el-option
            v-for="plan in planOptions"
            :key="plan.id"
            :label="`${plan.title} - ${plan.destination}`"
            :value="plan.id"
          />
        </el-select>
        <el-divider direction="vertical" style="height: 28px; margin: 0 8px" />
        <el-radio-group v-model="filterType" size="large">
          <el-radio-button value="">全部</el-radio-button>
          <el-radio-button value="提前返回">
            <el-icon style="margin-right: 4px"><Back /></el-icon>
            提前返回
          </el-radio-button>
          <el-radio-button value="更改集合点">
            <el-icon style="margin-right: 4px"><Location /></el-icon>
            更改集合点
          </el-radio-button>
          <el-radio-button value="其他">
            <el-icon style="margin-right: 4px"><MoreFilled /></el-icon>
            其他
          </el-radio-button>
        </el-radio-group>
      </div>
      <div>
        <el-button
          type="primary"
          size="large"
          :icon="Plus"
          :disabled="!selectedPlanId"
          @click="openAddDialog"
        >
          新增变更登记
        </el-button>
      </div>
    </div>

    <el-card v-loading="loading">
      <div v-if="!selectedPlanId">
        <el-empty description="请先选择一个出行计划查看变更记录" :image-size="120" />
      </div>
      <div v-else-if="filteredChanges.length === 0 && !loading">
        <el-empty description="暂无变更记录">
          <template #image>
            <el-icon :size="80" color="#E8855A"><Document /></el-icon>
          </template>
          <el-button v-if="selectedPlanId" type="primary" :icon="Plus" size="large" @click="openAddDialog">
            登记第一条变更
          </el-button>
        </el-empty>
      </div>

      <div v-else>
        <div style="display: flex; align-items: center; gap: 10px; margin-bottom: 20px; font-size: 16px; color: #5A4A42">
          <el-icon :size="22" color="#E8855A"><Histogram /></el-icon>
          <span style="font-weight: 600">变更时间线</span>
          <el-tag type="info" effect="plain" size="large" style="margin-left: 4px">
            共 {{ filteredChanges.length }} 条记录
          </el-tag>
        </div>

        <el-timeline style="padding-left: 20px">
          <el-timeline-item
            v-for="item in filteredChanges"
            :key="item.id"
            :timestamp="formatDateTime(item.changeTime)"
            :type="changeTypeColor[item.changeType]"
            :icon="changeTypeIcon[item.changeType] as never"
            :hollow="false"
            size="large"
          >
            <div style="background: #FBF5EF; border-radius: 12px; padding: 18px 20px">
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 14px; flex-wrap: wrap; gap: 12px">
                <div style="flex: 1; min-width: 300px">
                  <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap; margin-bottom: 8px">
                    <span style="font-size: 18px; font-weight: 700; color: #5A4A42">
                      {{ item.elderName }}
                    </span>
                    <el-tag :type="changeTypeTag[item.changeType]" effect="light" size="large">
                      <el-icon style="margin-right: 4px" :size="14">
                        <component :is="changeTypeIcon[item.changeType]" />
                      </el-icon>
                      {{ changeTypeText[item.changeType] }}
                    </el-tag>
                  </div>
                  <div v-if="item.routeVersionName" style="display: flex; gap: 8px; flex-wrap: wrap; margin-top: 8px">
                    <el-tag type="info" effect="plain" size="small">
                      <el-icon style="margin-right: 4px"><Guide /></el-icon>
                      路线：{{ item.routeVersionName }}
                    </el-tag>
                    <el-tag
                      v-if="item.consensusScore !== undefined"
                      :type="item.consensusScore >= 70 ? 'success' : 'warning'"
                      effect="plain"
                      size="small"
                    >
                      共识分：{{ item.consensusScore }}
                    </el-tag>
                    <el-tag v-if="item.isForcedRoute" type="danger" effect="plain" size="small">
                      强制发布路线
                    </el-tag>
                    <el-tag
                      v-if="item.riskTagsAtChange && item.riskTagsAtChange.length > 0"
                      type="warning"
                      effect="plain"
                      size="small"
                    >
                      风险：{{ item.riskTagsAtChange.join('、') }}
                    </el-tag>
                  </div>
                </div>
                <div style="display: flex; gap: 8px">
                  <el-button link type="primary" size="large" :icon="Edit" @click="openEditDialog(item)">
                    编辑
                  </el-button>
                  <el-button link type="danger" size="large" :icon="Delete" @click="handleDelete(item)">
                    删除
                  </el-button>
                </div>
              </div>

              <el-row :gutter="16">
                <el-col :xs="24" :md="12">
                  <div style="background: #FFF8F2; border-radius: 10px; padding: 12px 16px; margin-bottom: 8px">
                    <div style="font-size: 13px; color: #8B7B73; margin-bottom: 4px">
                      <el-icon style="margin-right: 4px"><Back /></el-icon>
                      原值 → 新值
                    </div>
                    <div style="font-size: 15px; color: #5A4A42; line-height: 1.6">
                      <span style="text-decoration: line-through; color: #8B7B73; margin-right: 8px">
                        {{ item.oldValue || '未填写' }}
                      </span>
                      <el-icon :size="16" color="#E8855A" style="vertical-align: middle"><Right /></el-icon>
                      <span style="font-weight: 600; color: #E8855A; margin-left: 8px">
                        {{ item.newValue || '未填写' }}
                      </span>
                    </div>
                  </div>
                </el-col>
                <el-col :xs="24" :md="12">
                  <div style="background: #F0FAF7; border-radius: 10px; padding: 12px 16px; margin-bottom: 8px">
                    <div style="font-size: 13px; color: #8B7B73; margin-bottom: 4px">
                      <el-icon style="margin-right: 4px"><InfoFilled /></el-icon>
                      影响备注
                    </div>
                    <div style="font-size: 15px; color: #5A4A42; line-height: 1.6">
                      {{ item.impactNotes || '未填写' }}
                    </div>
                  </div>
                </el-col>
              </el-row>

              <div style="background: #FFFDF8; border-left: 4px solid #FFE3B8; padding: 10px 14px; margin-top: 4px; border-radius: 8px">
                <div style="font-size: 13px; color: #8B7B73; margin-bottom: 2px">
                  <el-icon style="margin-right: 4px; color: #E8855A"><Warning /></el-icon>
                  变更原因（供下次参考）
                </div>
                <div style="font-size: 15px; color: #5A4A42; line-height: 1.6; font-weight: 500">
                  {{ item.changeReason || '未填写原因' }}
                </div>
              </div>
            </div>
          </el-timeline-item>
        </el-timeline>
      </div>
    </el-card>

    <el-dialog
      v-model="formDialogVisible"
      :title="isEditMode ? '编辑变更记录' : '新增变更登记'"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="120px"
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

        <el-form-item label="变更类型" prop="changeType">
          <el-radio-group v-model="formData.changeType" size="large">
            <el-radio-button value="提前返回">
              <el-icon style="margin-right: 4px"><Back /></el-icon>
              提前返回
            </el-radio-button>
            <el-radio-button value="更改集合点">
              <el-icon style="margin-right: 4px"><Location /></el-icon>
              更改集合点
            </el-radio-button>
            <el-radio-button value="其他">
              <el-icon style="margin-right: 4px"><MoreFilled /></el-icon>
              其他
            </el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="原值" prop="oldValue">
          <el-input v-model="formData.oldValue" placeholder="请输入变更前的值" maxlength="100" />
        </el-form-item>

        <el-form-item label="新值" prop="newValue">
          <el-input v-model="formData.newValue" placeholder="请输入变更后的值" maxlength="100" />
        </el-form-item>

        <el-form-item label="变更原因" prop="changeReason">
          <el-input
            v-model="formData.changeReason"
            type="textarea"
            :rows="3"
            placeholder="请详细描述变更的原因..."
            maxlength="300"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="影响备注" prop="impactNotes">
          <el-input
            v-model="formData.impactNotes"
            type="textarea"
            :rows="2"
            placeholder="请描述该变更带来的影响..."
            maxlength="300"
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
import { ref, reactive, computed, onMounted, type FormInstance, type Component } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  Plus,
  Document,
  Histogram,
  Warning,
  InfoFilled,
  Edit,
  Delete,
  Back,
  Location,
  MoreFilled,
  Right,
  Guide
} from '@element-plus/icons-vue'
import { getAllPlans } from '@/api/plans'
import {
  getChangesByPlanId,
  createChange,
  updateChange,
  deleteChange
} from '@/api/changes'
import type { TravelPlan, TravelChange, TravelChangeForm, ChangeType } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const planOptions = ref<TravelPlan[]>([])
const selectedPlanId = ref('')
const changeList = ref<TravelChange[]>([])
const filterType = ref('')

const formDialogVisible = ref(false)
const isEditMode = ref(false)
const editingId = ref('')
const formRef = ref<FormInstance>()

const changeTypeText: Record<ChangeType, string> = {
  '提前返回': '提前返回',
  '更改集合点': '更改集合点',
  '其他': '其他变更'
}

const changeTypeColor: Record<ChangeType, 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  '提前返回': 'warning',
  '更改集合点': 'primary',
  '其他': 'info'
}

const changeTypeTag: Record<ChangeType, 'warning' | 'primary' | 'info'> = {
  '提前返回': 'warning',
  '更改集合点': 'primary',
  '其他': 'info'
}

const changeTypeIcon: Record<ChangeType, Component> = {
  '提前返回': Back,
  '更改集合点': Location,
  '其他': MoreFilled
}

const filteredChanges = computed(() => {
  if (!filterType.value) return changeList.value
  return changeList.value.filter((c) => c.changeType === filterType.value)
})

const formData = reactive<TravelChangeForm>({
  planId: '',
  elderName: '',
  changeType: '其他',
  oldValue: '',
  newValue: '',
  changeReason: '',
  impactNotes: ''
})

const formRules = {
  planId: [{ required: true, message: '请选择计划', trigger: 'change' }],
  elderName: [
    { required: true, message: '请输入长辈姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度2-20字符', trigger: 'blur' }
  ],
  changeType: [{ required: true, message: '请选择变更类型', trigger: 'change' }],
  newValue: [{ required: true, message: '请输入新值', trigger: 'blur' }],
  changeReason: [{ required: true, message: '请填写变更原因', trigger: 'blur' }]
}

function formatDateTime(dateStr: string) {
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

async function fetchChanges() {
  if (!selectedPlanId.value) {
    changeList.value = []
    return
  }
  loading.value = true
  try {
    const res = await getChangesByPlanId(selectedPlanId.value)
    changeList.value = ((res.data as TravelChange[]) || []).sort(
      (a, b) => new Date(b.changeTime).getTime() - new Date(a.changeTime).getTime()
    )
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formData.planId = selectedPlanId.value || ''
  formData.elderName = ''
  formData.changeType = '其他'
  formData.oldValue = ''
  formData.newValue = ''
  formData.changeReason = ''
  formData.impactNotes = ''
  editingId.value = ''
  formRef.value?.resetFields()
}

function openAddDialog() {
  isEditMode.value = false
  resetForm()
  formDialogVisible.value = true
}

function openEditDialog(row: TravelChange) {
  isEditMode.value = true
  editingId.value = row.id
  formData.planId = row.planId
  formData.elderName = row.elderName
  formData.changeType = row.changeType
  formData.oldValue = row.oldValue
  formData.newValue = row.newValue
  formData.changeReason = row.changeReason
  formData.impactNotes = row.impactNotes
  formDialogVisible.value = true
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEditMode.value) {
        await updateChange(editingId.value, { ...formData })
        ElMessage.success('变更记录修改成功')
      } else {
        await createChange({ ...formData })
        ElMessage.success('变更登记成功')
      }
      formDialogVisible.value = false
      await fetchChanges()
    } catch (e) {
      console.error(e)
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row: TravelChange) {
  try {
    await ElMessageBox.confirm(
      `确定要删除 ${row.elderName} 的这条变更记录吗？`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await deleteChange(row.id)
    ElMessage.success('删除成功')
    await fetchChanges()
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
