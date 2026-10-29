<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useIncidentsStore } from '../stores/incidents.store.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import FormCard from '@/shared/presentation/components/form-card.component.vue'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

const router = useRouter()
const incidents = useIncidentsStore()
const fleet = useFleetStore()
const session = useSessionStore()

const form = ref({ vehicleId: fleet.vehicles[0]?.id ?? '', driverId: session.user?.id, description: '' })

async function save() {
  await incidents.reportVehicleIncident({ ...form.value })
  router.push('/incidents')
}
</script>

<template>
  <PageHeader context-label="Incident Management" title="Reportar incidencia" subtitle="Describe la falla o anomalía detectada durante la operación.">
    <template #actions>
      <AppButton variant="ghost" @click="router.push('/incidents')">← Volver a incidencias</AppButton>
    </template>
  </PageHeader>

  <FormCard>
    <form class="flex flex-column gap-3" @submit.prevent="save">
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Vehículo</label>
        <Select v-model="form.vehicleId" :options="fleet.vehicles" option-label="plate" option-value="id" fluid>
          <template #option="{ option }">{{ option.plate }} — {{ option.vehicleType }}</template>
        </Select>
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Descripción del problema</label>
        <Textarea v-model="form.description" required rows="4" fluid />
      </div>
      <div class="flex justify-content-end gap-2 pt-3" style="border-top: 1px solid var(--p-surface-100)">
        <AppButton variant="ghost" type="button" @click="router.push('/incidents')">Cancelar</AppButton>
        <AppButton type="submit">Reportar</AppButton>
      </div>
    </form>
  </FormCard>
</template>
