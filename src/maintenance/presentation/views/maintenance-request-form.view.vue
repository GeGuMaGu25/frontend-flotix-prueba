<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useMaintenanceStore } from '../stores/maintenance.store.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import FormCard from '@/shared/presentation/components/form-card.component.vue'
import Select from 'primevue/select'
import Textarea from 'primevue/textarea'

const router = useRouter()
const maintenance = useMaintenanceStore()
const fleet = useFleetStore()
const session = useSessionStore()

const form = ref({ vehicleId: fleet.vehicles[0]?.id ?? '', mechanicId: session.mechanics[0]?.id ?? '', faultDescription: '' })

async function save() {
  await maintenance.submitMaintenanceRequest({ ...form.value })
  router.push('/maintenance')
}
</script>

<template>
  <PageHeader context-label="Maintenance Management" title="Nueva solicitud de mantenimiento" subtitle="Describe la falla para que un taller pueda diagnosticarla y cotizarla.">
    <template #actions>
      <AppButton variant="ghost" @click="router.push('/maintenance')">← Volver a mantenimiento</AppButton>
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
        <label class="text-sm font-medium text-heading">Taller</label>
        <Select v-model="form.mechanicId" :options="session.mechanics" option-label="workshopName" option-value="id" fluid />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Descripción de la falla</label>
        <Textarea v-model="form.faultDescription" required rows="4" fluid />
      </div>
      <div class="flex justify-content-end gap-2 pt-3" style="border-top: 1px solid var(--p-surface-100)">
        <AppButton variant="ghost" type="button" @click="router.push('/maintenance')">Cancelar</AppButton>
        <AppButton type="submit">Enviar solicitud</AppButton>
      </div>
    </form>
  </FormCard>
</template>
