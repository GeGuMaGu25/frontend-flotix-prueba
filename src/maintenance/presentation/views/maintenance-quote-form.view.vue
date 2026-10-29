<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useMaintenanceStore } from '../stores/maintenance.store.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import FormCard from '@/shared/presentation/components/form-card.component.vue'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'

const router = useRouter()
const route = useRoute()
const maintenance = useMaintenanceStore()
const fleet = useFleetStore()
const session = useSessionStore()
const mechanics = session.mechanics

const request = maintenance.byId(route.params.id)
if (!request) router.replace('/maintenance')

function plate(id) {
  return fleet.byId(id)?.plate ?? '—'
}

const form = ref({ mechanicId: mechanics[0]?.id ?? '', estimatedCost: request?.estimatedCost || null })

async function save() {
  await maintenance.registerDiagnosticAndQuote(request.id, form.value)
  router.push('/maintenance')
}
</script>

<template>
  <template v-if="request">
    <PageHeader context-label="Maintenance Management" title="Diagnóstico y cotización" :subtitle="`${plate(request.vehicleId)} — ${request.faultDescription}`">
      <template #actions>
        <AppButton variant="ghost" @click="router.push('/maintenance')">← Volver a mantenimiento</AppButton>
      </template>
    </PageHeader>

    <FormCard>
      <form class="flex flex-column gap-3" @submit.prevent="save">
        <div class="flex flex-column gap-1">
          <label class="text-sm font-medium text-heading">Taller / mecánico</label>
          <Select v-model="form.mechanicId" :options="mechanics" option-label="name" option-value="id" fluid>
            <template #option="{ option }">{{ option.name }} ({{ option.workshopName }})</template>
          </Select>
        </div>
        <div class="flex flex-column gap-1">
          <label class="text-sm font-medium text-heading">Costo estimado (S/)</label>
          <InputNumber v-model="form.estimatedCost" mode="currency" currency="PEN" locale="es-PE" required fluid />
        </div>
        <div class="flex justify-content-end gap-2 pt-3" style="border-top: 1px solid var(--p-surface-100)">
          <AppButton variant="ghost" type="button" @click="router.push('/maintenance')">Cancelar</AppButton>
          <AppButton type="submit">Guardar cotización</AppButton>
        </div>
      </form>
    </FormCard>
  </template>
</template>
