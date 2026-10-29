<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useFuelStore } from '../stores/fuel.store.js'
import { useFleetStore } from '@/fleet-management/presentation/stores/fleet.store.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import FormCard from '@/shared/presentation/components/form-card.component.vue'
import Select from 'primevue/select'
import InputNumber from 'primevue/inputnumber'
import DatePicker from 'primevue/datepicker'

const router = useRouter()
const fuel = useFuelStore()
const fleet = useFleetStore()
const session = useSessionStore()

const form = ref({
  vehicleId: fleet.vehicles[0]?.id ?? '',
  driverId: session.user?.id,
  liters: null,
  totalCost: null,
  mileageAtRefuel: null,
  date: new Date().toISOString().slice(0, 10)
})

async function save() {
  await fuel.registerFuelConsumption({ ...form.value })
  router.push('/fuel')
}
</script>

<template>
  <PageHeader context-label="Fuel Control" title="Registrar recarga de combustible" subtitle="Litros cargados, costo asociado y kilometraje al momento de la recarga.">
    <template #actions>
      <AppButton variant="ghost" @click="router.push('/fuel')">← Volver a combustible</AppButton>
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
      <div class="grid">
        <div class="col-6 flex flex-column gap-1">
          <label class="text-sm font-medium text-heading">Litros</label>
          <InputNumber v-model="form.liters" :min-fraction-digits="1" required fluid />
        </div>
        <div class="col-6 flex flex-column gap-1">
          <label class="text-sm font-medium text-heading">Costo total (S/)</label>
          <InputNumber v-model="form.totalCost" mode="currency" currency="PEN" locale="es-PE" required fluid />
        </div>
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Kilometraje actual (odómetro)</label>
        <InputNumber v-model="form.mileageAtRefuel" :min="0" required fluid />
      </div>
      <div class="flex flex-column gap-1">
        <label class="text-sm font-medium text-heading">Fecha</label>
        <DatePicker v-model="form.date" date-format="yy-mm-dd" show-icon fluid required />
      </div>
      <div class="flex justify-content-end gap-2 pt-3" style="border-top: 1px solid var(--p-surface-100)">
        <AppButton variant="ghost" type="button" @click="router.push('/fuel')">Cancelar</AppButton>
        <AppButton type="submit">Guardar</AppButton>
      </div>
    </form>
  </FormCard>
</template>
