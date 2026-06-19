import { createRouter, createWebHistory, type RouteRecordRaw } from 'vue-router'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    redirect: '/plans'
  },
  {
    path: '/plans',
    name: 'Plans',
    component: () => import('@/views/PlansView.vue'),
    meta: { title: '出行计划' }
  },
  {
    path: '/preferences',
    name: 'Preferences',
    component: () => import('@/views/PreferencesView.vue'),
    meta: { title: '节奏偏好' }
  },
  {
    path: '/routes',
    name: 'Routes',
    component: () => import('@/views/RoutesView.vue'),
    meta: { title: '路线协商' }
  },
  {
    path: '/changes',
    name: 'Changes',
    component: () => import('@/views/ChangesView.vue'),
    meta: { title: '途中变更' }
  },
  {
    path: '/care-tasks',
    name: 'CareTasks',
    component: () => import('@/views/CareTasksView.vue'),
    meta: { title: '照护分工' }
  },
  {
    path: '/health-reminders',
    name: 'HealthReminders',
    component: () => import('@/views/HealthRemindersView.vue'),
    meta: { title: '出行前提醒' }
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/StatisticsView.vue'),
    meta: { title: '数据统计' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/plans'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, _from, next) => {
  if (to.meta.title) {
    document.title = `${to.meta.title} - 长者出行规划系统`
  }
  next()
})

export default router
