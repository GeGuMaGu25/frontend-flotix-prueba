import { defineStore } from 'pinia'
import { commerceService } from '../../application/commerce.service.js'

/** Pinia store — Digital Experience / IoT Commerce. Wraps CommerceService. */
export const useCommerceStore = defineStore('commerce', {
  state: () => ({
    orders: []
  }),
  getters: {
    catalog: () => commerceService.catalog
  },
  actions: {
    async refresh() {
      // The API does not store the SKU, so keep the ones known from this session's purchases.
      const skus = Object.fromEntries(this.orders.map((o) => [o.id, o.sku]))
      this.orders = (await commerceService.listOrders()).map((o) => ({ ...o, sku: skus[o.id] ?? o.sku }))
    },
    async purchaseIoTDevice(payload) {
      const order = await commerceService.purchaseIoTDevice(payload)
      this.orders = [order, ...this.orders]
      await this.refresh()
    },
    async updateOrderStatus(id, status) {
      await commerceService.updateOrderStatus(id, status)
      await this.refresh()
    }
  }
})
