<script setup>
import { computed, ref, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { toggleLocale, i18n } from '@/internationalization/i18n.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'
import { UserRole, RoleLabels } from '@/identity-access/domain/model/value-objects/user-role.js'
import { useAlertsStore } from '@/alerts/presentation/stores/alerts.store.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'
import { useMaintenanceStore } from '@/maintenance/presentation/stores/maintenance.store.js'
import { useFuelStore } from '@/fuel-control/presentation/stores/fuel.store.js'
import { useIncidentsStore } from '@/incidents/presentation/stores/incidents.store.js'
import { useTrackingStore } from '@/tracking/presentation/stores/tracking.store.js'
import { useCommerceStore } from '@/iot-commerce/presentation/stores/commerce.store.js'
import { useAnalyticsStore } from '@/analytics/presentation/stores/analytics.store.js'
import { MaintenanceStatus } from '@/maintenance/domain/model/value-objects/maintenance-status.js'
import { VehicleStatus } from '@/fleet-management/domain/model/value-objects/vehicle-status.js'
import AppIcon from '@/shared/presentation/components/app-icon.component.vue'
import Avatar from 'primevue/avatar'
import Button from 'primevue/button'
import Popover from 'primevue/popover'
import Drawer from 'primevue/drawer'
import flotixLogoMark from '@/assets/brand/flotix-logo-mark.png'

const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()
const session = useSessionStore()
const alerts = useAlertsStore()
const fleet = useFleetStore()
const maintenance = useMaintenanceStore()
const fuel = useFuelStore()
const incidents = useIncidentsStore()
const tracking = useTrackingStore()
const commerce = useCommerceStore()
const analytics = useAnalyticsStore()

const user = computed(() => session.user)

// Pages read the stores synchronously, so they render once the Flotix API data is loaded.
const loaded = ref(false)
const loadError = ref('')
onMounted(async () => {
  try {
    await Promise.all([session.refresh(), fleet.refresh(), maintenance.refresh(), fuel.refresh(), incidents.refresh(), tracking.refresh(), alerts.refresh()])
    if (user.value?.role === UserRole.OWNER) await Promise.all([commerce.refresh(), analytics.refresh()])
    loaded.value = true
  } catch (e) {
    loadError.value = e.message
  }
})
const mobileOpen = ref(false)
const notifPanel = ref(null)

const myNotifications = computed(() =>
  alerts.notifications.filter((n) => n.userId === user.value?.id).slice().sort((a, b) => new Date(b.sentAt) - new Date(a.sentAt))
)
const unreadCount = computed(() => myNotifications.value.filter((n) => !n.isRead).length)

const NAV_ITEMS = [
  { to: '/dashboard', icon: 'grid', key: 'dashboard', roles: [UserRole.OWNER, UserRole.DRIVER, UserRole.MECHANIC] },
  { to: '/fleet-management', icon: 'truck', key: 'fleet', roles: [UserRole.OWNER] },
  { to: '/drivers', icon: 'users', key: 'drivers', roles: [UserRole.OWNER] },
  { to: '/fuel', icon: 'fuel', key: 'fuel', roles: [UserRole.OWNER, UserRole.DRIVER] },
  { to: '/maintenance', icon: 'wrench', key: 'maintenance', roles: [UserRole.OWNER, UserRole.MECHANIC] },
  { to: '/incidents', icon: 'alert', key: 'incidents', roles: [UserRole.OWNER, UserRole.DRIVER] },
  { to: '/tracking', icon: 'pin', key: 'tracking', roles: [UserRole.OWNER] },
  { to: '/workshops', icon: 'building', key: 'workshops', roles: [UserRole.OWNER] },
  { to: '/reports', icon: 'chart', key: 'reports', roles: [UserRole.OWNER] },
  { to: '/commerce', icon: 'chip', key: 'commerce', roles: [UserRole.OWNER] },
  { to: '/settings', icon: 'gear', key: 'settings', roles: [UserRole.OWNER, UserRole.DRIVER, UserRole.MECHANIC] }
]

const nav = computed(() => {
  const role = user.value?.role ?? UserRole.OWNER
  return NAV_ITEMS.filter((item) => item.roles.includes(role)).map((item) => ({
    ...item,
    label: t(`nav.${item.key}.label`),
    context: t(`nav.${item.key}.context`)
  }))
})

const sidebarSummary = computed(() => {
  const role = user.value?.role
  if (role === UserRole.DRIVER) {
    const mine = fleet.vehicles.find((v) => v.driverId === user.value.id)
    return { label: t('header.sidebarSummaryDriver'), value: mine?.plate ?? t('header.unassigned'), icon: 'truck' }
  }
  if (role === UserRole.MECHANIC) {
    const pending = maintenance.requests.filter((r) => r.mechanicId === user.value.id && r.status === MaintenanceStatus.PENDING)
    return { label: t('header.sidebarSummaryMechanic'), value: String(pending.length), icon: 'wrench' }
  }
  const available = fleet.vehicles.filter((v) => v.status === VehicleStatus.AVAILABLE).length
  return { label: t('header.sidebarSummaryOwner'), value: `${available}/${fleet.vehicles.length}`, icon: 'truck' }
})

function initials(name) {
  return name?.split(' ').map((w) => w[0]).slice(0, 2).join('') ?? '?'
}

function toggleNotif(event) {
  notifPanel.value.toggle(event)
}
function readNotif(n) {
  if (!n.isRead) alerts.markNotificationAsRead(n.id)
}
function readAll() {
  alerts.markAllAsRead(user.value?.id)
}

function logout() {
  session.logout()
  router.push('/login')
}
</script>

<template>
  <div class="flex min-h-screen" style="background: var(--p-surface-50, #f8fafc)">
    <!-- Sidebar (persistent on desktop, off-canvas on mobile) -->
    <aside
      class="fixed left-0 flex flex-column bg-navy-gradient flotix-sidebar"
      :class="mobileOpen ? 'flotix-sidebar-open' : ''"
    >
      <div class="flex flex-column gap-1 px-3 py-4">
        <img :src="flotixLogoMark" alt="Flotix" style="height: 28px; width: auto; max-width: 11rem; object-fit: contain; object-position: left" />
        <p class="text-xs font-medium m-0" style="color: rgba(255,255,255,.4); letter-spacing: .08em; text-transform: uppercase">{{ t('header.tagline') }}</p>
      </div>

      <div class="flex flex-column flex-1 overflow-y-auto">
        <nav class="flex flex-column gap-1 px-2">
          <router-link
            v-for="item in nav"
            :key="item.to"
            :to="item.to"
            class="flotix-nav-link"
            :class="route.path.startsWith(item.to) ? 'flotix-nav-link-active' : ''"
            @click="mobileOpen = false"
          >
            <AppIcon :name="item.icon" :size="18" />
            <span>{{ item.label }}</span>
          </router-link>
        </nav>

        <div class="mx-2 mt-3 border-round-xl p-3" style="background: rgba(255,255,255,.06); border: 1px solid rgba(255,255,255,.1)">
          <p class="text-xs font-semibold m-0" style="color: rgba(255,255,255,.4); text-transform: uppercase; letter-spacing: .06em">{{ sidebarSummary.label }}</p>
          <div class="flex align-items-center gap-2 mt-2">
            <span class="flex align-items-center justify-content-center border-round" style="width: 1.75rem; height: 1.75rem; background: rgba(255,255,255,.1); color: #fff">
              <AppIcon :name="sidebarSummary.icon" :size="14" />
            </span>
            <p class="text-sm font-bold m-0" style="color: #fff">{{ sidebarSummary.value }}</p>
          </div>
        </div>
      </div>

      <div class="p-2" style="border-top: 1px solid rgba(255,255,255,.1)">
        <div class="flex align-items-center gap-2 border-round p-2">
          <Avatar :label="initials(user?.name)" shape="circle" style="background: var(--p-primary-400); color: #fff; font-size: .7rem; font-weight: 700" />
          <div class="min-w-0" style="line-height: 1.2">
            <p class="text-sm font-semibold m-0 white-space-nowrap overflow-hidden text-overflow-ellipsis" style="color: #fff; max-width: 10rem">{{ user?.name }}</p>
            <p class="text-xs m-0 white-space-nowrap overflow-hidden text-overflow-ellipsis" style="color: rgba(255,255,255,.4); max-width: 10rem">
              {{ user?.companyName || user?.workshopName || RoleLabels[user?.role] }}
            </p>
          </div>
        </div>
      </div>
    </aside>

    <div v-if="mobileOpen" class="fixed top-0 left-0 w-full h-full" style="background: rgba(15,23,42,.4); z-index: 30" @click="mobileOpen = false" />

    <!-- Main column -->
    <div class="flex flex-column flex-1 min-h-screen flotix-main">
      <header class="sticky top-0 flex align-items-center justify-content-between px-3 py-2 border-subtle" style="z-index: 20; background: rgba(255,255,255,.92); backdrop-filter: blur(6px)">
        <div class="flex align-items-center gap-2">
          <Button icon="pi pi-bars" text rounded class="flotix-mobile-toggle" @click="mobileOpen = true" />
          <div class="text-sm text-muted flotix-context-label">
            {{ nav.find(n => route.path.startsWith(n.to))?.context || 'Flotix Platform' }}
          </div>
        </div>
        <div class="flex align-items-center gap-2">
          <button
            type="button"
            class="flotix-lang-toggle"
            :aria-label="'Language: ' + (locale === 'en' ? 'English' : 'Español')"
            @click="toggleLocale()"
          >
            <span :class="{ active: locale === 'en' }">EN</span>
            <span :class="{ active: locale === 'es' }">ES</span>
          </button>

          <Button text rounded severity="secondary" @click="toggleNotif">
            <template #icon>
              <span class="relative">
                <AppIcon name="bell" :size="19" />
                <span v-if="unreadCount" class="flotix-notif-dot" />
              </span>
            </template>
          </Button>
          <Popover ref="notifPanel" style="width: 22rem">
            <div class="flex align-items-center justify-content-between mb-2">
              <p class="text-sm font-bold m-0 text-heading">Notificaciones</p>
              <button v-if="unreadCount" type="button" class="flotix-link text-xs" @click="readAll">Marcar todas como leídas</button>
            </div>
            <div style="max-height: 20rem; overflow-y: auto">
              <p v-if="!myNotifications.length" class="text-sm text-muted text-center py-4 m-0">No tienes notificaciones.</p>
              <button
                v-for="n in myNotifications.slice(0, 8)"
                :key="n.id"
                type="button"
                class="flotix-notif-item"
                @click="readNotif(n)"
              >
                <span class="flotix-notif-bullet" :style="{ background: n.isRead ? 'transparent' : 'var(--p-primary-color)' }" />
                <span class="min-w-0 flex-1 text-left">
                  <span class="block text-xs" :style="{ color: n.isRead ? 'var(--p-surface-500)' : 'var(--p-surface-800)', fontWeight: n.isRead ? 400 : 600 }">{{ n.message }}</span>
                  <span class="block text-xs text-faint mt-1">{{ new Date(n.sentAt).toLocaleString('es-PE') }}</span>
                </span>
              </button>
            </div>
            <router-link to="/alerts" class="flotix-link text-xs block text-center pt-2 mt-2" style="border-top: 1px solid var(--p-surface-200)" @click="notifPanel.hide()">
              Ver todas las alertas →
            </router-link>
          </Popover>

          <div class="text-right flotix-user-summary" style="line-height: 1.2">
            <p class="text-sm font-semibold m-0 text-heading">{{ user?.name }}</p>
            <p class="text-xs m-0 text-faint">{{ user?.companyName || user?.workshopName || RoleLabels[user?.role] }}</p>
          </div>
          <Avatar :label="user?.name?.charAt(0) ?? '?'" shape="circle" style="background: var(--p-primary-100); color: var(--p-primary-700); font-weight: 700" />
          <Button text severity="secondary" class="flotix-logout-btn" @click="logout">{{ t('header.logout') }}</Button>
        </div>
      </header>

      <main class="flex-1 p-3">
        <router-view v-if="loaded" />
        <p v-else-if="loadError" class="text-sm text-red-500 m-0">No se pudo conectar con la API de Flotix: {{ loadError }}</p>
        <p v-else class="text-sm text-faint m-0">{{ t('common.loading') }}</p>
      </main>
    </div>
  </div>
</template>

<style scoped>
.flotix-sidebar {
  top: 0;
  bottom: 0;
  width: 16rem;
  z-index: 40;
  transform: translateX(-100%);
  transition: transform .2s ease;
}
.flotix-sidebar-open { transform: translateX(0); }
.flotix-main { margin-left: 0; }

.flotix-nav-link {
  display: flex;
  align-items: center;
  gap: .75rem;
  padding: .6rem .75rem;
  border-radius: 10px;
  font-size: .875rem;
  font-weight: 500;
  color: rgba(255, 255, 255, .6);
  text-decoration: none;
  transition: background-color .15s ease, color .15s ease;
}
.flotix-nav-link:hover { background: rgba(255, 255, 255, .06); color: #fff; }
.flotix-nav-link-active { background: var(--p-primary-color); color: #fff; }

.flotix-notif-dot {
  position: absolute; top: -1px; right: -2px;
  width: 8px; height: 8px; border-radius: 999px;
  background: #ef4444; box-shadow: 0 0 0 2px #fff;
}
.flotix-notif-item {
  display: flex; align-items: flex-start; gap: .6rem; width: 100%;
  padding: .6rem 0; background: none; border: 0; border-bottom: 1px solid var(--p-surface-100);
  cursor: pointer;
}
.flotix-notif-item:last-child { border-bottom: 0; }
.flotix-notif-item:hover { background: var(--p-surface-50); }
.flotix-notif-bullet { margin-top: .3rem; width: 6px; height: 6px; border-radius: 999px; flex-shrink: 0; }

.flotix-lang-toggle {
  display: none;
  align-items: center;
  gap: .15rem;
  border: 1px solid var(--p-surface-200);
  border-radius: 999px;
  padding: 2px;
  background: none;
  cursor: pointer;
}
.flotix-lang-toggle span { padding: .15rem .5rem; border-radius: 999px; font-size: .7rem; font-weight: 700; color: var(--p-surface-900); }
.flotix-lang-toggle span.active { background: var(--p-surface-900); color: #fff; }

.flotix-mobile-toggle { display: inline-flex; }
.flotix-context-label, .flotix-user-summary, .flotix-logout-btn { display: none; }

@media screen and (min-width: 992px) {
  .flotix-sidebar { transform: none; }
  .flotix-main { margin-left: 16rem; }
  .flotix-mobile-toggle { display: none; }
  .flotix-context-label { display: block; }
  .flotix-user-summary, .flotix-logout-btn { display: block; }
  .flotix-lang-toggle { display: flex; }
}
</style>
