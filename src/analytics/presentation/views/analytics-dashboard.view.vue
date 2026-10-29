<script setup>
import { computed } from 'vue'
import { useAnalyticsStore } from '../stores/analytics.store.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import StatCard from '@/shared/presentation/components/stat-card.component.vue'
import EmptyState from '@/shared/presentation/components/empty-state.component.vue'

const session = useSessionStore()
const analytics = useAnalyticsStore()
const summary = analytics.summary
const performance = analytics.performance

const maxCost = computed(() => Math.max(1, ...performance.map((p) => p.totalCost)))

async function exportReport() {
  // The API stores the report as a fuel consumption report for the last 12 months.
  const to = new Date()
  const from = new Date(to.getFullYear() - 1, to.getMonth(), to.getDate())
  const report = await analytics.exportReportToPdf(session.user?.id, 'Reporte de consumo de combustible', { from, to })

  const lines = [
    'FLOTIX — Reporte de Rendimiento de Flota (exportación simulada)',
    `Generado: ${new Date(report.generatedAt).toLocaleString('es-PE')}`,
    '',
    `Vehículos en flota: ${summary.totalVehicles}`,
    `Gasto total en combustible: S/ ${summary.totalFuelCost.toFixed(2)}`,
    `Gasto total en mantenimiento: S/ ${summary.totalMaintenanceCost.toFixed(2)}`,
    `Mantenimientos completados: ${summary.completedMaintenance}`,
    '',
    'Detalle por vehículo (mín. 2 registros de combustible):',
    ...performance.map((p) => `  - ${p.plate}: S/ ${p.totalCost.toFixed(2)} · ${p.avgEfficiency ?? '—'} km/L`)
  ]
  const blob = new Blob([lines.join('\n')], { type: 'text/plain' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `flotix-reporte-${report.id.slice(0, 8)}.txt`
  a.click()
  URL.revokeObjectURL(url)
}
</script>

<template>
  <PageHeader
    context-label="Reporting & Analytics"
    title="Reportes y analítica"
    subtitle="Consolidación de datos operativos e históricos para la toma de decisiones gerenciales."
  >
    <template #actions>
      <AppButton @click="exportReport">⬇ Exportar reporte</AppButton>
    </template>
  </PageHeader>

  <div class="grid mb-3">
    <div class="col-6 md:col-3"><StatCard label="Vehículos" :value="summary.totalVehicles" icon="truck" /></div>
    <div class="col-6 md:col-3"><StatCard label="Gasto combustible" :value="`S/ ${summary.totalFuelCost.toFixed(0)}`" icon="fuel" /></div>
    <div class="col-6 md:col-3"><StatCard label="Gasto mantenimiento" :value="`S/ ${summary.totalMaintenanceCost.toFixed(0)}`" icon="wrench" tone="amber" /></div>
    <div class="col-6 md:col-3"><StatCard label="Mant. completados" :value="summary.completedMaintenance" icon="check" /></div>
  </div>

  <div class="rounded-2xl border-subtle shadow-card p-3 mb-3" style="background: var(--p-surface-0)">
    <h2 class="text-sm font-semibold text-heading mb-3">Gasto de combustible por vehículo</h2>
    <EmptyState v-if="!performance.length" icon="chart" message="Se necesitan al menos 2 registros de combustible por vehículo para generar el comparativo." />
    <div v-else class="flex flex-column gap-3">
      <div v-for="p in performance" :key="p.vehicleId" class="flex align-items-center gap-3">
        <span class="text-sm font-medium text-color-secondary flex-shrink-0" style="width: 5rem">{{ p.plate }}</span>
        <div class="flex-1 overflow-hidden border-round-full" style="height: .75rem; background: var(--p-surface-100)">
          <div class="h-full border-round-full" :style="{ width: `${(p.totalCost / maxCost) * 100}%`, background: 'var(--p-primary-color)' }" />
        </div>
        <span class="text-sm text-color-secondary text-right flex-shrink-0" style="width: 6rem">S/ {{ p.totalCost.toFixed(0) }}</span>
        <span class="text-xs text-faint text-right flex-shrink-0" style="width: 5rem">{{ p.avgEfficiency ?? '—' }} km/L</span>
      </div>
    </div>
  </div>

  <div class="rounded-2xl border-subtle shadow-card p-3" style="background: var(--p-surface-0)">
    <h2 class="text-sm font-semibold text-heading mb-2">Historial de reportes exportados</h2>
    <EmptyState v-if="!analytics.reports.length" icon="folder" message="Aún no has exportado ningún reporte." />
    <ul v-else class="list-none p-0 m-0">
      <li v-for="r in analytics.reports" :key="r.id" class="flex align-items-center justify-content-between py-2 text-sm" style="border-bottom: 1px solid var(--p-surface-100)">
        <span class="text-color-secondary">{{ r.reportType }}</span>
        <span class="text-xs text-faint">{{ new Date(r.generatedAt).toLocaleString('es-PE') }}</span>
      </li>
    </ul>
  </div>
</template>
