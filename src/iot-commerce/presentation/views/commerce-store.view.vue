<script setup>
import { ref } from 'vue'
import { useCommerceStore } from '../stores/commerce.store.js'
import { OrderStatus } from '../../domain/model/value-objects/order-status.js'
import { useSessionStore } from '@/identity-access/presentation/stores/session.store.js'

import PageHeader from '@/shared/presentation/components/page-header.component.vue'
import AppButton from '@/shared/presentation/components/app-button.component.vue'
import StatusBadge from '@/shared/presentation/components/status-badge.component.vue'
import EmptyState from '@/shared/presentation/components/empty-state.component.vue'
import AppIcon from '@/shared/presentation/components/app-icon.component.vue'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'

const session = useSessionStore()
const commerce = useCommerceStore()
const catalog = commerce.catalog
const quantities = ref(Object.fromEntries(catalog.map((p) => [p.sku, 1])))
const successMsg = ref('')

async function buy(product) {
  await commerce.purchaseIoTDevice({
    ownerId: session.user?.id,
    sku: product.sku,
    deviceQuantity: quantities.value[product.sku]
  })
  successMsg.value = `Compra de ${quantities.value[product.sku]} unidad(es) de "${product.name}" procesada correctamente.`
  setTimeout(() => (successMsg.value = ''), 4000)
}

function productName(sku) {
  return catalog.find((p) => p.sku === sku)?.name ?? sku
}

function advance(order) {
  const flow = [OrderStatus.PENDING_PAYMENT, OrderStatus.IN_PREPARATION, OrderStatus.DELIVERED]
  const next = flow[flow.indexOf(order.status) + 1]
  if (!next) return
  commerce.updateOrderStatus(order.id, next)
}
</script>

<template>
  <PageHeader
    context-label="Digital Experience / IoT Commerce"
    title="Tienda de hardware telemático"
    subtitle="Adquisición de dispositivos GPS, odómetro y sensores de combustible para equipar tu flota."
  />

  <p v-if="successMsg" class="text-sm px-3 py-2 border-round-lg mb-3" style="background: var(--p-primary-50); color: var(--p-primary-700); border: 1px solid var(--p-primary-200)">
    ✅ {{ successMsg }}
  </p>

  <div class="grid mb-5">
    <div v-for="(p, idx) in catalog" :key="p.sku" class="col-12 sm:col-4">
      <div class="flex flex-column overflow-hidden rounded-2xl border-subtle shadow-card h-full" style="background: var(--p-surface-0)">
        <div class="relative flex align-items-center justify-content-center bg-navy-gradient" style="height: 7rem">
          <span v-if="idx === 0" class="absolute border-round-full px-2 py-1 text-xs font-bold" style="top: .75rem; left: .75rem; background: #10b981; color: #fff">NUEVO</span>
          <div class="flex align-items-center justify-content-center border-round-xl" style="width: 3.5rem; height: 3.5rem; background: rgba(255,255,255,.1); color: #fff">
            <AppIcon :name="p.iconName" :size="26" />
          </div>
        </div>
        <div class="flex flex-column flex-1 p-3">
          <p class="font-bold text-heading m-0">{{ p.name }}</p>
          <p class="text-lg font-bold mt-1 mb-0" style="color: var(--p-primary-color)">S/ {{ p.unitPrice.toFixed(2) }}</p>
          <div class="flex align-items-center gap-2 pt-3 mt-auto">
            <InputNumber v-model="quantities[p.sku]" :min="1" input-style="width: 3.5rem" />
            <Button label="Comprar ahora →" class="flex-1 justify-content-center" @click="buy(p)" />
          </div>
        </div>
      </div>
    </div>
  </div>

  <h2 class="text-sm font-semibold text-heading mb-2">Historial de pedidos</h2>
  <EmptyState v-if="!commerce.orders.length" icon="cart" message="Aún no has realizado pedidos." />
  <div v-else class="rounded-2xl border-subtle shadow-card overflow-hidden" style="background: var(--p-surface-0)">
    <DataTable :value="commerce.orders" data-key="id" striped-rows responsive-layout="scroll">
      <Column field="orderDate" header="Fecha" />
      <Column header="Producto">
        <template #body="{ data }">{{ productName(data.sku) }}</template>
      </Column>
      <Column field="deviceQuantity" header="Cantidad" />
      <Column header="Total">
        <template #body="{ data }">S/ {{ data.totalAmount.toFixed(2) }}</template>
      </Column>
      <Column header="Estado">
        <template #body="{ data }"><StatusBadge :status="data.status" /></template>
      </Column>
      <Column header="Acciones">
        <template #body="{ data }">
          <Button
            v-if="data.status !== 'Entregado' && data.status !== 'Cancelado'"
            label="Avanzar estado →"
            text
            size="small"
            @click="advance(data)"
          />
        </template>
      </Column>
    </DataTable>
  </div>
</template>
