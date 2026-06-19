<template>
  <div>
    <h2 class="page-title">路线协商与推荐</h2>

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

    <div
      v-if="selectedPlanId && healthSummary"
      style="margin-bottom: 20px; padding: 18px 20px; border-radius: 14px; background: linear-gradient(135deg, #FFF8F2 0%, #F0FAF7 100%); border: 1px solid #F0D9C7;"
    >
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px; flex-wrap: wrap; gap: 10px">
        <div style="font-size: 17px; font-weight: 700; color: #5A4A42">
          <el-icon :size="20" color="#E8855A" style="margin-right: 6px"><Sunny /></el-icon>
          健康天气风险摘要
        </div>
        <div style="display: flex; gap: 8px; flex-wrap: wrap">
          <el-tag
            v-if="healthSummary.config"
            :type="healthSummary.config.weatherRiskLevel === 'extreme' ? 'danger' : healthSummary.config.weatherRiskLevel === 'high' ? 'warning' : healthSummary.config.weatherRiskLevel === 'medium' ? 'info' : 'success'"
            effect="dark"
            size="large"
          >
            天气：{{ { low: '良好', medium: '一般', high: '风险高', extreme: '极端' }[healthSummary.config.weatherRiskLevel] }}
          </el-tag>
          <el-tag
            v-if="healthSummary.hasExtremeRisk"
            type="danger"
            effect="dark"
            size="large"
          >
            <el-icon style="margin-right: 2px"><WarningFilled /></el-icon>
            存在极高风险
          </el-tag>
          <el-tag type="primary" effect="plain" size="large">
            登记率 {{ healthSummary.checkinRate }}% · 确认率 {{ healthSummary.confirmationRate }}%
          </el-tag>
        </div>
      </div>

      <el-row :gutter="16" style="margin-bottom: 10px">
        <el-col :xs="12" :sm="6" :md="4">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 10px; text-align: center">
            <div style="font-size: 12px; color: #8B7B73">应登记</div>
            <div style="font-size: 22px; font-weight: 700; color: #5A4A42">{{ healthSummary.expectedCheckinCount }}人</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 10px; text-align: center">
            <div style="font-size: 12px; color: #8B7B73">已登记</div>
            <div style="font-size: 22px; font-weight: 700; color: #4A9B8C">{{ healthSummary.actualCheckinCount }}人</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 10px; text-align: center">
            <div style="font-size: 12px; color: #8B7B73">高风险</div>
            <div style="font-size: 22px; font-weight: 700; color: #F56C6C">{{ healthSummary.highRiskCount }}人</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 10px; text-align: center">
            <div style="font-size: 12px; color: #8B7B73">中风险</div>
            <div style="font-size: 22px; font-weight: 700; color: #E6A23C">{{ healthSummary.mediumRiskCount }}人</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 10px; text-align: center">
            <div style="font-size: 12px; color: #8B7B73">建议改短</div>
            <div style="font-size: 22px; font-weight: 700; color: #409EFF">{{ healthSummary.suggestShortenCount }}人</div>
          </div>
        </el-col>
        <el-col :xs="12" :sm="6" :md="4">
          <div style="background: #FFFFFF; border-radius: 10px; padding: 10px; text-align: center"
               v-if="healthSummary.config">
            <div style="font-size: 12px; color: #8B7B73">出行时段</div>
            <div style="font-size: 15px; font-weight: 600; color: #5A4A42">{{ healthSummary.config.startTimeSlot }}-{{ healthSummary.config.endTimeSlot }}</div>
          </div>
        </el-col>
      </el-row>

      <div
        v-if="healthSummary.summarySuggestions && healthSummary.summarySuggestions.length > 0"
        style="background: #FFFFFF; border-radius: 10px; padding: 10px 14px"
      >
        <div style="font-size: 13px; font-weight: 600; color: #F56C6C; margin-bottom: 4px">
          <el-icon style="margin-right: 2px"><Warning /></el-icon>
          路线协商注意事项
        </div>
        <ul style="margin: 0; padding-left: 20px; line-height: 1.8">
          <li
            v-for="(s, i) in healthSummary.summarySuggestions"
            :key="i"
            style="font-size: 13px; color: #5A4A42"
          >
            {{ s }}
          </li>
        </ul>
      </div>
      <div
        v-else
        style="background: #FFFFFF; border-radius: 10px; padding: 10px 14px; font-size: 13px; color: #909399"
      >
        暂无汇总建议，如有高风险长辈将在此提示。
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
        <div style="margin-bottom: 20px; display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px">
          <div style="font-size: 17px; font-weight: 600">
            <el-icon :size="22" color="#E8855A" style="margin-right: 8px"><Collection /></el-icon>
            共 {{ routeVersions.length }} 个推荐版本
            <span v-if="selectedRouteId" style="margin-left: 12px; font-weight: normal; color: #4A9B8C; font-size: 15px">
              <el-icon style="vertical-align: middle; margin-right: 4px"><CircleCheckFilled /></el-icon>
              已选中：{{ getSelectedRouteName }}
            </span>
          </div>
          <div style="display: flex; gap: 8px; align-items: center">
            <el-tag type="info" effect="light" size="large">
              共识阈值：{{ consensusThreshold }}分
            </el-tag>
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
            >
              <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 16px">
                <div>
                  <div style="font-size: 20px; font-weight: 700; color: #5A4A42; margin-bottom: 4px">
                    {{ route.versionName }}
                  </div>
                  <div style="display: flex; gap: 8px; flex-wrap: wrap">
                    <el-tag
                      :type="difficultyTagType[route.difficulty]"
                      effect="light"
                      size="large"
                    >
                      <el-icon style="margin-right: 4px"><TrendCharts /></el-icon>
                      难度：{{ difficultyText[route.difficulty] }}
                    </el-tag>
                    <el-tag
                      v-if="route.recommendedRank !== undefined && route.recommendedRank <= routeVersions.length"
                      type="warning"
                      effect="dark"
                      size="large"
                    >
                      推荐 #{{ route.recommendedRank }}
                    </el-tag>
                  </div>
                </div>
                <div v-if="selectedRouteId === route.id">
                  <el-tag type="success" effect="dark" size="large">
                    <el-icon style="margin-right: 4px"><CircleCheckFilled /></el-icon>
                    已选
                  </el-tag>
                </div>
              </div>

              <div style="background: linear-gradient(135deg, #FFF8F2 0%, #F0FAF7 100%); border-radius: 12px; padding: 16px; margin-bottom: 16px">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px">
                  <div style="font-size: 14px; color: #8B7B73; font-weight: 500">
                    <el-icon style="margin-right: 4px; color: #E8855A"><DataAnalysis /></el-icon>
                    共识评分
                  </div>
                  <div style="display: flex; align-items: center; gap: 8px">
                    <span :style="{
                      fontSize: '28px',
                      fontWeight: '700',
                      color: getConsensusScoreColor(route.consensusScore),
                    }">
                      {{ route.consensusScore ?? '-' }}
                    </span>
                    <el-tag
                      :type="route.isConsensusReached ? 'success' : 'danger'"
                      effect="light"
                      size="large"
                    >
                      {{ route.isConsensusReached ? '已达成' : '未达成' }}
                    </el-tag>
                  </div>
                </div>
                <el-progress
                  :percentage="route.consensusScore ?? 0"
                  :color="getConsensusScoreColor(route.consensusScore)"
                  :stroke-width="8"
                  :show-text="false"
                />
                <div style="display: flex; justify-content: space-between; margin-top: 8px; font-size: 13px; color: #8B7B73">
                  <span>参与反馈：{{ route.feedbackCount ?? 0 }} 人</span>
                  <span v-if="route.isForcedPublish" style="color: #F56C6C">
                    <el-icon style="margin-right: 2px"><Warning /></el-icon>
                    强制发布
                  </span>
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

              <div v-if="route.riskTags && route.riskTags.length > 0" style="margin-bottom: 16px">
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #5A4A42">
                  <el-icon style="margin-right: 4px; color: #F56C6C"><Warning /></el-icon>
                  风险标签
                </div>
                <div style="display: flex; gap: 6px; flex-wrap: wrap">
                  <el-tag
                    v-for="tag in route.riskTags"
                    :key="tag"
                    type="danger"
                    effect="light"
                    size="large"
                  >
                    {{ tag }}
                  </el-tag>
                </div>
              </div>

              <div v-if="route.lowConsensusReasons && route.lowConsensusReasons.length > 0" style="margin-bottom: 16px">
                <div style="font-size: 14px; font-weight: 600; margin-bottom: 8px; color: #F56C6C">
                  <el-icon style="margin-right: 4px"><InfoFilled /></el-icon>
                  低共识原因
                </div>
                <div style="background: #FEF0F0; border-radius: 8px; padding: 12px">
                  <ul style="margin: 0; padding-left: 20px; color: #5A4A42; line-height: 1.8; font-size: 13px">
                    <li v-for="(reason, i) in route.lowConsensusReasons" :key="i">{{ reason }}</li>
                  </ul>
                </div>
              </div>

              <div style="border-top: 1px dashed #F0D9C7; padding-top: 16px">
                <div style="font-size: 15px; font-weight: 600; margin-bottom: 12px; color: #5A4A42">
                  <el-icon style="margin-right: 6px; color: #E8855A"><Location /></el-icon>
                  途经点（{{ route.waypoints.length }}个）
                </div>
                <div style="max-height: 200px; overflow-y: auto">
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

              <div style="margin-top: 16px; display: flex; gap: 8px; flex-direction: column">
                <div style="display: flex; gap: 8px">
                  <el-button
                    type="success"
                    size="large"
                    style="flex: 1"
                    :icon="ChatDotRound"
                    @click.stop="openFeedbackDialog(route)"
                  >
                    提交反馈
                  </el-button>
                  <el-button
                    type="info"
                    size="large"
                    style="flex: 1"
                    :icon="View"
                    @click.stop="viewFeedbackDetail(route)"
                  >
                    查看明细
                  </el-button>
                </div>
                <el-button
                  :type="route.isConsensusReached ? 'primary' : 'warning'"
                  size="large"
                  :icon="selectedRouteId === route.id ? CircleCheckFilled : Check"
                  @click.stop="handleSelectRoute(route)"
                >
                  {{ route.isConsensusReached ? '选为最终路线' : (selectedRouteId === route.id ? '已选为最终路线' : '强制发布路线') }}
                </el-button>
              </div>
            </div>
          </el-col>
        </el-row>
      </div>
    </el-card>

    <el-dialog
      v-model="feedbackDialogVisible"
      title="提交路线反馈"
      width="640px"
      :close-on-click-modal="false"
    >
      <el-form
        ref="feedbackFormRef"
        :model="feedbackForm"
        :rules="feedbackFormRules"
        label-width="120px"
        label-position="right"
      >
        <el-form-item label="路线版本">
          <el-tag type="primary" size="large">{{ currentRoute?.versionName }}</el-tag>
        </el-form-item>

        <el-form-item label="长者姓名" prop="elderName">
          <el-input v-model="feedbackForm.elderName" placeholder="请输入您的姓名" maxlength="20" />
        </el-form-item>

        <el-form-item label="体力等级" prop="staminaLevel">
          <el-radio-group v-model="feedbackForm.staminaLevel" size="large">
            <el-radio-button value="低">体力低</el-radio-button>
            <el-radio-button value="中">体力中</el-radio-button>
            <el-radio-button value="高">体力高</el-radio-button>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="可接受程度" prop="acceptanceLevel">
          <el-radio-group v-model="feedbackForm.acceptanceLevel" size="large">
            <el-radio value="完全接受">
              <span style="color: #67C23A; font-weight: 600">😊 完全接受</span>
            </el-radio>
            <el-radio value="基本接受">
              <span style="color: #E6A23C; font-weight: 600">🙂 基本接受</span>
            </el-radio>
            <el-radio value="有条件接受">
              <span style="color: #F56C6C; font-weight: 600">😐 有条件接受</span>
            </el-radio>
            <el-radio value="难以接受">
              <span style="color: #F56C6C; font-weight: 600">😟 难以接受</span>
            </el-radio>
          </el-radio-group>
        </el-form-item>

        <el-form-item label="担心原因" prop="concernReason">
          <el-input
            v-model="feedbackForm.concernReason"
            type="textarea"
            :rows="2"
            placeholder="请描述您的顾虑..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>

        <el-form-item label="步行时间调整" prop="suggestedWalkAdjustmentMinutes">
          <el-input-number
            v-model="feedbackForm.suggestedWalkAdjustmentMinutes"
            :min="-120"
            :max="120"
            :step="5"
            size="large"
            style="width: 100%"
          />
          <div style="font-size: 12px; color: #8B7B73; margin-top: 4px">
            正数表示希望延长，负数表示希望缩短，单位：分钟
          </div>
        </el-form-item>

        <el-form-item label="特殊需求">
          <el-checkbox-group v-model="specialNeeds">
            <el-checkbox value="needSunProtection">需要避晒 ☀️</el-checkbox>
            <el-checkbox value="needColdProtection">需要避冷 ❄️</el-checkbox>
            <el-checkbox value="needNearToilet">需要靠近厕所 🚻</el-checkbox>
          </el-checkbox-group>
        </el-form-item>

        <el-form-item label="其他建议">
          <el-input
            v-model="feedbackForm.otherSuggestions"
            type="textarea"
            :rows="2"
            placeholder="其他建议或补充说明..."
            maxlength="200"
            show-word-limit
          />
        </el-form-item>
      </el-form>

      <template #footer>
        <div class="form-actions" style="border-top: none; margin-top: 0; padding-top: 0">
          <el-button @click="feedbackDialogVisible = false" size="large">取消</el-button>
          <el-button type="primary" :loading="submitting" size="large" @click="submitFeedback">
            提交反馈
          </el-button>
        </div>
      </template>
    </el-dialog>

    <el-dialog
      v-model="feedbackDetailVisible"
      title="反馈明细"
      width="800px"
    >
      <div v-if="currentRoute">
        <div style="margin-bottom: 16px; padding: 16px; background: #FBF5EF; border-radius: 12px">
          <div style="font-size: 18px; font-weight: 700; color: #5A4A42; margin-bottom: 8px">
            {{ currentRoute.versionName }}
          </div>
          <div style="display: flex; gap: 16px; flex-wrap: wrap">
            <div>
              <span style="color: #8B7B73">共识分：</span>
              <span style="font-weight: 700; color: #E8855A; font-size: 20px">{{ currentRoute.consensusScore ?? '-' }}</span>
            </div>
            <div>
              <span style="color: #8B7B73">参与人数：</span>
              <span style="font-weight: 600">{{ currentRoute.feedbackCount ?? 0 }} 人</span>
            </div>
          </div>
        </div>

        <div v-if="currentRouteFeedbacks.length === 0">
          <el-empty description="暂无反馈数据" />
        </div>
        <div v-else>
          <el-table :data="currentRouteFeedbacks" stripe border size="large">
            <el-table-column prop="elderName" label="长者姓名" width="120" />
            <el-table-column prop="staminaLevel" label="体力" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="row.staminaLevel === '低' ? 'danger' : row.staminaLevel === '中' ? 'warning' : 'success'" size="small">
                  {{ row.staminaLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="acceptanceLevel" label="接受度" width="120">
              <template #default="{ row }">
                <el-tag
                  :type="row.acceptanceLevel === '完全接受' || row.acceptanceLevel === '基本接受' ? 'success' : 'danger'"
                  size="small"
                >
                  {{ row.acceptanceLevel }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="concernReason" label="担心原因" min-width="180" show-overflow-tooltip />
            <el-table-column label="步行调整" width="100" align="center">
              <template #default="{ row }">
                <span :style="{ color: row.suggestedWalkAdjustmentMinutes > 0 ? '#67C23A' : row.suggestedWalkAdjustmentMinutes < 0 ? '#F56C6C' : '#909399' }">
                  {{ row.suggestedWalkAdjustmentMinutes > 0 ? '+' : '' }}{{ row.suggestedWalkAdjustmentMinutes }}分
                </span>
              </template>
            </el-table-column>
            <el-table-column label="特殊需求" width="150">
              <template #default="{ row }">
                <div style="display: flex; gap: 4px; flex-wrap: wrap">
                  <el-tag v-if="row.needSunProtection" type="warning" size="small">避晒</el-tag>
                  <el-tag v-if="row.needColdProtection" type="info" size="small">避冷</el-tag>
                  <el-tag v-if="row.needNearToilet" type="primary" size="small">近厕</el-tag>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="feedbackTime" label="反馈时间" width="160">
              <template #default="{ row }">
                {{ formatDateTime(row.feedbackTime) }}
              </template>
            </el-table-column>
          </el-table>
        </div>
      </div>

      <template #footer>
        <el-button @click="feedbackDetailVisible = false" size="large">关闭</el-button>
      </template>
    </el-dialog>

    <el-dialog
      v-model="forcePublishDialogVisible"
      title="强制发布确认"
      width="560px"
      :close-on-click-modal="false"
    >
      <div style="padding: 16px 0">
        <el-alert
          type="warning"
          :closable="false"
          show-icon
          style="margin-bottom: 16px"
        >
          <template #title>
            该路线共识分（{{ currentRoute?.consensusScore }}）未达到阈值（{{ consensusThreshold }}）
          </template>
          <template #default>
            请详细说明强制发布的原因，该原因将被记录到统计数据中。
          </template>
        </el-alert>

        <el-form label-width="100px">
          <el-form-item label="发布人" required>
            <el-input v-model="publisherName" placeholder="请输入发布人姓名" maxlength="20" />
          </el-form-item>
          <el-form-item label="确认原因" required>
            <el-input
              v-model="manualConfirmReason"
              type="textarea"
              :rows="4"
              placeholder="请详细说明强制发布的原因..."
              maxlength="500"
              show-word-limit
            />
          </el-form-item>
        </el-form>
      </div>

      <template #footer>
        <div class="form-actions" style="border-top: none; margin-top: 0; padding-top: 0">
          <el-button @click="forcePublishDialogVisible = false" size="large">取消</el-button>
          <el-button type="warning" :loading="publishing" size="large" @click="confirmForcePublish">
            确认强制发布
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, reactive, onMounted, type FormInstance } from 'vue'
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
  Warning,
  ChatDotRound,
  View,
  DataAnalysis,
  InfoFilled,
  Sunny,
  WarningFilled,
} from '@element-plus/icons-vue'
import { getAllPlans } from '@/api/plans'
import {
  getRouteVersions,
  generateRoutes,
  selectRoute,
} from '@/api/routes'
import {
  getFeedbackList,
  createFeedback,
  publishRoute,
  getConsensusThreshold,
} from '@/api/feedbacks'
import { getPlanSummary } from '@/api/health-weather'
import type {
  TravelPlan,
  RouteVersion,
  DifficultyLevel,
  RouteFeedback,
  CreateFeedbackParams,
  StaminaLevel,
  AcceptanceLevel,
  PlanHealthWeatherSummary,
} from '@/types'

const loading = ref(false)
const generating = ref(false)
const submitting = ref(false)
const publishing = ref(false)
const planOptions = ref<TravelPlan[]>([])
const selectedPlanId = ref('')
const routeVersions = ref<RouteVersion[]>([])
const selectedRouteId = ref('')
const consensusThreshold = ref(70)
const healthSummary = ref<PlanHealthWeatherSummary | null>(null)

const feedbackDialogVisible = ref(false)
const feedbackDetailVisible = ref(false)
const forcePublishDialogVisible = ref(false)
const currentRoute = ref<RouteVersion | null>(null)
const currentRouteFeedbacks = ref<RouteFeedback[]>([])
const feedbackFormRef = ref<FormInstance>()
const specialNeeds = ref<string[]>([])

const publisherName = ref('')
const manualConfirmReason = ref('')

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

const feedbackForm = reactive<CreateFeedbackParams>({
  routeId: '',
  planId: '',
  elderName: '',
  staminaLevel: '中',
  acceptanceLevel: '基本接受',
  concernReason: '',
  suggestedWalkAdjustmentMinutes: 0,
  needSunProtection: false,
  needColdProtection: false,
  needNearToilet: false,
  otherSuggestions: '',
})

const feedbackFormRules = {
  elderName: [
    { required: true, message: '请输入姓名', trigger: 'blur' },
    { min: 2, max: 20, message: '姓名长度2-20字符', trigger: 'blur' }
  ],
  staminaLevel: [{ required: true, message: '请选择体力等级', trigger: 'change' }],
  acceptanceLevel: [{ required: true, message: '请选择接受程度', trigger: 'change' }],
  concernReason: [{ required: true, message: '请填写担心原因', trigger: 'blur' }],
}

const getSelectedRouteName = computed(() => {
  const route = routeVersions.value.find((r) => r.id === selectedRouteId.value)
  return route?.versionName || ''
})

function getConsensusScoreColor(score: number | undefined): string {
  if (score === undefined) return '#909399'
  if (score >= 70) return '#67C23A'
  if (score >= 50) return '#E6A23C'
  return '#F56C6C'
}

function formatDateTime(dateStr: string) {
  if (!dateStr) return '-'
  const d = new Date(dateStr)
  if (isNaN(d.getTime())) return dateStr
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return `${m}-${day} ${hh}:${mm}`
}

async function fetchPlans() {
  try {
    const res = await getAllPlans()
    planOptions.value = (res.data as TravelPlan[]) || []
  } catch (e) {
    console.error(e)
  }
}

async function fetchThreshold() {
  try {
    const res = await getConsensusThreshold()
    consensusThreshold.value = res.data?.threshold || 70
  } catch (e) {
    console.error(e)
  }
}

async function fetchRoutes() {
  if (!selectedPlanId.value) return
  loading.value = true
  try {
    const [routeRes, sumRes] = await Promise.all([
      getRouteVersions(selectedPlanId.value),
      getPlanSummary(selectedPlanId.value).catch(() => ({ data: null })),
    ])
    routeVersions.value = (routeRes.data as RouteVersion[]) || []
    const selected = routeVersions.value.find((r) => r.isSelected)
    if (selected) selectedRouteId.value = selected.id
    healthSummary.value = (sumRes.data as PlanHealthWeatherSummary) || null
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

function handlePlanChange() {
  routeVersions.value = []
  selectedRouteId.value = ''
  healthSummary.value = null
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

function openFeedbackDialog(route: RouteVersion) {
  currentRoute.value = route
  feedbackForm.routeId = route.id
  feedbackForm.planId = route.planId
  feedbackForm.elderName = ''
  feedbackForm.staminaLevel = '中'
  feedbackForm.acceptanceLevel = '基本接受'
  feedbackForm.concernReason = ''
  feedbackForm.suggestedWalkAdjustmentMinutes = 0
  feedbackForm.needSunProtection = false
  feedbackForm.needColdProtection = false
  feedbackForm.needNearToilet = false
  feedbackForm.otherSuggestions = ''
  specialNeeds.value = []
  feedbackFormRef.value?.resetFields()
  feedbackDialogVisible.value = true
}

async function viewFeedbackDetail(route: RouteVersion) {
  currentRoute.value = route
  loading.value = true
  try {
    const res = await getFeedbackList({ routeId: route.id })
    currentRouteFeedbacks.value = (res.data as RouteFeedback[]) || []
    feedbackDetailVisible.value = true
  } catch (e) {
    console.error(e)
  } finally {
    loading.value = false
  }
}

async function submitFeedback() {
  if (!feedbackFormRef.value) return
  feedbackForm.needSunProtection = specialNeeds.value.includes('needSunProtection')
  feedbackForm.needColdProtection = specialNeeds.value.includes('needColdProtection')
  feedbackForm.needNearToilet = specialNeeds.value.includes('needNearToilet')

  await feedbackFormRef.value.validate(async (valid) => {
    if (!valid) return
    submitting.value = true
    try {
      await createFeedback({ ...feedbackForm })
      ElMessage.success('反馈提交成功')
      feedbackDialogVisible.value = false
      await fetchRoutes()
    } catch (e: any) {
      ElMessage.error(e?.response?.data?.message || '提交失败，请重试')
      console.error(e)
    } finally {
      submitting.value = false
    }
  })
}

async function handleSelectRoute(route: RouteVersion) {
  if (selectedRouteId.value === route.id) {
    return
  }

  if (route.isConsensusReached) {
    try {
      await ElMessageBox.confirm(
        `确定要将「${route.versionName}」选为最终路线吗？该版本共识分${route.consensusScore}分，已达成共识。`,
        '确认选择',
        {
          confirmButtonText: '确认选择',
          cancelButtonText: '取消',
          type: 'info'
        }
      )
      try {
        await publishRoute({
          routeId: route.id,
          publisher: '系统默认',
        })
      } catch (_e) {
        try {
          await selectRoute(route.id)
        } catch (_e2) { /* ignore */ }
      }
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
  } else {
    currentRoute.value = route
    publisherName.value = ''
    manualConfirmReason.value = ''
    forcePublishDialogVisible.value = true
  }
}

async function confirmForcePublish() {
  if (!publisherName.value.trim()) {
    ElMessage.warning('请输入发布人姓名')
    return
  }
  if (!manualConfirmReason.value.trim()) {
    ElMessage.warning('请填写人工确认原因')
    return
  }
  if (!currentRoute.value) return

  publishing.value = true
  try {
    await publishRoute({
      routeId: currentRoute.value.id,
      manualConfirmReason: manualConfirmReason.value,
      publisher: publisherName.value,
    })
    routeVersions.value.forEach((r) => { r.isSelected = false })
    const target = routeVersions.value.find((r) => r.id === currentRoute.value!.id)
    if (target) {
      target.isSelected = true
      target.isForcedPublish = true
      target.manualConfirmReason = manualConfirmReason.value
      target.publisher = publisherName.value
    }
    selectedRouteId.value = currentRoute.value.id
    forcePublishDialogVisible.value = false
    ElMessage.success(`已强制发布「${currentRoute.value.versionName}」作为最终路线`)
    await fetchRoutes()
  } catch (e: any) {
    ElMessage.error(e?.response?.data?.message || '发布失败，请重试')
    console.error(e)
  } finally {
    publishing.value = false
  }
}

onMounted(async () => {
  await fetchPlans()
  await fetchThreshold()
})
</script>
