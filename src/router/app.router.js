import { createRouter, createWebHistory } from 'vue-router'
import { Session } from '@/shared/infrastructure/session.js'

const MainLayout = () => import('@/platform/presentation/layouts/app-layout.vue')

const routes = [
  { path: '/', redirect: '/dashboard' },
  { path: '/login', name: 'login', component: () => import('@/identity-access/presentation/views/login.vue'), meta: { public: true } },
  { path: '/register', name: 'register', component: () => import('@/identity-access/presentation/views/register.vue'), meta: { public: true } },
  {
    path: '/',
    component: MainLayout,
    children: [
      { path: 'dashboard', name: 'dashboard', component: () => import('@/platform/presentation/views/role-dashboard.vue') },
      { path: 'fleet-management', name: 'fleet', component: () => import('@/fleet-management/presentation/views/fleet-list.vue') },
      { path: 'fleet-management/new', name: 'fleet-management-new', component: () => import('@/fleet-management/presentation/views/vehicle-registration-form.vue') },
      { path: 'fleet-management/:id/edit', name: 'fleet-management-edit', component: () => import('@/fleet-management/presentation/views/vehicle-registration-form.vue') },
      { path: 'drivers', name: 'drivers', component: () => import('@/fleet-management/presentation/views/drivers-list.vue') },
      { path: 'fuel', name: 'fuel', component: () => import('@/fuel-control/presentation/views/fuel-list.vue') },
      { path: 'fuel/new', name: 'fuel-new', component: () => import('@/fuel-control/presentation/views/fuel-form.vue') },
      { path: 'maintenance', name: 'maintenance', component: () => import('@/maintenance/presentation/views/maintenance-list.view.vue') },
      { path: 'maintenance/new', name: 'maintenance-new', component: () => import('@/maintenance/presentation/views/maintenance-request-form.view.vue') },
      { path: 'maintenance/:id/quote', name: 'maintenance-quote', component: () => import('@/maintenance/presentation/views/maintenance-quote-form.view.vue') },
      { path: 'workshops', name: 'workshops', component: () => import('@/maintenance/presentation/views/workshops-list.view.vue') },
      { path: 'workshops/:id/request', name: 'workshops-request', component: () => import('@/maintenance/presentation/views/workshop-request-form.view.vue') },
      { path: 'incidents', name: 'incidents', component: () => import('@/incidents/presentation/views/incident-list.vue') },
      { path: 'incidents/new', name: 'incidents-new', component: () => import('@/incidents/presentation/views/incident-report-form.vue') },
      { path: 'tracking', name: 'tracking', component: () => import('@/tracking/presentation/views/tracking-dashboard.vue') },
      { path: 'alerts', name: 'alerts', component: () => import('@/alerts/presentation/views/alerts-list.view.vue') },
      { path: 'commerce', name: 'commerce', component: () => import('@/iot-commerce/presentation/views/commerce-store.view.vue') },
      { path: 'reports', name: 'reports', component: () => import('@/analytics/presentation/views/analytics-dashboard.view.vue') },
      { path: 'settings', name: 'settings', component: () => import('@/platform/presentation/views/settings.vue') }
    ]
  },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('@/platform/presentation/views/not-found.vue') }
]

const app_router = createRouter({
  history: createWebHistory(),
  routes
})

// Route guard: Identity, Profiles & Security — AuthenticateUser gate.
app_router.beforeEach((to) => {
  const authenticated = Session.isAuthenticated()
  if (!to.meta.public && !authenticated) return '/login'
  if (to.meta.public && authenticated) return '/dashboard'
  return true
})

export default app_router
