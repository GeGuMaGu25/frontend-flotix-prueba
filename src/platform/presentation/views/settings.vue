<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'
import { RoleLabels, UserRole } from '@/identity-access/domain/model/value-objects/user-role.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'
import { useCommerceStore } from '@/iot-commerce/presentation/stores/commerce.store.js'
import { usePreferencesStore } from '../stores/preferences.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import ToggleSwitch from '@/shared/presentation/components/toggle-switch.component.vue'
import StatusBadge from '@/shared/presentation/components/status-badge.component.vue'
import EmptyState from '@/shared/presentation/components/empty-state.component.vue'
import StatCard from '@/shared/presentation/components/stat-card.component.vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Avatar from 'primevue/avatar'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const router = useRouter()
const session = useSessionStore()
const fleet = useFleetStore()
const commerce = useCommerceStore()
const preferences = usePreferencesStore()

const user = session.user
const isOwner = user?.role === UserRole.OWNER

const tabs = computed(() => (isOwner ? ['Mi cuenta', 'Flota', 'Notificaciones', 'Facturación'] : ['Mi cuenta', 'Notificaciones']))
const activeTab = ref('Mi cuenta')

// --- Mi cuenta ---
const accountForm = ref({ name: user?.name ?? '', email: user?.email ?? '', companyName: user?.companyName ?? '', workshopName: user?.workshopName ?? '' })
const accountSaved = ref(false)
async function saveAccount() {
  await session.updateProfile({ ...accountForm.value })
  accountSaved.value = true
  setTimeout(() => (accountSaved.value = false), 3000)
}
function logout() {
  session.logout()
  router.push('/login')
}

// --- Flota (Owner only) ---
const fleetForm = ref({ ...preferences.fleet })
const fleetSaved = ref(false)
function saveFleetPrefs() {
  preferences.saveFleet({
    speedLimitKmh: Number(fleetForm.value.speedLimitKmh),
    maintenanceIntervalKm: Number(fleetForm.value.maintenanceIntervalKm),
    fuelAnomalyDropPct: Number(fleetForm.value.fuelAnomalyDropPct)
  })
  fleetSaved.value = true
  setTimeout(() => (fleetSaved.value = false), 3000)
}

// --- Notificaciones ---
const notifForm = ref(preferences.notificationsFor(user?.id))
const notifSaved = ref(false)
function saveNotifPrefs() {
  preferences.saveNotificationsFor(user.id, { ...notifForm.value })
  notifSaved.value = true
  setTimeout(() => (notifSaved.value = false), 3000)
}

// --- Facturación (Owner only) ---
const totalSpent = computed(() => commerce.orders.reduce((a, o) => a + o.totalAmount, 0))
</script>

<template>
  <PageHeader context-label="Platform" title="Configuración" subtitle="Gestiona tu cuenta, flota y preferencias" />

  <div class="flex gap-5 mb-4" style="border-bottom: 1px solid var(--p-surface-100)">
    <button
      v-for="tab in tabs"
      :key="tab"
      type="button"
      class="flotix-tab-btn"
      :class="activeTab === tab ? 'flotix-tab-btn-active' : ''"
      @click="activeTab = tab"
    >
      {{ tab }}
    </button>
  </div>

  <!-- Mi cuenta -->
  <div v-if="activeTab === 'Mi cuenta'" class="grid">
    <div class="col-12 lg:col-8">
      <div class="flex flex-column gap-3">
        <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
          <h2 class="text-sm font-bold text-heading m-0 mb-3">Información personal</h2>
          <div class="grid">
            <div class="col-12 sm:col-6 flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">Nombre completo</label>
              <InputText v-model="accountForm.name" fluid />
            </div>
            <div class="col-12 sm:col-6 flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">Correo electrónico</label>
              <InputText v-model="accountForm.email" fluid />
            </div>
          </div>
        </div>

        <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
          <h2 class="text-sm font-bold text-heading m-0 mb-3">Información de empresa</h2>
          <div class="grid">
            <div class="col-12 sm:col-6 flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">Nombre de la empresa</label>
              <InputText v-model="accountForm.companyName" fluid />
            </div>
            <div class="col-12 sm:col-6 flex flex-column gap-1">
              <label class="text-sm font-medium text-heading">Nombre del taller</label>
              <InputText v-model="accountForm.workshopName" fluid />
            </div>
          </div>
        </div>

        <div class="flex align-items-center justify-content-end gap-3">
          <p v-if="accountSaved" class="text-sm font-medium m-0" style="color: #059669">✅ Cambios guardados</p>
          <AppButton @click="saveAccount">Guardar cambios</AppButton>
        </div>
      </div>
    </div>

    <div class="col-12 lg:col-4">
      <div class="flex flex-column gap-3">
        <div class="rounded-2xl border-subtle shadow-card p-3 text-center" style="background: var(--p-surface-0)">
          <Avatar :label="user?.name?.charAt(0)" shape="circle" size="xlarge" style="background: var(--p-primary-100); color: var(--p-primary-700); font-weight: 700" />
          <p class="font-bold text-heading mt-3 mb-0">{{ user?.name }}</p>
          <p class="text-xs text-faint m-0">{{ user?.email }}</p>
          <span class="inline-block border-round-full px-2 py-1 text-xs font-semibold mt-2" style="background: var(--p-primary-50); color: var(--p-primary-700)">{{ RoleLabels[user?.role] }}</span>
        </div>

        <div class="border-round-2xl p-3" style="border: 1px solid #fecaca; background: #fef2f2">
          <h2 class="text-sm font-bold m-0 mb-1" style="color: #b91c1c">Zona peligrosa</h2>
          <AppButton variant="danger" class="w-full justify-content-center mt-2" @click="logout">Cerrar sesión</AppButton>
        </div>
      </div>
    </div>
  </div>

  <!-- Flota -->
  <div v-else-if="activeTab === 'Flota'" class="grid">
    <div class="col-12 lg:col-8">
      <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
        <h2 class="text-sm font-bold text-heading m-0">Umbrales de alertas automáticas</h2>
        <p class="text-xs text-faint mt-1 mb-3">Estos valores alimentan directamente las reglas de Alertas y Combustible del sistema.</p>
        <div class="grid">
          <div class="col-12 sm:col-4 flex flex-column gap-1">
            <label class="text-sm font-medium text-heading">Límite de velocidad (km/h)</label>
            <InputNumber v-model="fleetForm.speedLimitKmh" :min="1" fluid />
          </div>
          <div class="col-12 sm:col-4 flex flex-column gap-1">
            <label class="text-sm font-medium text-heading">Intervalo de mantenimiento (km)</label>
            <InputNumber v-model="fleetForm.maintenanceIntervalKm" :min="500" :step="500" fluid />
          </div>
          <div class="col-12 sm:col-4 flex flex-column gap-1">
            <label class="text-sm font-medium text-heading">Sensibilidad de anomalía (%)</label>
            <InputNumber v-model="fleetForm.fuelAnomalyDropPct" :min="5" :max="90" fluid />
          </div>
        </div>
        <p class="text-xs text-faint mt-3 mb-0">
          Una carga se marca como <strong>anómala</strong> cuando su rendimiento cae más de {{ fleetForm.fuelAnomalyDropPct }}% por debajo
          del promedio histórico del vehículo. Se genera una alerta de mantenimiento al llegar al 90% del intervalo configurado,
          y de exceso de velocidad al superar el límite configurado.
        </p>
        <div class="flex align-items-center justify-content-end gap-3 pt-3 mt-3" style="border-top: 1px solid var(--p-surface-100)">
          <p v-if="fleetSaved" class="text-sm font-medium m-0" style="color: #059669">✅ Preferencias guardadas</p>
          <AppButton @click="saveFleetPrefs">Guardar cambios</AppButton>
        </div>
      </div>
    </div>

    <div class="col-12 lg:col-4">
      <div class="flex flex-column gap-3">
        <StatCard label="Vehículos en flota" :value="fleet.vehicles.length" icon="truck" />
        <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
          <h2 class="text-sm font-bold text-heading m-0">¿Necesitas ajustar tu flota?</h2>
          <p class="text-xs text-faint mt-1 mb-3">Registra, edita o retira vehículos desde el módulo de flota.</p>
          <AppButton variant="ghost" class="w-full justify-content-center" @click="router.push('/fleet-management')">Ir a Vehículos</AppButton>
        </div>
      </div>
    </div>
  </div>

  <!-- Notificaciones -->
  <div v-else-if="activeTab === 'Notificaciones'" style="max-width: 40rem">
    <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
      <h2 class="text-sm font-bold text-heading m-0">Tipos de notificación</h2>
      <p class="text-xs text-faint mt-1 mb-3">Elige qué eventos generan una notificación para tu cuenta (visible desde la campana del encabezado).</p>

      <div class="flex flex-column">
        <div class="flex align-items-center justify-content-between py-3" style="border-bottom: 1px solid var(--p-surface-100)">
          <div>
            <p class="text-sm font-semibold text-heading m-0">Mantenimiento próximo</p>
            <p class="text-xs text-faint m-0">Cuando un vehículo alcanza el umbral de kilometraje configurado.</p>
          </div>
          <ToggleSwitch v-model="notifForm.maintenance" />
        </div>
        <div class="flex align-items-center justify-content-between py-3" style="border-bottom: 1px solid var(--p-surface-100)">
          <div>
            <p class="text-sm font-semibold text-heading m-0">Exceso de velocidad</p>
            <p class="text-xs text-faint m-0">Cuando la telemetría GPS reporta una velocidad por encima del límite.</p>
          </div>
          <ToggleSwitch v-model="notifForm.speed" />
        </div>
        <div class="flex align-items-center justify-content-between py-3">
          <div>
            <p class="text-sm font-semibold text-heading m-0">Incidencias reportadas</p>
            <p class="text-xs text-faint m-0">Cuando un conductor reporta una falla o anomalía en ruta.</p>
          </div>
          <ToggleSwitch v-model="notifForm.incidents" />
        </div>
      </div>

      <div class="flex align-items-center justify-content-end gap-3 pt-3 mt-3" style="border-top: 1px solid var(--p-surface-100)">
        <p v-if="notifSaved" class="text-sm font-medium m-0" style="color: #059669">✅ Preferencias guardadas</p>
        <AppButton @click="saveNotifPrefs">Guardar cambios</AppButton>
      </div>
    </div>
  </div>

  <!-- Facturación -->
  <div v-else-if="activeTab === 'Facturación'">
    <div class="grid mb-3">
      <div class="col-6 sm:col-4"><StatCard label="Gasto total en hardware IoT" :value="`S/ ${totalSpent.toFixed(2)}`" icon="cash" /></div>
      <div class="col-6 sm:col-4"><StatCard label="Pedidos realizados" :value="commerce.orders.length" icon="cart" /></div>
      <div class="col-6 sm:col-4"><StatCard label="Plan actual" value="Growth" icon="shield" tone="primary" /></div>
    </div>

    <div class="grid">
      <div class="col-12 lg:col-8">
        <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
          <h2 class="text-sm font-bold text-heading m-0 mb-3">Historial de facturación</h2>
          <EmptyState v-if="!commerce.orders.length" icon="cart" message="Aún no tienes compras registradas." />
          <DataTable v-else :value="commerce.orders" data-key="id" striped-rows>
            <Column field="orderDate" header="Fecha" />
            <Column header="Concepto">
              <template #body="{ data }">{{ data.deviceQuantity }}× dispositivo IoT ({{ data.sku }})</template>
            </Column>
            <Column header="Monto">
              <template #body="{ data }">S/ {{ data.totalAmount.toFixed(2) }}</template>
            </Column>
            <Column header="Estado">
              <template #body="{ data }"><StatusBadge :status="data.status" /></template>
            </Column>
          </DataTable>
        </div>
      </div>

      <div class="col-12 lg:col-4">
        <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
          <h2 class="text-sm font-bold text-heading m-0 mb-3">Método de pago</h2>
          <div class="flex align-items-center gap-3 border-round-xl p-3" style="background: var(--p-surface-50)">
            <span class="flex align-items-center justify-content-center border-round" style="width: 3rem; height: 2.25rem; background: var(--flotix-navy-900); color: #fff; font-size: 10px; font-weight: 700">VISA</span>
            <div>
              <p class="text-sm font-semibold text-heading m-0">Terminada en 4417</p>
              <p class="text-xs text-faint m-0">Expira 08/28</p>
            </div>
          </div>
          <AppButton variant="ghost" class="w-full justify-content-center mt-3" @click="router.push('/commerce')">Ir a la tienda IoT</AppButton>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.flotix-tab-btn {
  background: none; border: none; border-bottom: 2px solid transparent;
  padding: 0 0 .75rem 0; margin-bottom: -1px; font-size: .875rem; font-weight: 500;
  color: var(--p-surface-400); cursor: pointer;
}
.flotix-tab-btn-active { border-bottom-color: var(--p-primary-color); color: var(--p-primary-color); }
</style>
