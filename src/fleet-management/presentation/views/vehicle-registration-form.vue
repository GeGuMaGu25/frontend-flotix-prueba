<script setup>
import { ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useFleetStore } from '../stores/fleet.store.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'
import { VehicleStatus, VehicleTypes } from '../../domain/model/value-objects/vehicle-status.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import FormCard from '@/shared/presentation/components/form-card.component.vue'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Select from 'primevue/select'

const router = useRouter()
const route = useRoute()
const fleet = useFleetStore()
const session = useSessionStore()

const editingId = route.params.id ?? null
const existing = editingId ? fleet.byId(editingId) : null

const form = ref(
  existing
    ? { ...existing, driverId: existing.driverId ?? '' }
    : { ownerId: session.user?.id, driverId: '', plate: '', vehicleType: VehicleTypes[0], currentMileage: 0, status: VehicleStatus.AVAILABLE }
)

const title = computed(() => (editingId ? 'Editar vehículo' : 'Registrar vehículo'))
const driverOptions = computed(() => [{ id: '', name: 'Sin asignar' }, ...fleet.drivers])
const statusOptions = Object.values(VehicleStatus)

async function save() {
  const payload = { ...form.value, driverId: form.value.driverId || null, currentMileage: Number(form.value.currentMileage) }
  if (editingId) {
    await fleet.updateVehicleInfo(editingId, payload)
  } else {
    await fleet.registerVehicle(payload)
  }
  router.push('/fleet-management')
}
</script>

<template>
  <PageHeader context-label="Vehicle & Fleet Management" :title="title" subtitle="Datos operativos del vehículo y su conductor asignado.">
    <template #actions>
      <AppButton variant="ghost" @click="router.push('/fleet-management')">← Volver a la flota</AppButton>
    </template>
  </PageHeader>

  <FormCard>
    <form class="flex flex-column gap-3" @submit.prevent="save">
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Placa</label>
        <InputText v-model="form.plate" required fluid />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Tipo de vehículo</label>
        <Select v-model="form.vehicleType" :options="VehicleTypes" fluid />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Kilometraje actual</label>
        <InputNumber v-model="form.currentMileage" :min="0" fluid />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Conductor asignado</label>
        <Select v-model="form.driverId" :options="driverOptions" option-label="name" option-value="id" fluid />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Estado</label>
        <Select v-model="form.status" :options="statusOptions" fluid />
      </div>
      <div class="flex justify-content-end gap-2 pt-3" style="border-top: 1px solid var(--p-surface-100)">
        <AppButton variant="ghost" type="button" @click="router.push('/fleet-management')">Cancelar</AppButton>
        <AppButton type="submit">Guardar</AppButton>
      </div>
    </form>
  </FormCard>
</template>
