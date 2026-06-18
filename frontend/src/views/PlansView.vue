<template>
  <div>
    <h2 class="page-title">出行计划管理</h2>

    <div class="toolbar">
      <div>
        <el-input
          v-model="searchKeyword"
          placeholder="搜索计划标题或目的地..."
          style="width: 320px"
          :prefix-icon="Search"
          clearable
        />
      </div>
      <el-button type="primary" :icon="Plus" size="large" @click="openCreateDialog">
        创建新计划
      </el-button>
    </div>

    <el-card>
      <el-table
        :data="filteredPlans"
        v-loading="loading"
        style="width: 100%"
        stripe
        empty-text="暂无出行计划，点击右上角按钮创建"
      >
        <el-table-column prop="title" label="计划标题" min-width="180">
          <template #default="{ row }">
            <span style="font-weight: 600; font-size: 16px">{{ row.title }}</span>
          </template>
        </el-table-column>
        <el-table-column prop="destination" label="目的地" min-width="140" />
        <el-table-column label="预计步行时长" width="150">
          <template #default="{ row }">
            <el-tag type="primary" effect="light">
              {{ row.estimatedWalkMinutes }} 分钟
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="台阶坡度" width="160">
          <template #default="{ row }">
            <el-rate
              :model-value="row.stepSlope"
              disabled
              :max="5"
              :colors="['#E8855A', '#E8855A', '#E8855A']"
              void-color="#F0D9C7"
            />
          </template>
        </el-table-column>
        <el-table-column label="厕所点位" width="120" align="center">
          <template #default="{ row }">
            <el-tag type="success" effect="light">
              {{ row.toiletPoints?.length || 0 }} 个
            </el-tag>
          </template>
        </el-table-column>
        <el-table-column label="操作" width="280" fixed="right" align="center">
          <template #default="{ row }">
            <el-button link type="primary" :icon="View" @click="openDetailDialog(row)">
              详情
            </el-button>
            <el-button link type="primary" :icon="Edit" @click="openEditDialog(row)">
              编辑
            </el-button>
            <el-button link type="danger" :icon="Delete" @click="handleDelete(row)">
              删除
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-dialog
      v-model="formDialogVisible"
      :title="isEditMode ? '编辑出行计划' : '创建出行计划'"
      width="720px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="formRef"
        :model="formData"
        :rules="formRules"
        label-width="130px"
        label-position="right"
      >
        <el-form-item label="计划标题" prop="title">
          <el-input v-model="formData.title" placeholder="请输入计划标题" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="目的地" prop="destination">
          <el-input v-model="formData.destination" placeholder="请输入目的地" maxlength="50" show-word-limit />
        </el-form-item>

        <el-form-item label="预计步行时长" prop="estimatedWalkMinutes">
          <el-input-number
            v-model="formData.estimatedWalkMinutes"
            :min="5"
            :max="600"
            :step="5"
            style="width: 200px"
          />
          <span style="margin-left: 12px; color: #8B7B73">分钟</span>
        </el-form-item>

        <el-form-item label="台阶坡度" prop="stepSlope">
          <div style="flex: 1; display: flex; align-items: center; gap: 16px">
            <el-slider
              v-model="formData.stepSlope"
              :min="1"
              :max="5"
              :step="1"
              :show-tooltip="true"
              :marks="slopeMarks"
              style="flex: 1"
            />
            <el-tag type="warning" effect="light">
              {{ slopeLevelText[formData.stepSlope] }}
            </el-tag>
          </div>
        </el-form-item>

        <el-form-item label="厕所点位">
          <div style="flex: 1; width: 100%">
            <div
              v-for="(item, index) in formData.toiletPoints"
              :key="index"
              class="toilet-point-item"
            >
              <el-form-item
                :prop="`toiletPoints.${index}.name`"
                :rules="{ required: true, message: '请输入点位名称', trigger: 'blur' }"
                style="margin-bottom: 0; flex: 1"
                label="名称"
                label-width="50px"
              >
                <el-input v-model="item.name" placeholder="点位名称" />
              </el-form-item>
              <el-form-item
                :prop="`toiletPoints.${index}.longitude`"
                :rules="{ required: true, message: '请输入经度', trigger: 'blur' }"
                style="margin-bottom: 0; width: 150px"
                label="经度"
                label-width="40px"
              >
                <el-input-number v-model="item.longitude" :precision="6" :step="0.001" style="width: 100%" />
              </el-form-item>
              <el-form-item
                :prop="`toiletPoints.${index}.latitude`"
                :rules="{ required: true, message: '请输入纬度', trigger: 'blur' }"
                style="margin-bottom: 0; width: 150px"
                label="纬度"
                label-width="40px"
              >
                <el-input-number v-model="item.latitude" :precision="6" :step="0.001" style="width: 100%" />
              </el-form-item>
              <el-button
                type="danger"
                link
                :icon="Close"
                @click="removeToiletPoint(index)"
                :disabled="formData.toiletPoints.length === 0"
              />
            </div>
            <el-button type="primary" plain :icon="Plus" @click="addToiletPoint" style="margin-top: 8px">
              添加厕所点位
            </el-button>
          </div>
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="form-actions" style="border-top: none; margin-top: 0; padding-top: 0">
          <el-button @click="formDialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" :loading="submitting" size="large" @click="handleSubmit">
            {{ isEditMode ? '保存修改' : '创建计划' }}
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="detailDialogVisible"
      :title="`计划详情 - ${currentDetailPlan?.title || ''}`"
      width="640px"
    >
      <div v-if="currentDetailPlan" style="line-height: 2">
        <el-descriptions :column="2" border size="large">
          <el-descriptions-item label="计划标题" :span="2">
            <span style="font-weight: 600">{{ currentDetailPlan.title }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="目的地">
            {{ currentDetailPlan.destination }}
          </el-descriptions-item>
          <el-descriptions-item label="预计步行时长">
            {{ currentDetailPlan.estimatedWalkMinutes }} 分钟
          </el-descriptions-item>
          <el-descriptions-item label="台阶坡度">
            <el-rate
              :model-value="currentDetailPlan.stepSlope"
              disabled
              :max="5"
              :colors="['#E8855A', '#E8855A', '#E8855A']"
              void-color="#F0D9C7"
            />
            <span style="margin-left: 8px">{{ slopeLevelText[currentDetailPlan.stepSlope] }}</span>
          </el-descriptions-item>
          <el-descriptions-item label="厕所点位">
            {{ currentDetailPlan.toiletPoints?.length || 0 }} 个
          </el-descriptions-item>
        </el-descriptions>

        <div style="margin-top: 24px" v-if="currentDetailPlan.toiletPoints?.length">
          <div class="section-title">厕所点位列表</div>
          <el-table :data="currentDetailPlan.toiletPoints" size="large" border stripe>
            <el-table-column type="index" label="序号" width="70" align="center" />
            <el-table-column prop="name" label="点位名称" min-width="160" />
            <el-table-column prop="longitude" label="经度" width="150" />
            <el-table-column prop="latitude" label="纬度" width="150" />
          </el-table>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, computed, onMounted, type FormInstance } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { Search, Plus, View, Edit, Delete, Close } from '@element-plus/icons-vue'
import {
  getPlanList,
  createPlan,
  updatePlan,
  deletePlan
} from '@/api/plans'
import type { TravelPlan, TravelPlanForm, ToiletPoint, PaginatedResponse } from '@/types'

const loading = ref(false)
const submitting = ref(false)
const searchKeyword = ref('')
const planList = ref<TravelPlan[]>([])

const formDialogVisible = ref(false)
const detailDialogVisible = ref(false)
const isEditMode = ref(false)
const editingId = ref('')
const currentDetailPlan = ref<TravelPlan | null>(null)
const formRef = ref<FormInstance>()

const slopeLevelText: Record<number, string> = {
  1: '非常平缓',
  2: '较平缓',
  3: '适中',
  4: '较陡',
  5: '非常陡'
}

const slopeMarks: Record<number, string> = {
  1: '1级',
  2: '2级',
  3: '3级',
  4: '4级',
  5: '5级'
}

const formData = reactive<TravelPlanForm>({
  title: '',
  destination: '',
  estimatedWalkMinutes: 30,
  stepSlope: 2,
  toiletPoints: []
})

const formRules = {
  title: [
    { required: true, message: '请输入计划标题', trigger: 'blur' },
    { min: 2, max: 50, message: '标题长度在2-50个字符', trigger: 'blur' }
  ],
  destination: [
    { required: true, message: '请输入目的地', trigger: 'blur' }
  ],
  estimatedWalkMinutes: [
    { required: true, message: '请输入预计步行时长', trigger: 'blur' }
  ],
  stepSlope: [
    { required: true, message: '请选择台阶坡度', trigger: 'change' }
  ]
}

const filteredPlans = computed(() => {
  if (!searchKeyword.value) return planList.value
  const keyword = searchKeyword.value.toLowerCase()
  return planList.value.filter(
    (p) =>
      p.title.toLowerCase().includes(keyword) ||
      p.destination.toLowerCase().includes(keyword)
  )
})

async function fetchPlans() {
  loading.value = true
  try {
    const res = await getPlanList({ page: 1, pageSize: 100 })
    if (res.data && (res.data as PaginatedResponse<TravelPlan>).list) {
      planList.value = (res.data as PaginatedResponse<TravelPlan>).list
    } else if (Array.isArray(res.data)) {
      planList.value = res.data as TravelPlan[]
    }
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function resetForm() {
  formData.title = ''
  formData.destination = ''
  formData.estimatedWalkMinutes = 30
  formData.stepSlope = 2
  formData.toiletPoints = []
  editingId.value = ''
  formRef.value?.resetFields()
}

function openCreateDialog() {
  isEditMode.value = false
  resetForm()
  addToiletPoint()
  formDialogVisible.value = true
}

function openEditDialog(row: TravelPlan) {
  isEditMode.value = true
  editingId.value = row.id
  formData.title = row.title
  formData.destination = row.destination
  formData.estimatedWalkMinutes = row.estimatedWalkMinutes
  formData.stepSlope = row.stepSlope
  formData.toiletPoints = row.toiletPoints?.length
    ? row.toiletPoints.map((w) => ({ ...w }))
    : []
  if (formData.toiletPoints.length === 0) addToiletPoint()
  formDialogVisible.value = true
}

function openDetailDialog(row: TravelPlan) {
  currentDetailPlan.value = row
  detailDialogVisible.value = true
}

function addToiletPoint() {
  formData.toiletPoints.push({
    name: '',
    longitude: 116.39723,
    latitude: 39.9075
  } as ToiletPoint)
}

function removeToiletPoint(index: number) {
  formData.toiletPoints.splice(index, 1)
}

async function handleSubmit() {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      if (isEditMode.value) {
        await updatePlan(editingId.value, { ...formData })
        ElMessage.success('计划修改成功')
      } else {
        await createPlan({ ...formData })
        ElMessage.success('计划创建成功')
      }
      formDialogVisible.value = false
      await fetchPlans()
    } catch (e) {
      console.error(e)
    } finally {
      submitting.value = false
    }
  })
}

async function handleDelete(row: TravelPlan) {
  try {
    await ElMessageBox.confirm(
      `确定要删除计划"${row.title}"吗？删除后将无法恢复。`,
      '删除确认',
      {
        confirmButtonText: '确认删除',
        cancelButtonText: '取消',
        type: 'warning',
        confirmButtonClass: 'el-button--danger'
      }
    )
    await deletePlan(row.id)
    ElMessage.success('删除成功')
    await fetchPlans()
  } catch (e: any) {
    if (e !== 'cancel') {
      console.error(e)
    }
  }
}

onMounted(() => {
  fetchPlans()
})
</script>
