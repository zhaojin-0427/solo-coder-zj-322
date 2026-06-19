<template>
  <el-container class="layout-container">
    <el-aside width="240px" class="layout-aside">
      <div class="logo-area">
        <el-icon :size="36" color="#E8855A"><Sunny /></el-icon>
        <h1 class="logo-title">长者出行规划</h1>
      </div>
      <el-menu
        :default-active="activeMenu"
        router
        class="side-menu"
        background-color="transparent"
        text-color="#5A4A42"
        active-text-color="#E8855A"
      >
        <el-menu-item index="/plans">
          <el-icon><Calendar /></el-icon>
          <span>出行计划</span>
        </el-menu-item>
        <el-menu-item index="/preferences">
          <el-icon><User /></el-icon>
          <span>节奏偏好</span>
        </el-menu-item>
        <el-menu-item index="/routes">
          <el-icon><Guide /></el-icon>
          <span>路线协商</span>
        </el-menu-item>
        <el-menu-item index="/changes">
          <el-icon><Refresh /></el-icon>
          <span>途中变更</span>
        </el-menu-item>
        <el-menu-item index="/care-tasks">
          <el-icon><FirstAidKit /></el-icon>
          <span>照护分工</span>
        </el-menu-item>
        <el-menu-item index="/statistics">
          <el-icon><DataAnalysis /></el-icon>
          <span>数据统计</span>
        </el-menu-item>
      </el-menu>
    </el-aside>
    <el-container>
      <el-header class="layout-header">
        <div class="header-title">{{ currentPageTitle }}</div>
        <div class="header-user">
          <el-avatar :size="40" style="background-color: #E8855A">
            <el-icon><User /></el-icon>
          </el-avatar>
          <span class="user-name">管理员</span>
        </div>
      </el-header>
      <el-main class="layout-main">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import {
  Sunny,
  Calendar,
  User,
  Guide,
  Refresh,
  DataAnalysis,
  FirstAidKit
} from '@element-plus/icons-vue'

const route = useRoute()

const activeMenu = computed(() => route.path)

const titleMap: Record<string, string> = {
  '/plans': '出行计划管理',
  '/preferences': '长辈节奏偏好登记',
  '/routes': '路线协商与推荐',
  '/changes': '途中变更记录',
  '/care-tasks': '照护分工与物品确认',
  '/statistics': '数据统计分析'
}

const currentPageTitle = computed(() => titleMap[route.path] || '长者出行规划系统')
</script>

<style scoped>
.layout-container {
  height: 100vh;
  background-color: #FBF5EF;
}

.layout-aside {
  background: linear-gradient(180deg, #FFF8F2 0%, #FDEEE3 100%);
  border-right: 1px solid #F0D9C7;
  display: flex;
  flex-direction: column;
}

.logo-area {
  padding: 28px 24px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #F0D9C7;
}

.logo-title {
  font-size: 22px;
  font-weight: 700;
  color: #5A4A42;
  margin: 0;
}

.side-menu {
  flex: 1;
  border-right: none !important;
  padding: 16px 12px;
}

.side-menu .el-menu-item {
  height: 56px !important;
  line-height: 56px !important;
  font-size: 17px !important;
  border-radius: 12px;
  margin-bottom: 8px;
}

.side-menu .el-menu-item:hover {
  background-color: #FDE4D2 !important;
}

.side-menu .el-menu-item.is-active {
  background-color: #FDD7BF !important;
  font-weight: 600;
}

.side-menu .el-menu-item .el-icon {
  font-size: 20px !important;
}

.layout-header {
  background-color: #FFFFFF;
  border-bottom: 1px solid #F0D9C7;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32px;
  box-shadow: 0 2px 8px rgba(232, 133, 90, 0.06);
}

.header-title {
  font-size: 22px;
  font-weight: 700;
  color: #5A4A42;
}

.header-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-name {
  font-size: 16px;
  color: #5A4A42;
  font-weight: 500;
}

.layout-main {
  padding: 28px;
  overflow-y: auto;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
